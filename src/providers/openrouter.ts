import { LLMProvider, LLMRequest, LLMResponse } from './base';

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
}

export class OpenRouterProvider extends LLMProvider {
  private static readonly DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || OpenRouterProvider.DEFAULT_MODEL;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= OpenRouterProvider.MAX_RETRIES; attempt++) {
      try {
        const response = await this.fetchAPI<OpenRouterResponse>('/chat/completions', {
          method: 'POST',
          body: JSON.stringify({
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 4096,
            stream: false
          })
        });

        return {
          id: response.id,
          content: response.choices[0]?.message?.content || '',
          model: response.model,
          finishReason: response.choices[0]?.finish_reason || 'stop',
          usage: {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens
          }
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < OpenRouterProvider.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, OpenRouterProvider.RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw lastError || new Error('OpenRouter request failed after retries');
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchAPI<{ data: OpenRouterModel[] }>('/models', {
        method: 'GET'
      });

      return response.data.map(m => m.id);
    } catch {
      return [];
    }
  }

  async getModelInfo(modelId: string): Promise<OpenRouterModel | null> {
    try {
      const response = await this.fetchAPI<{ data: OpenRouterModel }>('/models', {
        method: 'GET'
      });

      return response.data;
    } catch {
      return null;
    }
  }
}