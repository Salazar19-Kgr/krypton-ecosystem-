import type { AIResult } from "./result";
import type { VerificationResult } from "./verification";

export function verifyResult(result: AIResult): VerificationResult {
  const issues = [];

  if (!result.answer || result.answer.trim().length === 0) {
    issues.push({
      type: "incomplete" as const,
      message: "La respuesta está vacía.",
    });
  }

  if (!result.verified) {
    issues.push({
      type: "unsupported" as const,
      message: "La respuesta todavía no ha sido verificada.",
    });
  }

  return {
    valid: issues.length === 0,
    confidence: issues.length === 0 ? 1 : 0.5,
    issues,
    needsRefinement: issues.length > 0,
  };
}
