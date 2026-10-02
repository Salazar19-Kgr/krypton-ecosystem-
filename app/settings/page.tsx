"use client";

import { useState } from "react";
import Link from "next/link";
import KryptonHeader from "@/components/layout/KryptonHeader";

export default function SettingsPage() {
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-5xl">

        <KryptonHeader />

        <section className="py-14 sm:py-20">

          <p className="krypton-eyebrow">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-4 text-4xl font-light sm:text-6xl">
            Configuración.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50">
            Controla tu experiencia, memoria y preferencias dentro de
            Krypton Ecosystem.
          </p>

        </section>

        <section className="space-y-4 pb-12">

          <div className="k-glass-panel rounded-3xl p-6">

            <p className="krypton-eyebrow">
              CUENTA
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Tu cuenta
            </h2>

            <p className="mt-2 text-sm text-white/45">
              La autenticación y el perfil se conectarán posteriormente.
            </p>

          </div>

          <div className="k-glass-panel rounded-3xl p-6">

            <div className="flex items-center justify-between gap-5">

              <div>
                <p className="krypton-eyebrow">
                  MEMORIA
                </p>

                <h2 className="mt-4 text-xl font-medium">
                  Mantener contexto
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  Permite que Krypton conserve el contexto de tus
                  conversaciones cuando esta función esté conectada.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMemoryEnabled(!memoryEnabled)}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                  memoryEnabled
                    ? "border-cyan-200/40 bg-cyan-200/20"
                    : "border-white/15 bg-white/5"
                }`}
                aria-label="Activar o desactivar memoria"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                    memoryEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>

            </div>

          </div>

          <div className="k-glass-panel rounded-3xl p-6">

            <p className="krypton-eyebrow">
              EXPERIENCIA
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Interfaz Liquid Glass
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/45">
              Krypton utiliza una interfaz transparente inspirada en vidrio
              líquido, agua, profundidad y luz.
            </p>

          </div>

          <div className="k-glass-panel rounded-3xl p-6">

            <p className="krypton-eyebrow">
              SESIÓN
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Conversaciones
            </h2>

            <p className="mt-2 text-sm text-white/45">
              Consulta y continúa tus conversaciones anteriores.
            </p>

            <Link
              href="/memory"
              className="mt-5 inline-flex text-sm text-cyan-200/80"
            >
              Ver conversaciones →
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}
