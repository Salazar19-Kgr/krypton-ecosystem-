import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runKrypton } from "@/lib/krypton/brain";
import { analyzeImages, type ImagePart } from "@/lib/krypton/vision";
import type { ChatMsg } from "@/lib/krypton/llm";
import { checkSession } from "@/lib/sentinel/session";
import { SENTINEL_PREFIX, SENTINEL_SYSTEM, SENTINEL_TERMS_VERSION, prefilter } from "@/lib/sentinel/rules";

const MAX_MESSAGE = 6000;
const DAILY = 300;
const ALLOWED = /^(image\/(jpeg|png|webp|gif)|application\/pdf|text\/plain)$/;

type Body = { message?: string; history?: { role?: string; content?: string }[]; images?: ImagePart[] };
type Sb = Awaited<ReturnType<typeof createClient>>;

async function strike(supabase: Sb, cat: string, text: string, source: string) {
  const { data } = await supabase.rpc("sentinel_strike", { p_category: cat, p_snippet: text, p_source: source });
  const s = (Array.isArray(data) ? data[0] : data) as { status?: string; strikes?: number } | undefined;
  const n = s?.strikes ?? 1;
  const extra =
    s?.status === "banned"
      ? "Tu acceso a Sentinel fue bloqueado. Si crees que es un error, escribe al equipo por WhatsApp (+58 424 5095002)."
      : s?.status === "suspended"
        ? "Tu acceso a Sentinel queda suspendido durante 24 horas."
        : "Aviso " + n + " de 3: una tercera falta bloquea tu acceso.";
  return { extra, refresh: s?.status === "banned" || s?.status === "suspended" };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    const user = u?.user;
    if (!user) return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });

    const st = await supabase.rpc("sentinel_status");
    const r = (Array.isArray(st.data) ? st.data[0] : st.data) as
      | { allowed?: boolean; status?: string; terms_version?: string; has_pass?: boolean }
      | undefined;
    const open =
      !!r?.allowed &&
      r.status === "active" &&
      r.terms_version === SENTINEL_TERMS_VERSION &&
      !!r.has_pass &&
      (await checkSession(request.headers.get("cookie"), user.id));
    if (!open) return NextResponse.json({ ok: false, error: "Acceso a Sentinel no disponible.", state: "refresh" }, { status: 403 });

    const body = (await request.json()) as Body;
    const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE);
    const images = (Array.isArray(body.images) ? body.images : [])
      .filter((i) => typeof i?.mimeType === "string" && ALLOWED.test(i.mimeType) && typeof i?.data === "string" && i.data.length < 9_000_000)
      .slice(0, 8);
    if (!message && images.length === 0) return NextResponse.json({ ok: false, error: "Escribe tu solicitud o adjunta un archivo." }, { status: 400 });
    const history: ChatMsg[] = (Array.isArray(body.history) ? body.history : [])
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-12)
      .map((m) => ({ role: m.role === "assistant" ? ("assistant" as const) : ("user" as const), content: String(m.content).slice(0, 3000) }));

    try {
      const since = new Date(Date.now() - 86400000).toISOString();
      const c = await supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("kind", "sentinel")
        .gte("created_at", since);
      if ((c.count ?? 0) >= DAILY) {
        return NextResponse.json({ ok: false, error: "Llegaste al límite diario de Sentinel (" + DAILY + " solicitudes). Se reinicia en 24 horas." }, { status: 429 });
      }
      await supabase.from("usage_events").insert({ user_id: user.id, kind: "sentinel" });
    } catch {}

    const cat = prefilter(message);
    if (cat) {
      const s = await strike(supabase, cat, message, "regla");
      return NextResponse.json({
        ok: true,
        blocked: true,
        state: s.refresh ? "refresh" : undefined,
        text: "Esta solicitud infringe las normas de Krypton Sentinel y no se procesó. " + s.extra,
      });
    }

    const result = images.length
      ? await analyzeImages(SENTINEL_PREFIX + (message || "Analiza el material adjunto."), history, images)
      : await runKrypton(message, history, SENTINEL_SYSTEM);
    const text = String(result.text ?? "").trim() || "No fue posible generar una respuesta.";
    const m = text.match(/^\s*\[\[SENTINEL_BLOQUEO:([^\]]{1,30})\]\]\s*/i);
    if (m) {
      const s = await strike(supabase, m[1].trim().toLowerCase(), message, "modelo");
      return NextResponse.json({
        ok: true,
        blocked: true,
        state: s.refresh ? "refresh" : undefined,
        text: text.replace(m[0], "").trim() + "\n\n" + s.extra,
      });
    }
    return NextResponse.json({ ok: true, text });
  } catch {
    return NextResponse.json({ ok: false, error: "No pude procesar la solicitud. Intenta de nuevo." }, { status: 500 });
  }
}
