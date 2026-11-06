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

function buildMesh(n: number, cx: number, cy: number, rx: number, ry: number, seed: number) {
  const rnd = prng(seed);
  const nodes: Node[] = Array.from({ length: n }, () => {
    const a = rnd() * Math.PI * 2;
    const r = Math.sqrt(rnd());
    return { x: cx + Math.cos(a) * rx * r, y: cy + Math.sin(a) * ry * r };
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

const BRAIN =
  "M70,228 C55,188 65,148 100,128 C120,116 150,108 175,113 C190,98 225,93 250,106 C275,88 310,103 320,133 C345,143 355,173 335,193 C355,208 350,238 325,243 C340,263 325,288 295,283 C300,303 270,313 250,296 C245,313 215,316 200,298 C180,313 155,306 150,286 C125,293 100,278 100,256 C80,260 65,248 70,228 Z";
const CEREBELLUM = "M300,228 C320,223 345,233 345,253 C345,273 320,283 300,273 C290,263 288,243 300,228 Z";
const STEM = "M298,270 C305,280 300,295 295,303 C290,295 292,280 298,270 Z";

export default function CerebroPage() {
  const { nodes, edges } = useMemo(() => buildMesh(70, 205, 195, 140, 95, 7), []);
  const [deg, setDeg] = useState(14);
  const [now, setNow] = useState("");
  const drag = useRef<{ x: number; start: number } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().toLocaleTimeString("es-VE")), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      if (!drag.current) setDeg((d) => d + 0.06);
    }, 60);
    return () => clearInterval(t);
  }, []);

  function onDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: deg };
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    setDeg(drag.current.start + (e.clientX - drag.current.x) * 0.6);
  }
  function onUp() {
    drag.current = null;
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-2xl px-1 pb-10 pt-4">
        <p className="krypton-eyebrow">KRYPTON PLATFORM</p>
        <h1 className="mt-2 text-2xl font-light">Cerebro de Krypton</h1>
        <p className="mt-2 text-sm text-white/60">Arrástralo para girarlo en 3D. Vista de exhibición.</p>

        <div className="krypton-brain-wrap relative mt-6 overflow-hidden rounded-3xl border border-white/15 bg-black p-2">
          <span className="absolute left-4 top-3 z-10 flex items-center gap-2 text-[10px] tracking-widest text-pink-200/80">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-400" /> CORTEX · EN VIVO
          </span>

          <div
            className="relative mx-auto touch-none select-none"
            style={{ perspective: 900 }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          >
            <svg viewBox="0 0 400 400" className="mx-auto block w-full max-w-md">
              <circle cx="200" cy="200" r="192" fill="none" stroke="#ff2d8a30" strokeWidth="1" />
              {Array.from({ length: 80 }).map((_, i) => {
                const a = (i * 4.5 * Math.PI) / 180;
                const x1 = 200 + Math.cos(a) * 180, y1 = 200 + Math.sin(a) * 180;
                const x2 = 200 + Math.cos(a) * 192, y2 = 200 + Math.sin(a) * 192;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ff2d8a50" strokeWidth={i % 10 === 0 ? 1.6 : 0.8} />;
              })}
            </svg>

            <div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d", transform: "rotateY(" + deg + "deg)" }}
            >
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ transform: "translateZ(-26px) scale(.92)", opacity: 0.55 }}>
                <path d={BRAIN} fill="#8a0030" />
                <path d={CEREBELLUM} fill="#8a0030" />
              </svg>

              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ transform: "translateZ(24px)" }}>
                <defs>
                  <clipPath id="brainClip">
                    <path d={BRAIN} />
                    <path d={CEREBELLUM} />
                    <path d={STEM} />
                  </clipPath>
                  <radialGradient id="glowC" cx="38%" cy="38%" r="60%">
                    <stop offset="0%" stopColor="#ff8fc7" stopOpacity=".9" />
                    <stop offset="100%" stopColor="#ff2d8a" stopOpacity="0" />
                  </radialGradient>
                  <filter id="tex" x="-40%" y="-40%" width="180%" height="180%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05 0.08" numOctaves="3" seed="6" result="n" />
                    <feDiffuseLighting in="n" lightingColor="#ff6fb4" surfaceScale="2.4" result="lit">
                      <feDistantLight azimuth="235" elevation="55" />
                    </feDiffuseLighting>
                    <feComposite in="lit" in2="SourceGraphic" operator="in" />
                  </filter>
                </defs>

                <g clipPath="url(#brainClip)">
                  <rect x="0" y="0" width="400" height="400" fill="#2a0014" />
                  <rect x="0" y="0" width="400" height="400" filter="url(#tex)" />
                  <rect x="0" y="0" width="400" height="400" fill="url(#glowC)" />
                  {edges.map(([a, b], i) => (
                    <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke="#ffd3ea" strokeOpacity=".32" strokeWidth="0.6" />
                  ))}
                  {nodes.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={i % 7 === 0 ? 2.2 : 1.2} fill="#ffe3f1" opacity={i % 7 === 0 ? 1 : 0.7} />
                  ))}
                </g>
                <path d={BRAIN} fill="none" stroke="#ff8fc7" strokeOpacity=".7" strokeWidth="1.3" />
                <path d={CEREBELLUM} fill="none" stroke="#ff8fc7" strokeOpacity=".7" strokeWidth="1" />
                <path d="M150,120 C165,150 170,180 155,210" fill="none" stroke="#ffd3ea" strokeOpacity=".4" strokeWidth="1" />
              </svg>
            </div>
          </div>
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

        <Link href="/platform" className="mt-8 block text-center text-xs text-white/55 underline">Volver a Platform</Link>
      </section>
    </KryptonShell>
  );
}
