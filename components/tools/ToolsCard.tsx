"use client";

import { useState } from "react";
import Link from "next/link";

const CHIPS = ["Redactar", "Corregir", "Traducir", "Resumir", "Extraer datos", "Texto a tabla", "Crear PDF", "Leer PDF y fotos"];

const TEETH = Array.from({ length: 8 }, (_, i) => {
  const a = (i * Math.PI) / 4;
  return { x1: Math.cos(a) * 14, y1: Math.sin(a) * 14, x2: Math.cos(a) * 21, y2: Math.sin(a) * 21 };
});

const CSS = `
.tl-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);background-size:32px 32px;}
.tl-modal{animation:tl-pop .35s cubic-bezier(.2,.9,.25,1.15) both}
@keyframes tl-pop{from{opacity:0;transform:translateY(18px) scale(.96)}to{opacity:1;transform:none}}
.tl-line{transform-box:fill-box;transform-origin:left center;animation:tl-grow 2.4s ease-in-out infinite}
.tl-line:nth-child(2){animation-delay:.35s}
.tl-line:nth-child(3){animation-delay:.7s}
.tl-line:nth-child(4){animation-delay:1.05s}
@keyframes tl-grow{0%{transform:scaleX(0);opacity:.3}45%,80%{transform:scaleX(1);opacity:1}100%{transform:scaleX(1);opacity:0}}
.tl-gear{transform-box:fill-box;transform-origin:center;animation:tl-spin 6s linear infinite}
@keyframes tl-spin{to{transform:rotate(360deg)}}
`;

export default function ToolsCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="k-glass-card block w-full rounded-3xl p-6 text-left">
        <div className="flex items-center justify-between">
          <p className="krypton-eyebrow">KRYPTON TOOLS</p>
          <span className="rounded-full bg-cyan-200/25 px-3 py-1 text-[10px] tracking-wide">Activo</span>
        </div>
        <h3 className="mt-4 text-lg font-medium">Máquina de trabajo</h3>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Pide lo que necesites: redacta, corrige, traduce, lee archivos y crea documentos.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <span key={c} className="rounded-full bg-white/10 px-3 py-1 text-[11px]">{c}</span>
          ))}
        </div>
        <p className="mt-5 text-xs text-white/70">Abrir →</p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          onClick={() => setOpen(false)}
        >
          <style>{CSS}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            className="tl-modal relative w-full max-w-md overflow-hidden rounded-[2rem] p-6 text-white"
            style={{ background: "linear-gradient(150deg,#0e7490 0%,#1d4ed8 55%,#6d28d9 100%)", border: "1px solid rgba(255,255,255,.35)" }}
          >
            <div className="tl-grid" aria-hidden />
            <p className="relative text-xs tracking-[.3em] text-white/70">KRYPTON TOOLS</p>
            <h2 className="relative mt-2 text-3xl font-semibold">Máquina de trabajo</h2>
            <svg viewBox="0 0 240 90" className="relative mt-4 h-24 w-full" aria-hidden>
              <g fill="rgba(255,255,255,.85)">
                <rect className="tl-line" x="16" y="12" width="110" height="7" rx="3.5" />
                <rect className="tl-line" x="16" y="30" width="150" height="7" rx="3.5" />
                <rect className="tl-line" x="16" y="48" width="120" height="7" rx="3.5" />
                <rect className="tl-line" x="16" y="66" width="80" height="7" rx="3.5" />
              </g>
              <g transform="translate(200 45)">
                <g className="tl-gear" stroke="rgba(255,255,255,.9)" strokeWidth="3.5" strokeLinecap="round" fill="none">
                  <circle r="13" />
                  <circle r="4.5" />
                  {TEETH.map((t, i) => (
                    <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
                  ))}
                </g>
              </g>
            </svg>
            <p className="relative mt-3 text-base leading-7">
              Pídele lo que necesites y Krypton lo ejecuta: redacta, corrige, traduce, resume, convierte y crea documentos en PDF.
              Lee tus fotos, PDF y archivos.
            </p>
            <p className="relative mt-2 text-sm leading-6 text-white/65">
              Usa el cerebro de Krypton Core. Revisa siempre los resultados importantes.
            </p>
            <div className="relative mt-6 flex gap-3">
              <Link href="/tools" className="flex-1 rounded-full bg-white px-5 py-3 text-center text-sm font-medium text-indigo-900">
                Entrar
              </Link>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-white/45 px-6 py-3 text-sm">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
