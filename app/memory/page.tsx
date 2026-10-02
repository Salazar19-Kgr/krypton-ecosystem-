import Link from "next/link";
import KryptonHeader from "@/components/layout/KryptonHeader";

const conversations = [
  {
    title: "Nueva conversación",
    description: "Todavía no hay conversaciones guardadas.",
  },
];

export default function MemoryPage() {
  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-5xl">

        <KryptonHeader />

        <section className="py-14 sm:py-20">

          <p className="krypton-eyebrow">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-4 text-4xl font-light tracking-tight sm:text-6xl">
            Tus conversaciones.
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            Aquí podrás encontrar tus conversaciones y continuar el contexto
            de lo que estabas haciendo.
          </p>

        </section>

        <section className="pb-12">

          <div className="space-y-3">

            {conversations.map((conversation) => (
              <div
                key={conversation.title}
                className="k-glass-card rounded-3xl p-6"
              >
                <p className="text-base font-medium">
                  {conversation.title}
                </p>

                <p className="mt-2 text-sm text-white/45">
                  {conversation.description}
                </p>
              </div>
            ))}

          </div>

          <Link
            href="/chat"
            className="k-glass-button mt-6 inline-flex rounded-full px-6 py-3"
          >
            Nueva conversación
            <span className="ml-2">→</span>
          </Link>

        </section>

      </div>
    </main>
  );
}
