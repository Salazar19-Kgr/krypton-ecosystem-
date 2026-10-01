export type OpenRouterRequest = {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
};

export async function openRouter(
  _request: OpenRouterRequest,
): Promise<string> {
  throw new Error("OpenRouter provider todavía no está conectado.");
}
