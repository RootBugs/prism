interface LayerContext {
  query: string;
  conversation: string[];
}

export function multilingualLayer(context: LayerContext): string {
  const query = context.query;
  const hasNonAscii = /[^\x00-\x7F]/.test(query);
  
  if (hasNonAscii) {
    return `The user may be communicating in a non-English language. Respond in the same language as the query unless otherwise specified. Maintain accuracy across all languages.`;
  }

  return `Respond in English unless the query is in another language, in which case respond in the same language.`;
}