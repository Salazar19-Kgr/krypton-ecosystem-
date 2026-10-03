"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loginGoogle() {
    setLoading(true);
    setError("");
    try {
      if (
        !process.env.NEXT_PUBLIC_SUPABASE_URL ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        throw new Error("Faltan las claves de Supabase en este despliegue");
      }
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (authError) throw authError;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-5 py-5 text-white">

      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-5xl flex-col">

        <header className="flex items-center justify-between">
          <Link href="/" className="krypton-brand-capsule k-glass">
            <span className="krypton-brand-dot" />
            <span>Krypton Ecosystem</span>
          </Link>

          <Link
            href="/"
            className="k-glass-button rounded-full px-4 py-2 text-xs"
          >
            Volver
          </Link>
        </header>

        <section className="flex flex-1 items-center justify-center py-12">

          <div className="k-glass-panel w-full max-w-md rounded-[2rem] p-7 text-center sm:p-9">

            <p className="krypton-eyebrow">KRYPTON ECOSYSTEM</p>

            <h1 className="mt-5 text-3xl font-light">
              Entra a tu ecosistema.
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/45">
              Accede para conservar tus conversaciones y continuar tu
              experiencia con Krypton.
            </p>

            <button
              type="button"
              onClick={loginGoogle}
              disabled={loading}
              className="k-glass-button mt-8 flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-sm disabled:opacity-60"
            >
              <span className="text-base">G</span>
              {loading ? "Conectando..." : "Continuar con Google"}
            </button>

            {error && (
              <p className="mt-6 text-xs leading-5 text-red-300">{error}</p>
            )}

          </div>

        </section>

        <footer className="pb-2 text-center text-[10px] text-white/25">
          © 2026 · Krypton Ecosystem
        </footer>

      </div>

    </main>
  );
}
