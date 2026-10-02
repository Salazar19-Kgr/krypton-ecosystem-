"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

export default function SettingsPage() {
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [appearance, setAppearance] = useState("Liquid Glass");

  return (
    <AppShell active="settings">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col">
        <header className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">
            Krypton Settings
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Configura tu ecosistema.
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Personaliza cómo quieres interactuar con Krypton y cómo se
            gestionará tu experiencia.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="k-glass-panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Cuenta
            </p>

            <h2 className="mt-2 text-xl font-medium text-white">
              Tu identidad
            </h2>

            <div className="mt-6 flex items-center gap-4 rounded-3xl border border-white/10 bg-black/15 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-200/10 text-xl text-cyan-100/60">
                ◉
              </div>

              <div>
                <p className="text-sm font-medium text-white/80">
                  Usuario Krypton
                </p>
                <p className="mt-1 text-xs text-white/35">
                  Cuenta preparada para autenticación
                </p>
              </div>
            </div>
          </section>

          <section className="k-glass-panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Memoria
            </p>

            <h2 className="mt-2 text-xl font-medium text-white">
              Contexto personal
            </h2>

            <div className="mt-6 flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/15 p-4">
              <div>
                <p className="text-sm font-medium text-white/75">
                  Memoria de Krypton
                </p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-white/35">
                  Permite conservar contexto útil entre conversaciones.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMemoryEnabled(!memoryEnabled)}
                className={`relative h-7 w-12 shrink-0 rounded-full border transition ${
                  memoryEnabled
                    ? "border-cyan-200/30 bg-cyan-200/15"
                    : "border-white/10 bg-white/5"
                }`}
                aria-label="Activar o desactivar memoria"
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full transition ${
                    memoryEnabled
                      ? "left-6 bg-cyan-100 shadow-[0_0_12px_rgba(100,230,255,0.6)]"
                      : "left-1 bg-white/30"
                  }`}
                />
              </button>
            </div>
          </section>

          <section className="k-glass-panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Apariencia
            </p>

            <h2 className="mt-2 text-xl font-medium text-white">
              Interfaz
            </h2>

            <div className="mt-6 space-y-3">
              {["Liquid Glass", "Profundo", "Minimal"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAppearance(option)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                    appearance === option
                      ? "border-cyan-200/20 bg-cyan-200/[0.06]"
                      : "border-white/10 bg-black/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="text-sm text-white/70">{option}</span>

                  <span
                    className={`h-3 w-3 rounded-full border ${
                      appearance === option
                        ? "border-cyan-100/60 bg-cyan-100/60 shadow-[0_0_10px_rgba(100,230,255,0.5)]"
                        : "border-white/20"
                    }`}
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="k-glass-panel p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Privacidad
            </p>

            <h2 className="mt-2 text-xl font-medium text-white">
              Datos y sesiones
            </h2>

            <div className="mt-6 space-y-3">
              {[
                ["Sesiones activas", "Gestiona tus dispositivos conectados"],
                ["Historial", "Controla tus conversaciones"],
                ["Preferencias", "Configura tu experiencia"],
              ].map(([title, description]) => (
                <button
                  key={title}
                  type="button"
                  className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:bg-white/[0.04]"
                >
                  <div>
                    <p className="text-sm text-white/70">{title}</p>
                    <p className="mt-1 text-xs text-white/30">
                      {description}
                    </p>
                  </div>

                  <span className="text-white/25">›</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
