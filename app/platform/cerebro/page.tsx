"use client";

import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

const NODES = [
  { label: "Core", a: 20 },
  { label: "Health", a: 75 },
  { label: "Tools", a: 130 },
  { label: "Code", a: 185 },
  { label: "Platform", a: 240 },
  { label: "Sentinel", a: 300 },
];

function pt(a: number, r: number) {
  const rad = (a * Math.PI) / 180;
  return { x: 200 + r * Math.cos(rad), y: 200 + r * Math.sin(rad) };
}

export default function CerebroPage() {
  return (
    <KryptonShell>
      <section className="mx-auto max-w-2xl px-1 pb-10 pt-4">
        <p className="krypton-eyebrow">KRYPTON PLATFORM</p>
        <h1 className="mt-2 text-2xl font-light">Cerebro de Krypton</h1>
        <p className="mt-2 text-sm text-white/60">Vista de arquitectura, solo exhibición.</p>

        <div className="krypton-brain-wrap mt-6 rounded-3xl border border-white/15 bg-black p-4">
          <svg viewBox="0 0 400 400" className="krypton-brain-spin mx-auto block w-full max-w-md">
            <defs>
              <radialGradient id="core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff5fb0" stopOpacity="1" />
                <stop offset="55%" stopColor="#ff2d8a" stopOpacity=".55" />
                <stop offset="100%" stopColor="#ff2d8a" stopOpacity="0" />
              </radialGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="2.2" /></filter>
            </defs>

            <circle cx="200" cy="200" r="190" fill="none" stroke="#ff2d8a33" strokeWidth="1" />
            <circle cx="200" cy="200" r="165" fill="none" stroke="#ff2d8a22" strokeWidth="1" />
            {Array.from({ length: 72 }).map((_, i) => {
              const p1 = pt(i * 5, 178);
              const p2 = pt(i * 5, 190);
              return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#ff2d8a55" strokeWidth="1" />;
            })}

            {NODES.map((n) => {
              const p = pt(n.a, 150);
              const c = pt(n.a, 70);
              return (
                <g key={n.label}>
                  <line x1={c.x} y1={c.y} x2={p.x} y2={p.y} stroke="#ff8fc7" strokeWidth="1" opacity=".55" />
                  <circle cx={p.x} cy={p.y} r="3.2" fill="#ff8fc7" />
                  <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fill="#ffd3ea">{n.label}</text>
                </g>
              );
            })}

            <circle cx="200" cy="200" r="55" fill="url(#core)" />
            <circle className="krypton-brain-pulse" cx="200" cy="200" r="34" fill="none" stroke="#ffd3ea" strokeWidth="1.4" filter="url(#glow)" />
          </svg>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="k-glass-card rounded-2xl p-4 text-xs leading-6 text-white/70">
            <p className="text-white/85">Módulos</p>
            Core · Health · Tools · Code · Platform · Sentinel
          </div>
          <div className="k-glass-card rounded-2xl p-4 text-xs leading-6 text-white/70">
            <p className="text-white/85">Cadena de IA</p>
            Gemini → DeepSeek → Groq → OpenRouter → OpenAI
          </div>
        </div>

        <Link href="/platform" className="mt-8 block text-center text-xs text-white/55 underline">Volver a Platform</Link>
      </section>
    </KryptonShell>
  );
}
