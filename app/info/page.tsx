"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

export default function InfoPage() {
  const [query, setQuery] = useState("");

  return (
    <AppShell active="info">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col">
        <header className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">
            Krypton Knowledge
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Información sin límites.
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Explora información y consulta fuentes desde un espacio diseñado
            para organizar el conocimiento.
          </p>
        </header>

        <section className="k-glass-panel mb-5 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                ⌕
              </span>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="¿Qué quieres investigar?"
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none backdrop-blur-xl transition placeholder:text-white/25 focus:border-cyan-200/25 focus:bg-white/[0.04]"
              />
            </div>

            <button
              type="button"
              className="k-glass-button h-14 rounded-2xl px-6 text-sm font-medium"
            >
              Buscar
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {["Historia", "Ciencia", "Tecnología", "Cultura"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuery(item)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/45 transition hover:bg-white/[0.07] hover:text-white/70"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <div className="grid flex-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="k-glass-panel min-h-[420px] p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/30">
                  Exploración
                </p>
                <h2 className="mt-2 text-xl font-medium text-white">
                  Resultados
                </h2>
              </div>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wider text-white/35">
                Knowledge Core
              </span>
            </div>

            <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-white/10 bg-black/15 p-6 text-center">
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-200/5 text-xl text-cyan-100/40">
                  ◌
                </div>

                <p className="text-sm text-white/50">
                  {query
                    ? `Preparado para investigar: "${query}"`
                    : "Los resultados aparecerán aquí."}
                </p>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/25">
                  Las fuentes externas se conectarán posteriormente al núcleo
                  de Krypton.
                </p>
              </div>
            </div>
          </section>

          <section className="k-glass-panel min-h-[420px] p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">
              Fuentes
            </p>

            <h2 className="mt-2 text-xl font-medium text-white">
              Fuentes consultadas
            </h2>

            <div className="mt-6 space-y-3">
              {[
                ["Wikipedia", "Enciclopedia y conocimiento general"],
                ["Fuentes web", "Información externa verificable"],
                ["Krypton AI", "Síntesis y organización"],
              ].map(([name, description]) => (
                <div
                  key={name}
                  className="k-glass-card rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-white/80">
                        {name}
                      </h3>
                      <p className="mt-1 text-xs text-white/35">
                        {description}
                      </p>
                    </div>

                    <span className="h-2 w-2 rounded-full bg-cyan-200/50 shadow-[0_0_12px_rgba(80,220,255,0.6)]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
