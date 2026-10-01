export type ToolSelection = {
  name: string;
  reason: string;
  input?: unknown;
  required: boolean;
};

export type ToolSelectionResult = {
  tools: ToolSelection[];
};
