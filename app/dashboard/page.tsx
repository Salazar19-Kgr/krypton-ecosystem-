import AppShell from "@/components/layout/AppShell"

const modules = [
  {
    icon: "✦",
    title: "Chat inteligente",
    description: "Conversa, razona y trabaja con Krypton.",
    href: "/chat",
  },
  {
    icon: "▣",
    title: "Análisis de imágenes",
    description: "Comprende imágenes y contenido visual.",
    href: "/vision",
  },
  {
    icon: "◎",
    title: "Información",
    description: "Consulta información y fuentes externas.",
    href: "/info",
  },
  {
    icon: "◌",
    title: "Memoria",
    description: "Gestiona el contexto y tus conversaciones.",
    href: "/settings",
  },
]

export default function DashboardPage() {
  return (
    <AppShell active="dashboard">
      <div className="space-y-8">

        {/* Encabezado */}
        <header>
          <p className="text-sm tracking-[0.28em] text-cyan-200/65">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-3 text-4xl font-light tracking-tight sm:text-5xl">
            Tu espacio inteligente.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
            Un ecosistema diseñado para reunir conversación, análisis,
            información y herramientas de inteligencia artificial en un solo
            lugar.
          </p>
        </header>

        {/* Acceso rápido */}
        <section className="k-glass-panel p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-cyan-200/55">
                Espacio de trabajo
              </span>

              <h2 className="mt-2 text-2xl font-medium">
                ¿Qué quieres hacer?
              </h2>

              <p className="mt-2 text-sm text-white/50">
                Comienza una conversación o entra directamente a una
                herramienta.
              </p>
            </div>

            <a
              href="/chat"
              className="k-glass-button inline-flex items-center justify-center px-7 py-3.5 text-sm"
            >
              Nueva conversación
              <span className="ml-4 text-lg">→</span>
            </a>
          </div>
        </section>

        {/* Módulos */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/35">
                Ecosistema
              </p>

              <h2 className="mt-2 text-2xl font-medium">
                Herramientas
              </h2>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <a
                key={module.title}
                href={module.href}
                className="k-glass-card group p-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100/20 bg-cyan-100/5 text-xl text-cyan-100 shadow-[0_0_25px_rgba(60,210,255,.08)] transition group-hover:scale-105">
                  {module.icon}
                </div>

                <h3 className="mt-6 text-lg font-medium">
                  {module.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  {module.description}
                </p>

                <div className="mt-6 text-xs text-cyan-200/65">
                  Abrir módulo →
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Estado del ecosistema */}
        <section className="grid gap-5 md:grid-cols-3">
          <div className="k-glass-card p-5">
            <p className="text-xs uppercase tracking-widest text-white/35">
              Sesión
            </p>
            <p className="mt-2 text-lg">Preparada</p>
            <p className="mt-1 text-xs text-white/40">
              Sistema de sesiones pendiente de conexión.
            </p>
          </div>

          <div className="k-glass-card p-5">
            <p className="text-xs uppercase tracking-widest text-white/35">
              Memoria
            </p>
            <p className="mt-2 text-lg">Preparada</p>
            <p className="mt-1 text-xs text-white/40">
              Sistema de contexto pendiente de conexión.
            </p>
          </div>

          <div className="k-glass-card p-5">
            <p className="text-xs uppercase tracking-widest text-white/35">
              IA Core
            </p>
            <p className="mt-2 text-lg">En preparación</p>
            <p className="mt-1 text-xs text-white/40">
              Orquestador pendiente de conectar los modelos.
            </p>
          </div>
        </section>

      </div>
    </AppShell>
  )
}
