import { perplexityKeys } from "./keys";
import { tavilySearch, type Source } from "./tools";

export const perplexityConfigured = () => perplexityKeys().length > 0;

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Búsqueda en la web con respuesta y fuentes (Perplexity Sonar). */
export async function perplexitySearch(query: string): Promise<Source[]> {
  const model = process.env.PERPLEXITY_MODEL || "sonar";
  for (const key of perplexityKeys()) {
    try {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          "User-Agent": "KryptonEcosystem/1.0",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Responde en español con datos actuales y verificables. Sé breve y preciso." },
            { role: "user", content: query },
          ],
          max_tokens: 700,
        }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();

      const out: Source[] = [];
      const answer = String(data?.choices?.[0]?.message?.content ?? "").trim();
      if (answer) out.push({ title: "Resumen de la búsqueda en la web", url: "", snippet: answer.slice(0, 1800) });

      const seen = new Set<string>();
      const results: { title?: string; url?: string; snippet?: string }[] = data?.search_results ?? [];
      for (const r of results) {
        if (!r.url || seen.has(r.url)) continue;
        seen.add(r.url);
        out.push({ title: String(r.title ?? host(r.url)), url: r.url, snippet: String(r.snippet ?? "").slice(0, 400) });
      }
      for (const url of (data?.citations ?? []) as string[]) {
        if (!url || seen.has(url)) continue;
        seen.add(url);
        out.push({ title: host(url), url, snippet: "" });
      }
      if (out.length) return out.slice(0, 7);
    } catch {
      // prueba con la siguiente clave
    }
  }
  return [];
}

/** Perplexity primero; si no está disponible, Tavily. */
export async function webSearch(query: string): Promise<Source[]> {
  const found = await perplexitySearch(query).catch(() => [] as Source[]);
  return found.length ? found : tavilySearch(query);
}
