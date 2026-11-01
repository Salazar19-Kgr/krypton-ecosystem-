import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      return NextResponse.json({ ok: false, error: "No autorizado, o falta el SQL (" + error.message.slice(0, 80) + ")" }, { status: 403 });
    }
    return NextResponse.json({ ok: true, users: data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const b = (await request.json()) as { user_id?: string; plan?: string; days?: number; note?: string };
    const { error } = await supabase.rpc("admin_set_plan", {
      p_user: b.user_id,
      p_plan: b.plan,
      p_days: Math.min(Math.max(Number(b.days) || 30, 1), 3650),
      p_note: b.note ?? null,
    });
    if (error) return NextResponse.json({ ok: false, error: "No se pudo cambiar el plan (" + error.message.slice(0, 80) + ")" }, { status: 403 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
