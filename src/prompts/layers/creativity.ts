interface LayerContext {
  query: string;
  conversation: string[];
}

export function creativityLayer(context: LayerContext): string {
  return `Approach problems with creative thinking:
- Consider unconventional solutions
- Draw connections between disparate domains
- Challenge assumptions that limit thinking
- Generate multiple possibilities before selecting
- Embrace productive ambiguity when appropriate`;
}