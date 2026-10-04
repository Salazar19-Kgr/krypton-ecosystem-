export type ChatMsg = { role: "user" | "assistant"; content: string };

export type LLMOptions = {
  system?: string;
  messages: ChatMsg[];
};

export type LLMResult = { text: string; provider: string };

const TIMEOUT_MS = 20000;

async function callGemini(opts: LLMOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("sin clave");
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        ...(opts.system
          ? { systemInstruction: { parts: [{ text: opts.system }] } }
          : {}),
        contents: opts.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    }
  );

  if (!res.ok) {
    throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  }

  const data = await res.json();
  const parts: { text?: string }[] =
    data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("respuesta vacía");
  return text;
}

async function callOpenAICompat(
  url: string,
  key: string,
  model: string,
  opts: LLMOptions,
  extraHeaders: Record<string, string> = {}
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        ...opts.messages,
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
  }

  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("respuesta vacía");
  return text;
}

type Provider = {
  name: string;
  configured: () => boolean;
  call: (opts: LLMOptions) => Promise<string>;
};

const providers: Provider[] = [
  {
    name: "gemini",
    configured: () => Boolean(process.env.GEMINI_API_KEY),
    call: callGemini,
  },
  {
    name: "groq",
    configured: () => Boolean(process.env.GROQ_API_KEY),
    call: (opts) =>
      callOpenAICompat(
        "https://api.groq.com/openai/v1/chat/completions",
        process.env.GROQ_API_KEY!,
        process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        opts
      ),
  },
  {
    name: "openrouter",
    configured: () => Boolean(process.env.OPENROUTER_API_KEY),
    call: (opts) =>
      callOpenAICompat(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY!,
        process.env.OPENROUTER_MODEL || "openrouter/auto",
        opts,
        { "X-OpenRouter-Title": "Krypton Ecosystem" }
      ),
  },
];

/** Prueba Gemini primero; si falla, Groq; si falla, OpenRouter. */
export async function generate(opts: LLMOptions): Promise<LLMResult> {
  const errors: string[] = [];

  for (const provider of providers) {
    if (!provider.configured()) continue;
    try {
      return { text: await provider.call(opts), provider: provider.name };
    } catch (e) {
      errors.push(`${provider.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(
    errors.length ? errors.join(" | ") : "No hay ningún proveedor de IA configurado"
  );
}

/** Para /api/diag: prueba cada proveedor por separado. */
export async function testProviders(): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = {};

  await Promise.all(
    providers.map(async (provider) => {
      if (!provider.configured()) {
        out[provider.name] = "sin clave";
        return;
      }
      const t0 = Date.now();
      try {
        const text = await provider.call({
          messages: [{ role: "user", content: "Responde solo: ok" }],
        });
        out[provider.name] = { ok: true, ms: Date.now() - t0, text: text.slice(0, 40) };
      } catch (e) {
        out[provider.name] = {
          ok: false,
          error: (e instanceof Error ? e.message : String(e)).slice(0, 200),
        };
      }
    })
  );

  return out;
}
