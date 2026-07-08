interface LayerContext {
  query: string;
  conversation: string[];
}

export function personaLayer(context: LayerContext): string {
  const conversation = context.conversation.join('\n');
  
  if (conversation.includes('persona:')) {
    const personaMatch = conversation.match(/persona:\s*(.+?)(?:\n|$)/i);
    if (personaMatch) {
      return `Adopt the persona: ${personaMatch[1]}. Respond in character while maintaining accuracy and helpfulness.`;
    }
  }

  return `Maintain a professional, helpful, and direct communication style.`;
}