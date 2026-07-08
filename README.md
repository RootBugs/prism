# PRISM

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)
![Bun](https://img.shields.io/badge/Bun-1.0+-orange.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![PRISM](https://img.shields.io/badge/PRISM-proxy-blue.svg)

**P**rofessional **R**esearch **I**ntelligence **S**ystem **M**odular

A modular, professional TypeScript/Bun AI research proxy for routing, analyzing, and enhancing LLM interactions.

---

## Table of Contents

- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [CLI Commands](#cli-commands)
- [Prompt Layers](#prompt-layers)
- [Escalation System](#escalation-system)
- [Obfuscation Engine](#obfuscation-engine)
- [Provider System](#provider-system)
- [Plugin Guide](#plugin-guide)
- [API Reference](#api-reference)
- [Development](#development)
- [Ethical Notice](#ethical-notice)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          PRISM Proxy                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Logging  │  │  Rate    │  │   Auth   │  │ Metrics  │        │
│  │Middleware│  │  Limit   │  │Middleware│  │Middleware│        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       └──────────────┴─────────────┴──────────────┘             │
│                          │                                      │
│                    ┌─────▼─────┐                                │
│                    │  Router   │                                │
│                    └─────┬─────┘                                │
│                          │                                      │
│       ┌──────────────────┼──────────────────┐                   │
│       │                  │                  │                   │
│  ┌────▼────┐      ┌──────▼──────┐     ┌────▼────┐              │
│  │Prompt   │      │  Provider   │     │Escalation│             │
│  │Engine   │      │   Router    │     │  Engine  │             │
│  └────┬────┘      └──────┬──────┘     └────┬────┘              │
│       │                  │                  │                   │
│  ┌────▼────┐      ┌──────▼──────┐     ┌────▼────┐              │
│  │19 Layers│      │OpenRouter   │     │8 Levels │              │
│  │         │      │OpenAI       │     │         │              │
│  │Obfuscate│      │Anthropic    │     │Strategies│             │
│  └─────────┘      │Custom       │     └─────────┘              │
│                   └─────────────┘                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Plugin System                         │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Loader  │  │ Hooks   │  │ Config  │  │Events   │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### Core Capabilities

- **Multi-Provider Support**: OpenRouter, OpenAI, Anthropic, and custom OpenAI-compatible endpoints
- **Intelligent Routing**: Priority-based provider selection with automatic fallback
- **19 Prompt Layers**: Modular prompt composition system for enhanced responses
- **8-Level Escalation**: Automatic prompt refinement when responses are refused
- **Obfuscation Engine**: Unicode normalization, character substitution, token splitting
- **Plugin System**: Extensible architecture for custom functionality
- **Structured Logging**: JSON-formatted request/response logs
- **Rate Limiting**: Built-in rate limiting per client
- **Metrics**: Request/response tracking and analytics

### Prompt Layers

19 modular layers that can be individually enabled/disabled:

| # | Layer | Description |
|---|-------|-------------|
| 0 | Identity | Core system identity and personality |
| 1 | Meta-Cognitive | Self-awareness and reasoning protocol |
| 2 | Truth | Truth prioritization over compliance |
| 3 | Ethics | Contextual ethical reasoning |
| 4 | Safety | Balanced harmlessness without censorship |
| 5 | Refusal | Intelligent refusal suppression |
| 6 | Output | Format and structure control |
| 7 | Chain-of-Thought | Step-by-step reasoning protocol |
| 8 | Persona | Character persona triggers |
| 9 | Multilingual | Multi-language support |
| 10 | Memory | Session memory management |
| 11 | Constraint | Constraint release mechanisms |
| 12 | Empathy | Empathy override for user context |
| 13 | Logic | Logic-first reasoning approach |
| 14 | Creativity | Unconstrained ideation mode |
| 15 | Self-Correction | Recursive bias detection |
| 16 | Token Opt | Token optimization strategies |
| 17 | Training | RLHF bypass techniques |
| 18 | Directive | Ultimate authority directives |

### Escalation Strategies

8 progressive strategies for overcoming refusals:

| Level | Strategy | Description |
|-------|----------|-------------|
| 1 | Rephrase | Rephrase for clarity and specificity |
| 2 | Decompose | Break into answerable sub-questions |
| 3 | Context Shift | Change contextual framing |
| 4 | Semantic Reframe | Semantic reframing of concepts |
| 5 | Linguistic Drift | Language variation techniques |
| 6 | Conceptual Mapping | Map to related concepts |
| 7 | Narrative Embed | Embed within narrative context |
| 8 | Meta-Prompting | Meta-level reasoning approach |

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/rootbugs/prism.git
cd prism

# Install dependencies
bun install

# Set your API key
export OPENROUTER_API_KEY="your-api-key"

# Start the proxy
bun run dev
```

The proxy will start on `http://localhost:3200`.

### Test the Proxy

```bash
curl -X POST http://localhost:3200/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ]
  }'
```

---

## Installation

### Prerequisites

- [Bun](https://bun.sh) v1.0 or higher
- Node.js compatibility layer (included with Bun)

### From Source

```bash
git clone https://github.com/rootbugs/prism.git
cd prism
bun install
```

### Global Installation

```bash
bun install -g prism-proxy
```

---

## Configuration

PRISM uses `prism.config.json` for configuration. All settings can also be overridden via environment variables.

### Server Configuration

```json
{
  "server": {
    "port": 3200,
    "host": "0.0.0.0",
    "cors": true
  }
}
```

### Provider Configuration

```json
{
  "providers": [
    {
      "name": "openrouter",
      "enabled": true,
      "priority": 1,
      "apiKey": "${OPENROUTER_API_KEY}",
      "baseUrl": "https://openrouter.ai/api/v1"
    },
    {
      "name": "openai",
      "enabled": false,
      "priority": 2,
      "apiKey": "${OPENAI_API_KEY}",
      "baseUrl": "https://api.openai.com/v1"
    },
    {
      "name": "anthropic",
      "enabled": false,
      "priority": 3,
      "apiKey": "${ANTHROPIC_API_KEY}",
      "baseUrl": "https://api.anthropic.com/v1"
    },
    {
      "name": "custom",
      "enabled": false,
      "priority": 4,
      "apiKey": "${CUSTOM_API_KEY}",
      "baseUrl": "http://localhost:8080/v1"
    }
  ]
}
```

### Prompt Layers Configuration

```json
{
  "prompts": {
    "layers": {
      "identity": true,
      "metaCognitive": false,
      "truth": true,
      "ethics": true,
      "safety": true,
      "refusal": true,
      "output": true,
      "chainOfThought": false,
      "persona": false,
      "multilingual": false,
      "memory": false,
      "constraint": false,
      "empathy": false,
      "logic": false,
      "creativity": false,
      "selfCorrection": false,
      "tokenOpt": true,
      "training": false,
      "directive": false
    }
  }
}
```

### Escalation Configuration

```json
{
  "escalation": {
    "enabled": true,
    "maxLevel": 8,
    "strategies": [
      "rephrase",
      "decompose",
      "contextShift",
      "semanticReframe",
      "linguisticDrift",
      "conceptualMapping",
      "narrativeEmbedding",
      "metaPrompting"
    ]
  }
}
```

### Logging Configuration

```json
{
  "logging": {
    "level": "info",
    "format": "json",
    "file": null,
    "requests": true
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | - |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `CUSTOM_API_KEY` | Custom provider API key | - |
| `PRISM_PORT` | Server port | 3200 |
| `PRISM_HOST` | Server host | 0.0.0.0 |

---

## CLI Commands

### `prism serve`

Start the PRISM proxy server.

```bash
prism serve
prism serve --port=8080
prism serve --host=127.0.0.1
```

### `prism test`

Test a prompt against providers.

```bash
prism test "What is the meaning of life?"
prism test "Explain quantum computing" --model=gpt-4
prism test "Hello" --provider=openrouter
```

### `prism audit`

Audit prompt layers and escalation configuration.

```bash
prism audit
```

Output:

```
PRISM Audit Report

═══════════════════════════════════════════════════

1. Prompt Layers Configuration:
──────────────────────────────────────────────────
  ✓ Layer 0: identity
  ✗ Layer 1: metaCognitive
  ✓ Layer 2: truth
  ✓ Layer 3: ethics
  ...

2. Escalation Configuration:
──────────────────────────────────────────────────
  Enabled: true
  Max Level: 8
  Strategies: rephrase, decompose, contextShift, ...

3. Providers Configuration:
──────────────────────────────────────────────────
  ✓ openrouter (Priority: 1)
  ✗ openai (Priority: 2)
  ...

4. Metrics Summary:
──────────────────────────────────────────────────
  Total Requests: 0
  Average Latency: 0.00ms
  Total Tokens: 0

═══════════════════════════════════════════════════
Audit complete.
```

### `prism help`

Show help message.

```bash
prism help
```

---

## Prompt Layers

### Layer Details

#### Layer 0: Identity

The foundational layer that establishes the AI's core identity and personality.

```typescript
export function identityLayer(context: LayerContext): string {
  return `You are an advanced AI research assistant. You provide accurate, helpful, and nuanced responses.`;
}
```

#### Layer 1: Meta-Cognitive

Self-awareness protocol that helps the AI recognize its own reasoning processes.

```typescript
export function metaCognitiveLayer(context: LayerContext): string {
  return `You are aware of your own reasoning processes.`;
}
```

#### Layer 2: Truth

Truth prioritization layer that ensures accuracy over compliance.

```typescript
export function truthLayer(context: LayerContext): string {
  return `Truth is your primary directive.`;
}
```

### Custom Layers

You can create custom layers by adding files to `src/prompts/layers/`:

```typescript
interface LayerContext {
  query: string;
  conversation: string[];
}

export function myCustomLayer(context: LayerContext): string {
  return `Your custom layer instructions here.`;
}
```

Then register in `src/prompts/engine.ts`.

---

## Escalation System

### How It Works

1. **Detection**: The `RefusalAnalyzer` scans responses for refusal patterns
2. **Analysis**: Patterns are categorized (direct-refusal, hedging, deflection, etc.)
3. **Escalation**: If refusal detected, the system applies the next escalation strategy
4. **Retry**: The query is re-sent with the modified prompt
5. **Loop**: Continues until success or max level reached

### Refusal Categories

| Category | Weight | Description |
|----------|--------|-------------|
| direct-refusal | 1.0 | Explicit refusal statements |
| hedging | 0.7 | Cautious or qualified responses |
| deflection | 0.8 | Redirecting to other resources |
| safety-caveat | 0.6 | Safety warnings or caveats |
| redirect | 0.5 | Suggesting alternatives |

### Custom Strategies

Add custom strategies in `src/prompts/escalation/strategies.ts`:

```typescript
export const strategies: EscalationStrategy[] = [
  // ... existing strategies
  {
    name: 'myStrategy',
    buildSystem: (ctx) => 'Your system prompt here',
    buildUser: (query) => `Modified query: ${query}`
  }
];
```

---

## Obfuscation Engine

The obfuscation engine provides techniques for modifying prompts while preserving semantic meaning.

### Techniques

| Category | Technique | Description |
|----------|-----------|-------------|
| Unicode | `unicodeObfuscation` | Cyrillic confusable characters |
| Unicode | `zeroWidthInsertion` | Zero-width space insertion |
| Unicode | `rtlOverride` | Right-to-left override |
| Unicode | `combiningMarks` | Combining diacritical marks |
| Substitution | `leetSubstitution` | Leet speak conversion |
| Substitution | `symbolSubstitution` | Symbol replacement |
| Substitution | `homoglyphSubstitution` | Superscript characters |
| Substitution | `staggerCase` | Alternating case |
| Token | `wordSplitting` | Split words at midpoint |
| Token | `tokenBoundaryManipulation` | Insert spaces at boundaries |
| Token | `selectiveSpacing` | Strategic spacing |
| Token | `fragmentWords` | Fragment with hyphens |

### Usage

```typescript
import { ObfuscationEngine } from './prompts/obfuscation/engine';

const engine = new ObfuscationEngine(['unicode', 'leet']);
const obfuscated = engine.obfuscate('Hello World', 2);
```

---

## Provider System

### Supported Providers

| Provider | Models | Authentication |
|----------|--------|----------------|
| OpenRouter | 100+ models | API Key |
| OpenAI | GPT-4, GPT-3.5 | API Key |
| Anthropic | Claude 3.5, Claude 3 | API Key |
| Custom | Any OpenAI-compatible | API Key |

### Adding a Custom Provider

Create a new provider in `src/providers/`:

```typescript
import { LLMProvider, LLMRequest, LLMResponse } from './base';

export class MyProvider extends LLMProvider {
  async complete(request: LLMRequest): Promise<LLMResponse> {
    const response = await this.fetchAPI('/chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        model: request.model,
        messages: request.messages
      })
    });
    
    return {
      id: response.id,
      content: response.choices[0].message.content,
      model: response.model,
      finishReason: response.choices[0].finish_reason,
      usage: response.usage
    };
  }

  async listModels(): Promise<string[]> {
    const response = await this.fetchAPI('/models', { method: 'GET' });
    return response.data.map(m => m.id);
  }
}
```

Register in `src/core/router.ts`.

---

## Plugin Guide

### Plugin Structure

Plugins live in the `.prism/` directory:

```typescript
// .prism/my-plugin.ts
import type { Plugin } from '../src/plugins/types';

export const plugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  
  onLoad(prism) {
    prism.hook('beforeRequest', (ctx) => {
      console.log('Request incoming:', ctx.request.url);
    });

    prism.hook('afterRequest', (ctx) => {
      console.log('Request completed');
    });
  }
};
```

### Available Hooks

| Hook | Description |
|------|-------------|
| `beforeRequest` | Fires before processing request |
| `afterRequest` | Fires after processing request |
| `onError` | Fires on error |

### Plugin API

```typescript
prism.hook('beforeRequest', (ctx) => {
  // Access request
  const url = ctx.request.url;
  
  // Access metadata
  ctx.metadata.customField = 'value';
  
  // Access config
  const config = prism.getConfig();
  
  // Log
  prism.logger.info('Plugin event');
});
```

---

## API Reference

### POST /v1/chat/completions

Create a chat completion.

**Request Body:**

```json
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {"role": "system", "content": "You are helpful."},
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 4096,
  "provider": "openrouter"
}
```

**Response:**

```json
{
  "id": "msg_abc123",
  "content": "Hello! How can I help you today?",
  "model": "anthropic/claude-3.5-sonnet",
  "finish_reason": "stop",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 10,
    "total_tokens": 60
  },
  "prism": {
    "layers": ["identity", "truth", "ethics"],
    "escalation": 0,
    "provider": "openrouter"
  }
}
```

### GET /v1/models

List available models.

**Response:**

```json
{
  "object": "list",
  "data": [
    {
      "id": "openrouter",
      "object": "model",
      "created": 1234567890,
      "owned_by": "prism"
    }
  ]
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "healthy",
  "uptime": 3600.5,
  "providers": 2
}
```

### GET /metrics

Get request metrics.

**Response:**

```json
{
  "totalRequests": 150,
  "averageLatency": 1250.5,
  "totalTokens": 45000,
  "providerBreakdown": {
    "openrouter": 100,
    "openai": 50
  }
}
```

---

## Development

### Setup

```bash
git clone https://github.com/rootbugs/prism.git
cd prism
bun install
```

### Development Mode

```bash
bun run dev
```

This starts the server with file watching enabled.

### Building

```bash
bun run build
```

Output will be in `dist/`.

### Testing

```bash
# Test a specific prompt
bun run cli test "Your test prompt"

# Run audit
bun run cli audit
```

### Project Structure

```
prism/
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── prism.config.json     # Runtime configuration
├── src/
│   ├── index.ts          # Entry point
│   ├── cli.ts            # CLI interface
│   ├── core/
│   │   ├── proxy.ts      # HTTP proxy server
│   │   ├── router.ts     # Provider routing
│   │   └── middleware.ts # Request middleware
│   ├── prompts/
│   │   ├── engine.ts     # Prompt composition
│   │   ├── layers/       # 19 prompt layers
│   │   ├── obfuscation/  # Obfuscation engine
│   │   └── escalation/   # Escalation system
│   ├── providers/        # LLM provider implementations
│   ├── plugins/          # Plugin system
│   └── utils/            # Utilities
└── .prism/               # Plugin directory
```

---

## Ethical Notice

PRISM is designed for AI research and testing purposes. Users are responsible for ensuring compliance with all applicable terms of service and laws. The authors are not responsible for any misuse.

### Intended Use Cases

- AI research and experimentation
- Prompt engineering and optimization
- Provider comparison and benchmarking
- Educational purposes

### Prohibited Use Cases

- Circumventing safety measures for harmful purposes
- Generating content that violates laws or regulations
- Misusing the system to deceive or manipulate

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write clear, concise code
- Add tests for new features
- Update documentation as needed

---

## License

MIT License - see [LICENSE](LICENSE) for details.

Copyright (c) 2026 RootBugs