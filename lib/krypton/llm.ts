export type ChatMsg = { role: "user" | "assistant"; content: string };

export type LLMOptions = {
  system?: string;
  messages: ChatMsg[];
};

export type LLMResult = { text: string; provider: string };

export type GeminiContent = { role: string; parts: Record<string, unknown>[] };

const TIMEOUT_MS = 20000;
export const UA = { "User-Agent": "KryptonEcosystem/1.0" };

const split = (value: string | undefined, fallback: string[]) => {
  const items = (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
};

/** Modelos de Gemini en orden: calidad primero; si uno se queda sin cuota o está saturado, pasa al siguiente. */
const geminiModels = () =>
  split(process.env.GEMINI_MODELS, [
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ]);

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(`${status} ${message}`);
    this.status = status;
  }
}

// Modelos que fallaron hace poco se saltan un rato (evita esperar errores repetidos)
const cooldown = new Map<string, number>();

function markFailed(model: string, status: number) {
  const minutes = status === 429 ? 10 : status === 404 ? 60 : 0.5;
  cooldown.set(model, Date.now() + minutes * 60_000);
}

async function askModel(
  key: string,
  model: string,
  system: string | undefined,
  contents: GeminiContent[],
  timeoutMs: number
): Promise<string> {
  const base = {
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    contents,
  };

  const send = (extra: object) =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key, ...UA },
        body: JSON.stringify({ ...base, ...extra }),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );

  // Razonamiento ligero = más rápido; si el modelo no lo acepta, se reintenta sin eso
  let res = await send({
    generationConfig: {
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: "low" },
    },
  });
  if (res.status === 400) res = await send({});

  if (!res.ok) throw new HttpError(res.status, (await res.text()).slice(0, 140));

  const data = await res.json();
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();
  if (!text) {
    const why = data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "";
    throw new Error(`respuesta vacía ${why}`.trim());
  }
  return text;
}

export async function geminiChain(
  system: string | undefined,
  contents: GeminiContent[],
  timeoutMs = TIMEOUT_MS,
  budgetMs = 45000
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("sin clave");

  const all = geminiModels();
  const ready = all.filter((m) => (cooldown.get(m) ?? 0) <= Date.now());
  const order = ready.length ? ready : all;
  const started = Date.now();
  const errors: string[] = [];

  for (const model of order) {
    if (errors.length && Date.now() - started > budgetMs) break;
    try {
      return await askModel(key, model, system, contents, timeoutMs);
    } catch (e) {
      markFailed(model, e instanceof HttpError ? e.status : 0);
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(errors.join(" | "));
}

async function callGemini(opts: LLMOptions): Promise<string> {
  return geminiChain(
    opts.system,
    opts.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    15000,
    40000
  );
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
      ...UA,
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
    throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
  }

  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("respuesta vacía");
  return text;
}

async function callGroq(opts: LLMOptions): Promise<string> {
  const key = process.env.GROQ_API_KEY!;
  const models = split(process.env.GROQ_MODELS, [
    "openai/gpt-oss-120b",
    "llama-3.3-70b-versatile",
  ]);
  const errors: string[] = [];

  for (const model of models) {
    try {
      return await callOpenAICompat(
        "https://api.groq.com/openai/v1/chat/completions",
        key,
        model,
        opts
      );
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
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
    call: callGroq,
  },
  {
    name: "openrouter",
    configured: () => Boolean(process.env.OPENROUTER_API_KEY),
    call: (opts) =>
      callOpenAICompat(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY!,
        process.env.OPENROUTER_MODEL || "openrouter/free",
        opts,
        { "X-OpenRouter-Title": "Krypton Ecosystem" }
      ),
  },
];

/** Gemini (varios modelos) → Groq → OpenRouter gratuito. */
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
          error: (e instanceof Error ? e.message : String(e)).slice(0, 300),
        };
      }
    })
  );

  return out;
}
