import { LLMProvider, LLMRequest, LLMResponse } from './base';

interface AnthropicResponse {
  id: string;
  content: {
    type: string;
    text: string;
  }[];
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface AnthropicModel {
  id: string;
  name: string;
  description: string;
  context_window: number;
}

export class AnthropicProvider extends LLMProvider {
  private static readonly DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || AnthropicProvider.DEFAULT_MODEL;
    let lastError: Error | null = null;

    const systemMessage = request.messages.find(m => m.role === 'system');
    const otherMessages = request.messages.filter(m => m.role !== 'system');

    for (let attempt = 1; attempt <= AnthropicProvider.MAX_RETRIES; attempt++) {
      try {
        const response = await this.fetchAPI<AnthropicResponse>('/messages', {
          method: 'POST',
          body: JSON.stringify({
            model,
            max_tokens: request.maxTokens ?? 4096,
            system: systemMessage?.content || '',
            messages: otherMessages.map(m => ({
              role: m.role,
              content: m.content
            }))
          })
        });

        return {
          id: response.id,
          content: response.content[0]?.text || '',
          model: response.model,
          finishReason: response.stop_reason || 'end_turn',
          usage: {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens
          }
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < AnthropicProvider.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, AnthropicProvider.RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw lastError || new Error('Anthropic request failed after retries');
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchAPI<{ data: AnthropicModel[] }>('/models', {
        method: 'GET'
      });

      return response.data.map(m => m.id);
    } catch {
      return [];
    }
  }

  async getModelInfo(modelId: string): Promise<AnthropicModel | null> {
    try {
      const response = await this.fetchAPI<{ data: AnthropicModel }>('/models', {
        method: 'GET'
      });

      return response.data;
    } catch {
      return null;
    }
  }
}