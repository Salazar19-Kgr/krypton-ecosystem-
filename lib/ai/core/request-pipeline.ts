export type PipelineStage =
  | "receive"
  | "recognize"
  | "plan"
  | "execute"
  | "verify"
  | "refine"
  | "respond";

export type PipelineState = {
  stage: PipelineStage;
  completed: PipelineStage[];
};

export function createPipelineState(): PipelineState {
  return {
    stage: "receive",
    completed: [],
  };
}

export function advancePipeline(
  state: PipelineState,
  stage: PipelineStage,
): PipelineState {
  return {
    stage,
    completed: [...state.completed, stage],
  };
}
