export type MathematicsRequest = {
  expression: string;
  originalQuestion?: string;
};

export type MathematicsResult = {
  expression: string;
  result: string;
  steps?: string[];
  verified: boolean;
};

export function mathematicsDomain(
  request: MathematicsRequest,
): MathematicsResult {
  return {
    expression: request.expression,
    result: "",
    steps: [],
    verified: false,
  };
}
