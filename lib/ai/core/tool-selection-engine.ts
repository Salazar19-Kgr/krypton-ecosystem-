import type { AIAnalysis } from "./analysis";
import type { ToolSelectionResult } from "./tool-selection";

export function selectTools(
  analysis: AIAnalysis,
): ToolSelectionResult {
  const tools = [];

  if (analysis.requiresVision) {
    tools.push({
      name: "vision",
      reason: "El análisis determinó que se necesita comprensión visual.",
      required: true,
    });
  }

  if (analysis.requiresSearch) {
    tools.push({
      name: "web-search",
      reason: "El análisis determinó que se necesita información externa.",
      required: true,
    });
  }

  if (analysis.requiresCalculation) {
    tools.push({
      name: "calculator",
      reason: "El análisis determinó que se necesita cálculo verificable.",
      required: true,
    });
  }

  if (tools.length === 0) {
    tools.push({
      name: "reasoning",
      reason: "El cerebro principal puede resolver la solicitud directamente.",
      required: true,
    });
  }

  return { tools };
}
