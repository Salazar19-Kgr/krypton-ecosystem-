import type { AIAnalysis } from "./analysis";
import type { AIPlan } from "./plan";

export function routePlan(plan: AIPlan): string[] {
  const routes: string[] = [];

  if (plan.requiresVision) {
    routes.push("vision");
  }

  if (plan.requiresSearch) {
    routes.push("web-search");
  }

  if (plan.domain === "mathematics") {
    routes.push("mathematics");
  }

  if (plan.domain === "refrigeration") {
    routes.push("refrigeration");
  }

  if (routes.length === 0) {
    routes.push("gemini");
  }

  return routes;
}

export function routeAnalysis(analysis: AIAnalysis): string[] {
  return routePlan({
    intent: analysis.intent.type,
    domain: analysis.intent.type,
    requiresVision: analysis.requiresVision,
    requiresSearch: analysis.requiresSearch,
    steps: [],
  });
}
