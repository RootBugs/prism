import { Plugin, PluginAPI } from './types';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

interface LoadedPlugin {
  plugin: Plugin;
  path: string;
}

export class PluginLoader {
  private plugins: LoadedPlugin[] = [];
  private hooks: Map<string, Function[]> = new Map();
  private config: ReturnType<typeof getConfig>;

  constructor() {
    this.config = getConfig();
  }

  async loadPlugins(): Promise<void> {
    const pluginDir = resolve(process.cwd(), this.config.plugins.directory);

    if (!existsSync(pluginDir)) {
      logger.warn('Plugin directory not found', { path: pluginDir });
      return;
    }

    try {
      const files = readdirSync(pluginDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));

      for (const file of files) {
        try {
          const pluginPath = join(pluginDir, file);
          const mod = await import(pluginPath);
          
          if (mod.plugin && this.isPlugin(mod.plugin)) {
            this.registerPlugin(mod.plugin, pluginPath);
          }
        } catch (error) {
          logger.error('Failed to load plugin', { file, error: (error as Error).message });
        }
      }
    } catch (error) {
      logger.error('Failed to read plugin directory', { error: (error as Error).message });
    }
  }

  private isPlugin(obj: unknown): obj is Plugin {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'name' in obj &&
      'version' in obj &&
      'onLoad' in obj &&
      typeof (obj as Plugin).onLoad === 'function'
    );
  }

  private registerPlugin(plugin: Plugin, path: string): void {
    const api: PluginAPI = {
      hook: (event, fn) => {
        const hooks = this.hooks.get(event) || [];
        hooks.push(fn);
        this.hooks.set(event, hooks);
      },
      getConfig: () => this.config as unknown as Record<string, unknown>,
      logger: {
        info: (msg) => logger.info(`[${plugin.name}] ${msg}`),
        warn: (msg) => logger.warn(`[${plugin.name}] ${msg}`),
        error: (msg) => logger.error(`[${plugin.name}] ${msg}`)
      }
    };

    plugin.onLoad(api);
    this.plugins.push({ plugin, path });
    logger.info('Plugin loaded', { name: plugin.name, version: plugin.version });
  }

  async triggerHooks(event: string, ctx: Record<string, unknown>): Promise<void> {
    const hooks = this.hooks.get(event) || [];
    
    for (const hook of hooks) {
      try {
        await hook(ctx);
      } catch (error) {
        logger.error('Hook execution failed', { event, error: (error as Error).message });
      }
    }
  }

  getLoadedPlugins(): { name: string; version: string }[] {
    return this.plugins.map(p => ({
      name: p.plugin.name,
      version: p.plugin.version
    }));
  }
}