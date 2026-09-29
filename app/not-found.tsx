import Link from "next/link";

export default function NotFound() {
  return (
    <main className="krypton-ocean flex min-h-screen items-center justify-center px-5">
      <section className="k-glass-panel max-w-md p-8 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/50">
          Krypton Ecosystem
        </p>

        <h1 className="mt-4 text-5xl font-semibold text-white">404</h1>

        <p className="mt-4 text-sm leading-6 text-white/45">
          Esta sección todavía no existe o ya no está disponible.
        </p>

        <Link
          href="/"
          className="k-glass-button mt-7 inline-flex rounded-2xl px-5 py-3 text-sm"
        >
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
