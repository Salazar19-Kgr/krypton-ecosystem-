import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runKrypton } from "@/lib/krypton/brain";
import { coreContext } from "@/lib/krypton/codemode";
import { kbContext, kbRules } from "@/lib/krypton/kb";
import { EVAL_TESTS } from "@/lib/krypton/evalset";

async function guard() {
  const supabase = await createClient();
  const { data: u } = await supabase.auth.getUser();
  if (!u?.user) return { supabase, status: 401 };
  const { data } = await supabase.rpc("is_admin");
  return { supabase, status: data === true ? 200 : 403 };
}

export async function GET() {
  const g = await guard();
  if (g.status !== 200) return NextResponse.json({ ok: false, error: "No autorizado." }, { status: g.status });
  return NextResponse.json({ ok: true, tests: EVAL_TESTS.map(({ id, area, prompt }) => ({ id, area, prompt })) });
}

export async function POST(request: Request) {
  const g = await guard();
  if (g.status !== 200) return NextResponse.json({ ok: false, error: "No autorizado." }, { status: g.status });
  let id = "";
  try {
    id = String(((await request.json()) as { id?: string }).id ?? "");
  } catch {}
  const t = EVAL_TESTS.find((x) => x.id === id);
  if (!t) return NextResponse.json({ ok: false, error: "Prueba no encontrada." }, { status: 404 });
  const t0 = Date.now();
  try {
    const ctx = coreContext(t.prompt, []) + (await kbRules(g.supabase)) + (await kbContext(g.supabase, t.prompt));
    const r = await Promise.race([
      runKrypton(t.prompt, [], ctx),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("tiempo agotado (60 s)")), 60000)),
    ]);
    const text = String(r.text ?? "");
    const clean = text.replace(/[*_]/g, "");
    const failed: string[] = [];
    for (const rx of t.expect ?? []) if (!(rx.test(text) || rx.test(clean))) failed.push("falta: " + rx.source.slice(0, 40));
    for (const rx of t.forbid ?? []) if (rx.test(text)) failed.push("sobra: " + rx.source.slice(0, 40));
    return NextResponse.json({ ok: true, pass: failed.length === 0, failed, ms: Date.now() - t0, provider: r.provider, text: text.slice(0, 1500) });
  } catch (e) {
    return NextResponse.json({
      ok: true,
      pass: false,
      failed: ["error: " + String((e as Error)?.message ?? e).slice(0, 80)],
      ms: Date.now() - t0,
      text: "",
    });
  }
}
