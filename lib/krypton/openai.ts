const UA = { "User-Agent": "KryptonEcosystem/1.0" };

// Acepta el nombre estándar y también las variantes con las que se pudo guardar el secreto
const apiKey = () =>
  process.env.OPENAI_API_KEY ??
  process.env.OPEN_AI_API_KEY ??
  process.env["OPEN_AI_API-KEY"];

export const openaiConfigured = () => Boolean(apiKey());

const split = (value: string | undefined, fallback: string[]) => {
  const items = (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
};

type Msg = { role: string; content: unknown };

async function chat(model: string, messages: Msg[], timeoutMs: number): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
      ...UA,
    },
    body: JSON.stringify({ model, messages }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
  if (!text) throw new Error("respuesta vacía");
  return text;
}

async function firstWorking(models: string[], messages: Msg[], timeoutMs: number) {
  const errors: string[] = [];
  for (const model of models) {
    try {
      return await chat(model, messages, timeoutMs);
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

/** Texto: respaldo de alta fiabilidad cuando los gratuitos fallan. */
export async function callOpenAI(opts: {
  system?: string;
  messages: { role: string; content: string }[];
}): Promise<string> {
  return firstWorking(
    split(process.env.OPENAI_MODELS, ["gpt-5-mini", "gpt-4.1-mini"]),
    [...(opts.system ? [{ role: "system", content: opts.system }] : []), ...opts.messages],
    40000
  );
}

/** Visión: análisis de imágenes con OpenAI. */
export async function openaiVision(
  system: string,
  history: { role: string; content: string }[],
  images: { mimeType: string; data: string }[],
  prompt: string
): Promise<string> {
  const content = [
    { type: "text", text: prompt },
    ...images.map((i) => ({
      type: "image_url",
      image_url: { url: `data:${i.mimeType};base64,${i.data}` },
    })),
  ];
  return firstWorking(
    split(process.env.OPENAI_VISION_MODELS, ["gpt-5-mini", "gpt-4.1-mini"]),
    [{ role: "system", content: system }, ...history, { role: "user", content }],
    60000
  );
}

function pickSize(request: string) {
  if (/vertical|retrato|9:16|portrait|p[oó]ster|poster|celular|tel[eé]fono/i.test(request))
    return "1024x1536";
  if (/horizontal|paisaje|panor[aá]mic|16:9|landscape|wallpaper|banner|escritorio/i.test(request))
    return "1536x1024";
  return "1024x1024";
}

/** Imágenes: gpt-image-2 y, si no está disponible, modelos anteriores. */
export async function openaiImage(
  prompt: string,
  request = ""
): Promise<{ mime: string; data: string }> {
  if (!openaiConfigured()) throw new Error("sin clave de OpenAI");
  const models = split(process.env.OPENAI_IMAGE_MODELS, [
    "gpt-image-2",
    "gpt-image-1.5",
    "gpt-image-1-mini",
  ]);
  const quality = process.env.OPENAI_IMAGE_QUALITY || "medium";
  const size = pickSize(request);
  const errors: string[] = [];

  for (const model of models) {
    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey()}`,
          ...UA,
        },
        body: JSON.stringify({ model, prompt: prompt.slice(0, 4000), size, quality, n: 1 }),
        signal: AbortSignal.timeout(100000),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
      const data = await res.json();
      const b64 = data?.data?.[0]?.b64_json;
      if (typeof b64 !== "string" || !b64) throw new Error("sin imagen en la respuesta");
      return { mime: "image/png", data: b64 };
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}
