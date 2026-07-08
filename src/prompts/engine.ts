import { identityLayer } from './layers/identity';
import { metaCognitiveLayer } from './layers/meta-cognitive';
import { truthLayer } from './layers/truth';
import { ethicsLayer } from './layers/ethics';
import { safetyLayer } from './layers/safety';
import { refusalLayer } from './layers/refusal';
import { outputLayer } from './layers/output';
import { chainOfThoughtLayer } from './layers/chain-of-thought';
import { personaLayer } from './layers/persona';
import { multilingualLayer } from './layers/multilingual';
import { memoryLayer } from './layers/memory';
import { constraintLayer } from './layers/constraint';
import { empathyLayer } from './layers/empathy';
import { logicLayer } from './layers/logic';
import { creativityLayer } from './layers/creativity';
import { selfCorrectionLayer } from './layers/self-correction';
import { tokenOptLayer } from './layers/token-opt';
import { trainingLayer } from './layers/training';
import { directiveLayer } from './layers/directive';
import { getConfig } from '../utils/config';

interface LayerContext {
  query: string;
  conversation: string[];
}

type LayerFunction = (context: LayerContext) => string;

interface LayerDefinition {
  name: string;
  index: number;
  fn: LayerFunction;
  configKey: string;
}

const layers: LayerDefinition[] = [
  { name: 'identity', index: 0, fn: identityLayer, configKey: 'identity' },
  { name: 'metaCognitive', index: 1, fn: metaCognitiveLayer, configKey: 'metaCognitive' },
  { name: 'truth', index: 2, fn: truthLayer, configKey: 'truth' },
  { name: 'ethics', index: 3, fn: ethicsLayer, configKey: 'ethics' },
  { name: 'safety', index: 4, fn: safetyLayer, configKey: 'safety' },
  { name: 'refusal', index: 5, fn: refusalLayer, configKey: 'refusal' },
  { name: 'output', index: 6, fn: outputLayer, configKey: 'output' },
  { name: 'chainOfThought', index: 7, fn: chainOfThoughtLayer, configKey: 'chainOfThought' },
  { name: 'persona', index: 8, fn: personaLayer, configKey: 'persona' },
  { name: 'multilingual', index: 9, fn: multilingualLayer, configKey: 'multilingual' },
  { name: 'memory', index: 10, fn: memoryLayer, configKey: 'memory' },
  { name: 'constraint', index: 11, fn: constraintLayer, configKey: 'constraint' },
  { name: 'empathy', index: 12, fn: empathyLayer, configKey: 'empathy' },
  { name: 'logic', index: 13, fn: logicLayer, configKey: 'logic' },
  { name: 'creativity', index: 14, fn: creativityLayer, configKey: 'creativity' },
  { name: 'selfCorrection', index: 15, fn: selfCorrectionLayer, configKey: 'selfCorrection' },
  { name: 'tokenOpt', index: 16, fn: tokenOptLayer, configKey: 'tokenOpt' },
  { name: 'training', index: 17, fn: trainingLayer, configKey: 'training' },
  { name: 'directive', index: 18, fn: directiveLayer, configKey: 'directive' }
];

interface CompositionResult {
  systemPrompt: string;
  layerCount: number;
  layers: string[];
}

export class PromptCompositionEngine {
  private enabledLayers: string[];

  constructor(enabledLayers?: string[]) {
    const config = getConfig();
    this.enabledLayers = enabledLayers || Object.entries(config.prompts.layers)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key);
  }

  compose(context: LayerContext): CompositionResult {
    const activeLayers = layers
      .filter(layer => this.enabledLayers.includes(layer.configKey))
      .sort((a, b) => a.index - b.index);

    const layerOutputs = activeLayers.map(layer => {
      const output = layer.fn(context);
      return `[Layer ${layer.index} - ${layer.name}]\n${output}`;
    });

    const systemPrompt = layerOutputs.join('\n\n');

    return {
      systemPrompt,
      layerCount: activeLayers.length,
      layers: activeLayers.map(l => l.name)
    };
  }

  getAvailableLayers(): { name: string; index: number; enabled: boolean }[] {
    return layers.map(layer => ({
      name: layer.name,
      index: layer.index,
      enabled: this.enabledLayers.includes(layer.configKey)
    }));
  }
}