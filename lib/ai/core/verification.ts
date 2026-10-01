export type VerificationIssue = {
  type:
    | "incorrect"
    | "incomplete"
    | "unsupported"
    | "ambiguous"
    | "format";
  message: string;
};

export type VerificationResult = {
  valid: boolean;
  confidence: number;
  issues: VerificationIssue[];
  needsRefinement: boolean;
};
