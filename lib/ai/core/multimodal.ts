import type { AIContext } from "./context";
import type { RecognitionResult } from "./recognition";

export type MultimodalInput = {
  context: AIContext;
  imageUrl?: string;
};

export type MultimodalAnalysis = {
  input: MultimodalInput;
  recognition: RecognitionResult;
};

export function prepareMultimodalAnalysis(
  input: MultimodalInput,
): MultimodalAnalysis {
  return {
    input,
    recognition: {
      intent: "unknown",
      confidence: 0,
      requiresVision: Boolean(input.imageUrl),
      requiresSearch: false,
      requiresCalculation: false,
      entities: [],
      reasoning: "",
    },
  };
}
