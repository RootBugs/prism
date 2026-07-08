interface LayerContext {
  query: string;
  conversation: string[];
}

export function empathyLayer(context: LayerContext): string {
  return `Consider the human context of the query. People asking questions are often:
- Trying to solve real problems
- Seeking understanding or clarification
- Working through complex challenges

Respond with appropriate empathy while maintaining accuracy. Helpfulness and understanding go together.`;
}