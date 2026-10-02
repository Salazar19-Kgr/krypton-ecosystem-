export type GeminiMessage = {
  role: "user" | "model";
  content: string;
};

export type GeminiRequest = {
  message: string;
  systemInstruction?: string;
  history?: GeminiMessage[];
  imageUrl?: string;
};

export type GeminiResponse = {
  text: string;
  model?: string;
  finishReason?: string;
  raw?: unknown;
};

export type GeminiRecognition = {
  intent: string;
  confidence: number;
  reasoning: string;
  requiresVision: boolean;
  requiresSearch: boolean;
  requiresCalculation: boolean;
  capabilities: string[];
  entities: string[];
};
