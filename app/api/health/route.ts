import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generate, type ChatMsg } from "@/lib/krypton/llm";
import { analyzeImages, type ImagePart } from "@/lib/krypton/vision";
import { triage, emergencyMessage } from "@/lib/krypton/health/triage";
import {
  HEALTH_SYSTEM_PROMPT,
  HEALTH_SCOPE_PROMPT,
  HEALTH_VISION_PROMPT,
  HEALTH_VERIFIER_PROMPT,
} from "@/lib/krypton/health/prompts";

const MAX_MESSAGE = 3000;
const MAX_HISTORY = 14;
const MAX_IMAGES = 4;
const MAX_B64 = 2_500_000;
const ALLOWED = /^(image\/(jpeg|png|webp)|application\/pdf)$/;
const VERIFY = process.env.HEALTH_VERIFY !== "off";
const OFF_TOPIC_MARK = "[[FUERA_DE_TEMA]]";
const OFF_TOPIC_REPLY =
  "Krypton Health es un asistente médico y no puede ayudarte con esa consulta. Si tienes dudas sobre tu salud, síntomas, medicamentos o resultados de exámenes, con gusto te ayudo.";
const NEEDS_CHECK =
  /\b(mg|ml|dosis|tableta|pastilla|capsula|comprimido|jarabe|gotas|antibiotico|ibuprofeno|paracetamol|acetaminofen|aspirina|naproxeno|diclofenac|loratadina|medicamento)/;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

type Body = {
  message?: string;
  history?: { role?: string; content?: string }[];
  images?: ImagePart[];
};
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

async function verify(userContext: string, answer: string): Promise<Verdict | null> {
  try {
    const r = await generate({
      system: HEALTH_VERIFIER_PROMPT,
      messages: [
        {
          role: "user",
          content:
            "LO QUE EL USUARIO HA DICHO:\n" + userContext + "\n\nRESPUESTA PROPUESTA:\n" + answer,
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
    const images = (Array.isArray(body.images) ? body.images : [])
      .filter(
        (i) =>
          typeof i?.mimeType === "string" &&
          ALLOWED.test(i.mimeType) &&
          typeof i?.data === "string" &&
          i.data.length < MAX_B64
      )
      .slice(0, MAX_IMAGES);

    if (!message && images.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Escribe tu consulta o adjunta un archivo compatible." },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json({ ok: false, error: "El mensaje es demasiado largo." }, { status: 400 });
    }

    const history: ChatMsg[] = (Array.isArray(body.history) ? body.history : [])
      .filter(
        (m) =>
          (m?.role === "user" || m?.role === "assistant" || m?.role === "model") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-MAX_HISTORY)
      .map((m): ChatMsg => ({
        role: m.role === "user" ? "user" : "assistant",
        content: String(m.content).slice(0, MAX_MESSAGE),
      }));
    while (history.length && history[0].role !== "user") history.shift();

    // 1) Triage por reglas: posible emergencia => mensaje fijo, sin consultar a la IA
    const current = triage(message);
    if (current.level === 4) {
      return NextResponse.json({
        ok: true,
        reply: emergencyMessage(current),
        triage: { level: 4, reasons: current.reasons },
        verified: "rules",
      });
    }

    // 2) Triage con contexto reciente
    const recentUser = history.filter((m) => m.role === "user").slice(-4).map((m) => m.content);
    const userContext = [...recentUser, message].join("\n- ");
    const ctx = triage(userContext);
    const level = ctx.level;

    const triageNote =
      level >= 2
        ? "\n\nTRIAGE (reglas de seguridad): nivel " +
          level +
          " de 4. Señales detectadas: " +
          ctx.reasons.join("; ") +
          ". " +
          (level >= 3
            ? "Indica con claridad al inicio que conviene valoración médica pronto y por qué, sin dramatismo."
            : "Menciona que conviene consultar a un profesional si no mejora.")
        : "";
    const system = HEALTH_SYSTEM_PROMPT + "\n\n" + HEALTH_SCOPE_PROMPT + triageNote;
    const messages: ChatMsg[] = [...history, { role: "user", content: message }];

    const produce = async (extra: string): Promise<string> => {
      if (images.length) {
        const r = await analyzeImages(
          system +
            "\n\n" +
            HEALTH_VISION_PROMPT +
            extra +
            "\n\nMENSAJE DEL USUARIO:\n" +
            (message || "Analiza en detalle los archivos adjuntos."),
          history,
          images
        );
        return r.text.trim();
      }
      return (await generate({ system: system + extra, messages })).text.trim();
    };

    // 3) Borrador
    let answer = await produce("");

    // 4) Fuera de tema: mensaje fijo
    if (answer.includes(OFF_TOPIC_MARK)) {
      return NextResponse.json({
        ok: true,
        reply: OFF_TOPIC_REPLY,
        triage: { level: 1, reasons: [] },
        verified: "scope",
      });
    }

    // 5) Verificador solo cuando hay medicamentos o riesgo
    let verified: "ok" | "skipped" | "unavailable" = "skipped";
    if (VERIFY && (level >= 2 || NEEDS_CHECK.test(norm(answer)))) {
      let v = await verify(userContext, answer);
      if (v && !v.safe) {
        answer = await produce(
          "\n\nUna revisión de seguridad marcó estos puntos en tu borrador; corrígelos manteniendo el mismo tono útil y sin disculparte: " +
            v.problems.join("; ") +
            "."
        );
        v = await verify(userContext, answer);
        if (v && !v.safe) {
          answer +=
            "\n\nConfirma estos detalles con un farmacéutico o un médico antes de tomar cualquier medicamento.";
        }
      }
      verified = v ? "ok" : "unavailable";
    }

    let reply = answer;
    if (level >= 3) {
      reply =
        "**Importante:** por lo que describes, conviene que te valore un profesional de la salud pronto.\n\n" +
        reply;
    }

    return NextResponse.json({
      ok: true,
      reply,
      triage: { level, reasons: ctx.reasons },
      verified,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pude analizar eso ahora. Intenta de nuevo en un momento." },
      { status: 500 }
    );
  }
}
