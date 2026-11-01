"use client";

import { useEffect, useState } from "react";

type M = { id: string; name: string; details: string };
type Mine = { id: string; plan: string; reference: string; status: string; created_at: string };

const PRICES: Record<string, string> = { basic: "4.99", pro: "9.99", max: "14.99" };
const LABEL: Record<string, string> = { basic: "Básico", pro: "Pro", max: "Max" };
const ST: Record<string, string> = { pending: "En revisión", approved: "Aprobado", rejected: "Rechazado" };
const FIELD =
  "w-full rounded-2xl border border-white/35 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40";

export default function PayForm() {
  const [methods, setMethods] = useState<M[]>([]);
  const [mine, setMine] = useState<Mine[]>([]);
  const [plan, setPlan] = useState("basic");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/payments");
      const d = await r.json();
      if (d.ok) {
        setMethods(d.methods ?? []);
        setMine(d.mine ?? []);
      }
    } catch {}
  }
  useEffect(() => {
    load();
  }, []);

  async function send() {
    setMsg("");
    if (!method || !reference.trim()) {
      setMsg("Elige el método y escribe la referencia del pago.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, method, reference, amount: Number(amount) || Number(PRICES[plan]) }),
      });
      const d = await r.json();
      if (d.ok) {
        setReference("");
        setAmount("");
        setMsg("Pago enviado. Lo revisaremos y activaremos tu plan.");
        load();
      } else {
        setMsg(d.error ?? "No se pudo enviar.");
      }
    } catch {
      setMsg("Sin conexión.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="k-glass-card rounded-3xl p-6">
      <p className="krypton-eyebrow">CÓMO PAGAR</p>
      {methods.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-white/75">Escríbenos por WhatsApp para recibir los datos de pago.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {methods.map((m) => (
            <div key={m.id}>
              <p className="text-sm font-medium">{m.name}</p>
              <p className="whitespace-pre-wrap text-sm leading-6 text-white/70">{m.details}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 text-sm font-medium">¿Ya pagaste? Reporta tu pago</p>
      <div className="mt-3 space-y-3">
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className={FIELD} style={{ colorScheme: "dark" }}>
          {Object.keys(PRICES).map((k) => (
            <option key={k} value={k}>{LABEL[k]} · ${PRICES[k]}</option>
          ))}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={FIELD} style={{ colorScheme: "dark" }}>
          <option value="">Método de pago…</option>
          {methods.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Referencia o número de operación" className={FIELD} />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder={"Monto en USD (" + PRICES[plan] + ")"} className={FIELD} />
        <button type="button" onClick={send} disabled={busy} className="k-glass-button w-full rounded-full px-4 py-3 text-sm font-medium disabled:opacity-60">
          {busy ? "Enviando…" : "Enviar pago →"}
        </button>
        {msg && <p className="text-xs text-white/80">{msg}</p>}
      </div>
      {mine.length > 0 && (
        <div className="mt-5 space-y-1 text-xs text-white/60">
          {mine.map((p) => (
            <p key={p.id}>
              {LABEL[p.plan] ?? p.plan} · {p.reference} · <b>{ST[p.status] ?? p.status}</b>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
