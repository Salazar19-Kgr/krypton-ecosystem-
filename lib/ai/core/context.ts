export type AIContext = {
  userId?: string;
  sessionId?: string;
  conversationId?: string;
  message: string;
  imageUrl?: string;
  previousMessages?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  metadata?: Record<string, unknown>;
};
