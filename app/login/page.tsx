"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  function handleGoogleLogin() {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
    }, 900);
  }

  return (
    <main className="krypton-ocean relative min-h-screen overflow-hidden px-5 py-8 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="krypton-glow absolute left-[15%] top-[15%] h-64 w-64 rounded-full" />
        <div className="krypton-glow-cyan absolute bottom-[10%] right-[10%] h-72 w-72 rounded-full" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="k-glass rounded-full px-5 py-2.5 text-sm font-medium tracking-wide text-white/85 transition hover:bg-white/10"
          >
            Krypton Ecosystem
          </Link>

          <Link
            href="/"
            className="text-xs text-white/40 transition hover:text-white/70"
          >
            Volver
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center py-12">
          <section className="k-glass-panel w-full max-w-md p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-100/15 bg-cyan-100/5 shadow-[0_0_40px_rgba(80,220,255,0.08)]">
                <span className="text-2xl text-cyan-100/80">✦</span>
              </div>

              <p className="mt-6 text-xs uppercase tracking-[0.3em] text-cyan-200/50">
                Bienvenido
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                Entra a Krypton.
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/45">
                Accede a tu ecosistema inteligente y continúa donde lo
                dejaste.
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-medium text-white/85 backdrop-blur-xl transition hover:bg-white/[0.1] disabled:cursor-wait disabled:opacity-60"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-sm font-semibold text-black">
                  G
                </span>

                {loading ? "Preparando acceso..." : "Continuar con Google"}
              </button>
            </div>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-widest text-white/20">
                Krypton
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-center">
              <p className="text-xs leading-5 text-white/35">
                Tu cuenta permitirá mantener tus conversaciones, preferencias
                y contexto de forma independiente.
              </p>
            </div>

            <p className="mt-6 text-center text-[11px] leading-5 text-white/25">
              Al continuar, podrás acceder a las funciones del ecosistema
              Krypton.
            </p>
          </section>
        </div>

        <footer className="pb-2 text-center text-xs text-white/25">
          © 2026 — Todos los derechos reservados.
        </footer>
      </div>
    </main>
  );
}
