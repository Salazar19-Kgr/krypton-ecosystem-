import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runKrypton } from "@/lib/krypton/brain";
import type { ChatMsg } from "@/lib/krypton/llm";

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

    const history: ChatMsg[] = (Array.isArray(body.history) ? body.history : [])
      .filter(
        (item) =>
          (item?.role === "user" || item?.role === "model") &&
          typeof item?.content === "string"
      )
      .slice(-MAX_HISTORY)
      .map((item) => ({
        role: item.role === "model" ? "assistant" : "user",
        content: item.content.slice(0, MAX_MESSAGE),
      }));

    const result = await runKrypton(message, history);

    return NextResponse.json({
      ok: true,
      text: result.text,
      provider: result.provider,
    });
  } catch (error) {
    console.error("Krypton Core error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Krypton no pudo responder en este momento. Intenta de nuevo.",
      },
      { status: 502 }
    );
  }
}
