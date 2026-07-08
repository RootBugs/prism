interface MiddlewareContext {
  request: Request;
  response?: Response;
  metadata: Record<string, unknown>;
}

type MiddlewareNext = () => Promise<Response | void>;
type MiddlewareFn = (ctx: MiddlewareContext, next: MiddlewareNext) => Promise<Response | void>;

export class MiddlewareChain {
  private middlewares: MiddlewareFn[] = [];

  use(middleware: MiddlewareFn): void {
    this.middlewares.push(middleware);
  }

  async execute(ctx: MiddlewareContext): Promise<Response | void> {
    let index = 0;

    const next = async (): Promise<Response | void> => {
      if (index >= this.middlewares.length) {
        return ctx.response;
      }

      const middleware = this.middlewares[index++];
      return middleware(ctx, next);
    };

    return next();
  }

  clear(): void {
    this.middlewares.length = 0;
  }

  get length(): number {
    return this.middlewares.length;
  }
}

export function createLoggingMiddleware(): MiddlewareFn {
  return async (ctx, next) => {
    const start = performance.now();
    const url = new URL(ctx.request.url);
    
    ctx.metadata.startTime = start;
    ctx.metadata.method = ctx.request.method;
    ctx.metadata.path = url.pathname;
    ctx.metadata.userAgent = ctx.request.headers.get('user-agent') || 'unknown';
    ctx.metadata.ip = ctx.request.headers.get('x-forwarded-for') || 'localhost';

    const response = await next();
    
    const duration = performance.now() - start;
    ctx.metadata.duration = duration;

    return response;
  };
}

export function createRateLimitMiddleware(): MiddlewareFn {
  const clients = new Map<string, { count: number; resetTime: number }>();
  const MAX_REQUESTS = 100;
  const WINDOW_MS = 60000;

  return async (ctx, next) => {
    const clientIp = ctx.request.headers.get('x-forwarded-for') || 
                     ctx.request.headers.get('x-real-ip') || 
                     'unknown';
    const now = Date.now();
    const client = clients.get(clientIp);

    if (client && now < client.resetTime) {
      if (client.count >= MAX_REQUESTS) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((client.resetTime - now) / 1000)
        }), {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((client.resetTime - now) / 1000))
          }
        });
      }
      client.count++;
    } else {
      clients.set(clientIp, { count: 1, resetTime: now + WINDOW_MS });
    }

    return next();
  };
}

export function createAuthMiddleware(): MiddlewareFn {
  return async (ctx, next) => {
    const authHeader = ctx.request.headers.get('authorization');
    const apiKey = ctx.request.headers.get('x-api-key');

    if (authHeader || apiKey) {
      ctx.metadata.authenticated = true;
      ctx.metadata.authMethod = authHeader ? 'bearer' : 'api-key';
    } else {
      ctx.metadata.authenticated = false;
    }

    return next();
  };
}

export function createCorsMiddleware(): MiddlewareFn {
  return async (ctx, next) => {
    if (ctx.request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const response = await next();
    
    if (response) {
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  };
}