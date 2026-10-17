"use client";

import KryptonShell from "@/components/layout/KryptonShell";

export default function SettingsPage() {
  return (
    <KryptonShell>

      <section className="mx-auto max-w-4xl py-12 sm:py-16">

        <p className="krypton-eyebrow">
          KRYPTON ECOSYSTEM
        </p>

        <h1 className="mt-4 text-4xl font-light">
          Configuración
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/45">
          Personaliza tu experiencia dentro del ecosistema.
        </p>

        <div className="mt-10 space-y-4">

          <section className="k-glass-panel rounded-[1.6rem] p-6">
            <p className="krypton-eyebrow">
              EXPERIENCIA
            </p>

            <h2 className="mt-3 text-base font-medium">
              Apariencia
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Krypton utiliza actualmente su interfaz Liquid Glass
              acuática como experiencia principal.
            </p>
          </section>

          <section className="k-glass-panel rounded-[1.6rem] p-6">
            <p className="krypton-eyebrow">
              CONVERSACIONES
            </p>

            <h2 className="mt-3 text-base font-medium">
              Memoria y contexto
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              La conservación del contexto se conectará posteriormente
              al sistema de sesiones y base de datos.
            </p>
          </section>

          <section className="k-glass-panel rounded-[1.6rem] p-6">
            <p className="krypton-eyebrow">
              PRIVACIDAD
            </p>

            <h2 className="mt-3 text-base font-medium">
              Sesión
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              La autenticación y gestión de sesiones se integrarán
              después de finalizar la interfaz.
            </p>
          </section>

        </div>

      </section>

    </KryptonShell>
  );
}
