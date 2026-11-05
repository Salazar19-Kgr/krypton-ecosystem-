"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

export default function PlatformPage() {
  const [admin, setAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((d) => setAdmin(d?.is_admin === true))
      .catch(() => setAdmin(false));
  }, []);

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-10 pt-4">
        <p className="krypton-eyebrow">KRYPTON PLATFORM</p>
        <h1 className="mt-2 text-2xl font-light">Plataforma</h1>
        <p className="mt-2 text-sm text-white/65">Herramientas para probar, medir y hacer crecer Krypton.</p>

        {admin ? (
          <Link href="/lab" className="k-glass-card mt-6 block rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg">Laboratorio de personas digitales</p>
              <span className="rounded-full border border-cyan-300/60 px-2 py-0.5 text-[10px] text-cyan-200">Activo</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/65">
              50 personas digitales prueban Core y Tools y reportan qué falló, qué faltó y cuánto tardó cada respuesta.
            </p>
            <p className="mt-4 text-sm underline">Abrir laboratorio →</p>
          </Link>
        ) : (
          <div className="k-glass-card mt-6 rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg">Laboratorio de personas digitales</p>
              <span className="rounded-full border border-white/30 px-2 py-0.5 text-[10px] text-white/60">{admin === null ? "…" : "Solo administradores"}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">Disponible solo para el equipo de Krypton.</p>
          </div>
        )}
      </section>
    </KryptonShell>
  );
}
