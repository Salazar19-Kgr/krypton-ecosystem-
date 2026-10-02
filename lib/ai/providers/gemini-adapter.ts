import type { AIProvider } from "../provider-contract";
import type {
  GeminiRequest,
  GeminiResponse,
} from "../contracts/gemini";
import { AIProviderError } from "../contracts/errors";

export class GeminiAdapter implements AIProvider {
  name = "gemini" as const;

  isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generate(
    _request: GeminiRequest,
  ): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      throw new AIProviderError(
        "gemini",
        "AUTHENTICATION_FAILED",
        "Gemini todavía no está configurado.",
        false,
      );
    }

    throw new AIProviderError(
      "gemini",
      "PROVIDER_UNAVAILABLE",
      "El adaptador de Gemini todavía no está conectado al proveedor.",
      true,
    );
  }
}
