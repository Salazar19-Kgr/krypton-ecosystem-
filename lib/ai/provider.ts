export type AIProviderName =
  | "gemini"
  | "groq"
  | "wikipedia"
  | "vision";

export type AIProviderRequest = {
  input: string;
  context?: string;
  images?: string[];
};

export type AIProviderResponse = {
  provider: AIProviderName;
  content: string;
  sources?: string[];
  metadata?: Record<string, unknown>;
};

export interface AIProvider {
  name: AIProviderName;
  generate(
    request: AIProviderRequest,
  ): Promise<AIProviderResponse>;
}
