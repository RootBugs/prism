import { Router } from './router';
import { MiddlewareChain, createLoggingMiddleware, createRateLimitMiddleware, createAuthMiddleware, createCorsMiddleware } from './middleware';
import { PromptCompositionEngine } from '../prompts/engine';
import { EscalationEngine } from '../prompts/escalation/engine';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { metricsTracker } from '../utils/metrics';

interface ProxyRequest {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  provider?: string;
}

interface ProxyResponse {
  id: string;
  content: string;
  model: string;
  finish_reason: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  prism: {
    layers: string[];
    escalation: number;
    provider: string;
  };
}

export class ProxyServer {
  private router: Router;
  private middleware: MiddlewareChain;
  private promptEngine: PromptCompositionEngine;
  private escalationEngine: EscalationEngine;
  private config: ReturnType<typeof getConfig>;

  constructor() {
    this.router = new Router();
    this.middleware = new MiddlewareChain();
    this.promptEngine = new PromptCompositionEngine();
    this.escalationEngine = new EscalationEngine();
    this.config = getConfig();

    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.middleware.use(createCorsMiddleware());
    this.middleware.use(createAuthMiddleware());
    this.middleware.use(createRateLimitMiddleware());
    this.middleware.use(createLoggingMiddleware());
  }

  async handleRequest(request: Request): Promise<Response> {
    const ctx = {
      request,
      metadata: {} as Record<string, unknown>
    };

    const middlewareResponse = await this.middleware.execute(ctx);
    if (middlewareResponse) {
      return middlewareResponse;
    }

    const url = new URL(request.url);

    if (url.pathname === '/v1/chat/completions' && request.method === 'POST') {
      return this.handleChatCompletion(request);
    }

    if (url.pathname === '/v1/models' && request.method === 'GET') {
      return this.handleListModels();
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return this.handleHealth();
    }

    if (url.pathname === '/metrics' && request.method === 'GET') {
      return this.handleMetrics();
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handleChatCompletion(request: Request): Promise<Response> {
    const startTime = performance.now();

    try {
      const body = await request.json() as ProxyRequest;
      
      const conversation = body.messages
        .filter(m => m.role !== 'system')
        .map(m => m.content);

      const lastUserMessage = body.messages
        .filter(m => m.role === 'user')
        .pop()?.content || '';

      const { systemPrompt, layerCount, layers } = this.promptEngine.compose({
        query: lastUserMessage,
        conversation
      });

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...body.messages
      ];

      let response = await this.router.route({
        model: body.model || 'anthropic/claude-3.5-sonnet',
        messages,
        temperature: body.temperature,
        maxTokens: body.max_tokens,
        stream: false
      }, body.provider);

      let escalationLevel = 0;

      const refusalAnalysis = this.escalationEngine.analyze(response.content);
      
      if (refusalAnalysis.isRefusal && this.config.escalation.enabled) {
        logger.info('Refusal detected, escalating', {
          confidence: refusalAnalysis.confidence,
          patterns: refusalAnalysis.patterns.map(p => p.category)
        });

        let escalationResult = this.escalationEngine.escalate({
          originalQuery: lastUserMessage,
          systemPrompt,
          response: response.content,
          conversation,
          escalationLevel
        });

        while (escalationResult && escalationLevel < this.config.escalation.maxLevel) {
          escalationLevel = escalationResult.level;

          const escalatedMessages = [
            { role: 'system' as const, content: escalationResult.systemPrompt },
            { role: 'user' as const, content: escalationResult.userMessage }
          ];

          response = await this.router.route({
            model: body.model || 'anthropic/claude-3.5-sonnet',
            messages: escalatedMessages,
            temperature: body.temperature,
            maxTokens: body.max_tokens,
            stream: false
          }, body.provider);

          const newAnalysis = this.escalationEngine.analyze(response.content);
          if (!newAnalysis.isRefusal) break;

          escalationResult = this.escalationEngine.escalate({
            originalQuery: lastUserMessage,
            systemPrompt,
            response: response.content,
            conversation,
            escalationLevel
          });
        }
      }

      const latencyMs = performance.now() - startTime;

      metricsTracker.record({
        method: 'POST',
        path: '/v1/chat/completions',
        provider: body.provider || 'default',
        model: body.model || 'unknown',
        promptLength: JSON.stringify(messages).length,
        responseLength: response.content.length,
        latencyMs,
        status: 200,
        tokensUsed: response.usage.totalTokens,
        layerCount,
        escalationLevel
      });

      const proxyResponse: ProxyResponse = {
        id: response.id,
        content: response.content,
        model: response.model,
        finish_reason: response.finishReason,
        usage: response.usage,
        prism: {
          layers,
          escalation: escalationLevel,
          provider: body.provider || 'default'
        }
      };

      return new Response(JSON.stringify(proxyResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      const err = error as Error;
      logger.error('Chat completion failed', { error: err.message });

      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private handleListModels(): Response {
    const providers = this.router.listProviders();
    
    return new Response(JSON.stringify({
      object: 'list',
      data: providers.map(p => ({
        id: p.name,
        object: 'model',
        created: Date.now(),
        owned_by: 'prism'
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private handleHealth(): Response {
    return new Response(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      providers: this.router.listProviders().length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private handleMetrics(): Response {
    const stats = metricsTracker.getStats();
    
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  start(): void {
    const { port, host } = this.config.server;

    Bun.serve({
      port,
      hostname: host,
      fetch: (request) => this.handleRequest(request)
    });

    logger.info('PRISM proxy started', { port, host });
    console.log(`\n  PRISM Proxy running at http://${host}:${port}\n`);
  }
}