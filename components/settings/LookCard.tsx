"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { applyLook, readLook } from "@/lib/ui/motion";

type Info = { version: string; apk: string; apkSizeMB: number };

/** Tarjetas de Configuración: brillo del fondo y de la interfaz, y descarga de la app. */
export default function LookCard() {
  const [bg, setBg] = useState(100);
  const [ui, setUi] = useState(100);
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    const look = readLook();
    setBg(look.bg);
    setUi(look.ui);
    fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  function change(nextBg: number, nextUi: number) {
    setBg(nextBg);
    setUi(nextUi);
    applyLook(nextBg, nextUi);
  }

  const fillBg = { "--fill": `${((bg - 50) / 50) * 100}%` } as CSSProperties;
  const fillUi = { "--fill": `${((ui - 100) / 40) * 100}%` } as CSSProperties;

  return (
    <>
      <div className="k-glass-card rounded-3xl p-6">
        <p className="krypton-eyebrow">BRILLO</p>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Baja el brillo del fondo y sube el de la interfaz para leer mejor.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span>Brillo del fondo</span>
            <span className="text-white/80">{bg}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={1}
            value={bg}
            onChange={(e) => change(Number(e.target.value), ui)}
            className="krypton-range mt-3"
            style={fillBg}
            aria-label="Brillo del fondo"
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span>Brillo de la interfaz</span>
            <span className="text-white/80">{ui === 100 ? "Normal" : `+${ui - 100}%`}</span>
          </div>
          <input
            type="range"
            min={100}
            max={140}
            step={1}
            value={ui}
            onChange={(e) => change(bg, Number(e.target.value))}
            className="krypton-range mt-3"
            style={fillUi}
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
        <h2 className="mt-3 text-lg font-medium">Krypton para Android</h2>
        {info?.apk ? (
          <>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Versión {info.version}
              {info.apkSizeMB ? ` · ${info.apkSizeMB} MB` : ""}. Se actualiza sola cuando publicamos mejoras.
            </p>
            <a href={info.apk} download className="k-glass-button mt-5 inline-flex rounded-full px-5 py-2.5 text-sm">
              Descargar APK
            </a>
          </>
        ) : (
          <p className="mt-2 text-sm leading-6 text-white/75">El APK estará disponible muy pronto.</p>
        )}
        <p className="mt-4 text-xs text-white/70">
          <Link href="/download" className="underline underline-offset-4">
            Más opciones de instalación
          </Link>
        </p>
      </div>
    </>
  );
}
