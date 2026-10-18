import Link from "next/link";

export type LegalSection = { title: string; body: string[] };

/** Página legal pública (se puede abrir sin iniciar sesión). */
export default function LegalDoc({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-5 py-8 text-white">
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/" className="k-glass-button inline-flex rounded-full px-5 py-2.5 text-sm">
          Krypton Ecosystem
        </Link>

        <p className="krypton-eyebrow mt-10">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-light sm:text-5xl">{title}</h1>
        <p className="mt-3 text-xs text-white/70">Última actualización: {updated}</p>

        <div className="k-glass-panel mt-8 rounded-[2rem] p-6 sm:p-8">
          <p className="text-sm leading-7 text-white/85">{intro}</p>
          {sections.map((section, i) => (
            <section key={section.title} className="mt-7">
              <h2 className="text-base font-medium">
                {i + 1}. {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-7 text-white/80">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-6 flex flex-wrap gap-4 pb-6 text-sm text-white/80">
          <Link href="/terms" className="underline underline-offset-4">
            Términos y condiciones
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Política de privacidad
          </Link>
          <Link href="/login" className="underline underline-offset-4">
            Ir a iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
