import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getKryptonRuntimeConfig } from "@/lib/ai/runtime-config";
import { geminiAdapter } from "@/lib/ai/providers/gemini-adapter";

export async function GET() {
  const report: Record<string, unknown> = {};

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json(
        { ok: false, error: "Inicia sesión primero." },
        { status: 401 }
      );
    }
    report.auth = "ok";
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "auth", detail: String(e).slice(0, 300) },
      { status: 500 }
    );
  }

  report.config = getKryptonRuntimeConfig();
  report.geminiModel = process.env.GEMINI_MODEL || "(por defecto)";

  try {
    const result = await geminiAdapter.generate({
      message: "Responde solo: ok",
    });
    report.gemini = {
      ok: true,
      model: result.model,
      text: result.text.slice(0, 80),
    };
  } catch (e) {
    report.gemini = { ok: false, detail: String(e).slice(0, 400) };
  }

  return NextResponse.json(report);
}
