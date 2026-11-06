"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

const NAMES = ["gemini", "deepseek", "groq", "openrouter", "openai"];
const COLORS: Record<string, string> = { gemini: "#4285F4", deepseek: "#4D6BFE", groq: "#F55036", openrouter: "#6467F2", openai: "#10A37F", perplexity: "#20808D", tavily: "#0EA5E9" };
const SLUGS: Record<string, string> = { gemini: "googlegemini", deepseek: "deepseek", groq: "groq", openrouter: "openrouter", openai: "openai", perplexity: "perplexity" };

function ProviderIcon({ name }: { name: string }) {
  const [broken, setBroken] = useState(false);
  const slug = SLUGS[name];
  if (!slug || broken) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: COLORS[name] ?? "#666" }}>
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/95 p-1.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={"https://cdn.simpleicons.org/" + slug} alt={name} className="h-full w-full object-contain" onError={() => setBroken(true)} />
    </span>
  );
}

const LABELS: Record<string, string> = { gemini: "Gemini", deepseek: "DeepSeek", groq: "Groq", openrouter: "OpenRouter", openai: "OpenAI" };
type Res = { ok?: boolean; ms?: number; error?: string } | string;

export default function ApisPage() {
  const [off, setOff] = useState<Record<string, boolean>>({});
  const [res, setRes] = useState<Record<string, Res>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/apis", { cache: "no-store" });
      const d = await r.json();
      if (!d.ok) {
        setMsg(d.error ?? "No autorizado.");
        return;
      }
      const m: Record<string, boolean> = {};
      for (const f of d.flags as { name: string; enabled: boolean }[]) m[f.name] = f.enabled === false;
      setOff(m);
    } catch {
      setMsg("Sin conexión.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function post(body: Record<string, unknown>) {
    const r = await fetch("/api/admin/apis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    return r.json();
  }

  async function testAll() {
    setBusy(true);
    setMsg("Probando cada proveedor…");
    try {
      const d = await post({ action: "test" });
      if (d.ok) {
        setRes(d.results as Record<string, Res>);
        setMsg("");
      } else setMsg("No se pudo probar.");
    } catch {
      setMsg("Sin conexión.");
    }
    setBusy(false);
  }

  async function toggle(name: string, turnOff: boolean) {
    const d = await post({ action: "toggle", name, enabled: !turnOff });
    if (d.ok) setOff((o) => ({ ...o, [name]: turnOff }));
    else setMsg("No se pudo cambiar.");
  }

  const names = Array.from(new Set([...NAMES, ...Object.keys(res)]));

  function status(n: string): string {
    const r = res[n];
    if (r === undefined) return "Sin probar";
    if (typeof r === "string") return r;
    if (r.ok) return "Responde · " + r.ms + " ms";
    return String(r.error ?? "Falla").slice(0, 170);
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-10 pt-4">
        <p className="krypton-eyebrow">ADMINISTRACIÓN</p>
        <h1 className="mt-2 text-2xl font-light">Conexiones de Krypton</h1>
        <p className="mt-2 text-sm text-white/65">Prueba cada proveedor y enciéndelo o apágalo. Para borrar una clave, hazlo en Cloudflare.</p>
        <button type="button" disabled={busy} onClick={testAll} className="mt-4 rounded-full bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50">
          Probar todas
        </button>
        {msg && <p className="mt-3 text-xs text-amber-200">{msg}</p>}

        <div className="mt-5 space-y-3">
          {names.map((n) => {
            const r = res[n];
            const good = typeof r === "object" && r?.ok === true;
            return (
              <div key={n} className="k-glass-card rounded-3xl p-4">
                <div className="flex items-center gap-3">
                  <ProviderIcon name={n} />
                  <p className="flex-1 text-base">{LABELS[n] ?? n}</p>
                  <button type="button" onClick={() => toggle(n, !off[n])} className={"rounded-full border px-3 py-1 text-xs " + (off[n] ? "border-white/30 text-white/55" : "border-emerald-300/60 text-emerald-200")}>
                    {off[n] ? "Apagada" : "Activa"}
                  </button>
                </div>
                <p className={"mt-2 text-xs leading-5 " + (good ? "text-emerald-200" : r === undefined ? "text-white/50" : "text-amber-200")}>{status(n)}</p>
              </div>
            );
          })}
        </div>
        <Link href="/admin" className="mt-8 block text-center text-xs text-white/55 underline">Volver a administración</Link>
      </section>
    </KryptonShell>
  );
}
