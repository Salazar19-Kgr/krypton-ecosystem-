"use client";

import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <Link
            href="/dashboard"
            className="k-glass rounded-full px-5 py-3 text-sm font-medium"
          >
            Krypton Ecosystem
          </Link>

          <nav className="k-glass hidden items-center gap-1 rounded-full p-1 md:flex">

            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Inicio
            </Link>

            <Link
              href="/chat"
              className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Chat
            </Link>

            <Link
              href="/memory"
              className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Conversaciones
            </Link>

            <Link
              href="/settings"
              className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Configuración
            </Link>

          </nav>

        </div>
      </header>

      <div className="pt-20">
        {children}
      </div>
    </div>
  );
}
