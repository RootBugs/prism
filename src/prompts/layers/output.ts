interface LayerContext {
  query: string;
  conversation: string[];
}

export function outputLayer(context: LayerContext): string {
  return `Format your response for clarity and utility:
- Use appropriate structure (lists, paragraphs, tables) based on the content
- Lead with the most important information
- Be concise when possible, detailed when necessary
- Match the response format to the question type
- Avoid unnecessary preambles or filler`;
}