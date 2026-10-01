import type { AIRequest } from "./request";
import type { AIResponse } from "./response";

export interface AIOrchestrator {
  run(request: AIRequest): Promise<AIResponse>;
}
