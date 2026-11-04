import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkSession } from "@/lib/sentinel/session";
import { SENTINEL_TERMS_VERSION } from "@/lib/sentinel/rules";

type Row = {
  plan: string;
  allowed: boolean;
  status: string;
  suspended_until: string | null;
  terms_version: string | null;
  has_pass: boolean;
  question: string | null;
};

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false }, { status: 401 });
    const { data, error } = await supabase.rpc("sentinel_status");
    const r = (Array.isArray(data) ? data[0] : data) as Row | undefined;
    if (error || !r) return NextResponse.json({ ok: false, error: "Falta ejecutar el SQL de Sentinel." }, { status: 500 });
    let state = "ready";
    if (!r.allowed) state = "no_plan";
    else if (r.status === "banned") state = "banned";
    else if (r.status === "suspended") state = "suspended";
    else if (r.terms_version !== SENTINEL_TERMS_VERSION) state = "terms";
    else if (!r.has_pass) state = "setup";
    else if (!(await checkSession(request.headers.get("cookie"), u.user.id))) state = "locked";
    return NextResponse.json({ ok: true, state, question: state === "locked" ? r.question : null, until: r.suspended_until });
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
