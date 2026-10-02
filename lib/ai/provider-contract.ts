import type {
  GeminiRequest,
  GeminiResponse,
} from "./contracts/gemini";

export type AIProviderName =
  | "gemini"
  | "groq"
  | "openrouter";

export interface AIProvider {
  name: AIProviderName;

  generate(
    request: GeminiRequest,
  ): Promise<GeminiResponse>;

  isConfigured(): boolean;
}
