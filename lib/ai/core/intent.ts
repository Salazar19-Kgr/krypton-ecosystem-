export type AIIntent = {
  type:
    | "conversation"
    | "mathematics"
    | "refrigeration"
    | "vision"
    | "web_search"
    | "information"
    | "unknown";
  confidence: number;
  reason?: string;
};
