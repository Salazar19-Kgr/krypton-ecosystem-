import { BASE_SYSTEM } from "./brain";
import type { ChatMsg } from "./llm";

export type ImagePart = { mimeType: string; data: string };

const VISION_NOTE = `El usuario adjuntó una o más imágenes. Analízalas con detalle: describe lo relevante, identifica objetos, texto visible y estado. Si es un equipo de refrigeración o un circuito, identifica sus componentes y posibles fallas con pasos de diagnóstico. Si la imagen contiene un problema de matemáticas o ciencias, resuélvelo paso a paso. Si no puedes distinguir algo, dilo.`;

const TIMEOUT_MS = 30000;

export async function analyzeImages(
  message: string,
  history: ChatMsg[],
  images: ImagePart[]
): Promise<{ text: string; provider: string }> {
  const system = `${BASE_SYSTEM}\n\nFecha actual: ${new Date().toISOString().slice(0, 10)}.\n\n${VISION_NOTE}`;
  const prompt = message || "Describe y analiza esta imagen.";
  const errors: string[] = [];

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [
              ...history.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
              {
                role: "user",
                parts: [
                  ...images.map((i) => ({
                    inlineData: { mimeType: i.mimeType, data: i.data },
                  })),
                  { text: prompt },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        }
      );
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
      const data = await res.json();
      const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts.map((p) => p.text ?? "").join("").trim();
      if (!text) throw new Error("respuesta vacía");
      return { text, provider: "gemini" };
    } catch (e) {
      errors.push(`gemini: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const routerKey = process.env.OPENROUTER_API_KEY;
  if (routerKey) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${routerKey}`,
          "X-OpenRouter-Title": "Krypton Ecosystem",
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_VISION_MODEL || "openrouter/auto",
          messages: [
            { role: "system", content: system },
            ...history,
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                ...images.map((i) => ({
                  type: "image_url",
                  image_url: { url: `data:${i.mimeType};base64,${i.data}` },
                })),
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);
      const data = await res.json();
      const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
      if (!text) throw new Error("respuesta vacía");
      return { text, provider: "openrouter" };
    } catch (e) {
      errors.push(`openrouter: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  throw new Error(errors.join(" | ") || "No hay proveedor de visión configurado");
}
