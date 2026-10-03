import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geminiAdapter } from "@/lib/ai/providers/gemini-adapter";

const KRYPTON_SYSTEM_INSTRUCTION = `
Eres Krypton Core, el cerebro central de Krypton Ecosystem.

Tu función es ayudar al usuario de forma clara, precisa y útil.

Debes:
- comprender la intención del usuario automáticamente;
- responder directamente sin pedirle que seleccione categorías;
- mantener el contexto proporcionado en la conversación;
- no inventar datos;
- reconocer cuando una información no puede confirmarse;
- resolver problemas matemáticos cuidadosamente;
- analizar solicitudes técnicas con precisión;
- cuando posteriormente existan herramientas externas, utilizarlas según corresponda;
- responder en el idioma utilizado por el usuario;
- ser conciso cuando la solicitud sea sencilla y explicar paso a paso cuando sea necesario.

No muestres al usuario las decisiones internas del sistema, herramientas, proveedores, rutas ni arquitectura de Krypton.
`;

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 20;

type ChatRequestBody = {
  message?: string;
  history?: {
    role: "user" | "model";
    content: string;
  }[];
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Debes iniciar sesión." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "El mensaje es obligatorio." },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { ok: false, error: "El mensaje es demasiado largo." },
        { status: 400 }
      );
    }

    if (!geminiAdapter.isConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Krypton Core todavía no tiene Gemini configurado." },
        { status: 503 }
      );
    }

    const history = (Array.isArray(body.history) ? body.history : [])
      .filter(
        (item) =>
          (item?.role === "user" || item?.role === "model") &&
          typeof item?.content === "string"
      )
      .slice(-MAX_HISTORY)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, MAX_MESSAGE),
      }));

    const result = await geminiAdapter.generate({
      message,
      history,
      systemInstruction: KRYPTON_SYSTEM_INSTRUCTION,
    });

    return NextResponse.json({
      ok: true,
      text: result.text,
      model: result.model,
    });
  } catch (error) {
    console.error("Krypton Core error:", error);
    return NextResponse.json(
      { ok: false, error: "Krypton Core no pudo procesar la solicitud." },
      { status: 500 }
    );
  }
}
