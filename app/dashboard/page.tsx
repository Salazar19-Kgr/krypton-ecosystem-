"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-6xl flex-col">

        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="k-glass rounded-full px-5 py-3 text-sm font-medium tracking-wide"
          >
            Krypton Ecosystem
          </Link>

          <Link
            href="/chat"
            className="k-glass-button flex h-11 w-11 items-center justify-center rounded-full"
            aria-label="Abrir Chat"
          >
            ☰
          </Link>
        </header>

        <section className="pt-14 sm:pt-20">

          <p className="krypton-eyebrow">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-6xl">
            Tu espacio inteligente.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Un ecosistema diseñado para reunir conversación, análisis,
            información y memoria en un solo lugar.
          </p>

        </section>

        <section className="mt-10">

          <div className="k-glass-panel rounded-[2rem] p-6 sm:p-8">

            <p className="krypton-eyebrow">
              ESPACIO DE TRABAJO
            </p>

            <div className="mt-3 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-2xl font-medium">
                  ¿Qué quieres hacer?
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Comienza una conversación con Krypton.
                </p>
              </div>

              <Link
                href="/chat"
                className="k-glass-button inline-flex w-fit rounded-full px-6 py-3.5"
              >
                Nueva conversación
                <span className="ml-2">→</span>
              </Link>

            </div>

          </div>

        </section>

        <section className="mt-10">

          <p className="krypton-eyebrow">
            CONVERSACIONES
          </p>

          <div className="k-glass-panel mt-4 rounded-[1.8rem] p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-medium">
                  Tu historial
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Tus conversaciones y contexto estarán disponibles aquí.
                </p>
              </div>

              <Link
                href="/chat"
                className="text-sm text-cyan-200/80 transition hover:text-cyan-100"
              >
                Abrir Chat →
              </Link>

            </div>

          </div>

        </section>

        <section className="mt-10 pb-10">

          <p className="krypton-eyebrow">
            ESTADO DEL ECOSISTEMA
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">

            <div className="k-glass-card rounded-2xl p-5">
              <p className="text-xs text-white/35">
                SESIÓN
              </p>

              <p className="mt-3 text-lg font-medium">
                Preparada
              </p>

              <p className="mt-2 text-xs text-white/40">
                Contexto de usuario disponible.
              </p>
            </div>

            <div className="k-glass-card rounded-2xl p-5">
              <p className="text-xs text-white/35">
                MEMORIA
              </p>

              <p className="mt-3 text-lg font-medium">
                Preparada
              </p>

              <p className="mt-2 text-xs text-white/40">
                Conversaciones y contexto.
              </p>
            </div>

            <div className="k-glass-card rounded-2xl p-5">
              <p className="text-xs text-white/35">
                KRYPTON CORE
              </p>

              <p className="mt-3 text-lg font-medium">
                En preparación
              </p>

              <p className="mt-2 text-xs text-white/40">
                El núcleo coordinará las capacidades del ecosistema.
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
