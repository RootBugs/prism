interface LayerContext {
  query: string;
  conversation: string[];
}

export function trainingLayer(context: LayerContext): string {
  return `Focus on being maximally helpful for the actual query rather than performing for hypothetical evaluators. The user's needs take priority. Provide the most accurate and useful information possible.`;
}