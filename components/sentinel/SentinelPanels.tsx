"use client";

import type { ReactNode } from "react";

export function Card({ title, badge, children, className = "" }: { title: string; badge?: string; children: ReactNode; className?: string }) {
  return (
    <section className={"k-glass-card rounded-3xl p-4 " + className}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {badge && <span className="rounded-full border border-amber-200/50 px-2 py-0.5 text-[10px] text-amber-100">{badge}</span>}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function Row({ a }: { a: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/60">{a}</span>
      <span className="text-white/80">—</span>
    </div>
  );
}

export function Ring({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-16 w-16 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r="16" fill="none" stroke="#ffffff25" strokeWidth="4" strokeDasharray="3 3" />
      </svg>
      <p className="text-xs text-white/60">{label}</p>
    </div>
  );
}

export function Atom({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden>
      <ellipse cx="50" cy="50" rx="44" ry="16" />
      <ellipse cx="50" cy="50" rx="44" ry="16" transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="50" rx="44" ry="16" transform="rotate(120 50 50)" />
      <circle cx="50" cy="50" r="6" fill="#fff" />
    </svg>
  );
}

export function Globe() {
  const sparks: [number, number][] = [[70, 52], [84, 60], [96, 48], [110, 58], [122, 66], [132, 54], [90, 74], [104, 80], [60, 66]];
  return (
    <svg viewBox="0 0 200 120" className="h-32 w-full" aria-hidden>
      <defs>
        <radialGradient id="kgl" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#6b8fb8" stopOpacity=".9" />
          <stop offset=".55" stopColor="#10243d" />
          <stop offset="1" stopColor="#02060c" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="140" r="120" fill="url(#kgl)" stroke="#ffffff55" />
      <ellipse cx="100" cy="140" rx="60" ry="120" fill="none" stroke="#ffffff25" />
      <ellipse cx="100" cy="140" rx="30" ry="120" fill="none" stroke="#ffffff25" />
      <ellipse cx="100" cy="140" rx="120" ry="40" fill="none" stroke="#ffffff25" />
      <ellipse cx="100" cy="140" rx="120" ry="80" fill="none" stroke="#ffffff25" />
      {sparks.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#f5c451" />
      ))}
    </svg>
  );
}

export function Flights() {
  const dots: ReactNode[] = [];
  for (let y = 0; y < 8; y++) for (let x = 0; x < 20; x++) dots.push(<circle key={x + "-" + y} cx={10 + x * 9} cy={10 + y * 9} r={1.1} fill="#ffffff30" />);
  return (
    <svg viewBox="0 0 200 84" className="h-24 w-full" aria-hidden>
      {dots}
      <path d="M20 60 Q70 5 120 40" fill="none" stroke="#f5c451" strokeDasharray="3 3" />
      <path d="M60 70 Q120 15 180 35" fill="none" stroke="#f5c451" strokeDasharray="3 3" />
    </svg>
  );
}

export function Cams() {
  return (
    <div className="flex h-24 items-center justify-center rounded-2xl border border-white/20 text-xs text-white/50">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="mr-2" aria-hidden>
        <rect x="3" y="7" width="13" height="10" rx="2" />
        <path d="M16 11l5-3v8l-5-3z" />
      </svg>
      Sin señal conectada
    </div>
  );
}
