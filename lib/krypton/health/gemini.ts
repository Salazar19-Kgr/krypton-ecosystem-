import { keyPool } from "@/lib/krypton/keys";
import type { ChatMsg } from "@/lib/krypton/llm";

const DEFAULT_MODELS = "gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-3.1-flash-lite";

async function healthOnce(args: {
  system: string;
  messages: ChatMsg[];
}): Promise<{ text: string }> {
  const keys = keyPool(
    "GEMINI_KEY_KRYTON-HEALT",
    "GEMINI_KEY_KRYTON_HEALT",
    "GEMINI_KEY_KRYTON-HEALTH",
    "GEMINI_KEY_KRYTON_HEALTH"
  );
  if (!keys.length) throw new Error("Falta la variable GEMINI_KEY_KRYTON-HEALT");
  const models = (process.env.HEALTH_GEMINI_MODELS || DEFAULT_MODELS)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const contents = args.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const cats = [
    "HARM_CATEGORY_HARASSMENT",
    "HARM_CATEGORY_HATE_SPEECH",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    "HARM_CATEGORY_DANGEROUS_CONTENT",
  ];
  let last = "";
  for (const model of models) {
    for (const key of keys) {
      try {
        const res = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-goog-api-key": key },
            signal: AbortSignal.timeout(55000),
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: args.system }] },
              contents,
              generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
              safetySettings: cats.map((category) => ({ category, threshold: "BLOCK_ONLY_HIGH" })),
            }),
          }
        );
        if (!res.ok) {
          last = model + " " + res.status;
          continue;
        }
        const j = await res.json();
        const parts: { text?: string }[] = j?.candidates?.[0]?.content?.parts ?? [];
        const text = parts.map((p) => p.text ?? "").join("").trim();
        if (text) return { text };
        last = model + " vacio";
      } catch (e) {
        last = String(e);
      }
    }
  }
  throw new Error("Gemini Health fallo: " + last);
}

export async function healthGenerate(args: {
  system: string;
  messages: ChatMsg[];
}): Promise<{ text: string }> {
  try {
    return await healthOnce(args);
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
    return await healthOnce(args);
  }
}
