import { deepseekConfigured, deepseekReason } from "./deepseek";
import { geminiKey } from "./keys";
import { generate, type ChatMsg } from "./llm";
import { callOpenAI, openaiConfigured } from "./openai";

const UA = { "User-Agent": "KryptonEcosystem/1.0" };

const PROTOCOL = `PROTOCOLO DE MATEMÁTICAS (síguelo siempre):
1. Entiende la petición: identifica exactamente qué se pide (resolver, explicar, demostrar, comprobar, convertir de una forma a otra), qué datos da el usuario y en qué notación y formato quiere la respuesta ("como en la foto", "con esta fórmula", etc.). Si indica una fórmula o notación, úsala tal cual y no la cambies.
2. Si hay una imagen o texto manuscrito, transcribe primero los datos y la fórmula tal como aparecen. Si algo es ambiguo (unidades, r frente a r², signos), dilo en una línea y elige la interpretación más razonable.
3. Resuelve paso a paso con cada operación escrita de forma explícita. No saltes cálculos. Mantén las unidades.
4. Verifica antes de responder: sustituye el resultado en el planteamiento, recalcula cada operación y comprueba signos y unidades.
5. Presenta: primero una respuesta directa o el plan en una línea, luego el desarrollo numerado con una operación o ecuación por línea (nunca juntes dos ecuaciones en la misma línea), y al final el resultado en negrita con la notación que usó el usuario. Si pidió "explícame", explica el porqué de cada paso con palabras sencillas.
6. Nunca des un resultado sin haberlo comprobado. Si no estás seguro de una parte, dilo.
Formato: Markdown en texto plano; fórmulas con Unicode (x², √, ×, ÷), nunca LaTeX.`;

const VERIFY_SYSTEM = `Eres un verificador matemático riguroso. Recibirás la petición de un usuario y una solución. Recalcula cada operación, revisa signos, unidades, el planteamiento y que la respuesta final sea justo lo que el usuario pidió (formato y notación incluidos). Responde SOLO con la palabra OK si la solución es correcta y completa. Si encuentras un error, responde con la solución completa corregida, con el mismo formato (Markdown en texto plano, una ecuación por línea, sin LaTeX) y sin mencionar que hubo una corrección.`;

const MATH_HINT =
  /ecuaci[oó]n|f[oó]rmula|ejercicio|problema de|resuelve|resolver|calcul|derivad|integral|l[ií]mite|matriz|vector|geometr[ií]a|trigonom|circunferencia|par[aá]bola|elipse|funci[oó]n|despej|simplific|factoriz|demuestr|demostr|(?:[aá]rea|volumen|per[ií]metro) (?:de|del) (?:un|una|el|la)? ?(?:c[ií]rculo|tri[aá]ngulo|cuadrado|rect[aá]ngulo|cilindro|esfera|cono|cubo|pir[aá]mide|pol[ií]gono|trapecio|rombo|prisma)|porcentaje|fracci[oó]n|acertijo|adivinanza|enigma|puzzle|paradoja|probabilidad|combinatoria|sucesi[oó]n|progresi[oó]n|\d\s*[+*/^=×÷]\s*\d|\d\s+-\s+\d|[xy]\s*[²^]/i;

export const looksMath = (text: string) => MATH_HINT.test(text);

const models = () =>
  (process.env.GEMINI_MATH_MODELS ?? "gemini-3.6-flash,gemini-3.5-flash,gemini-3.1-flash-lite")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

type Content = { role: string; parts: Record<string, unknown>[] };

async function ask(
  model: string,
  system: string,
  contents: Content[],
  thinking: string,
  timeoutMs: number
): Promise<string> {
  const key = geminiKey();
  if (!key) throw new Error("sin clave");
  const base = { systemInstruction: { parts: [{ text: system }] }, contents };
  const send = (extra: object) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key, ...UA },
      body: JSON.stringify({ ...base, ...extra }),
      signal: AbortSignal.timeout(timeoutMs),
    });

  let res = await send({
    generationConfig: { maxOutputTokens: 12000, thinkingConfig: { thinkingLevel: thinking } },
  });
  if (res.status === 400) res = await send({});
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 140)}`);

  const data = await res.json();
  const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p) => p.text ?? "").join("").trim();
  if (!text) throw new Error("respuesta vacía");
  return text;
}

async function chain(system: string, contents: Content[], thinking: string, timeoutMs: number) {
  const errors: string[] = [];
  for (const model of models()) {
    try {
      return await ask(model, system, contents, thinking, timeoutMs);
    } catch (e) {
      errors.push(`${model}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

/** Segundo cerebro: revisa la solución (con OpenAI si está disponible) y la corrige si hay errores. */
async function verify(request: string, solution: string): Promise<string> {
  if (solution.length < 350) return solution;
  const prompt = `PETICIÓN DEL USUARIO:\n${request}\n\nSOLUCIÓN A VERIFICAR:\n${solution}`;
  const contents: Content[] = [{ role: "user", parts: [{ text: prompt }] }];

  let verdict = "";
  const user = [{ role: "user", content: prompt }];
  const attempts: (() => Promise<string>)[] = [];
  if (deepseekConfigured()) attempts.push(() => deepseekReason({ system: VERIFY_SYSTEM, messages: user }));
  if (openaiConfigured()) attempts.push(() => callOpenAI({ system: VERIFY_SYSTEM, messages: user }));
  attempts.push(() => chain(VERIFY_SYSTEM, contents, "medium", 45000));
  for (const attempt of attempts) {
    try {
      verdict = await attempt();
      break;
    } catch {
      // prueba con el siguiente cerebro
    }
  }
  if (!verdict) return solution;

  const v = verdict.trim();
  if (/^ok\b/i.test(v) && v.length < 120) return solution;
  // solo se acepta una corrección si es una solución completa, no un comentario
  return v.length >= solution.length * 0.6 ? v : solution;
}

export async function solveMath(opts: {
  system?: string;
  messages: ChatMsg[];
}): Promise<{ text: string; provider: string }> {
  const system = `${opts.system ?? ""}\n\n${PROTOCOL}`;
  const contents: Content[] = opts.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let solution: string;
  try {
    solution = await chain(system, contents, "high", 60000);
  } catch {
    return generate({ system, messages: opts.messages });
  }

  try {
    solution = await verify(opts.messages[opts.messages.length - 1]?.content ?? "", solution);
  } catch {
    // si la verificación falla, se entrega la solución resuelta
  }
  return { text: solution, provider: "math" };
}

/** Problemas con imagen (cuaderno, pizarra, libro): razonamiento alto y verificación. */
export async function solveMathImages(
  system: string,
  history: { role: string; content: string }[],
  images: { mimeType: string; data: string }[],
  prompt: string
): Promise<{ text: string; provider: string }> {
  const full = `${system}\n\n${PROTOCOL}`;
  const contents: Content[] = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [
        ...images.map((i) => ({ inlineData: { mimeType: i.mimeType, data: i.data } })),
        { text: prompt },
      ],
    },
  ];

  let solution = await chain(full, contents, "high", 70000);
  try {
    solution = await verify(`${prompt}\n(La petición incluye una imagen adjunta con el enunciado.)`, solution);
  } catch {
    // se entrega la solución sin verificar
  }
  return { text: solution, provider: "math" };
}

/** Matemáticas: razonamiento alto y verificación; el resto: cadena normal. */
export function generateSmart(intent: string, opts: { system?: string; messages: ChatMsg[] }) {
  return intent === "mathematics" ? solveMath(opts) : generate(opts);
}
