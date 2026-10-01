export type RefrigerationRequest = {
  description?: string;
  imageUrl?: string;
};

export type RefrigerationResult = {
  equipment?: string;
  manufacturer?: string;
  model?: string;
  power?: string;
  current?: string;
  voltage?: string;
  refrigerant?: string;
  capacity?: string;
  confirmedFields: string[];
  uncertainFields: string[];
  notes: string[];
};

export function refrigerationDomain(
  _request: RefrigerationRequest,
): RefrigerationResult {
  return {
    confirmedFields: [],
    uncertainFields: [],
    notes: [],
  };
}
