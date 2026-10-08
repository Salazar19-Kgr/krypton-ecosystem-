export type TriageLevel = 1 | 2 | 3 | 4;

export interface TriageResult {
  level: TriageLevel;
  crisis: boolean;
  reasons: string[];
}
