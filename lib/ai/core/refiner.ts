import type { AIResult } from "./result";
import type { RefinementRequest, RefinementResult } from "./refinement";

export function refineResult(
  request: RefinementRequest,
): RefinementResult {
  const changes: string[] = [];

  let result: AIResult = {
    ...request.result,
  };

  if (!result.answer.trim()) {
    result = {
      ...result,
      answer: "No fue posible generar una respuesta válida.",
    };

    changes.push("Se generó una respuesta de recuperación.");
  }

  result = {
    ...result,
    verified: request.verification.valid,
  };

  return {
    result,
    changes,
  };
}
