import type { AIContext } from "./context";
import type { AIAnalysis } from "./analysis";
import { createPlan } from "./planner";
import { routePlan } from "./router";
import { verifyResult } from "./verifier";
import { refineResult } from "./refiner";
import type { AIResult } from "./result";

export async function orchestrate(
  context: AIContext,
  analysis: AIAnalysis,
  initialResult: AIResult,
): Promise<AIResult> {
  const plan = createPlan(analysis);
  const routes = routePlan(plan);

  const result: AIResult = {
    ...initialResult,
    metadata: {
      ...initialResult.metadata,
      plan,
      routes,
    },
  };

  const verification = verifyResult(result);

  if (verification.needsRefinement) {
    const refined = refineResult({
      result,
      verification,
      instructions: analysis.instructions,
    });

    return refined.result;
  }

  return {
    ...result,
    verified: true,
  };
}
