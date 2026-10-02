"use client";

import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

const conversations = [
  {
    title: "Todavía no hay conversaciones",
    description:
      "Cuando empieces a utilizar Krypton, tus conversaciones aparecerán aquí.",
  },
];

export default function MemoryPage() {
  return (
    <KryptonShell>

      <section className="mx-auto max-w-5xl py-12 sm:py-16">

        <p className="krypton-eyebrow">
          CONVERSACIONES
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <h1 className="text-4xl font-light">
              Tu historial.
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/45">
              Conserva tus conversaciones y vuelve a ellas cuando
              quieras continuar un trabajo.
            </p>
          </div>

          <Link
            href="/chat"
            className="k-glass-button inline-flex rounded-full px-6 py-3 text-sm"
          >
            Nueva conversación →
          </Link>

        </div>

        <div className="mt-10 space-y-3">

          {conversations.map((conversation) => (
            <div
              key={conversation.title}
              className="k-glass-panel krypton-empty rounded-[1.6rem] p-7"
            >
              <h2 className="text-base font-medium">
                {conversation.title}
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
                {conversation.description}
              </p>
            </div>
          ))}

        </div>

      </section>

    </KryptonShell>
  );
}
