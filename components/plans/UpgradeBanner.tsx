"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAMES: Record<string, string> = { free: "Free", basic: "Básico", pro: "Pro", max: "Max" };

export default function UpgradeBanner() {
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((d) => d?.plan && setPlan(d.plan))
      .catch(() => {});
  }, []);

  const top = plan === "max";
  return (
    <Link href="/plans" className="k-glass-card flex items-center justify-between gap-4 rounded-3xl p-5">
      <div>
        <p className="krypton-eyebrow">TU PLAN · {(NAMES[plan] ?? "Free").toUpperCase()}</p>
        <p className="mt-2 text-sm text-white/75">
          {top ? "Tienes disponibilidad total." : "Consigue más mensajes y funciones."}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-white/50 px-4 py-2 text-xs font-medium">
        {top ? "Ver planes" : "Mejorar plan →"}
      </span>
    </Link>
  );
}
