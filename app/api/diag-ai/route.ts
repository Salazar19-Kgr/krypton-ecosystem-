import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callDeepSeek, deepseekConfigured, deepseekReason } from "@/lib/krypton/deepseek";
import { perplexityConfigured, perplexitySearch } from "@/lib/krypton/perplexity";
import { callOpenAI, openaiConfigured } from "@/lib/krypton/openai";
import { generate } from "@/lib/krypton/llm";
import { deepseekKeys, geminiKeys, perplexityKeys } from "@/lib/krypton/keys";

export const dynamic = "force-dynamic";

const names = (...list: string[]) =>
  list.filter((n) => Boolean((process.env as Record<string, string | undefined>)[n]));

async function probe(name: string, configured: boolean, run: () => Promise<string>) {
  if (!configured) return { name, configurado: false, ok: false };
  const start = Date.now();
  try {
    return { name, configurado: true, ok: true, ms: Date.now() - start, detalle: await run() };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    return { name, configurado: true, ok: false, ms: Date.now() - start, error: error.slice(0, 180) };
  }
}

/** Comprueba que las claves de las IAs están bien guardadas y responden (solo para quien ha iniciado sesión). */
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Inicia sesión." }, { status: 401 });

  const ask = [{ role: "user" as const, content: "Responde solo con la palabra OK." }];
  const pruebas = await Promise.all([
    probe("deepseek", deepseekConfigured(), async () => (await callDeepSeek({ messages: ask })).slice(0, 30)),
    probe("deepseek-razonamiento", deepseekConfigured(), async () =>
      (await deepseekReason({ messages: [{ role: "user", content: "¿Cuánto es 17 por 23? Responde solo el número." }] })).slice(0, 30)
    ),
    probe("perplexity", perplexityConfigured(), async () => {
      const found = await perplexitySearch("hora actual en Caracas, Venezuela");
      if (!found.length) throw new Error("sin resultados");
      return `${found.length} resultados`;
    }),
    probe("openai", openaiConfigured(), async () => (await callOpenAI({ messages: ask })).slice(0, 30)),
    probe("cadena de texto", true, async () => `respondió ${(await generate({ messages: ask })).provider}`),
  ]);

  return NextResponse.json({
    claves: {
      gemini: geminiKeys().length,
      deepseek: deepseekKeys().length,
      perplexity: perplexityKeys().length,
      nombres_encontrados: names(
        "GEMINI_API_KEY", "gemini_api", "DEEPSEEK_API_KEY", "DEESEEK_API_KEY", "DEESEEK_IMAGENES_API_KEY",
        "PERPLEXITY_API_KEY", "OPENAI_API_KEY", "OPEN_AI_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "TAVILY_API_KEY"
      ),
    },
    pruebas,
  });
}
