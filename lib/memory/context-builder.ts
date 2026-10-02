import type { AIContext } from "../ai/core/context";

export type MemoryContext = {
  recentMessages: AIContext["previousMessages"];
  relevantMemories: string[];
};

export function buildMemoryContext(
  context: AIContext,
): MemoryContext {
  return {
    recentMessages: context.previousMessages ?? [],
    relevantMemories: [],
  };
}
