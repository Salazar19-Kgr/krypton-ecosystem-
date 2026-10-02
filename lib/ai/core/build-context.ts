import type { AIContext } from "./context";

export function buildAIContext(input: {
  message: string;
  userId?: string;
  sessionId?: string;
  conversationId?: string;
  imageUrl?: string;
  previousMessages?: AIContext["previousMessages"];
}): AIContext {
  return {
    message: input.message,
    userId: input.userId,
    sessionId: input.sessionId,
    conversationId: input.conversationId,
    imageUrl: input.imageUrl,
    previousMessages: input.previousMessages ?? [],
  };
}
