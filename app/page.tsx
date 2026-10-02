"use client";

import Link from "next/link";

const features = [
  {
    title: "IA avanzada",
    description: "Piensa contigo.",
  },
  {
    title: "Información",
    description: "Conocimiento cuando lo necesitas.",
  },
  {
    title: "Visión",
    description: "Comprende imágenes desde el Chat.",
  },
  {
    title: "Evolución",
    description: "Un ecosistema preparado para crecer.",
  },
];

export default function Home() {
  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-5 py-5 text-white">

      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl flex-col">

        <header className="flex items-center justify-between">

          <div className="krypton-brand-capsule k-glass">
            <span className="krypton-brand-dot" />
            <span>Krypton Ecosystem</span>
          </div>

          <Link
            href="/login"
            className="k-glass-button rounded-full px-5 py-2.5 text-xs"
          >
            Acceder
          </Link>

        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-14 text-center">

          <p className="krypton-eyebrow">
            KRYPTON
          </p>

          <h1 className="krypton-title mt-4 text-5xl font-light tracking-[0.18em] sm:text-7xl">
            ECOSYSTEM
          </h1>

          <div className="k-glass-panel mt-10 w-full max-w-3xl rounded-[2.2rem] p-7 sm:p-10">

            <h2 className="text-2xl font-medium leading-tight sm:text-4xl">
              Inteligencia diseñada para adaptarse a ti.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
              Ecosistema multifuncional diseñado para adaptarse a tus
              límites y capacidades.
            </p>

            <Link
              href="/login"
              className="k-glass-button mt-8 inline-flex rounded-full px-7 py-3.5 text-sm"
            >
              Comenzar
              <span className="ml-2">→</span>
            </Link>

          </div>

          <div className="mt-7 grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {features.map((feature) => (
              <div
                key={feature.title}
                className="k-glass-card rounded-2xl p-5 text-left"
              >
                <p className="text-sm font-medium">
                  {feature.title}
                </p>

                <p className="mt-2 text-xs leading-5 text-white/45">
                  {feature.description}
                </p>
              </div>
            ))}

          </div>

        </section>

        <footer className="pb-2 text-center text-[10px] text-white/25">
          © 2026 · Krypton Ecosystem
        </footer>

      </div>

    </main>
  );
}
