import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false }, { status: 401 });
    const [m, p] = await Promise.all([
      supabase.from("payment_methods").select("id,name,details").eq("active", true).order("sort").order("created_at"),
      supabase.from("payments").select("id,plan,amount,method,reference,status,created_at").order("created_at", { ascending: false }).limit(10),
    ]);
    return NextResponse.json({ ok: true, methods: m.data ?? [], mine: p.data ?? [] });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const b = (await request.json()) as { plan?: string; method?: string; reference?: string; amount?: number; note?: string };
    const plan = b.plan ?? "";
    const method = (b.method ?? "").trim().slice(0, 80);
    const reference = (b.reference ?? "").trim().slice(0, 120);
    if (!["basic", "pro", "max"].includes(plan) || !method || !reference) {
      return NextResponse.json({ ok: false, error: "Completa el plan, el método y la referencia." }, { status: 400 });
    }
    const pend = await supabase.from("payments").select("id", { count: "exact", head: true }).eq("status", "pending");
    if ((pend.count ?? 0) >= 3) {
      return NextResponse.json({ ok: false, error: "Ya tienes pagos en revisión. Espera a que los aprobemos." }, { status: 429 });
    }
    const { error } = await supabase.from("payments").insert({
      user_id: u.user.id, plan, method, reference,
      amount: Number(b.amount) > 0 ? Number(b.amount) : null,
      note: (b.note ?? "").slice(0, 300) || null, status: "pending",
    });
    if (error) return NextResponse.json({ ok: false, error: "No se pudo enviar (" + error.message.slice(0, 80) + ")" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
