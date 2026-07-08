import { LLMProvider, LLMRequest, LLMResponse } from '../providers/base';
import { OpenRouterProvider } from '../providers/openrouter';
import { OpenAIProvider } from '../providers/openai';
import { AnthropicProvider } from '../providers/anthropic';
import { CustomProvider } from '../providers/custom';
import { getConfig, PrismConfig } from '../utils/config';
import { logger } from '../utils/logger';

interface ProviderInstance {
  provider: LLMProvider;
  config: PrismConfig['providers'][0];
}

export class Router {
  private providers: ProviderInstance[] = [];
  private config: PrismConfig;

  constructor() {
    this.config = getConfig();
    this.initializeProviders();
  }

  private initializeProviders(): void {
    for (const providerConfig of this.config.providers) {
      if (!providerConfig.enabled) continue;

      let provider: LLMProvider;

      switch (providerConfig.name) {
        case 'openrouter':
          provider = new OpenRouterProvider(providerConfig);
          break;
        case 'openai':
          provider = new OpenAIProvider(providerConfig);
          break;
        case 'anthropic':
          provider = new AnthropicProvider(providerConfig);
          break;
        case 'custom':
          provider = new CustomProvider(providerConfig);
          break;
        default:
          logger.warn('Unknown provider', { name: providerConfig.name });
          continue;
      }

      this.providers.push({ provider, config: providerConfig });
    }

    this.providers.sort((a, b) => a.config.priority - b.config.priority);

    logger.info('Providers initialized', {
      count: this.providers.length,
      names: this.providers.map(p => p.config.name)
    });
  }

  getProvider(name?: string): LLMProvider | null {
    if (name) {
      const found = this.providers.find(p => p.config.name === name);
      return found?.provider || null;
    }

    return this.providers[0]?.provider || null;
  }

  async route(request: LLMRequest, preferredProvider?: string): Promise<LLMResponse> {
    const provider = this.getProvider(preferredProvider);
    
    if (!provider) {
      throw new Error('No available providers');
    }

    logger.info('Routing request', {
      provider: provider.name,
      model: request.model
    });

    return provider.complete(request);
  }

  async routeWithFallback(request: LLMRequest): Promise<{ response: LLMResponse; provider: string }> {
    let lastError: Error | null = null;

    for (const { provider } of this.providers) {
      try {
        const response = await provider.complete(request);
        return { response, provider: provider.name };
      } catch (error) {
        lastError = error as Error;
        logger.warn('Provider failed, trying next', {
          provider: provider.name,
          error: lastError.message
        });
      }
    }

    throw lastError || new Error('All providers failed');
  }

  listProviders(): { name: string; enabled: boolean; priority: number }[] {
    return this.providers.map(p => ({
      name: p.config.name,
      enabled: p.config.enabled,
      priority: p.config.priority
    }));
  }
}