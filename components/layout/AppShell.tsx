"use client"

import { ReactNode, useState } from "react"

type AppShellProps = {
  children: ReactNode
  active?: string
}

const navigation = [
  { id: "dashboard", label: "Inicio", icon: "⌂", href: "/dashboard" },
  { id: "chat", label: "Chat", icon: "✦", href: "/chat" },
  { id: "vision", label: "Visión", icon: "▣", href: "/vision" },
  { id: "info", label: "Información", icon: "◎", href: "/info" },
  { id: "settings", label: "Configuración", icon: "⚙", href: "/settings" },
]

export default function AppShell({
  children,
  active = "dashboard",
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <main className="krypton-ocean min-h-screen text-white">
      <div className="krypton-glow krypton-glow-cyan left-[-10%] top-[10%] h-72 w-72" />
      <div className="krypton-glow krypton-glow-cyan bottom-[5%] right-[-8%] h-80 w-80" />

      <div className="relative z-10 flex min-h-screen">

        {/* Sidebar desktop */}
        <aside className="hidden w-72 shrink-0 p-5 lg:block">
          <div className="k-glass-panel sticky top-5 flex h-[calc(100vh-40px)] flex-col p-5">

            <div className="flex items-center gap-3 px-2 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.95)]" />
              <div>
                <p className="text-sm font-medium">Krypton</p>
                <p className="text-[10px] tracking-[0.28em] text-white/45">
                  ECOSYSTEM
                </p>
              </div>
            </div>

            <button
              type="button"
              className="k-glass-button mt-8 w-full px-4 py-3 text-sm"
            >
              + Nueva conversación
            </button>

            <nav className="mt-8 flex flex-col gap-2">
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm transition ${
                    active === item.id
                      ? "border border-cyan-100/25 bg-cyan-200/10 text-white shadow-[0_0_25px_rgba(70,220,255,.08)]"
                      : "text-white/55 hover:bg-white/7 hover:text-white"
                  }`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-100">
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto">
              <div className="k-glass-card flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-200/15 text-sm text-cyan-100">
                  K
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm">Tu espacio</p>
                  <p className="text-xs text-white/40">Cuenta conectada</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Navegación móvil */}
        <div className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between p-5 lg:hidden">
          <div className="k-glass flex items-center gap-3 rounded-full px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,.9)]" />
            <span className="text-sm">Krypton Ecosystem</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="k-glass flex h-12 w-12 items-center justify-center rounded-2xl"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute left-5 right-5 top-20 z-40 lg:hidden">
            <nav className="k-glass-panel rounded-3xl p-4">
              {navigation.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-4 rounded-2xl px-4 py-4 text-sm text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Contenido */}
        <section className="min-w-0 flex-1 px-5 pb-8 pt-24 sm:px-8 lg:px-10 lg:pt-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}
