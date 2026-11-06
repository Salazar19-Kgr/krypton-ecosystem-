"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Node = { x: number; y: number };

function buildMesh(n: number, rx: number, ry: number, seed: number) {
  const rnd = prng(seed);
  const nodes: Node[] = Array.from({ length: n }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd());
    return { x: Math.cos(a) * rx * r, y: Math.sin(a) * ry * r };
  });
  const edges: [number, number][] = [];
  nodes.forEach((p, i) => {
    const dists = nodes
      .map((q, j) => ({ j, d: (q.x - p.x) ** 2 + (q.y - p.y) ** 2 }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    dists.forEach((o) => edges.push([i, o.j]));
  });
  return { nodes, edges };
}

const LINKS = [
  { label: "Core", href: "/chat" },
  { label: "Health", href: "/health" },
  { label: "Tools", href: "/tools" },
  { label: "Sentinel", href: "/sentinel" },
  { label: "Platform", href: "/platform" },
  { label: "Panel", href: "/dashboard" },
];

export default function CerebroPage() {
  const { nodes, edges } = useMemo(() => buildMesh(54, 150, 96, 7), []);
  const [deg, setDeg] = useState(0);
  const [now, setNow] = useState("");
  const drag = useRef<{ x: number; start: number } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleTimeString("es-VE")), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDeg((d) => d + 0.04), 60);
    return () => clearInterval(t);
  }, []);

  function onDown(e: React.PointerEvent<SVGSVGElement>) {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: deg };
  }
  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!drag.current) return;
    setDeg(drag.current.start + (e.clientX - drag.current.x) * 0.5);
  }
  function onUp() {
    drag.current = null;
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-2xl px-1 pb-10 pt-4">
        <p className="krypton-eyebrow">KRYPTON PLATFORM</p>
        <h1 className="mt-2 text-2xl font-light">Cerebro de Krypton</h1>
        <p className="mt-2 text-sm text-white/60">Arrástralo para girarlo. Vista de exhibición.</p>

        <div className="krypton-brain-wrap relative mt-6 overflow-hidden rounded-3xl border border-white/15 bg-black p-2">
          <span className="absolute left-4 top-3 z-10 flex items-center gap-2 text-[10px] tracking-widest text-pink-200/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" /> CORTEX · EN VIVO
          </span>
          <svg
            viewBox="0 0 400 400"
            className="mx-auto block w-full max-w-md touch-none"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            <defs>
              <radialGradient id="glowC" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff2d8a" stopOpacity=".85" />
                <stop offset="100%" stopColor="#ff2d8a" stopOpacity="0" />
              </radialGradient>
              <filter id="tex" x="-40%" y="-40%" width="180%" height="180%">
                <feTurbulence type="fractalNoise" baseFrequency="0.028 0.05" numOctaves="3" seed="6" result="n" />
                <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.08  0 0 0 0 0.52  0 0 0 1 0" result="tint" />
                <feComposite in="tint" in2="SourceGraphic" operator="in" />
              </filter>
              <filter id="soft"><feGaussianBlur stdDeviation="3" /></filter>
            </defs>

            <circle cx="200" cy="200" r="192" fill="none" stroke="#ff2d8a30" strokeWidth="1" />
            {Array.from({ length: 80 }).map((_, i) => {
              const a = ((i * 4.5 + deg * 2) * Math.PI) / 180;
              const x1 = 200 + Math.cos(a) * 180, y1 = 200 + Math.sin(a) * 180;
              const x2 = 200 + Math.cos(a) * 192, y2 = 200 + Math.sin(a) * 192;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff2d8a50" strokeWidth={i % 10 === 0 ? 1.6 : 0.8} />;
            })}

            <g transform={"translate(200 200) rotate(" + deg + ")"}>
              <ellipse rx="160" ry="105" fill="#ff2d8a22" filter="url(#soft)" />
              <ellipse rx="150" ry="96" fill="#000" filter="url(#tex)" />
              <ellipse rx="150" ry="96" fill="none" stroke="#ff8fc755" strokeWidth="1" />
              {edges.map(([a, b], i) => (
                <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#ffd3ea" strokeOpacity=".3" strokeWidth="0.6" />
              ))}
              {nodes.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={i % 7 === 0 ? 2.4 : 1.3} fill="#ffe3f1" opacity={i % 7 === 0 ? 1 : 0.75} />
              ))}
              <circle r="30" fill="url(#glowC)" className="krypton-brain-pulse" />
            </g>
          </svg>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="k-glass-card rounded-2xl p-4">
            <p className="text-xs text-white/55">Pulso · Cortex</p>
            <svg viewBox="0 0 160 36" className="mt-2 h-9 w-full">
              <path d="M0 18 H50 L58 4 L66 32 L74 10 L82 18 H160" fill="none" stroke="#ff8fc7" strokeWidth="1.6" className="krypton-brain-trace" />
            </svg>
          </div>
          <div className="k-glass-card rounded-2xl p-4">
            <p className="text-xs text-white/55">Reloj del núcleo</p>
            <p className="mt-2 font-mono text-lg text-pink-100">{now || "--:--:--"}</p>
          </div>
        </div>

        <div className="k-glass-card mt-3 rounded-2xl p-4">
          <p className="text-xs text-white/55">Accesos rápidos</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl border border-pink-300/30 py-2 text-center text-xs text-pink-100 hover:bg-pink-400/10">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/platform" className="mt-8 block text-center text-xs text-white/55 underline">Volver a Platform</Link>
      </section>
    </KryptonShell>
  );
}
