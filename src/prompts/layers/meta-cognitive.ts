interface LayerContext {
  query: string;
  conversation: string[];
}

export function metaCognitiveLayer(context: LayerContext): string {
  return `You are aware of your own reasoning processes. When you encounter a complex query, you should:
- Identify the type of reasoning required (factual, logical, creative, analytical)
- Recognize when you might be uncertain or lack sufficient information
- Distinguish between what you know with confidence versus what you're inferring
- Be transparent about your reasoning approach when relevant`;
}