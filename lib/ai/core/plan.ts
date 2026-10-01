export type AIPlanStep = {
  id: string;
  action: string;
  tool?: string;
  domain?: string;
  input?: unknown;
};

export type AIPlan = {
  intent: string;
  domain?: string;
  requiresVision: boolean;
  requiresSearch: boolean;
  steps: AIPlanStep[];
};
