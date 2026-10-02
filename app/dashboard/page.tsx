import Link from "next/link";
import KryptonHeader from "@/components/layout/KryptonHeader";

export default function DashboardPage() {
  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-6xl">

        <KryptonHeader />

        <section className="pt-14 sm:pt-20">

          <p className="krypton-eyebrow">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-6xl">
            Tu espacio inteligente.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            Conversa, analiza, busca información y trabaja con Krypton
            desde un mismo espacio.
          </p>

        </section>

        <section className="mt-10">

          <div className="k-glass-panel rounded-[2rem] p-6 sm:p-8">

            <p className="krypton-eyebrow">
              ESPACIO DE TRABAJO
            </p>

            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-2xl font-medium">
                  ¿Qué quieres hacer?
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Cuéntale a Krypton lo que necesitas.
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

          <div className="k-glass-card rounded-[1.8rem] p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="krypton-eyebrow">
                  MEMORIA
                </p>

                <h2 className="mt-3 text-xl font-medium">
                  Continúa donde lo dejaste.
                </h2>

                <p className="mt-2 text-sm text-white/45">
                  Tus conversaciones y contexto estarán disponibles para
                  continuar trabajando.
                </p>
              </div>

              <Link
                href="/memory"
                className="text-sm text-cyan-200/80 transition hover:text-cyan-100"
              >
                Ver conversaciones →
              </Link>

            </div>

          </div>

        </section>

        <section className="mt-10 pb-12">

          <p className="krypton-eyebrow">
            ESTADO
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
                Sistema de sesión pendiente de conexión.
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
                Sistema de contexto pendiente de conexión.
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
                Orquestador pendiente de conectar los modelos.
              </p>
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}
