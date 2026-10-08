import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generate, type ChatMsg } from "@/lib/krypton/llm";
import { triage, emergencyMessage } from "@/lib/krypton/health/triage";
import { HEALTH_SYSTEM_PROMPT, HEALTH_VERIFIER_PROMPT } from "@/lib/krypton/health/prompts";

const MAX_MESSAGE = 3000;
const MAX_HISTORY = 12;
const VERIFY = process.env.HEALTH_VERIFY !== "off";

const FALLBACK =
  "No puedo darte una respuesta lo bastante segura sobre esto con la información que tengo. Lo más prudente es consultarlo con un profesional de la salud, y si empeoras o aparecen señales de alarma, buscar atención de urgencia. Si quieres, cuéntame más detalles (cuándo empezó, intensidad, otros síntomas, medicamentos) y lo intentamos de nuevo.";

type Body = { message?: string; history?: { role?: string; content?: string }[] };
type Verdict = { safe: boolean; problems: string[] };

function parseVerdict(t: string): Verdict | null {
  const m = t.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    return {
      safe: j.safe === true,
      problems: Array.isArray(j.problems) ? j.problems.map(String).slice(0, 5) : [],
    };
  } catch {
    return null;
  }
}

async function verify(message: string, answer: string): Promise<Verdict | null> {
  try {
    const r = await generate({
      system: HEALTH_VERIFIER_PROMPT,
      messages: [
        {
          role: "user",
          content: "MENSAJE DEL USUARIO:\n" + message + "\n\nRESPUESTA PROPUESTA:\n" + answer,
        },
      ],
    });
    return parseVerdict(r.text);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "Debes iniciar sesión." }, { status: 401 });
    }

    const body = (await request.json()) as Body;
    const message = (body.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ ok: false, error: "Escribe tu consulta." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json({ ok: false, error: "El mensaje es demasiado largo." }, { status: 400 });
    }

    const history: ChatMsg[] = (Array.isArray(body.history) ? body.history : [])
      .filter(
        (m) =>
          (m?.role === "user" || m?.role === "assistant" || m?.role === "model") &&
          typeof m.content === "string"
      )
      .slice(-MAX_HISTORY)
      .map((m): ChatMsg => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content).slice(0, MAX_MESSAGE),
      }));
    while (history.length && history[0].role !== "user") history.shift();

    // 1) Triage por reglas: si es posible emergencia, NO se consulta a la IA
    const current = triage(message);
    if (current.level === 4) {
      return NextResponse.json({
        ok: true,
        reply: emergencyMessage(current),
        triage: { level: 4, reasons: current.reasons },
        verified: "rules",
      });
    }

    // 2) Triage con contexto reciente del usuario
    const recentUser = history.filter((m) => m.role === "user").slice(-3).map((m) => m.content);
    const ctx = triage([...recentUser, message].join("\n"));
    const level = ctx.level;

    let system = HEALTH_SYSTEM_PROMPT;
    if (level >= 2) {
      system +=
        "\n\nTRIAGE (reglas de seguridad, no negociable): nivel " +
        level +
        " de 4. Señales detectadas: " +
        ctx.reasons.join("; ") +
        ". " +
        (level >= 3
          ? "Empieza tu respuesta indicando con claridad que conviene valoración médica pronto y por qué. No sugieras esperar ni automedicarte."
          : "Menciona que conviene consultar a un profesional.");
    }
    const messages: ChatMsg[] = [...history, { role: "user", content: message }];

    // 3) Borrador
    let answer = (await generate({ system, messages })).text.trim();

    // 4) Verificador de seguridad (un reintento; si sigue inseguro, respuesta prudente)
    let verified: "ok" | "unavailable" | "off" = "off";
    if (VERIFY) {
      let v = await verify(message, answer);
      if (v && !v.safe) {
        const retry = await generate({
          system:
            system +
            "\n\nUna revisión de seguridad encontró estos problemas en tu borrador; corrígelos: " +
            v.problems.join("; ") +
            ".",
          messages,
        });
        answer = retry.text.trim();
        v = await verify(message, answer);
        if (v && !v.safe) answer = FALLBACK;
      }
      verified = v ? "ok" : "unavailable";
    }

    let reply = answer;
    if (level >= 3 && answer !== FALLBACK) {
      reply =
        "⚠️ Por lo que describes, conviene que te valore un profesional de la salud pronto.\n\n" +
        reply;
    }
    if (verified === "unavailable") {
      reply +=
        "\n\n(La verificación de seguridad no estuvo disponible en este momento. Ante cualquier duda, consulta a un profesional.)";
    }

    return NextResponse.json({
      ok: true,
      reply,
      triage: { level, reasons: ctx.reasons },
      verified,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pude responder ahora. Intenta de nuevo en un momento." },
      { status: 500 }
    );
  }
}
