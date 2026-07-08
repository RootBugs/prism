export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  id: string;
  content: string;
  model: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProviderConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
  priority: number;
}

export abstract class LLMProvider {
  protected config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get isEnabled(): boolean {
    return this.config.enabled;
  }

  get priority(): number {
    return this.config.priority;
  }

  abstract complete(request: LLMRequest): Promise<LLMResponse>;
  
  abstract listModels(): Promise<string[]>;

  protected async fetchAPI<T>(path: string, options: RequestInit): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${this.config.name} API error: ${response.status} - ${error}`);
    }

    return response.json() as Promise<T>;
  }
}