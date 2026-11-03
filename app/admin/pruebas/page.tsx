"use client";

import { useEffect, useRef, useState } from "react";
import KryptonShell from "@/components/layout/KryptonShell";

type T = { id: string; area: string; prompt: string };
type Res = { pass: boolean; failed: string[]; ms: number; text: string; provider?: string };

const KEY = "krypton.eval.last";

export default function EvalPage() {
  const [tests, setTests] = useState<T[]>([]);
  const [res, setRes] = useState<Record<string, Res>>({});
  const [prev, setPrev] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState("");
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState("");
  const [msg, setMsg] = useState("");
  const stop = useRef(false);

  const readPrev = (): Record<string, boolean> => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? "{}");
    } catch {
      return {};
    }
  };

  useEffect(() => {
    fetch("/api/admin/eval")
      .then((r) => r.json())
      .then((d) => (d.ok ? setTests(d.tests ?? []) : setMsg(d.error ?? "Error")))
      .catch(() => setMsg("Sin conexión."));
    setPrev(readPrev());
  }, []);

  async function runOne(id: string): Promise<boolean | null> {
    setRunning(id);
    try {
      const r = await fetch("/api/admin/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const d = await r.json();
      if (d.ok) {
        setRes((c) => ({ ...c, [id]: d as Res }));
        return d.pass === true;
      }
      setMsg(d.error ?? "Error");
    } catch {
      setMsg("Sin conexión.");
    } finally {
      setRunning("");
    }
    return null;
  }

  async function runAll() {
    stop.current = false;
    setMsg("");
    setAll(true);
    setRes({});
    const before = readPrev();
    setPrev(before);
    const done: Record<string, boolean> = {};
    for (const t of tests) {
      if (stop.current) break;
      const p = await runOne(t.id);
      if (p !== null) done[t.id] = p;
    }
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...before, ...done }));
    } catch {}
    setAll(false);
  }

  const ran = tests.filter((t) => res[t.id]).length;
  const pass = tests.filter((t) => res[t.id]?.pass).length;

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-12 pt-4">
        <p className="krypton-eyebrow">ADMINISTRACIÓN</p>
        <h1 className="mt-1 text-2xl font-light">Banco de pruebas del cerebro</h1>
        <p className="mt-1 text-sm text-white/60">
          Corre peticiones fijas y verifica automáticamente las respuestas. Úsalo antes y después de cada cambio. Cada prueba gasta cuota de IA.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={runAll} disabled={all || !tests.length} className="k-glass-button flex-1 rounded-full px-4 py-3 text-sm disabled:opacity-50">
            {all ? "Corriendo… (" + ran + "/" + tests.length + ")" : "Correr todas (" + tests.length + ")"}
          </button>
          {all && (
            <button type="button" onClick={() => (stop.current = true)} className="k-glass-button rounded-full px-4 py-3 text-sm">
              Detener
            </button>
          )}
        </div>
        {ran > 0 && (
          <p className="mt-3 text-sm">
            <b>{pass}</b> de {ran} aprobadas
            {ran === tests.length ? " · puntaje " + Math.round((pass / tests.length) * 100) + "%" : ""}
          </p>
        )}
        {msg && <p className="mt-3 text-xs text-red-200">{msg}</p>}
        <div className="mt-4 space-y-3">
          {tests.map((t) => {
            const r = res[t.id];
            const was = prev[t.id];
            const delta = r && was !== undefined && was !== r.pass ? (r.pass ? " · mejoró" : " · empeoró") : "";
            return (
              <div key={t.id} className="k-glass-card rounded-3xl p-4">
                <p className="text-[11px] tracking-widest text-white/45">{t.area.toUpperCase()}</p>
                <p className="mt-1 text-sm">{t.prompt}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex-1 text-xs text-white/70">
                    {running === t.id ? "Probando…" : r ? (r.pass ? "✓ Aprobó" : "✗ Falló") + delta + " · " + Math.round(r.ms / 1000) + " s" : was === undefined ? "Sin correr" : was ? "Última vez: ✓" : "Última vez: ✗"}
                  </span>
                  <button type="button" disabled={all || !!running} onClick={() => runOne(t.id)} className="k-glass-button rounded-full px-4 py-2 text-xs disabled:opacity-50">
                    Probar
                  </button>
                  {r && (
                    <button type="button" onClick={() => setOpen(open === t.id ? "" : t.id)} className="k-glass-button rounded-full px-4 py-2 text-xs">
                      {open === t.id ? "Ocultar" : "Ver"}
                    </button>
                  )}
                </div>
                {r && open === t.id && (
                  <div className="mt-3">
                    {r.failed.length > 0 && <p className="text-xs text-red-200">{r.failed.join(" · ")}</p>}
                    <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-white/70">{r.text || "(sin respuesta)"}</pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </KryptonShell>
  );
}
