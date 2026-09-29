"use client"

import { useState } from "react"

const features = [
y
  {
    icon: "✦",
    title: "IA Avanzada",
    text: "Piensa contigo",
  },
  {
    icon: "◎",
    title: "Información",
    text: "Sin límites",
  },
  {
    icon: "▣",
    title: "Análisis de Imágenes",
    text: "Ve y comprende",
  },
  {
    icon: "ϟ",
    title: "Mucho más",
    text: "En constante evolución",
  },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="krypton-ocean min-h-screen text-white">
      {/* Luces ambientales */}
      <div className="krypton-glow krypton-glow-cyan left-[-8%] top-[18%] h-72 w-72" />
      <div className="krypton-glow krypton-glow-warm bottom-[35%] left-[-10%] h-80 w-80" />
      <div className="krypton-glow krypton-glow-cyan right-[-8%] top-[5%] h-80 w-80" />
      <div className="krypton-glow krypton-glow-cyan bottom-[5%] right-[15%] h-64 w-64" />

      {/* Capa de profundidad acuática */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,5,15,.28)_100%)]" />

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-5 py-6 sm:px-10 sm:py-8">
        <div className="k-glass flex items-center gap-3 rounded-full px-5 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.95)]" />
          <span className="text-sm tracking-wide text-white/95">
            Krypton Ecosystem
          </span>
        </div>

        <button
          type="button"
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="k-glass flex h-14 w-14 items-center justify-center rounded-2xl"
        >
          <span className="flex w-6 flex-col gap-1.5">
            <span className="h-px w-full bg-white/90" />
            <span className="h-px w-full bg-white/90" />
            <span className="h-px w-full bg-white/90" />
          </span>
        </button>
      </header>

      {/* Menú */}
      {menuOpen && (
        <div className="absolute right-5 top-24 z-40 w-64 sm:right-10">
          <nav className="k-glass rounded-3xl p-3">
            {[
              "Inicio",
              "Chat",
              "Análisis de Imágenes",
              "Información",
              "Memoria",
              "Configuración",
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMenuOpen(false)}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Contenido principal */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-105px)] w-full max-w-7xl flex-col items-center px-5 pb-8 pt-14 text-center sm:px-8 sm:pt-20">

        {/* Marca */}
        <div className="mb-8 sm:mb-10">
          <h1 className="krypton-title text-5xl text-white sm:text-7xl lg:text-8xl">
            KRYPTON
          </h1>

          <p className="krypton-subtitle mt-3 text-base text-white/90 sm:text-xl lg:text-2xl">
            ECOSYSTEM
          </p>
        </div>

        {/* Panel principal */}
        <section className="k-glass-panel w-full max-w-4xl px-6 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-14">

          <h2 className="relative z-10 text-3xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
            Inteligencia diseñada
            <br />
            <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent">
              para adaptarse a ti.
            </span>
          </h2>

          <p className="relative z-10 mx-auto mt-7 max-w-2xl text-sm leading-6 text-white/75 sm:text-lg sm:leading-8">
            Ecosistema multifuncional diseñado para adaptarse a tus límites y
            capacidades.
          </p>
        </section>

        {/* Botón */}
        <button
          type="button"
          className="k-glass-button mt-7 px-10 py-4 text-base font-medium sm:px-14 sm:py-5 sm:text-lg"
        >
           Comenzar</span>
          <span className="ml-5 text-xl">→</span>
        </button>

        {/* Funciones */}
        <section className="mt-16 grid w-full max-w-5xl grid-cols-2 gap-x-4 gap-y-8 sm:mt-20 sm:grid-cols-4 sm:gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group flex flex-col items-center"
            >
              <div className="k-glass-card flex h-16 w-16 items-center justify-center rounded-2xl transition group-hover:scale-105 sm:h-20 sm:w-20">
                <span className="text-3xl font-light text-cyan-100 drop-shadow-[0_0_12px_rgba(139,234,255,.65)]">
                  {feature.icon}
                </span>
              </div>

              <h3 className="mt-4 text-xs font-medium text-white sm:text-sm lg:text-base">
                {feature.title}
              </h3>

              <p className="mt-1 text-[11px] text-white/55 sm:text-xs">
                {feature.text}
              </p>
            </article>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-auto flex w-full items-center justify-center gap-5 pt-20 text-xs text-white/55">
          <span className="hidden h-px w-16 bg-white/35 sm:block" />
          <span>© 2026</span>
          <span>·</span>
          <span>Krypton Ecosystem</span>
          <span className="hidden h-px w-16 bg-white/35 sm:block" />
        </footer>
      </section>
    </main>
  )
}
