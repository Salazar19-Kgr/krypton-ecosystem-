import KryptonShell from "@/components/layout/KryptonShell";
import PlansPanel from "@/components/plans/PlansPanel";

export default function PlansPage() {
  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-12 pt-4">
        <p className="krypton-eyebrow">PLANES</p>
        <h1 className="mt-1 text-2xl font-light">Planes que crecen contigo</h1>
        <p className="mb-5 mt-1 text-sm text-white/60">Elige el plan que se adapta a ti.</p>
        <PlansPanel />
      </section>
    </KryptonShell>
  );
}
