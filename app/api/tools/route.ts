import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generate } from "@/lib/krypton/llm";

const MAX_TEXT = 12000;
const BASE =
  "Eres Krypton Tools, una herramienta de trabajo de precisión. Respondes en el idioma del texto del usuario, salvo que se pida otro. Entregas solo el resultado, bien formateado en Markdown, sin saludos ni explicar lo que haces. Nunca inventes datos que no estén en el texto. Si falta información esencial, dilo en una línea al final.";
const TOOLS: Record<string, string> = {
  resumir: "Resume el texto con los puntos clave en viñetas y una conclusión de una línea. Respeta la longitud o enfoque que indique el usuario.",
  corregir: "Corrige ortografía, gramática y puntuación sin cambiar el sentido ni el estilo. Devuelve primero el texto corregido completo y luego una lista corta de los cambios principales.",
  traducir: "Traduce el texto con naturalidad al idioma indicado (si no se indica, al inglés). Conserva el formato y los nombres propios.",
  reescribir: "Reescribe el texto manteniendo todo el contenido, con el tono indicado (si no se indica, profesional y claro).",
  extraer: "Extrae del texto los datos relevantes (personas, fechas, cifras, lugares, tareas y decisiones) y preséntalos organizados por categoría. Si el usuario pide datos concretos, extrae solo esos.",
  tabla: "Convierte la información del texto en una tabla Markdown clara. Si el usuario indica columnas, úsalas. Después de la tabla no añadas nada salvo notas imprescindibles.",
  redactar: "Redacta el documento completo que pide el usuario (el texto contiene sus instrucciones), con estructura profesional y listo para usar en el formato indicado.",
  explicar: "Explica el tema o texto de forma simple, paso a paso, con un ejemplo concreto y una analogía. Ajusta el nivel al indicado (si no se indica, principiante).",
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (!data?.user) {
      return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    }
    const body = (await request.json()) as { tool?: string; text?: string; extra?: string };
    const text = (body.text ?? "").trim();
    const extra = (body.extra ?? "").trim().slice(0, 300);
    const rule = TOOLS[body.tool ?? ""];
    if (!rule) return NextResponse.json({ ok: false, error: "Herramienta no válida." }, { status: 400 });
    if (!text) return NextResponse.json({ ok: false, error: "Escribe o pega un texto." }, { status: 400 });
    if (text.length > MAX_TEXT) {
      return NextResponse.json({ ok: false, error: "El texto es demasiado largo (máximo 12 000 caracteres)." }, { status: 400 });
    }
    const r = await generate({
      system: BASE + "\n\nTAREA: " + rule,
      messages: [
        {
          role: "user",
          content: (extra ? "INDICACIÓN: " + extra + "\n\n" : "") + "TEXTO:\n" + text,
        },
      ],
    });
    return NextResponse.json({ ok: true, result: r.text.trim() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "No pude completar la herramienta. (" + String((e as Error)?.message ?? e).slice(0, 120) + ")" },
      { status: 500 }
    );
  }
}
