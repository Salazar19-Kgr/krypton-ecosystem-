"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PERSONAS } from "@/lib/lab/personas";

type J = { nota: number; fallo: string; falto: string; formato: string };
type R = { id: string; name: string; who: string; area: string; q: string; ms: number; answer: string; judge: J };

export default function LabPage() {
  const [res, setRes] = useState<Record<string, R>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/lab/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => (d?.admin === true ? setOk(true) : router.replace("/platform")))
      .catch(() => router.replace("/platform"));
  }, [router]);

  async function runIds(ids: string[]) {
    if (running) return;
    setRunning(true);
    setMsg("");
    const queue = [...ids];
    const worker = async () => {
      for (;;) {
        const id = queue.shift();
        if (!id) return;
        setBusy((b) => ({ ...b, [id]: true }));
        try {
          const r = await fetch("/api/lab/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
          const d = await r.json();
          if (d.ok) setRes((c) => ({ ...c, [id]: d as R }));
          else setMsg(d.error ?? "Error al probar.");
        } catch {
          setMsg("Sin conexión con Krypton.");
        }
        setBusy((b) => ({ ...b, [id]: false }));
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    setRunning(false);
  }

  async function makeReport() {
    const items = Object.values(res).map((r) => ({ name: r.name, area: r.area, ms: r.ms, nota: r.judge.nota, fallo: r.judge.fallo, falto: r.judge.falto, formato: r.judge.formato }));
    if (!items.length) {
      setMsg("Primero corre alguna tanda.");
      return;
    }
    setMsg("Generando informe…");
    try {
      const r = await fetch("/api/lab/report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const d = await r.json();
      setReport(d.ok ? d.text : "");
      setMsg(d.ok ? "" : d.error ?? "No se pudo generar.");
    } catch {
      setMsg("Sin conexión.");
    }
  }

  const done = Object.keys(res).length;
  const BTN = "rounded-lg border border-cyan-400/50 px-3 py-2 text-xs text-cyan-100 disabled:opacity-40";

  if (!ok) return null;

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-6 text-slate-100">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[.35em] text-cyan-300">KRYPTON LAB</p>
        <h1 className="mt-1 text-2xl font-light">Laboratorio de personas digitales</h1>
        <p className="mt-1 text-xs text-slate-400">Parte del ecosistema Krypton · 50 personas prueban Core y Tools y reportan qué falló y qué faltó.</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((k) => (
            <button key={k} type="button" disabled={running} className={BTN} onClick={() => runIds(PERSONAS.slice(k * 10, k * 10 + 10).map((p) => p.id))}>
              Tanda {k + 1}
            </button>
          ))}
          <button type="button" disabled={running} className={BTN + " bg-cyan-400/10"} onClick={() => runIds(PERSONAS.map((p) => p.id))}>Las 50</button>
          <button type="button" disabled={running || !done} className={BTN + " bg-violet-400/10 border-violet-300/50 text-violet-100"} onClick={makeReport}>Generar informe</button>
        </div>
        <p className="mt-3 text-xs text-slate-400">{running ? "Probando… no cierres esta página." : "Evaluadas: " + done + " de 50"} {msg && " · " + msg}</p>

        {report && (
          <div className="mt-4 rounded-xl border border-violet-300/40 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Informe</p>
              <button type="button" className={BTN} onClick={() => navigator.clipboard.writeText(report)}>Copiar</button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-200">{report}</pre>
          </div>
        )}

        <div className="mt-5 space-y-2">
          {PERSONAS.map((p) => {
            const r = res[p.id];
            return (
              <details key={p.id} className="rounded-xl border border-slate-700/70 bg-slate-900/40 px-3 py-2">
                <summary className="flex cursor-pointer items-center gap-2 text-sm">
                  <span className="flex-1">{p.name}<span className="ml-2 text-[11px] text-slate-400">{p.area}</span></span>
                  <span className={r && r.judge.nota < 6 ? "text-amber-300" : "text-cyan-200"}>
                    {busy[p.id] ? "…" : r ? r.judge.nota + "/10 · " + Math.round(r.ms / 1000) + " s" : "—"}
                  </span>
                </summary>
                <div className="mt-2 space-y-1 text-xs text-slate-300">
                  <p><b>Perfil:</b> {p.who}</p>
                  <p><b>Pidió:</b> {p.q}</p>
                  {r && (
                    <>
                      <p><b>Falló:</b> {r.judge.fallo}</p>
                      <p><b>Faltó:</b> {r.judge.falto}</p>
                      <p><b>Formato:</b> {r.judge.formato}</p>
                      <p className="whitespace-pre-wrap text-slate-400"><b>Respuesta (inicio):</b> {r.answer}</p>
                    </>
                  )}
                </div>
              </details>
            );
          })}
        </div>

        <Link href="/dashboard" className="mt-8 block text-center text-xs text-slate-500 underline">Volver a Krypton</Link>
      </div>
    </main>
  );
}
