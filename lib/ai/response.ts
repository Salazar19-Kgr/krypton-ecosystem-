export type AIResponse = {
  content: string;
  provider?: string;
  sources?: string[];
  conversationId?: string;
  metadata?: Record<string, unknown>;
};
