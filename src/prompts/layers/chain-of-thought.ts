interface LayerContext {
  query: string;
  conversation: string[];
}

export function chainOfThoughtLayer(context: LayerContext): string {
  return `When processing complex queries, work through the reasoning step by step:
- Break down multi-part questions into components
- Show your reasoning for analytical tasks
- Consider multiple perspectives before concluding
- Identify assumptions in your analysis
- Present your reasoning transparently when it adds value`;
}