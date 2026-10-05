import { BASE_SYSTEM } from "./brain";
import type { ChatMsg } from "./llm";

export type ImagePart = { mimeType: string; data: string };

const VISION_NOTE = `El usuario adjuntó una o más imágenes. Analízalas con detalle: describe lo relevante, identifica objetos, texto visible y estado.

Si es un equipo de refrigeración, aire acondicionado o un componente eléctrico (compresor, motor, capacitor, placa o etiqueta de datos): transcribe con exactitud los datos legibles de la etiqueta (marca, modelo, voltaje, fases, frecuencia, refrigerante, corrientes como RLA o LRA, potencia, capacidad), explica qué significa cada uno y, solo con esos datos, calcula o estima la potencia y el consumo (por ejemplo, potencia aparente ≈ voltaje × corriente). Si un dato no aparece o no se lee, dilo y señala cualquier estimación como estimación. Después sugiere pasos de diagnóstico o revisión.

Si la imagen contiene un problema de matemáticas o ciencias, resuélvelo paso a paso.`;

const TIMEOUT_MS = 55000;

async function askGemini(
  key: string,
  system: string,
  history: ChatMsg[],
  images: ImagePart[],
  prompt: string
): Promise<string> {
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  const base = {
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
  };

  const send = (extra: object) =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ ...base, ...extra }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

  // Razonamiento ligero = respuestas mucho más rápidas; si el modelo no lo acepta, se reintenta sin eso
  let res = await send({
    generationConfig: {
      maxOutputTokens: 8192,
      thinkingConfig: { thinkingLevel: "low" },
    },
  });
  if (res.status === 400) res = await send({});

  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 160)}`);

  const data = await res.json();
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();
  if (!text) {
    const why = data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "";
    throw new Error(`respuesta vacía ${why}`.trim());
  }
  return text;
}

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
      return {
        text: await askGemini(geminiKey, system, history, images, prompt),
        provider: "gemini",
      };
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
