import Link from "next/link";

type Section = { h: string; p: string[] };

export default function LegalDoc({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
      <Link href="/" className="text-xs text-white/60 underline">
        ← Volver a Krypton
      </Link>
      <p className="krypton-eyebrow mt-6">KRYPTON ECOSYSTEM</p>
      <h1 className="mt-2 text-3xl font-light">{title}</h1>
      <p className="mt-2 text-xs text-white/50">Última actualización: {updated}</p>
      <p className="mt-5 text-sm leading-7 text-white/80">{intro}</p>
      <div className="mt-6 space-y-6">
        {sections.map((s, i) => (
          <section key={s.h} className="border-t border-white/10 pt-5">
            <h2 className="text-base font-semibold">
              {i + 1}. {s.h}
            </h2>
            {s.p.map((t, j) => (
              <p key={j} className="mt-2 text-sm leading-7 text-white/80">
                {t}
              </p>
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
