import type { ChatMsg } from "./llm";

const CODE_HINT =
  /(c[oó]digo|comando|script|termux|bash|python|javascript|typescript|html|css|react|next\.?js|sql|php|kotlin|swift|git\b|github|npm|pip\b|api\b|programa(r|ci[oó]n)|aplicaci[oó]n|\bapp\b|\bbug\b|depura|algoritmo|consola|terminal|linux|compila)/i;

const CODE_PREFIX =
  "[MODO PROGRAMACIÓN] Responde como un ingeniero de software que acompaña al usuario paso a paso. 1) Si la petición es ambigua o faltan datos que cambian el resultado (lenguaje, sistema, dónde se ejecutará, qué debe hacer exactamente), haz de 1 a 3 preguntas cortas y numeradas, con opciones cuando sea posible, y espera la respuesta antes de escribir código; si ya es clara, entrega directamente. 2) Todo el código y todos los comandos van en bloques de código Markdown cercados con tres acentos graves e indicando el lenguaje (bash, python, tsx, html, sql); nunca en tablas ni en texto corrido. 3) Divide el trabajo en bloques cortos (unas 15 líneas como máximo cada uno): encima de cada bloque un título en negrita («Paso 1: …») y debajo una línea que diga qué debe aparecer si salió bien. Si hay varios archivos, cada uno en su propio bloque con el nombre del archivo en negrita encima. 4) No ofrezcas archivos descargables salvo que el usuario los pida expresamente. 5) Al final, un resumen de una línea por paso y, si aplica, cómo probarlo. 6) Código completo y funcional, sin omitir partes con puntos suspensivos. PETICIÓN DEL USUARIO:\n";

export function codeModePrefix(message: string, history: ChatMsg[]): string {
  if (CODE_HINT.test(message)) return CODE_PREFIX;
  const recent = history.slice(-4);
  const sticky = recent.some(
    (m) => (m.role === "user" && CODE_HINT.test(m.content)) || m.content.includes("```")
  );
  return sticky ? CODE_PREFIX : "";
}
