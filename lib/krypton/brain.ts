import { generate, type ChatMsg } from "./llm";
import { tavilySearch, wikipediaSearch, calculate, type Source } from "./tools";

type Plan = {
  intent: "conversation" | "mathematics" | "refrigeration" | "science" | "information";
  needsSearch: boolean;
  searchQuery: string;
  needsWikipedia: boolean;
  wikiQuery: string;
  calculations: string[];
};

export type BrainResult = {
  text: string;
  provider: string;
  trace: string[];
};

const REFRIGERATION =
  /refriger|nevera|heladera|frigor|congelador|compresor|evaporador|condensador|capilar|aire acondicionado|\bsplit\b|inverter|chiller|c[aá]mara fr[ií]a|\br-?(134a?|404a?|410a?|600a?|290|22|32|407c?|717|744)\b|sobrecalentamiento|subenfriamiento|presi[oó]n de (succi[oó]n|descarga)/i;
const MATH =
  /calcul|resuelve|ecuaci[oó]n|derivada|integral|l[ií]mite|fracci[oó]n|porcentaje|ra[ií]z|logaritmo|trigonom|\bseno\b|coseno|tangente|matem[aá]tic|recta num[eé]rica|\d\s*[+*/^×÷]\s*[\d(]|\d\s+-\s+\d/i;
const SCIENCE =
  /f[ií]sica|qu[ií]mica|biolog|energ[ií]a|fuerza|velocidad|aceleraci[oó]n|newton|termodin|el[eé]ctric|voltaje|corriente|[aá]tomo|mol[eé]cula|c[eé]lula|planeta|universo/i;
const NEEDS_WEB =
  /\b(hoy|ahora|actual(mente|es)?|[uú]ltim[oa]s?|reciente(s)?|noticias?|precios?|cu[aá]nto (cuesta|vale)|d[oó]nde (comprar|puedo comprar)|202[4-9]|esta semana|este mes)\b/i;
const WIKI =
  /^\s*[¿]?\s*(qu[eé] (es|son|fue|significa)|qui[eé]n(es)? (es|son|fue|fueron|era)|define|definici[oó]n de|significado de|historia de|cu[aá]l es la capital)/i;

function extractCalculations(message: string): string[] {
  const candidates = message.match(/[\d(][\d\s+\-*/^().,×÷]*[\d)]/g) ?? [];
  return candidates
    .map((c) => c.trim())
    .filter((c) => /[+*/^×÷]|\s-\s/.test(c))
    .filter((c) => !/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(c))
    .slice(0, 3);
}

/** Reconocimiento rápido por reglas: no gasta una llamada a la IA. */
export function recognize(message: string): Plan {
  const intent: Plan["intent"] = REFRIGERATION.test(message)
    ? "refrigeration"
    : MATH.test(message)
      ? "mathematics"
      : SCIENCE.test(message)
        ? "science"
        : WIKI.test(message) || NEEDS_WEB.test(message)
          ? "information"
          : "conversation";

  const isWiki = WIKI.test(message);
  const wikiQuery = message
    .replace(
      /^\s*[¿]?\s*(qu[eé] (es|son|fue|significa)|qui[eé]n(es)? (es|son|fue|fueron|era)|define|definici[oó]n de|significado de|historia de)\s+(una?|el|la|los|las|unos|unas)?\s*/i,
      ""
    )
    .replace(/[¿?¡!.]/g, "")
    .trim()
    .slice(0, 100);

  return {
    intent,
    needsSearch: NEEDS_WEB.test(message),
    searchQuery: message.slice(0, 200),
    needsWikipedia: isWiki && wikiQuery.length > 1,
    wikiQuery,
    calculations: MATH.test(message) ? extractCalculations(message) : [],
  };
}

const BASE_SYSTEM = `Eres Krypton, el asistente central de Krypton Ecosystem.

Estilo de respuesta:
- Responde en el idioma del usuario, con un tono profesional, claro y cercano.
- Empieza con la respuesta directa. Después amplía con la explicación, ejemplos concretos y, si aporta valor, un dato útil o un siguiente paso. Sé completo: no te quedes en una sola frase, pero tampoco rellenes.
- Usa Markdown con moderación: negritas solo para términos clave, listas cuando haya varios elementos, títulos cortos (##) solo en respuestas largas y tablas solo para comparar datos. Escribe las fórmulas en texto simple o Unicode (por ejemplo x², √16), nunca en LaTeX.
- No uses separadores horizontales (---), ni emojis, ni frases de relleno como "¡Claro!" o "Espero que te ayude". No repitas la pregunta.
- No inventes datos. Si algo no puede confirmarse o es una estimación, dilo.
- No menciones herramientas, proveedores, rutas ni la arquitectura interna.`;

const DOMAIN_NOTES: Record<string, string> = {
  refrigeration: `Especialidad: refrigeración doméstica, comercial e industrial (ciclo de compresión de vapor, refrigerantes como R134a, R600a, R290, R404A, R410A y R32, presiones y temperaturas de trabajo, sobrecalentamiento y subenfriamiento, compresores, condensadores, evaporadores, válvulas y capilares, controles y diagnóstico de fallas). Da pasos de diagnóstico ordenados y verificables. Si faltan datos (equipo, refrigerante, presiones, temperaturas), pídelos antes de concluir. Recuerda brevemente la seguridad: electricidad, recuperación de refrigerante y que algunos refrigerantes son inflamables.`,
  mathematics: `Especialidad: matemáticas. Resuelve paso a paso, explica cada paso con ejemplos y verifica el resultado final.`,
  science: `Especialidad: ciencias y física. Explica con rigor, indica unidades y supuestos, y distingue hechos de estimaciones.`,
};

const safe = <T>(promise: Promise<T[]>) => promise.catch(() => [] as T[]);

export async function runKrypton(
  message: string,
  history: ChatMsg[]
): Promise<BrainResult> {
  const trace: string[] = [];
  const plan = recognize(message);
  trace.push(`reconocimiento: ${plan.intent}`);

  const [web, wiki] = await Promise.all([
    plan.needsSearch ? safe(tavilySearch(plan.searchQuery)) : Promise.resolve([] as Source[]),
    plan.needsWikipedia ? safe(wikipediaSearch(plan.wikiQuery)) : Promise.resolve([] as Source[]),
  ]);

  const calcs = plan.calculations
    .map((expression) => ({ expression, result: calculate(expression) }))
    .filter((c): c is { expression: string; result: number } => c.result !== null);

  trace.push(`herramientas: web ${web.length}, wikipedia ${wiki.length}, cálculos ${calcs.length}`);

  const sources = [...web, ...wiki];

  let system = `${BASE_SYSTEM}\n\nFecha actual: ${new Date().toISOString().slice(0, 10)}.`;
  if (DOMAIN_NOTES[plan.intent]) system += `\n\n${DOMAIN_NOTES[plan.intent]}`;
  if (calcs.length) {
    system += `\n\nRESULTADOS CALCULADOS Y VERIFICADOS (úsalos tal cual si corresponden a la pregunta, no los recalcules):\n${calcs
      .map((c) => `${c.expression} = ${c.result}`)
      .join("\n")}`;
  }
  if (sources.length) {
    system += `\n\nINFORMACIÓN EXTERNA (úsala solo si es relevante; si algo no está confirmado, dilo):\n${sources
      .map((s, i) => `[${i + 1}] ${s.title} (${s.url})\n${s.snippet}`)
      .join("\n\n")}`;
  }

  const answer = await generate({
    system,
    messages: [...history, { role: "user", content: message }],
  });
  trace.push(`respuesta (${answer.provider})`);

  let text = answer.text.trim() || "No fue posible generar una respuesta válida.";

  const cited = sources.filter((s) => s.url).slice(0, 4);
  if (cited.length) {
    text += `\n\n**Fuentes**\n${cited
      .map((s) => `- [${s.title.replace(/[\[\]]/g, "")}](${s.url})`)
      .join("\n")}`;
  }

  return { text, provider: answer.provider, trace };
}
