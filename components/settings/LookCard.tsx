"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { applyColor, readColor } from "@/lib/ui/motion";

type Info = { version: string; apk: string; apkSizeMB: number };

/** Tarjetas de Configuración: volumen de color de los fondos y descarga de la app. */
export default function LookCard() {
  const [color, setColor] = useState(90);
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    setColor(readColor());
    fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  function change(next: number) {
    setColor(next);
    applyColor(next);
  }

  const fill = { "--fill": `${((color - 40) / 80) * 100}%` } as CSSProperties;

  return (
    <>
      <div className="k-glass-card rounded-3xl p-6">
        <p className="krypton-eyebrow">COLOR</p>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Ajusta qué tan intenso se ve el color de los fondos. Un valor medio se ve sereno y profesional.
        </p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span>Volumen de color</span>
            <span className="text-white/80">{color}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={120}
            step={1}
            value={color}
            onChange={(e) => change(Number(e.target.value))}
            className="krypton-range mt-3"
            style={fill}
            aria-label="Volumen de color"
          />
          <div className="mt-2 flex justify-between text-xs text-white/65">
            <span>Suave</span>
            <span>Vivo</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => change(90)}
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
