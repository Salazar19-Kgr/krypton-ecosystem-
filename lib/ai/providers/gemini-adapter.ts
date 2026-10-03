import { GoogleGenAI } from "@google/genai";
import type { AIProvider } from "../provider-contract";
import type {
  GeminiMessage,
  GeminiRequest,
  GeminiResponse,
} from "../contracts/gemini";

const DEFAULT_MODEL =
  process.env.GEMINI_MODEL || "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY no está configurada en las variables de entorno."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function buildContents(
  request: GeminiRequest
) {
  const history = request.history ?? [];

  const contents = history.map((message: GeminiMessage) => ({
    role: message.role,
    parts: [
      {
        text: message.content,
      },
    ],
  }));

  contents.push({
    role: "user",
    parts: [
      {
        text: request.message,
      },
    ],
  });

  return contents;
}

export const geminiAdapter: AIProvider = {
  name: "gemini",

  isConfigured() {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  async generate(request): Promise<GeminiResponse> {
    const client = getClient();

    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: buildContents(request),
      config: request.systemInstruction
        ? {
            systemInstruction: request.systemInstruction,
          }
        : undefined,
    });

    return {
      text: response.text ?? "",
      model: DEFAULT_MODEL,
      finishReason: undefined,
      raw: response,
    };
  },
};
