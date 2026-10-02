"use client";

import { useState } from "react";
import Link from "next/link";

const features = [
  {
    title: "IA Avanzada",
    description: "Piensa contigo",
  },
  {
    title: "Información",
    description: "Conecta conocimiento",
  },
  {
    title: "Análisis de Imágenes",
    description: "Ve y comprende",
  },
  {
    title: "Mucho más",
    description: "En constante evolución",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-5 py-5 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl flex-col">

        <header className="flex items-center justify-between">
          <div className="k-glass rounded-full px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
              <span className="text-sm font-medium tracking-wide">
                Krypton Ecosystem
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="k-glass-button flex h-12 w-12 items-center justify-center rounded-full text-xl"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              ☰
            </button>

            {menuOpen && (
              <div className="k-glass-panel absolute right-0 top-14 z-30 w-52 rounded-2xl p-2">
                <Link
                  href="/login"
                  className="block rounded-xl px-4 py-3 text-sm transition hover:bg-white/10"
                >
                  Acceder
                </Link>
                <Link
                  href="/info"
                  className="block rounded-xl px-4 py-3 text-sm transition hover:bg-white/10"
                >
                  Información
                </Link>
              </div>
            )}
          </div>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.45em] text-cyan-200/70">
            KRYPTON
          </p>

          <h1 className="krypton-title text-5xl font-semibold tracking-[0.16em] sm:text-7xl">
            ECOSYSTEM
          </h1>

          <div className="k-glass-panel mt-10 w-full max-w-3xl rounded-[2rem] p-7 sm:p-10">
            <p className="text-2xl font-medium leading-tight sm:text-4xl">
              Inteligencia diseñada para adaptarse a ti.
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              Ecosistema multifuncional diseñado para adaptarse a tus límites
              y capacidades.
            </p>

            <Link
              href="/login"
              className="k-glass-button mt-8 inline-flex rounded-full px-7 py-3.5 font-medium"
            >
              Comenzar
              <span className="ml-2">→</span>
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="k-glass-card rounded-2xl p-5 text-left"
              >
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="mt-2 text-xs text-white/50">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="pb-3 text-center text-xs text-white/35">
          © 2026 · Krypton Ecosystem
        </footer>
      </div>
    </main>
  );
}
