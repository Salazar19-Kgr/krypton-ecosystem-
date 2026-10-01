export type TavilySearchRequest = {
  query: string;
  maxResults?: number;
};

export async function tavilySearch(
  _request: TavilySearchRequest,
): Promise<unknown[]> {
  throw new Error("Tavily todavía no está conectado.");
}
