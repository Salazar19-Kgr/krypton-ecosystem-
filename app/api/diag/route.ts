import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { testProviders } from "@/lib/krypton/llm";
import { tavilySearch, wikipediaSearch } from "@/lib/krypton/tools";

const KEYS = [
  "GEMINI_API_KEY",
  "GROQ_API_KEY",
  "OPENROUTER_API_KEY",
  "TAVILY_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const check = (promise: Promise<unknown[]>) =>
  promise
    .then((r) => ({ ok: true, results: r.length }))
    .catch((e) => ({ ok: false, error: String(e).slice(0, 160) }));

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json(
        { ok: false, error: "Inicia sesión primero." },
        { status: 401 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: "auth", detail: String(e).slice(0, 300) },
      { status: 500 }
    );
  }

  const [llm, tavily, wikipedia] = await Promise.all([
    testProviders(),
    process.env.TAVILY_API_KEY ? check(tavilySearch("agua")) : "sin clave",
    check(wikipediaSearch("Refrigeración")),
  ]);

  return NextResponse.json({
    claves: Object.fromEntries(KEYS.map((k) => [k, Boolean(process.env[k])])),
    modeloGemini: process.env.GEMINI_MODEL || "(por defecto)",
    llm,
    tavily,
    wikipedia,
  });
}
