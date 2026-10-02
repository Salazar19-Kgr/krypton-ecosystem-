"use client";

import Link from "next/link";
import { useState } from "react";

export default function KryptonHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 flex items-center justify-between">
      <Link
        href="/dashboard"
        className="k-glass inline-flex items-center gap-3 rounded-full px-5 py-3"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />

        <span className="text-sm font-medium tracking-wide">
          Krypton Ecosystem
        </span>
      </Link>

      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="k-glass-button flex h-11 w-11 items-center justify-center rounded-full text-base"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          ☰
        </button>

        {open && (
          <div className="k-glass-panel absolute right-0 top-14 w-60 rounded-2xl p-2">

            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm transition hover:bg-white/10"
            >
              Inicio
            </Link>

            <Link
              href="/chat"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm transition hover:bg-white/10"
            >
              Chat
            </Link>

            <Link
              href="/memory"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm transition hover:bg-white/10"
            >
              Conversaciones
            </Link>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm transition hover:bg-white/10"
            >
              Configuración
            </Link>

          </div>
        )}
      </div>
    </header>
  );
}
