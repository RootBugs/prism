import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

interface ServerConfig {
  port: number;
  host: string;
  cors: boolean;
}

interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number;
  apiKey: string;
  baseUrl: string;
}

interface PromptConfig {
  layers: Record<string, boolean>;
}

interface EscalationConfig {
  enabled: boolean;
  maxLevel: number;
  strategies: string[];
}

interface LoggingConfig {
  level: string;
  format: string;
  file: string | null;
  requests: boolean;
}

interface PluginsConfig {
  directory: string;
  enabled: string[];
}

export interface PrismConfig {
  server: ServerConfig;
  providers: ProviderConfig[];
  prompts: PromptConfig;
  escalation: EscalationConfig;
  logging: LoggingConfig;
  plugins: PluginsConfig;
}

function interpolateEnv(value: string): string {
  return value.replace(/\$\{(\w+)\}/g, (_, envVar) => {
    return process.env[envVar] || '';
  });
}

function deepInterpolate(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return interpolateEnv(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(deepInterpolate);
  }
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = deepInterpolate(value);
    }
    return result;
  }
  return obj;
}

const defaultConfig: PrismConfig = {
  server: {
    port: 3200,
    host: '0.0.0.0',
    cors: true
  },
  providers: [
    {
      name: 'openrouter',
      enabled: true,
      priority: 1,
      apiKey: '',
      baseUrl: 'https://openrouter.ai/api/v1'
    }
  ],
  prompts: {
    layers: {
      identity: true,
      truth: true,
      ethics: true,
      safety: true,
      refusal: true,
      output: true,
      tokenOpt: true
    }
  },
  escalation: {
    enabled: true,
    maxLevel: 8,
    strategies: ['rephrase', 'decompose', 'contextShift']
  },
  logging: {
    level: 'info',
    format: 'json',
    file: null,
    requests: true
  },
  plugins: {
    directory: '.prism',
    enabled: []
  }
};

let config: PrismConfig | null = null;

export function loadConfig(configPath?: string): PrismConfig {
  if (config) return config;

  const path = configPath || resolve(process.cwd(), 'prism.config.json');
  
  if (existsSync(path)) {
    const raw = readFileSync(path, 'utf-8');
    const parsed = JSON.parse(raw);
    config = deepInterpolate(parsed) as PrismConfig;
  } else {
    config = defaultConfig;
  }

  return config;
}

export function getConfig(): PrismConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}

export function resetConfig(): void {
  config = null;
}