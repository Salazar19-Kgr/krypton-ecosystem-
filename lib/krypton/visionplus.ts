import { analyzeImages, type ImagePart } from "./vision";
import { looksMath } from "./math";
import type { ChatMsg } from "./llm";

const READ_PROMPT =
  "Transcribe con la máxima fidelidad TODO lo que aparece en la imagen, sin interpretar ni contestar nada: textos, números, símbolos, pistas, preguntas, opciones, listas y tablas (las tablas en formato Markdown) y la estructura de lo que se ve (por ejemplo, en una cuadrícula o crucigrama: cantidad de filas y columnas, número de cada casilla de inicio, dirección horizontal o vertical y longitud de cada palabra, y la pista que le corresponde). Si algo no se lee con certeza, escribe [ilegible]. Responde solo con la transcripción, ordenada.";

const NEEDS_READ =
  /(resuelv|resolv|complet|respond|contest|calcul|analiz|explic|traduc|corrig|crucigrama|sopa de letras|examen|tarea|ejercicio|pregunta|tabla|factura|document|transcrib|\blee\b|\bleer\b|qu[eé] dice)/i;
const MATHY =
  /(ecuaci|integral|deriv|l[ií]mite|matriz|fracci|porcentaje|matem|c[aá]lcul|geometr|trigonom|\d\s*[+\-*/^=×÷]\s*\d|[xy]\s*[²^])/i;

export async function visionPlus(message: string, history: ChatMsg[], images: ImagePart[]) {
  if (!NEEDS_READ.test(message)) return analyzeImages(message, history, images);
  let transcript = "";
  try {
    transcript = ((await analyzeImages(READ_PROMPT, [], images)).text ?? "").trim();
  } catch {}
  if (transcript.length < 20) return analyzeImages(message, history, images);
  const math = MATHY.test(transcript) && looksMath(transcript + " " + message);
  const ask = math ? message : message.replace(/resuelv\w*|resolv\w*|resoluci[oó]n/gi, "contesta");
  return analyzeImages(
    ask +
      "\n\nTRANSCRIPCIÓN DE LA IMAGEN (hecha por un lector independiente; puede tener errores, contrástala siempre con la imagen):\n" +
      transcript.slice(0, 6000),
    history,
    images
  );
}
