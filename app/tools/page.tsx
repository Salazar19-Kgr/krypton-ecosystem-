"use client";

import { useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import TypedContent, { liveStamp } from "@/components/chat/TypedContent";

type Tool = { id: string; name: string; hint: string; local?: boolean; two?: boolean; extra?: string };
type Out = { text: string; md: boolean; id: number };

const TOOLS: Tool[] = [
  { id: "contar", name: "Contador de palabras", hint: "Palabras, caracteres, párrafos y tiempo de lectura.", local: true },
  { id: "limpiar", name: "Limpieza de texto", hint: "Quita espacios dobles, saltos repetidos y líneas vacías.", local: true },
  { id: "comparar", name: "Comparador de textos", hint: "Muestra qué líneas cambian entre dos textos.", local: true, two: true },
  { id: "resumir", name: "Resumir", hint: "Resumen claro con los puntos clave.", extra: "Longitud o enfoque (opcional)" },
  { id: "corregir", name: "Corregir", hint: "Ortografía, gramática y puntuación.", extra: "Indicación (opcional)" },
  { id: "traducir", name: "Traducir", hint: "A cualquier idioma.", extra: "Idioma de destino (ej. inglés)" },
  { id: "reescribir", name: "Reescribir", hint: "Mismo contenido con otro tono.", extra: "Tono (ej. formal, cercano)" },
  { id: "extraer", name: "Extraer datos", hint: "Fechas, nombres, cifras y tareas.", extra: "Qué datos buscar (opcional)" },
  { id: "tabla", name: "Texto a tabla", hint: "Ordena la información en una tabla.", extra: "Columnas deseadas (opcional)" },
  { id: "redactar", name: "Redactar", hint: "Describe lo que necesitas y lo escribo completo.", extra: "Formato (carta, correo, informe…)" },
  { id: "explicar", name: "Explicar fácil", hint: "Explica algo complejo paso a paso.", extra: "Nivel (ej. principiante)" },
];

function localTool(id: string, a: string, b: string): { text: string; md: boolean } {
  if (id === "contar") {
    const words = (a.trim().match(/\S+/g) ?? []).length;
    const noSpace = a.replace(/\s/g, "").length;
    const lines = a ? a.split("\n").length : 0;
    const paras = a.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const mins = Math.max(1, Math.round(words / 200));
    return {
      md: true,
      text:
        "- **Palabras:** " + words +
        "\n- **Caracteres:** " + a.length +
        "\n- **Caracteres sin espacios:** " + noSpace +
        "\n- **Líneas:** " + lines +
        "\n- **Párrafos:** " + paras +
        "\n- **Lectura aproximada:** " + mins + " min",
    };
  }
  if (id === "limpiar") {
    const t = a.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    return { md: false, text: t };
  }
  const la = a.split("\n").map((s) => s.trim()).filter(Boolean);
  const lb = b.split("\n").map((s) => s.trim()).filter(Boolean);
  const sa = new Set(la);
  const sb = new Set(lb);
  const onlyA = la.filter((x) => !sb.has(x));
  const onlyB = lb.filter((x) => !sa.has(x));
  const common = Array.from(sa).filter((x) => sb.has(x)).length;
  const union = sa.size + sb.size - common;
  const sim = union ? Math.round((common / union) * 100) : 100;
  const list = (arr: string[]) => (arr.length ? arr.map((x) => "- " + x).join("\n") : "_Nada_");
  return {
    md: true,
    text:
      "**Parecido:** " + sim + "%\n\n### Solo en el texto A\n" + list(onlyA) +
      "\n\n### Solo en el texto B\n" + list(onlyB),
  };
}

function save(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
  const el = document.createElement("a");
  el.href = url;
  el.download = name;
  el.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

const FIELD =
  "w-full rounded-2xl border border-white/35 bg-transparent p-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/70";

export default function ToolsPage() {
  const [tool, setTool] = useState<Tool>(TOOLS[0]);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [out, setOut] = useState<Out | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    setError("");
    if (!a.trim()) {
      setError("Escribe o pega un texto primero.");
      return;
    }
    if (tool.local) {
      setOut({ ...localTool(tool.id, a, b), id: Date.now() });
      return;
    }
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: tool.id, text: a, extra }),
      });
      if (res.status === 401) {
        window.location.replace("/login");
        return;
      }
      const data = await res.json();
      if (data.ok) {
        liveStamp.t = Date.now();
        setOut({ text: data.result, md: true, id: Date.now() });
      } else {
        setError(data.error ?? "No pude completar la herramienta.");
      }
    } catch {
      setError("No hay conexión con Krypton. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-12 pt-4">
        <p className="krypton-eyebrow">KRYPTON TOOLS</p>
        <h1 className="mt-1 text-2xl font-light">Máquina de trabajo</h1>
        <p className="mt-1 text-sm text-white/60">Elige una herramienta, pega tu texto y Krypton lo resuelve.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTool(t);
                setOut(null);
                setError("");
              }}
              className={"k-glass-button rounded-full px-4 py-2 text-xs " + (t.id === tool.id ? "font-semibold text-white" : "text-white/70")}
              style={t.id === tool.id ? { boxShadow: "0 0 0 1px rgba(255,255,255,.9), 0 0 16px rgba(255,255,255,.35)" } : undefined}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="k-glass-panel mt-4 rounded-3xl p-4">
          <p className="mb-3 text-xs text-white/60">{tool.hint}</p>
          <textarea
            value={a}
            onChange={(e) => setA(e.target.value)}
            rows={7}
            placeholder={tool.two ? "Texto A" : tool.id === "redactar" ? "Describe lo que necesitas…" : "Pega o escribe tu texto aquí…"}
            className={FIELD}
          />
          {tool.two && (
            <textarea value={b} onChange={(e) => setB(e.target.value)} rows={7} placeholder="Texto B" className={FIELD + " mt-3"} />
          )}
          {tool.extra && (
            <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder={tool.extra} className={FIELD + " mt-3"} />
          )}
          {error && <p className="mt-3 text-xs text-red-200">{error}</p>}
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="k-glass-button mt-4 w-full rounded-full px-4 py-3 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "Trabajando…" : "Ejecutar →"}
          </button>
        </div>

        {out && (
          <div className="mt-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="krypton-eyebrow mr-auto">RESULTADO</p>
              <button type="button" onClick={copy} className="k-glass-button rounded-full px-4 py-2 text-xs">
                {copied ? "Copiado" : "Copiar"}
              </button>
              <button type="button" onClick={() => save("krypton-resultado.txt", out.text)} className="k-glass-button rounded-full px-4 py-2 text-xs">
                TXT
              </button>
              <button type="button" onClick={() => save("krypton-resultado.md", out.text)} className="k-glass-button rounded-full px-4 py-2 text-xs">
                Markdown
              </button>
            </div>
            {out.md ? (
              <TypedContent key={out.id} content={out.text} bot />
            ) : (
              <pre className="whitespace-pre-wrap text-sm text-white/90">{out.text}</pre>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="text-xs text-white/50 underline">
            ← Volver al dashboard
          </Link>
        </div>
      </section>
    </KryptonShell>
  );
}
