export type AIRequest = {
  userId?: string;
  conversationId?: string;
  message: string;
  images?: string[];
  useMemory?: boolean;
  useWeb?: boolean;
};
