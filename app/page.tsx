"use client";

import Link from "next/link";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons: Record<string, React.ReactNode> = {
  ai: (
    <svg {...iconProps}>
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </svg>
  ),
  info: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  ),
  vision: (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M4 17l5-5 4 4 3-3 4 4" />
    </svg>
  ),
  evolution: (
    <svg {...iconProps}>
      <path d="M13 2L5 13h6l-1 9 8-11h-6l1-9z" />
    </svg>
  ),
};

const features = [
  { icon: "ai", title: "IA avanzada", description: "Piensa contigo." },
  { icon: "info", title: "Información", description: "Conocimiento cuando lo necesitas." },
  { icon: "vision", title: "Visión", description: "Comprende imágenes desde el chat." },
  { icon: "evolution", title: "Evolución", description: "Un ecosistema preparado para crecer." },
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

        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <p className="krypton-eyebrow">KRYPTON</p>

          <h1 className="krypton-title mt-4 text-5xl font-normal tracking-[0.16em] sm:text-7xl">
            ECOSYSTEM
          </h1>

          <div className="k-glass-panel mt-10 w-full max-w-3xl rounded-[2.2rem] p-7 sm:p-10">
            <h2 className="text-2xl font-semibold leading-tight sm:text-4xl">
              Inteligencia diseñada para adaptarse a ti.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Ecosistema multifuncional diseñado para adaptarse a tus límites
              y capacidades.
            </p>

            <Link
              href="/login"
              className="k-glass-button mt-8 inline-flex rounded-full px-8 py-3.5 text-sm font-medium"
            >
              Comenzar
              <span className="ml-2">→</span>
            </Link>
          </div>

          <div className="mt-7 grid w-full max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="k-glass-card flex flex-col items-center rounded-3xl px-3 py-5 text-center"
              >
                <span className="k-glass flex h-12 w-12 items-center justify-center rounded-2xl text-white">
                  {icons[feature.icon]}
                </span>

                <p className="mt-3 text-sm font-medium">{feature.title}</p>

                <p className="mt-1 text-[11px] leading-4 text-white/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="pb-2 text-center text-[10px] text-white/50">
          © 2026 · Krypton Ecosystem
        </footer>
      </div>
    </main>
  );
}
