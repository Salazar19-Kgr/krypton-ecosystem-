export type VisionRequest = {
  imageUrl: string;
  question?: string;
};

export type VisionResult = {
  description: string;
  detectedObjects: string[];
  extractedText: string[];
  uncertainAreas: string[];
  confidence: number;
};

export function visionDomain(
  _request: VisionRequest,
): VisionResult {
  return {
    description: "",
    detectedObjects: [],
    extractedText: [],
    uncertainAreas: [],
    confidence: 0,
  };
}
