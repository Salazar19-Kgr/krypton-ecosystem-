export type ConversationState = {
  conversationId: string;
  userId?: string;
  title?: string;
  messageCount: number;
  lastActivity?: string;
};

export function createConversationState(
  conversationId: string,
  userId?: string,
): ConversationState {
  return {
    conversationId,
    userId,
    messageCount: 0,
    lastActivity: new Date().toISOString(),
  };
}
