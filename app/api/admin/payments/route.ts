import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const [p, m] = await Promise.all([supabase.rpc("admin_list_payments"), supabase.rpc("admin_list_methods")]);
    if (p.error || m.error) {
      const e = (p.error ?? m.error)!;
      return NextResponse.json({ ok: false, error: "No autorizado, o falta el SQL de pagos (" + e.message.slice(0, 80) + ")" }, { status: 403 });
    }
    return NextResponse.json({ ok: true, payments: p.data ?? [], methods: m.data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const b = (await request.json()) as {
      action?: string; id?: string | null; approve?: boolean; days?: number; name?: string; details?: string; active?: boolean;
    };
    let err: { message: string } | null = null;
    if (b.action === "review") {
      const r = await supabase.rpc("admin_review_payment", {
        p_id: b.id, p_approve: b.approve === true, p_days: Math.min(Math.max(Number(b.days) || 30, 1), 3650),
      });
      err = r.error;
    } else if (b.action === "save_method") {
      const r = await supabase.rpc("admin_save_method", {
        p_id: b.id ?? null, p_name: (b.name ?? "").slice(0, 80), p_details: (b.details ?? "").slice(0, 600), p_active: b.active !== false,
      });
      err = r.error;
    } else if (b.action === "delete_method") {
      const r = await supabase.rpc("admin_delete_method", { p_id: b.id });
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
