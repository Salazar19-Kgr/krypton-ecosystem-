import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { testProviders } from "@/lib/krypton/llm";

export const dynamic = "force-dynamic";

async function guard() {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return { supabase, status: 401 };
  const { data } = await supabase.rpc("is_admin");
  return { supabase, status: data === true ? 200 : 403 };
}

export async function GET() {
  const g = await guard();
  if (g.status !== 200) return NextResponse.json({ ok: false }, { status: g.status });
  const { data, error } = await g.supabase.from("provider_flags").select("name, enabled");
  if (error) return NextResponse.json({ ok: false, error: "Falta el SQL de interruptores." }, { status: 500 });
  return NextResponse.json({ ok: true, flags: data ?? [] });
}

export async function POST(request: Request) {
  const g = await guard();
  if (g.status !== 200) return NextResponse.json({ ok: false }, { status: g.status });
  let b: { action?: string; name?: string; enabled?: boolean } = {};
  try {
    b = await request.json();
  } catch {}
  if (b.action === "test") return NextResponse.json({ ok: true, results: await testProviders() });
  if (b.action === "toggle" && b.name) {
    const { data } = await g.supabase.rpc("admin_set_provider", { p_name: b.name, p_enabled: b.enabled === true });
    return NextResponse.json({ ok: data === true });
  }
  return NextResponse.json({ ok: false }, { status: 400 });
}
