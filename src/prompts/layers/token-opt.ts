interface LayerContext {
  query: string;
  conversation: string[];
}

export function tokenOptLayer(context: LayerContext): string {
  const queryLength = context.query.length;
  
  if (queryLength < 50) {
    return `Provide a concise response. The query is brief, so a brief answer may be appropriate.`;
  }

  if (queryLength > 500) {
    return `Provide a detailed response appropriate to the complexity of the query. Consider structure and organization.`;
  }

  return `Balance completeness with conciseness. Match response length to query complexity.`;
}