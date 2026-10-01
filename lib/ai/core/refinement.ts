import type { AIResult } from "./result";
import type { VerificationResult } from "./verification";

export type RefinementRequest = {
  result: AIResult;
  verification: VerificationResult;
  instructions: string[];
};

export type RefinementResult = {
  result: AIResult;
  changes: string[];
};
