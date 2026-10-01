import type { AIAnalysis } from "./analysis";
import type { AIPlan } from "./plan";

export function createPlan(analysis: AIAnalysis): AIPlan {
  const steps: AIPlan["steps"] = [];

  if (analysis.requiresVision) {
    steps.push({
      id: "vision",
      action: "Analizar la imagen proporcionada",
      tool: "vision",
      domain: analysis.intent.type,
    });
  }

  if (analysis.requiresSearch) {
    steps.push({
      id: "search",
      action: "Buscar información externa necesaria",
      tool: "web-search",
    });
  }

  if (analysis.requiresCalculation) {
    steps.push({
      id: "calculation",
      action: "Realizar y verificar cálculos",
      tool: "calculator",
      domain: "mathematics",
    });
  }

  return {
    intent: analysis.intent.type,
    domain: analysis.intent.type,
    requiresVision: analysis.requiresVision,
    requiresSearch: analysis.requiresSearch,
    steps,
  };
}
