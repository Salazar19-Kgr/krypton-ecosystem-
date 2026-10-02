"use client";

import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

const recentItems = [
  {
    title: "Nueva conversación",
    description: "Comienza algo nuevo con Krypton.",
    href: "/chat",
  },
  {
    title: "Continuar conversación",
    description: "Retoma una conversación anterior.",
    href: "/memory",
  },
];

export default function DashboardPage() {
  return (
    <KryptonShell>

      <section className="mx-auto max-w-5xl py-12 sm:py-20">

        <div className="max-w-3xl">

          <p className="krypton-eyebrow">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-6xl">
            Tu espacio inteligente.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            Conversa, analiza, busca información y trabaja con Krypton
            desde un único espacio.
          </p>

        </div>

        <div className="k-glass-panel mt-10 rounded-[2rem] p-6 sm:p-8">

          <p className="krypton-eyebrow">
            ESPACIO DE TRABAJO
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-xl font-medium">
                ¿Qué quieres hacer?
              </h2>

              <p className="mt-2 text-sm text-white/45">
                Explícale directamente a Krypton lo que necesitas.
              </p>
            </div>

            <Link
              href="/chat"
              className="k-glass-button inline-flex shrink-0 items-center justify-center rounded-full px-6 py-3 text-sm"
            >
              Nueva conversación
              <span className="ml-2">→</span>
            </Link>

          </div>

        </div>

        <section className="mt-10">

          <div className="flex items-end justify-between">
            <div>
              <p className="krypton-eyebrow">
                TU ECOSISTEMA
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Continuar
              </h2>
            </div>

            <Link
              href="/memory"
              className="text-xs text-cyan-100/55 transition hover:text-white"
            >
              Ver conversaciones →
            </Link>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">

            {recentItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="k-glass-card rounded-[1.5rem] p-6"
              >
                <h3 className="text-base font-medium">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  {item.description}
                </p>

                <p className="mt-6 text-xs text-white/40">
                  Abrir →
                </p>
              </Link>
            ))}

          </div>

        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">

          <div className="k-glass-card rounded-[1.4rem] p-5">
            <p className="krypton-eyebrow">SESIÓN</p>
            <p className="mt-3 text-sm">Preparada</p>
            <p className="mt-1 text-xs text-white/35">
              Sistema de sesión listo para integración.
            </p>
          </div>

          <div className="k-glass-card rounded-[1.4rem] p-5">
            <p className="krypton-eyebrow">MEMORIA</p>
            <p className="mt-3 text-sm">Preparada</p>
            <p className="mt-1 text-xs text-white/35">
              Conversaciones preparadas para conservar contexto.
            </p>
          </div>

          <div className="k-glass-card rounded-[1.4rem] p-5">
            <p className="krypton-eyebrow">KRYPTON CORE</p>
            <p className="mt-3 text-sm">En preparación</p>
            <p className="mt-1 text-xs text-white/35">
              El núcleo conectará las capacidades automáticamente.
            </p>
          </div>

        </section>

      </section>

    </KryptonShell>
  );
}
