import { deepseekKeys } from "./keys";

const URL = "https://api.deepseek.com/chat/completions";
const UA = { "User-Agent": "KryptonEcosystem/1.0" };

export const deepseekConfigured = () => deepseekKeys().length > 0;

const list = (value: string | undefined, fallback: string[]) => {
  const items = (value ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return items.length ? items : fallback;
};

/** Una petición a DeepSeek; si una clave falla (límite o saldo) prueba la siguiente. */
async function chat(body: Record<string, unknown>, timeoutMs: number): Promise<string> {
  const keys = deepseekKeys();
  if (!keys.length) throw new Error("sin clave de DeepSeek");
  const errors: string[] = [];
  for (const key of keys) {
    try {
      const send = (payload: Record<string, unknown>) =>
        fetch(URL, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}`, ...UA },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(timeoutMs),
        });
      let res = await send(body);
      if (res.status === 400 && "thinking" in body) {
        const { thinking: _thinking, reasoning_effort: _effort, ...plain } = body;
        void _thinking;
        void _effort;
        res = await send(plain);
      }
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
      const data = await res.json();
      const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
      if (!text) throw new Error("respuesta vacía");
      return text;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  throw new Error(errors.join(" | "));
}

type Msg = { role: string; content: string };

/** Texto rápido y económico (sin modo de razonamiento). */
export async function callDeepSeek(opts: { system?: string; messages: Msg[] }): Promise<string> {
  const messages = [...(opts.system ? [{ role: "system", content: opts.system }] : []), ...opts.messages];
  const errors: string[] = [];
  for (const model of list(process.env.DEEPSEEK_MODELS, ["deepseek-flash"])) {
    try {
      return await chat({ model, messages, thinking: { type: "disabled" }, max_tokens: 4000 }, 45000);
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

/** Razonamiento profundo (matemáticas, lógica, verificación). */
export async function deepseekReason(opts: { system?: string; messages: Msg[] }): Promise<string> {
  const messages = [...(opts.system ? [{ role: "system", content: opts.system }] : []), ...opts.messages];
  const errors: string[] = [];
  for (const model of list(process.env.DEEPSEEK_REASON_MODELS, ["deepseek-v4-pro", "deepseek-flash"])) {
    try {
      return await chat(
        { model, messages, thinking: { type: "enabled" }, reasoning_effort: "high", max_tokens: 12000 },
        90000
      );
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

/** Lectura de imágenes con DeepSeek (solo imágenes; los PDF y textos se descartan). */
export async function deepseekVision(
  system: string,
  history: Msg[],
  images: { mimeType: string; data: string }[],
  prompt: string
): Promise<string> {
  const pics = images.filter((i) => i.mimeType.startsWith("image/"));
  if (!pics.length) throw new Error("sin imágenes");
  const content = [
    { type: "text", text: prompt },
    ...pics.map((i) => ({ type: "image_url", image_url: { url: `data:${i.mimeType};base64,${i.data}` } })),
  ];
  const model = list(process.env.DEEPSEEK_VISION_MODELS, ["deepseek-flash"])[0];
  return chat(
    {
      model,
      messages: [{ role: "system", content: system }, ...history, { role: "user", content }],
      thinking: { type: "disabled" },
      max_tokens: 4000,
    },
    60000
  );
}
