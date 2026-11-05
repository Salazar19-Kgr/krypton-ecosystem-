"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

export default function PlatformPage() {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/lab/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAdmin(d?.admin === true))
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
            <p className="text-lg">Laboratorio</p>
          </Link>
        ) : (
          <div className="k-glass-card mt-6 rounded-3xl p-5">
            <p className="text-lg">Laboratorio</p>
          </div>
        )}
      </section>
    </KryptonShell>
  );
}
