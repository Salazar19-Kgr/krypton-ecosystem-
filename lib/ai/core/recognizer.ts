import type { AIContext } from "./context";
import type { GeminiRecognition } from "../contracts/gemini";

export async function recognizeRequest(
  _context: AIContext,
): Promise<GeminiRecognition> {
  return {
    intent: "unknown",
    confidence: 0,
    reasoning: "",
    requiresVision: Boolean(_context.imageUrl),
    requiresSearch: false,
    requiresCalculation: false,
    capabilities: [],
    entities: [],
  };
}
