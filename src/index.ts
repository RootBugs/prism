import { ProxyServer } from './core/proxy';
import { PluginLoader } from './plugins/loader';
import { loadConfig } from './utils/config';
import { logger } from './utils/logger';

async function main() {
  loadConfig();

  const pluginLoader = new PluginLoader();
  await pluginLoader.loadPlugins();

  const loadedPlugins = pluginLoader.getLoadedPlugins();
  if (loadedPlugins.length > 0) {
    logger.info('Loaded plugins', { plugins: loadedPlugins.map(p => p.name) });
  }

  const server = new ProxyServer();
  server.start();
}

main().catch((error) => {
  logger.error('Failed to start PRISM', { error: error.message });
  process.exit(1);
});