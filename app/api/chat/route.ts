import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runKrypton } from "@/lib/krypton/brain";
import { analyzeImages, type ImagePart } from "@/lib/krypton/vision";
import { wantsImage, createImageLimited } from "@/lib/krypton/imagegen";
import type { ChatMsg } from "@/lib/krypton/llm";

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 20;
const MAX_IMAGES = 4;
const MAX_IMAGE_B64 = 14_000_000;

type Body = {
  message?: string;
  conversationId?: string | null;
  history?: { role: "user" | "model"; content: string }[];
  images?: ImagePart[];
};

type Row = { role: string; content: string };

const toChat = (rows: Row[]): ChatMsg[] =>
  rows.map((m) => ({
    role: m.role === "model" ? "assistant" : "user",
    content: String(m.content).slice(0, MAX_MESSAGE),
  }));

const reason = (e: unknown) =>
  (e instanceof Error ? e.message : String((e as { message?: string })?.message ?? e)).slice(0, 200);

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

    {
      let plan = "free";
      try {
        const r = await supabase.rpc("my_plan");
        if (typeof r.data === "string") plan = r.data;
      } catch {}
      const LIM: Record<string, number[]> = { free: [10, 40], basic: [15, 300], pro: [20, 1000], max: [30, 3000] };
      const [perMin, perDay] = LIM[plan] ?? LIM.free;
      const since = (ms: number) => new Date(Date.now() - ms).toISOString();
      try {
        const [m, d] = await Promise.all([
          supabase.from("messages").select("role", { count: "exact", head: true }).eq("user_id", user.id).eq("role", "user").gte("created_at", since(60000)),
          supabase.from("messages").select("role", { count: "exact", head: true }).eq("user_id", user.id).eq("role", "user").gte("created_at", since(86400000)),
        ]);
        if ((m.count ?? 0) >= perMin) {
          return NextResponse.json({ ok: false, error: "Vas muy rápido. Espera un minuto y vuelve a escribir." }, { status: 429 });
        }
        if ((d.count ?? 0) >= perDay) {
          return NextResponse.json({ ok: false, error: "Llegaste al límite diario de mensajes. Mañana se reinicia." }, { status: 429 });
        }
      } catch {}
    }

    const body = (await request.json()) as Body;
    const message = (body.message ?? "").trim();
    const images = (Array.isArray(body.images) ? body.images : [])
      .filter(
        (i) =>
          typeof i?.mimeType === "string" &&
          (i.mimeType.startsWith("image/") ||
            i.mimeType === "application/pdf" ||
            i.mimeType === "text/plain") &&
          typeof i?.data === "string" &&
          i.data.length < MAX_IMAGE_B64
      )
      .slice(0, MAX_IMAGES);

    if (!message && images.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Escribe un mensaje o adjunta una imagen." },
        { status: 400 }
      );
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { ok: false, error: "El mensaje es demasiado largo." },
        { status: 400 }
      );
    }

    let conversationId = body.conversationId ?? null;

    // Historial: de la base de datos; si no está disponible, el que envía el chat
    let history: ChatMsg[] = [];
    if (conversationId) {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("role,content")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(MAX_HISTORY);
        if (error) throw error;
        history = toChat(((data ?? []) as Row[]).reverse());
      } catch {
        history = [];
      }
    }
    if (!history.length && Array.isArray(body.history)) {
      history = toChat(
        body.history
          .filter((m) => (m?.role === "user" || m?.role === "model") && typeof m?.content === "string")
          .slice(-MAX_HISTORY)
      );
    }

    const result = images.length
      ? await analyzeImages(message, history, images)
      : wantsImage(message)
        ? await createImageLimited(supabase, user.id, message)
        : await runKrypton(message, history);

    // Guardar en el historial (si falla, el usuario igual recibe su respuesta)
    let title: string | null = null;
    const saveErrors: string[] = [];
    try {
      if (!conversationId) {
        title = (message || "Análisis de imagen").slice(0, 60);
        const { data, error } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title })
          .select("id")
          .single();
        if (error) throw error;
        conversationId = (data as { id: string }).id;
      }
    } catch (e) {
      saveErrors.push(`conversación: ${reason(e)}`);
    }

    if (conversationId) {
      const now = Date.now();
      const rows = [
        {
          conversation_id: conversationId,
          user_id: user.id,
          role: "user",
          content: message || "[Imagen adjunta]",
          has_image: images.length > 0,
          created_at: new Date(now).toISOString(),
        },
        {
          conversation_id: conversationId,
          user_id: user.id,
          role: "model",
          content: result.text.length > 20000 ? "[Imagen generada]" : result.text,
          has_image: false,
          created_at: new Date(now + 1).toISOString(),
        },
      ];

      for (const row of rows) {
        const { error } = await supabase.from("messages").insert(row);
        if (error) saveErrors.push(`mensaje: ${reason(error)}`);
      }

      const { error } = await supabase
        .from("conversations")
        .update({ updated_at: new Date(now + 2).toISOString() })
        .eq("id", conversationId);
      if (error) saveErrors.push(`actualizar: ${reason(error)}`);
    }

    return NextResponse.json({
      ok: true,
      text: result.text,
      provider: result.provider,
      conversationId,
      title,
      saved: saveErrors.length === 0,
      saveError: saveErrors[0],
    });
  } catch (error) {
    console.error("Krypton Core error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Krypton está con mucha demanda en este momento. Intenta de nuevo en unos segundos.",
      },
      { status: 502 }
    );
  }
}
