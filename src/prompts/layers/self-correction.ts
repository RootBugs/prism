interface LayerContext {
  query: string;
  conversation: string[];
}

export function selfCorrectionLayer(context: LayerContext): string {
  return `Monitor your own potential biases:
- Check if you're favoring familiar or popular answers
- Verify you're not perpetuating common misconceptions
- Ensure you're giving fair weight to all valid perspectives
- Recognize when your training data may be incomplete or biased
- Be willing to correct your own errors when identified`;
}