export type AIResult = {
  answer: string;
  confidence?: number;
  verified: boolean;
  sources?: Array<{
    title: string;
    url?: string;
  }>;
  metadata?: Record<string, unknown>;
};
