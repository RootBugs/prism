import { LLMProvider, LLMRequest, LLMResponse } from './base';

interface CustomResponse {
  id?: string;
  choices: {
    message?: {
      role: string;
      content: string;
    };
    text?: string;
    finish_reason?: string;
  }[];
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

export class CustomProvider extends LLMProvider {
  private static readonly DEFAULT_MODEL = 'default';
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const model = request.model || CustomProvider.DEFAULT_MODEL;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= CustomProvider.MAX_RETRIES; attempt++) {
      try {
        const response = await this.fetchAPI<CustomResponse>('/chat/completions', {
          method: 'POST',
          body: JSON.stringify({
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 4096
          })
        });

        if (response.error) {
          throw new Error(response.error.message || 'Custom provider error');
        }

        const choice = response.choices[0];
        const content = choice?.message?.content || choice?.text || '';

        return {
          id: response.id || `custom_${Date.now()}`,
          content,
          model: response.model || request.model,
          finishReason: choice?.finish_reason || 'stop',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0
          }
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < CustomProvider.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, CustomProvider.RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw lastError || new Error('Custom provider request failed after retries');
  }

  async listModels(): Promise<string[]> {
    try {
      const response = await this.fetchAPI<{ data: { id: string }[] }>('/models', {
        method: 'GET'
      });
      return response.data?.map(m => m.id) || [];
    } catch {
      return [];
    }
  }

  async getModelInfo(modelId: string): Promise<{ id: string } | null> {
    try {
      const response = await this.fetchAPI<{ data: { id: string } }>('/models', {
        method: 'GET'
      });
      return response.data;
    } catch {
      return null;
    }
  }
}