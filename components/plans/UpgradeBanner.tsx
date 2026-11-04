"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAMES: Record<string, string> = { free: "Free", basic: "Básico", pro: "Pro", max: "Max" };
type Usage = { plan?: string; expires_at?: string | null; used?: number; perDay?: number };

export default function UpgradeBanner() {
  const [admin, setAdmin] = useState(false);
  const [u, setU] = useState<Usage>({});

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((d) => {
        if (d?.admin) setAdmin(true);
      })
      .catch(() => {});
    fetch("/api/usage")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setU(d);
      })
      .catch(() => {});
  }, []);

  const plan = u.plan ?? "free";
  const days = u.expires_at ? Math.ceil((new Date(u.expires_at).getTime() - Date.now()) / 86400000) : null;
  const soon = plan !== "free" && days !== null && days <= 3;
  const top = plan === "max" && !soon;
  const usage = u.perDay ? "Hoy: " + (u.used ?? 0) + " de " + u.perDay + " mensajes" : "";
  const expiry =
    plan !== "free" && u.expires_at
      ? soon
        ? "Tu plan vence en " + Math.max(days ?? 0, 0) + " día(s)"
        : "Vence el " + new Date(u.expires_at).toLocaleDateString("es")
      : "";

  return (
    <div className="space-y-3">
      <Link href="/plans" className="k-glass-card flex items-center justify-between gap-4 rounded-3xl p-5">
        <div>
          <p className="krypton-eyebrow">TU PLAN · {(NAMES[plan] ?? "Free").toUpperCase()}</p>
          {usage && <p className="mt-2 text-sm text-white/80">{usage}</p>}
          <p className={"mt-1 text-xs " + (soon ? "text-amber-200" : "text-white/60")}>
            {expiry || (top ? "Tienes disponibilidad total." : "Consigue más mensajes y funciones.")}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-white/50 px-4 py-2 text-xs font-medium">
          {soon ? "Renovar →" : top ? "Ver planes" : "Mejorar plan →"}
        </span>
      </Link>
      {admin && (
        <Link href="/admin" className="k-glass-card flex items-center justify-between gap-4 rounded-3xl p-5">
          <div>
            <p className="krypton-eyebrow">ADMINISTRACIÓN</p>
            <p className="mt-2 text-sm text-white/75">Pagos, métodos de pago y suscripciones.</p>
          </div>
          <span className="shrink-0 rounded-full border border-white/50 px-4 py-2 text-xs font-medium">Abrir →</span>
        </Link>
      )}
    </div>
  );
}
