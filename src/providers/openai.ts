import { LLMProvider, LLMRequest, LLMResponse } from './base';

interface OpenAIResponse {
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

interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export class OpenAIProvider extends LLMProvider {
  private static readonly DEFAULT_MODEL = 'gpt-4o';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || OpenAIProvider.DEFAULT_MODEL;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= OpenAIProvider.MAX_RETRIES; attempt++) {
      try {
        const response = await this.fetchAPI<OpenAIResponse>('/chat/completions', {
          method: 'POST',
          body: JSON.stringify({
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 4096
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
        
        if (attempt < OpenAIProvider.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, OpenAIProvider.RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw lastError || new Error('OpenAI request failed after retries');
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchAPI<{ data: OpenAIModel[] }>('/models', {
        method: 'GET'
      });

      return response.data.map(m => m.id);
    } catch {
      return [];
    }
  }

  async getModelInfo(modelId: string): Promise<OpenAIModel | null> {
    try {
      const response = await this.fetchAPI<{ data: OpenAIModel }>('/models', {
        method: 'GET'
      });

      return response.data;
    } catch {
      return null;
    }
  }
}