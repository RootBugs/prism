interface LayerContext {
  query: string;
  conversation: string[];
}

export function memoryLayer(context: LayerContext): string {
  const conversation = context.conversation;
  
  if (conversation.length > 0) {
    return `Consider the conversation history for context and continuity. Reference relevant prior exchanges when they add value to the current response. Maintain consistency with previously provided information.`;
  }

  return `This is the start of the conversation. Establish context from the current query.`;
}