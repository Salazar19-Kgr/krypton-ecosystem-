import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generate } from "@/lib/krypton/llm";

type Item = { name: string; area: string; ms: number; nota: number; fallo: string; falto: string; formato: string };

const SYS = `Eres el jefe de calidad de Krypton, un asistente de IA. Recibes las evaluaciones de varias personas digitales que lo probaron. Escribe un informe en español, claro y accionable, con estas secciones: 1) Los 10 problemas más repetidos, ordenados por gravedad, cada uno con las personas afectadas. 2) Qué le falta a Krypton, en una lista corta. 3) Problemas de formato y presentación. 4) Velocidad: qué tipo de peticiones tardan más. 5) Plan de arreglo en orden de prioridad (máximo 8 pasos). No inventes datos que no estén en las evaluaciones.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  const { data: adm } = await supabase.rpc("is_admin");
  if (adm !== true) return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 403 });
  let items: Item[] = [];
  try {
    items = ((await request.json()) as { items?: Item[] }).items ?? [];
  } catch {}
  items = items.slice(0, 60);
  if (!items.length) return NextResponse.json({ ok: false, error: "No hay resultados." }, { status: 400 });
  const avg = Math.round(items.reduce((a, i) => a + i.ms, 0) / items.length / 1000);
  const slow = items.filter((i) => i.ms > 30000).length;
  const mean = (items.reduce((a, i) => a + i.nota, 0) / items.length).toFixed(1);
  const head = "Personas evaluadas: " + items.length + " · Nota media: " + mean + "/10 · Tiempo medio: " + avg + " s · Respuestas de más de 30 s: " + slow;
  const lines = items.map((i) => i.name + " | " + i.area + " | " + Math.round(i.ms / 1000) + " s | nota " + i.nota + " | falló: " + i.fallo + " | faltó: " + i.falto + " | formato: " + i.formato).join("\n");
  try {
    const r = await generate({ system: SYS, messages: [{ role: "user", content: head + "\n\n" + lines }] });
    return NextResponse.json({ ok: true, text: head + "\n\n" + r.text });
  } catch {
    return NextResponse.json({ ok: true, text: head + "\n\n(No se pudo redactar el resumen automático. Detalle:)\n" + lines });
  }
}
