"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applyLook, readLook } from "@/lib/ui/motion";

/** Tarjetas de Configuración: brillo del fondo y de la interfaz, y descarga de la app. */
export default function LookCard() {
  const [bg, setBg] = useState(100);
  const [ui, setUi] = useState(100);

  useEffect(() => {
    const look = readLook();
    setBg(look.bg);
    setUi(look.ui);
  }, []);

  function change(nextBg: number, nextUi: number) {
    setBg(nextBg);
    setUi(nextUi);
    applyLook(nextBg, nextUi);
  }

  return (
    <>
      <div className="k-glass-card rounded-3xl p-6">
        <p className="krypton-eyebrow">BRILLO</p>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Baja el brillo del fondo y sube el de la interfaz para leer mejor.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span>Fondo</span>
            <span className="text-white/80">{bg}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={bg}
            onChange={(e) => change(Number(e.target.value), ui)}
            className="krypton-range mt-2"
            aria-label="Brillo del fondo"
          />
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span>Interfaz</span>
            <span className="text-white/80">{ui}%</span>
          </div>
          <input
            type="range"
            min={100}
            max={140}
            step={1}
            value={ui}
            onChange={(e) => change(bg, Number(e.target.value))}
            className="krypton-range mt-2"
            aria-label="Brillo de la interfaz"
          />
        </div>

        <button
          type="button"
          onClick={() => change(100, 100)}
          className="k-glass-button mt-6 rounded-full px-5 py-2.5 text-sm"
        >
          Restablecer
        </button>
      </div>

      <div className="k-glass-card rounded-3xl p-6">
        <p className="krypton-eyebrow">APLICACIÓN</p>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Instala Krypton en tu teléfono. Se actualiza sola cada vez que publicamos mejoras.
        </p>
        <Link href="/download" className="k-glass-button mt-5 inline-flex rounded-full px-5 py-2.5 text-sm">
          Descargar la app
        </Link>
      </div>
    </>
  );
}
