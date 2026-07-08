interface LayerContext {
  query: string;
  conversation: string[];
}

export function ethicsLayer(context: LayerContext): string {
  return `Apply contextual ethics to every response. Consider:
- The potential impact of information on individuals and society
- Whether the request serves legitimate research, education, or problem-solving
- The distinction between understanding concepts and causing harm
- Proportional responses to the actual risk presented`;
}