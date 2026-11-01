/* eslint-disable @typescript-eslint/no-explicit-any */
export async function kbContext(supabase: any, message: string): Promise<string> {
  try {
    const q = message.replace(/\s+/g, " ").trim().slice(0, 300);
    if (q.length < 6) return "";
    const { data, error } = await supabase.rpc("kb_search", { q, lim: 3 });
    if (error || !Array.isArray(data) || data.length === 0) return "";
    const rows = (data as { title: string; kind: string; content: string }[]).map(
      (r) => "### " + r.title + " (" + r.kind + ")\n" + String(r.content).slice(0, 1800)
    );
    return (
      "[BASE DE MODELOS Y CONOCIMIENTO DE KRYPTON: material revisado por el equipo y relacionado con la petición. Úsalo como base y adáptalo a lo que pide el usuario; si no aplica, ignóralo sin mencionarlo.]\n" +
      rows.join("\n\n") +
      "\n[FIN DE LA BASE]\n\n"
    );
  } catch {
    return "";
  }
}
