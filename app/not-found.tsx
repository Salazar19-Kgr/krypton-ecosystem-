import Link from "next/link";

export default function NotFound() {
  return (
    <main className="krypton-ocean krypton-liquid flex min-h-screen items-center justify-center px-5 text-white">

      <div className="k-glass-panel w-full max-w-lg rounded-[2rem] p-8 text-center">

        <p className="krypton-eyebrow">
          KRYPTON ECOSYSTEM
        </p>

        <h1 className="mt-5 text-5xl font-light">
          404
        </h1>

        <p className="mt-4 text-sm leading-6 text-white/50">
          Esta sección todavía no existe.
        </p>

        <Link
          href="/dashboard"
          className="k-glass-button mt-7 inline-flex rounded-full px-6 py-3"
        >
          Volver a Krypton
          <span className="ml-2">→</span>
        </Link>

      </div>

    </main>
  );
}
