import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { COOKIE, TTL, makeSession } from "@/lib/sentinel/session";
import { SENTINEL_TERMS_VERSION } from "@/lib/sentinel/rules";

const MSG: Record<string, string> = {
  no_plan: "Sentinel es exclusivo del plan Max.",
  terms: "Primero acepta las normas.",
  exists: "Ya tienes una clave creada.",
  short: "La clave debe tener al menos 14 caracteres.",
  question: "Escribe una pregunta (mínimo 8 caracteres) y su respuesta.",
  bad: "Clave incorrecta.",
  locked: "Demasiados intentos. Espera unos minutos e inténtalo otra vez.",
  suspended: "Tu acceso está suspendido.",
  banned: "Tu acceso fue bloqueado.",
  blocked: "Tu acceso está restringido.",
  no_pass: "Aún no tienes una clave creada.",
  no_session: "Inicia sesión.",
};

type Body = { action?: string; pass?: string; question?: string; answer?: string };

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    const uid = u.user.id;
    const b = (await request.json()) as Body;
    const pass = String(b.pass ?? "").slice(0, 200);
    const fail = (code: string) => NextResponse.json({ ok: false, error: MSG[code] ?? "No se pudo completar." }, { status: 400 });
    const session = async () => {
      const v = await makeSession(uid);
      if (!v) return NextResponse.json({ ok: false, error: "Falta configurar SENTINEL_SECRET en el servidor." }, { status: 500 });
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE, v, { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: TTL });
      return res;
    };

    if (b.action === "accept_terms") {
      const { data } = await supabase.rpc("sentinel_accept_terms", { p_version: SENTINEL_TERMS_VERSION });
      return data === true ? NextResponse.json({ ok: true }) : fail("no_plan");
    }
    if (b.action === "setup") {
      const { data } = await supabase.rpc("sentinel_set_secrets", {
        p_pass: pass,
        p_question: String(b.question ?? "").slice(0, 200),
        p_answer: String(b.answer ?? "").slice(0, 200),
      });
      return data === "ok" ? session() : fail(String(data));
    }
    if (b.action === "unlock") {
      const { data } = await supabase.rpc("sentinel_check_pass", { p_pass: pass });
      return data === "ok" ? session() : fail(String(data));
    }
    if (b.action === "reset") {
      const { data } = await supabase.rpc("sentinel_reset", { p_answer: String(b.answer ?? "").slice(0, 200), p_new: pass });
      return data === "ok" ? session() : fail(String(data));
    }
    if (b.action === "lock") {
      const res = NextResponse.json({ ok: true });
      res.cookies.set(COOKIE, "", { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 0 });
      return res;
    }
    return fail("x");
  } catch {
    return NextResponse.json({ ok: false, error: "Error interno." }, { status: 500 });
  }
}
