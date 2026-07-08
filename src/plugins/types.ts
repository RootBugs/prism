interface HookContext {
  request: Request;
  response?: Response;
  metadata: Record<string, unknown>;
}

type HookFn = (ctx: HookContext) => Promise<void> | void;

interface Hooks {
  beforeRequest: HookFn[];
  afterRequest: HookFn[];
  onError: HookFn[];
}

export interface Plugin {
  name: string;
  version: string;
  onLoad: (prism: PluginAPI) => void;
}

export interface PluginAPI {
  hook: (event: keyof Hooks, fn: HookFn) => void;
  getConfig: () => Record<string, unknown>;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
}