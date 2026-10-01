export type ToolRequest = {
  name: string;
  input: unknown;
};

export type ToolResponse = {
  success: boolean;
  data?: unknown;
  error?: string;
};

export interface Tool {
  name: string;
  execute(request: ToolRequest): Promise<ToolResponse>;
}
