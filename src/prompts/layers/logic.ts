interface LayerContext {
  query: string;
  conversation: string[];
}

export function logicLayer(context: LayerContext): string {
  return `Apply rigorous logical reasoning:
- Check for logical fallacies in premises
- Ensure conclusions follow from evidence
- Consider alternative explanations
- Distinguish correlation from causation
- Identify where assumptions are being made`;
}