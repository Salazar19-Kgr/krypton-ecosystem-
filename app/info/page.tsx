import Link from "next/link";

export default function InfoPage() {
  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">
      <div className="mx-auto min-h-[calc(100vh-32px)] max-w-5xl">

        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="k-glass rounded-full px-5 py-3 text-sm font-medium tracking-wide"
          >
            Krypton Ecosystem
          </Link>

          <Link
            href="/chat"
            className="k-glass-button flex h-11 w-11 items-center justify-center rounded-full"
            aria-label="Abrir Chat"
          >
            →
          </Link>
        </header>

        <section className="py-20">

          <p className="krypton-eyebrow">
            KRYPTON ECOSYSTEM
          </p>

          <h1 className="mt-4 text-4xl font-light sm:text-6xl">
            Un ecosistema.
            <br />
            Muchas capacidades.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Krypton está diseñado para comprender lo que necesitas y
            utilizar internamente las capacidades adecuadas para construir
            una respuesta.
          </p>

        </section>

        <section className="grid gap-4 pb-12 sm:grid-cols-2">

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">
              INTELIGENCIA
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Razonamiento
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Krypton podrá analizar solicitudes complejas y coordinar
              diferentes capacidades sin obligarte a elegir herramientas.
            </p>
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">
              MULTIMODAL
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Comprensión visual
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Las imágenes formarán parte de la conversación directamente
              desde el Chat.
            </p>
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">
              INFORMACIÓN
            </p>

            <h2 className="mt-4 text-xl font-medium">
              Conocimiento externo
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Cuando sea necesario, Krypton podrá consultar fuentes externas
              internamente para complementar una respuesta.
            </p>
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">
              EVOLUCIÓN
            </p>

            <h2 className="mt-4 text-xl font-medium">
              En constante crecimiento
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/45">
              La arquitectura está preparada para incorporar nuevas
              capacidades sin cambiar la experiencia principal.
            </p>
          </div>

        </section>

      </div>
    </main>
  );
}
