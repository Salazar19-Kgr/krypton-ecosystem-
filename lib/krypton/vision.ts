import { BASE_SYSTEM } from "./brain";
import { geminiChain, UA, type ChatMsg } from "./llm";

export type ImagePart = { mimeType: string; data: string };

const VISION_NOTE = `El usuario adjuntó una o más imágenes. Analízalas con detalle: describe lo relevante, identifica objetos, texto visible y estado.

Si es un equipo de refrigeración, aire acondicionado o un componente eléctrico (compresor, motor, capacitor, placa o etiqueta de datos): transcribe con exactitud los datos legibles de la etiqueta (marca, modelo, voltaje, fases, frecuencia, refrigerante, corrientes como RLA o LRA, potencia, capacidad), explica qué significa cada uno y, solo con esos datos, calcula o estima la potencia y el consumo (por ejemplo, potencia aparente ≈ voltaje × corriente). Si un dato no aparece o no se lee, dilo y señala cualquier estimación como estimación. Después sugiere pasos de diagnóstico o revisión.

Si la imagen contiene un problema de matemáticas o ciencias, resuélvelo paso a paso.`;

export async function analyzeImages(
  message: string,
  history: ChatMsg[],
  images: ImagePart[]
): Promise<{ text: string; provider: string }> {
  const system = `${BASE_SYSTEM}\n\nFecha actual: ${new Date().toISOString().slice(0, 10)}.\n\n${VISION_NOTE}`;
  const prompt = message || "Describe y analiza esta imagen.";
  const errors: string[] = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await geminiChain(
        system,
        [
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
        35000,
        70000
      );
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
          ...UA,
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_VISION_MODEL || "openrouter/free",
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
        signal: AbortSignal.timeout(40000),
      });
      if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);
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
