"use client";

import { useEffect, useState } from "react";
import KryptonShell from "@/components/layout/KryptonShell";

type U = { user_id: string; email: string; created_at: string; plan: string; expires_at: string | null };
type Pay = { id: string; email: string; plan: string; amount: number | null; method: string; reference: string; note: string | null; status: string; created_at: string };
type Meth = { id: string; name: string; details: string; active: boolean };
type R = { ok: boolean; error?: string; users?: U[]; payments?: Pay[]; methods?: Meth[] };
type Tab = "pagos" | "cuentas" | "metodos";

const PLANS = ["free", "basic", "pro", "max"];
const LABEL: Record<string, string> = { free: "Free", basic: "Básico", pro: "Pro", max: "Max" };
const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("es") : "—");
const FIELD = "w-full rounded-2xl border border-white/35 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/40";
const ON = { boxShadow: "0 0 0 1px rgba(255,255,255,.9), 0 0 14px rgba(255,255,255,.35)" };

async function call(url: string, body?: unknown): Promise<R> {
  try {
    const res = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined);
    if (res.status === 401) {
      window.location.replace("/login");
      return { ok: false, error: "" };
    }
    return (await res.json()) as R;
  } catch {
    return { ok: false, error: "Sin conexión." };
  }
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("pagos");
  const [users, setUsers] = useState<U[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [meths, setMeths] = useState<Meth[]>([]);
  const [q, setQ] = useState("");
  const [days, setDays] = useState("30");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [editId, setEditId] = useState("");
  const [mName, setMName] = useState("");
  const [mDetails, setMDetails] = useState("");

  async function load() {
    const [a, b] = await Promise.all([call("/api/admin/users"), call("/api/admin/payments")]);
    if (a.ok) setUsers(a.users ?? []);
    if (b.ok) {
      setPays(b.payments ?? []);
      setMeths(b.methods ?? []);
    }
    setMsg(a.ok && b.ok ? "" : a.error || b.error || "");
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function act(id: string, body: unknown, url = "/api/admin/payments") {
    setBusy(id);
    const r = await call(url, body);
    await load();
    if (!r.ok && r.error) setMsg(r.error);
    setBusy("");
  }
  const d = () => Number(days) || 30;
  const review = (p: Pay, approve: boolean) => act(p.id, { action: "review", id: p.id, approve, days: d() });
  const setPlan = (u: U, plan: string) => act(u.user_id, { user_id: u.user_id, plan, days: d() }, "/api/admin/users");
  const delMethod = (m: Meth) => act(m.id, { action: "delete_method", id: m.id });
  async function saveMethod() {
    if (!mName.trim()) {
      setMsg("Escribe el nombre del método.");
      return;
    }
    await act("m", { action: "save_method", id: editId || null, name: mName, details: mDetails, active: true });
    setEditId("");
    setMName("");
    setMDetails("");
  }

  const pending = pays.filter((p) => p.status === "pending").length;
  const list = users.filter((u) => (u.email ?? "").toLowerCase().includes(q.toLowerCase()));
  const tabBtn = (id: Tab, label: string) => (
    <button key={id} type="button" onClick={() => setTab(id)} className="k-glass-button flex-1 rounded-full px-3 py-2 text-xs" style={tab === id ? ON : undefined}>
      {label}
    </button>
  );

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-12 pt-4">
        <p className="krypton-eyebrow">ADMINISTRACIÓN</p>
        <h1 className="mt-1 text-2xl font-light">Pagos y suscripciones</h1>
        <a href="/admin/base" className="mt-2 inline-block text-xs text-white/60 underline">Biblioteca de modelos y conocimiento →</a>
        <a href="/admin/pruebas" className="ml-4 mt-2 inline-block text-xs text-white/60 underline">Banco de pruebas →</a>
        <div className="mt-4 flex gap-2">
          {tabBtn("pagos", "Pagos" + (pending ? " (" + pending + ")" : ""))}
          {tabBtn("cuentas", "Cuentas (" + users.length + ")")}
          {tabBtn("metodos", "Métodos")}
        </div>
        {msg && <p className="mt-3 text-xs text-red-200">{msg}</p>}
        {loading && <p className="mt-4 text-sm text-white/60">Cargando…</p>}

        {(tab === "pagos" || tab === "cuentas") && (
          <div className="mt-4 flex items-center gap-2">
            {tab === "cuentas" && <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar correo…" className={FIELD} />}
            <p className="shrink-0 text-[11px] text-white/50">Días del plan:</p>
            <input value={days} onChange={(e) => setDays(e.target.value)} inputMode="numeric" aria-label="Días" className="w-16 shrink-0 rounded-full border border-white/35 bg-transparent px-3 py-2 text-center text-sm text-white outline-none" />
          </div>
        )}

        {tab === "pagos" && (
          <div className="mt-4 space-y-3">
            {!loading && pays.length === 0 && <p className="text-sm text-white/60">Todavía no hay pagos reportados.</p>}
            {pays.map((p) => (
              <div key={p.id} className="k-glass-card rounded-3xl p-4">
                <p className="break-all text-sm font-medium">{p.email}</p>
                <p className="mt-1 text-xs text-white/70">
                  Plan <b>{LABEL[p.plan] ?? p.plan}</b>{p.amount ? " · $" + p.amount : ""} · {p.method}
                </p>
                <p className="mt-1 break-all text-xs text-white/70">Referencia: <b>{p.reference}</b> · {fmt(p.created_at)}</p>
                {p.status === "pending" ? (
                  <div className="mt-3 flex gap-2">
                    <button type="button" disabled={busy === p.id} onClick={() => review(p, true)} className="k-glass-button flex-1 rounded-full px-4 py-2 text-xs disabled:opacity-50">Aprobar</button>
                    <button type="button" disabled={busy === p.id} onClick={() => review(p, false)} className="k-glass-button flex-1 rounded-full px-4 py-2 text-xs disabled:opacity-50">Rechazar</button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-white/50">{p.status === "approved" ? "Aprobado" : "Rechazado"}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "cuentas" && (
          <div className="mt-4 space-y-3">
            {list.map((u) => (
              <div key={u.user_id} className="k-glass-card rounded-3xl p-4">
                <p className="break-all text-sm font-medium">{u.email}</p>
                <p className="mt-1 text-xs text-white/60">
                  Plan: <b>{LABEL[u.plan] ?? u.plan}</b> · Vence: {u.plan === "free" ? "—" : fmt(u.expires_at)} · Registro: {fmt(u.created_at)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {PLANS.map((p) => (
                    <button key={p} type="button" disabled={busy === u.user_id} onClick={() => setPlan(u, p)} className="k-glass-button rounded-full px-4 py-2 text-xs disabled:opacity-50" style={u.plan === p ? ON : undefined}>
                      {LABEL[p]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "metodos" && (
          <div className="mt-4 space-y-3">
            <div className="k-glass-card rounded-3xl p-4">
              <p className="text-sm font-medium">{editId ? "Editar método" : "Nuevo método de pago"}</p>
              <input value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Nombre (ej. Pago móvil)" className={FIELD + " mt-3"} />
              <textarea value={mDetails} onChange={(e) => setMDetails(e.target.value)} rows={4} placeholder={"Datos para pagar (banco, teléfono, cédula, titular…)"} className={FIELD + " mt-3"} />
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={saveMethod} disabled={busy === "m"} className="k-glass-button flex-1 rounded-full px-4 py-2 text-xs disabled:opacity-50">Guardar</button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(""); setMName(""); setMDetails(""); }} className="k-glass-button rounded-full px-4 py-2 text-xs">Cancelar</button>
                )}
              </div>
            </div>
            {meths.map((m) => (
              <div key={m.id} className="k-glass-card rounded-3xl p-4">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="mt-1 whitespace-pre-wrap text-xs text-white/70">{m.details}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => { setEditId(m.id); setMName(m.name); setMDetails(m.details); }} className="k-glass-button rounded-full px-4 py-2 text-xs">Editar</button>
                  <button type="button" disabled={busy === m.id} onClick={() => delMethod(m)} className="k-glass-button rounded-full px-4 py-2 text-xs disabled:opacity-50">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </KryptonShell>
  );
}
