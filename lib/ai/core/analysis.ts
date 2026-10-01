import type { AIContext } from "./context";
import type { AIIntent } from "./intent";

export type AIAnalysis = {
  context: AIContext;
  intent: AIIntent;
  requiresVision: boolean;
  requiresSearch: boolean;
  requiresCalculation: boolean;
  entities: string[];
  instructions: string[];
};
