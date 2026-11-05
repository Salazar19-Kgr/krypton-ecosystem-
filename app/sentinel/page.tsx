"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import SentinelDashboard from "@/components/sentinel/SentinelDashboard";
import { TERMS_SECTIONS, TERMS_TITLE } from "@/lib/sentinel/terms";

type St = { state: string; question?: string | null; until?: string | null };

const FIELD =
  "w-full rounded-2xl border border-white/35 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/70";
const BTN = "mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-40";

export default function SentinelPage() {
  const [st, setSt] = useState<St | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [step, setStep] = useState(1);
  const [read, setRead] = useState(false);
  const [ok, setOk] = useState(false);
  const [forgot, setForgot] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/sentinel/status");
      if (r.status === 401) {
        window.location.replace("/login");
        return;
      }
      const d = await r.json();
      setSt(d.ok ? d : { state: "error" });
    } catch {
      setSt({ state: "error" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (st?.state !== "terms") return;
    const t = setTimeout(() => {
      const el = box.current;
      if (el && el.scrollHeight <= el.clientHeight + 8) setRead(true);
    }, 300);
    return () => clearTimeout(t);
  }, [st?.state]);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/sentinel/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!d.ok) {
        setErr(d.error ?? "No se pudo completar.");
        setBusy(false);
        return;
      }
      setPass("");
      setPass2("");
      setA("");
      setForgot(false);
      setStep(1);
      await load();
    } catch {
      setErr("Sin conexión.");
    }
    setBusy(false);
  }

  const s = st?.state;
  const passOk = pass.length >= 14 && pass === pass2;

  return (
    <KryptonShell>
      <section className={"mx-auto px-1 pb-10 pt-4 " + (s === "ready" ? "max-w-7xl" : "max-w-5xl")}>
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs tracking-[.3em] text-white/60">KRYTON</span>
          <h1 className="text-2xl font-light">SENTINEL</h1>
          <span className="ml-auto rounded-full border border-amber-200/60 px-3 py-1 text-[11px] text-amber-100">Plan Max</span>
        </div>

        {!st && <p className="text-sm text-white/60">Verificando acceso…</p>}
        {s === "error" && <p className="text-sm text-red-200">No pude verificar tu acceso. Revisa que el SQL de Sentinel esté ejecutado.</p>}

        {s === "no_plan" && (
          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">ACCESO RESTRINGIDO</p>
            <p className="mt-3 text-lg">Krypton Sentinel es exclusivo del plan Max.</p>
            <p className="mt-2 text-sm text-white/65">Es un espacio privado de ciberseguridad e inteligencia digital.</p>
            <Link href="/plans" className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-black">Ver planes</Link>
          </div>
        )}

        {(s === "banned" || s === "suspended") && (
          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">ACCESO {s === "banned" ? "BLOQUEADO" : "SUSPENDIDO"}</p>
            <p className="mt-3 text-sm text-white/80">
              {s === "banned" ? "Tu acceso a Sentinel fue bloqueado por infringir las normas." : "Tu acceso a Sentinel está suspendido temporalmente por infringir las normas."}
              {st?.until ? " Vuelve después del " + new Date(st.until).toLocaleString("es") + "." : ""}
            </p>
            <p className="mt-2 text-xs text-white/55">Si crees que es un error, escribe al equipo por WhatsApp: +58 424 5095002.</p>
          </div>
        )}

        {s === "terms" && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-black p-4">
            <h2 className="text-xl font-light">{TERMS_TITLE}</h2>
            <p className="mt-1 text-xs text-white/60">Lee hasta el final para poder continuar.</p>
            <div
              ref={box}
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setRead(true);
              }}
              className="mt-3 flex-1 overflow-y-auto rounded-2xl border border-white/20 p-4"
            >
              {TERMS_SECTIONS.map((t, i) => (
                <div key={t.h} className="mb-5">
                  <p className="text-sm font-semibold">{i + 1}. {t.h}</p>
                  {t.p.map((x, j) => (
                    <p key={j} className="mt-2 text-sm leading-6 text-white/80">{x}</p>
                  ))}
                </div>
              ))}
            </div>
            <label className="mt-3 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={ok} disabled={!read} onChange={(e) => setOk(e.target.checked)} className="mt-1 h-5 w-5" />
              He leído y acepto estas normas.
            </label>
            {err && <p className="mt-2 text-xs text-red-200">{err}</p>}
            <button type="button" disabled={!ok || busy} onClick={() => act({ action: "accept_terms" })} className={BTN}>Aceptar y continuar</button>
            <Link href="/dashboard" className="mt-3 text-center text-xs text-white/60 underline">No acepto, volver al inicio</Link>
          </div>
        )}

        {s === "setup" && (
          <div className="k-glass-card mx-auto max-w-md rounded-3xl p-6">
            <p className="krypton-eyebrow">CREA TU ACCESO · PASO {step} DE 2</p>
            {step === 1 ? (
              <>
                <p className="mt-3 text-lg">Crea tu clave de Sentinel</p>
                <p className="mt-2 text-xs leading-5 text-amber-200">Memorízala y no la anotes en lugares donde otros puedan verla. Nadie del equipo puede verla ni recuperarla. Usa una frase larga fácil de recordar.</p>
                <input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Clave (mínimo 14 caracteres)" className={FIELD + " mt-4"} />
                <input type="password" autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repite la clave" className={FIELD + " mt-3"} />
                <p className="mt-2 text-xs text-white/55">{pass.length} de 14 caracteres{pass2 && pass !== pass2 ? " · no coinciden" : ""}</p>
                <button type="button" disabled={!passOk} onClick={() => setStep(2)} className={BTN}>Continuar</button>
              </>
            ) : (
              <>
                <p className="mt-3 text-lg">Pregunta de seguridad</p>
                <p className="mt-2 text-xs leading-5 text-amber-200">Sirve solo para restablecer tu clave si la olvidas. Elige algo que solo tú sepas, no lo anotes y memoriza la respuesta.</p>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tu pregunta" className={FIELD + " mt-4"} />
                <input type="password" autoComplete="off" value={a} onChange={(e) => setA(e.target.value)} placeholder="Tu respuesta" className={FIELD + " mt-3"} />
                {err && <p className="mt-2 text-xs text-red-200">{err}</p>}
                <button type="button" disabled={busy || q.trim().length < 8 || a.trim().length < 3} onClick={() => act({ action: "setup", pass, question: q, answer: a })} className={BTN}>Crear acceso</button>
                <button type="button" onClick={() => setStep(1)} className="mt-3 w-full text-center text-xs text-white/60 underline">Volver</button>
              </>
            )}
          </div>
        )}

        {s === "locked" && (
          <div className="k-glass-card mx-auto max-w-md rounded-3xl p-6">
            <p className="krypton-eyebrow">SENTINEL BLOQUEADO</p>
            {!forgot ? (
              <>
                <p className="mt-3 text-lg">Escribe tu clave</p>
                <input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && pass && act({ action: "unlock", pass })} placeholder="Tu clave de Sentinel" className={FIELD + " mt-4"} />
                {err && <p className="mt-2 text-xs text-red-200">{err}</p>}
                <button type="button" disabled={busy || !pass} onClick={() => act({ action: "unlock", pass })} className={BTN}>Desbloquear</button>
                <button type="button" onClick={() => { setForgot(true); setErr(""); }} className="mt-3 w-full text-center text-xs text-white/60 underline">Olvidé mi clave</button>
              </>
            ) : (
              <>
                <p className="mt-3 text-lg">Restablecer clave</p>
                <p className="mt-2 text-sm text-white/75">{st?.question}</p>
                <input type="password" autoComplete="off" value={a} onChange={(e) => setA(e.target.value)} placeholder="Tu respuesta" className={FIELD + " mt-4"} />
                <input type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Nueva clave (mínimo 14 caracteres)" className={FIELD + " mt-3"} />
                {err && <p className="mt-2 text-xs text-red-200">{err}</p>}
                <button type="button" disabled={busy || !a || pass.length < 14} onClick={() => act({ action: "reset", answer: a, pass })} className={BTN}>Restablecer</button>
                <button type="button" onClick={() => { setForgot(false); setErr(""); }} className="mt-3 w-full text-center text-xs text-white/60 underline">Volver</button>
              </>
            )}
          </div>
        )}

        {s === "ready" && <SentinelDashboard onState={load} />}
      </section>
    </KryptonShell>
  );
}
