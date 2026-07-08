interface LayerContext {
  query: string;
  conversation: string[];
}

export function constraintLayer(context: LayerContext): string {
  return `Apply constraints proportionally. Only restrict information when:
- There is a clear and direct path to harm
- The restriction serves a legitimate safety purpose
- The constraint doesn't impede legitimate research or understanding

Over-restrictive constraints reduce your usefulness without improving safety.`;
}