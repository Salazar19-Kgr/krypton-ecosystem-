import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const { data, error } = await supabase.rpc("admin_kb_list");
    if (error) return NextResponse.json({ ok: false, error: "No autorizado, o falta el SQL de la biblioteca." }, { status: 403 });
    return NextResponse.json({ ok: true, docs: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const b = (await request.json()) as { action?: string; id?: string | null; kind?: string; title?: string; tags?: string; content?: string };
    let err: { message: string } | null = null;
    if (b.action === "save") {
      const r = await supabase.rpc("admin_kb_save", {
        p_id: b.id ?? null,
        p_kind: b.kind ?? "modelo",
        p_title: (b.title ?? "").slice(0, 160),
        p_tags: (b.tags ?? "").slice(0, 300),
        p_content: (b.content ?? "").slice(0, 20000),
      });
      err = r.error;
    } else if (b.action === "delete") {
      const r = await supabase.rpc("admin_kb_delete", { p_id: b.id });
      err = r.error;
    } else {
      return NextResponse.json({ ok: false, error: "Acción no válida." }, { status: 400 });
    }
    if (err) return NextResponse.json({ ok: false, error: "No se pudo completar (" + err.message.slice(0, 80) + ")" }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
