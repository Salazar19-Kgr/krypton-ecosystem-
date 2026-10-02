export type RecognitionResult = {
  intent: string;
  confidence: number;
  requiresVision: boolean;
  requiresSearch: boolean;
  requiresCalculation: boolean;
  entities: string[];
  reasoning: string;
};

export function createRecognition(
  result: RecognitionResult,
): RecognitionResult {
  return result;
}
