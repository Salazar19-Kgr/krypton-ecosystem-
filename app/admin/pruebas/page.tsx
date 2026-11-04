"use client";

import { useEffect, useRef, useState } from "react";
import KryptonShell from "@/components/layout/KryptonShell";

type T = { id: string; area: string; prompt: string };
type Res = { pass: boolean; failed: string[]; ms: number; text: string; provider?: string };

const KEY = "krypton.eval.last";
const SLOW = ["Matemáticas", "Lógica"];
const POOL = 4;
const TIMEOUT = 75000;

export default function EvalPage() {
  const [tests, setTests] = useState<T[]>([]);
  const [res, setRes] = useState<Record<string, Res>>({});
  const [prev, setPrev] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState("");
  const [msg, setMsg] = useState("");
  const [total, setTotal] = useState(0);
  const [doneN, setDoneN] = useState(0);
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

  async function runOne(id: string): Promise<boolean> {
    setRunning((c) => [...c, id]);
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), TIMEOUT);
    const t0 = Date.now();
    let r: Res = { pass: false, failed: ["tiempo agotado"], ms: 0, text: "" };
    try {
      const resp = await fetch("/api/admin/eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        signal: ctl.signal,
      });
      const d = await resp.json();
      r = d.ok ? (d as Res) : { pass: false, failed: [d.error ?? "error"], ms: Date.now() - t0, text: "" };
    } catch {
      r = { pass: false, failed: ["tiempo agotado o sin conexión"], ms: Date.now() - t0, text: "" };
    } finally {
      clearTimeout(timer);
      setRunning((c) => c.filter((x) => x !== id));
    }
    setRes((c) => ({ ...c, [id]: r }));
    return r.pass;
  }

  async function runSet(ids: string[]) {
    stop.current = false;
    setMsg("");
    setBusy(true);
    setTotal(ids.length);
    setDoneN(0);
    setRes((c) => {
      const n = { ...c };
      ids.forEach((i) => delete n[i]);
      return n;
    });
    const before = readPrev();
    setPrev(before);
    const done: Record<string, boolean> = {};
    const queue = [...ids];
    const worker = async () => {
      while (queue.length && !stop.current) {
        const id = queue.shift();
        if (!id) break;
        done[id] = await runOne(id);
        setDoneN((n) => n + 1);
      }
    };
    await Promise.all(Array.from({ length: Math.min(POOL, ids.length) }, () => worker()));
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...before, ...done }));
    } catch {}
    setBusy(false);
  }

  const quick = tests.filter((t) => !SLOW.includes(t.area)).map((t) => t.id);
  const all = tests.map((t) => t.id);
  const ran = tests.filter((t) => res[t.id]).length;
  const pass = tests.filter((t) => res[t.id]?.pass).length;

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-12 pt-4">
        <p className="krypton-eyebrow">ADMINISTRACIÓN</p>
        <h1 className="mt-1 text-2xl font-light">Banco de pruebas del cerebro</h1>
        <p className="mt-1 text-sm text-white/60">
          Corre 4 pruebas a la vez, con máximo 75 segundos cada una. «Rápidas» deja fuera matemáticas y lógica, que son las más lentas. Cada prueba gasta cuota de IA.
        </p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={() => runSet(quick)} disabled={busy || !quick.length} className="k-glass-button flex-1 rounded-full px-4 py-3 text-sm disabled:opacity-50">
            Rápidas ({quick.length})
          </button>
          <button type="button" onClick={() => runSet(all)} disabled={busy || !all.length} className="k-glass-button flex-1 rounded-full px-4 py-3 text-sm disabled:opacity-50">
            Todas ({all.length})
          </button>
          {busy && (
            <button type="button" onClick={() => (stop.current = true)} className="k-glass-button rounded-full px-4 py-3 text-sm">
              Detener
            </button>
          )}
        </div>
        {busy && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-white/70" style={{ width: Math.round((doneN / Math.max(total, 1)) * 100) + "%" }} />
            </div>
            <p className="mt-1 text-xs text-white/60">
              {doneN} de {total} terminadas · {running.length} en curso
            </p>
          </div>
        )}
        {ran > 0 && (
          <p className="mt-3 text-sm">
            <b>{pass}</b> de {ran} aprobadas
            {!busy && ran === tests.length ? " · puntaje " + Math.round((pass / tests.length) * 100) + "%" : ""}
          </p>
        )}
        {msg && <p className="mt-3 text-xs text-red-200">{msg}</p>}
        <div className="mt-4 space-y-3">
          {tests.map((t) => {
            const r = res[t.id];
            const was = prev[t.id];
            const delta = r && was !== undefined && was !== r.pass ? (r.pass ? " · mejoró" : " · empeoró") : "";
            const isRun = running.includes(t.id);
            return (
              <div key={t.id} className="k-glass-card rounded-3xl p-4">
                <p className="text-[11px] tracking-widest text-white/45">{t.area.toUpperCase()}</p>
                <p className="mt-1 text-sm">{t.prompt}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex-1 text-xs text-white/70">
                    {isRun
                      ? "Probando…"
                      : r
                        ? (r.pass ? "✓ Aprobó" : "✗ Falló") + delta + " · " + Math.round(r.ms / 1000) + " s"
                        : was === undefined
                          ? "Sin correr"
                          : was
                            ? "Última vez: ✓"
                            : "Última vez: ✗"}
                  </span>
                  <button type="button" disabled={busy || isRun} onClick={() => runSet([t.id])} className="k-glass-button rounded-full px-4 py-2 text-xs disabled:opacity-50">
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
