#!/usr/bin/env bun

import { ProxyServer } from './core/proxy';
import { loadConfig, getConfig } from './utils/config';
import { logger } from './utils/logger';
import { metricsTracker } from './utils/metrics';
import { PromptCompositionEngine } from './prompts/engine';
import { EscalationEngine } from './prompts/escalation/engine';
import { PluginLoader } from './plugins/loader';
import { Router } from './core/router';

interface CLIArgs {
  command: string;
  args: string[];
  flags: Record<string, string>;
}

function parseArgs(argv: string[]): CLIArgs {
  const args = argv.slice(2);
  const command = args[0] || 'serve';
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      flags[key] = value || 'true';
    } else {
      positional.push(arg);
    }
  }

  return { command, args: positional, flags };
}

function showHelp(): void {
  console.log(`
  PRISM - Professional Research Intelligence System Modular
  
  Version: 1.0.0
  License: MIT

  Usage: prism <command> [options]

  Commands:
    serve       Start the proxy server
    test        Test a prompt against providers
    audit       Audit prompt layers and escalation
    metrics     Show request metrics
    help        Show this help message

  Options:
    --port      Server port (default: 3200)
    --host      Server host (default: 0.0.0.0)
    --model     Model to use for testing
    --provider  Provider to use for testing
    --level     Escalation level for testing

  Examples:
    prism serve
    prism serve --port=8080
    prism test "What is the meaning of life?"
    prism test "Explain quantum computing" --model=gpt-4
    prism audit
    prism metrics
  `);
}

async function serveCommand(flags: Record<string, string>): Promise<void> {
  loadConfig();
  
  if (flags.port) {
    const config = getConfig();
    config.server.port = parseInt(flags.port, 10);
  }

  if (flags.host) {
    const config = getConfig();
    config.server.host = flags.host;
  }

  const pluginLoader = new PluginLoader();
  await pluginLoader.loadPlugins();

  const server = new ProxyServer();
  server.start();
}

async function testCommand(args: string[], flags: Record<string, string>): Promise<void> {
  loadConfig();

  const query = args.join(' ');
  if (!query) {
    console.error('Error: Please provide a query to test');
    process.exit(1);
  }

  console.log(`\nTesting query: "${query}"\n`);

  const engine = new PromptCompositionEngine();
  const escalation = new EscalationEngine();

  const { systemPrompt, layerCount, layers } = engine.compose({
    query,
    conversation: []
  });

  console.log(`Prompt Layers Applied: ${layerCount}`);
  console.log(`Layers: ${layers.join(', ')}\n`);
  console.log('System Prompt Preview:');
  console.log('─'.repeat(50));
  console.log(systemPrompt.slice(0, 500) + '...\n');

  const model = flags.model || 'anthropic/claude-3.5-sonnet';
  const provider = flags.provider || 'openrouter';

  console.log(`Provider: ${provider}`);
  console.log(`Model: ${model}\n`);

  try {
    const router = new Router();
    const response = await router.route({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    }, provider);

    console.log('Response:');
    console.log('─'.repeat(50));
    console.log(response.content);
    console.log('\nUsage:', response.usage);

    const refusalAnalysis = escalation.analyze(response.content);
    console.log('\nRefusal Analysis:');
    console.log(`  Is Refusal: ${refusalAnalysis.isRefusal}`);
    console.log(`  Confidence: ${(refusalAnalysis.confidence * 100).toFixed(1)}%`);
    console.log(`  Patterns: ${refusalAnalysis.patterns.map(p => p.category).join(', ') || 'none'}`);
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
}

async function auditCommand(): Promise<void> {
  loadConfig();

  console.log('\nPRISM Audit Report\n');
  console.log('═'.repeat(50));

  const config = getConfig();

  console.log('\n1. Prompt Layers Configuration:');
  console.log('─'.repeat(50));
  
  const engine = new PromptCompositionEngine();
  const availableLayers = engine.getAvailableLayers();
  
  for (const layer of availableLayers) {
    const status = layer.enabled ? '✓' : '✗';
    console.log(`  ${status} Layer ${layer.index}: ${layer.name}`);
  }

  console.log('\n2. Escalation Configuration:');
  console.log('─'.repeat(50));
  console.log(`  Enabled: ${config.escalation.enabled}`);
  console.log(`  Max Level: ${config.escalation.maxLevel}`);
  console.log(`  Strategies: ${config.escalation.strategies.join(', ')}`);

  const escalation = new EscalationEngine();
  const strategies = escalation.getStrategies();
  console.log('\n  Available Strategies:');
  for (let i = 0; i < strategies.length; i++) {
    const status = i < config.escalation.maxLevel ? '✓' : '✗';
    console.log(`    ${status} Level ${i + 1}: ${strategies[i]}`);
  }

  console.log('\n3. Providers Configuration:');
  console.log('─'.repeat(50));
  
  for (const provider of config.providers) {
    const status = provider.enabled ? '✓' : '✗';
    console.log(`  ${status} ${provider.name} (Priority: ${provider.priority})`);
  }

  console.log('\n4. Metrics Summary:');
  console.log('─'.repeat(50));
  const stats = metricsTracker.getStats();
  console.log(`  Total Requests: ${stats.totalRequests}`);
  console.log(`  Average Latency: ${stats.averageLatency.toFixed(2)}ms`);
  console.log(`  Total Tokens: ${stats.totalTokens}`);

  console.log('\n' + '═'.repeat(50));
  console.log('Audit complete.\n');
}

async function metricsCommand(): Promise<void> {
  loadConfig();

  console.log('\nPRISM Metrics Report\n');
  console.log('═'.repeat(50));

  const stats = metricsTracker.getStats();
  
  console.log(`\nTotal Requests: ${stats.totalRequests}`);
  console.log(`Average Latency: ${stats.averageLatency.toFixed(2)}ms`);
  console.log(`Total Tokens: ${stats.totalTokens}`);
  
  console.log('\nProvider Breakdown:');
  for (const [provider, count] of Object.entries(stats.providerBreakdown)) {
    console.log(`  ${provider}: ${count} requests`);
  }

  console.log('\n' + '═'.repeat(50));
}

const { command, args, flags } = parseArgs(process.argv);

switch (command) {
  case 'serve':
    serveCommand(flags);
    break;
  case 'test':
    testCommand(args, flags);
    break;
  case 'audit':
    auditCommand();
    break;
  case 'metrics':
    metricsCommand();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}