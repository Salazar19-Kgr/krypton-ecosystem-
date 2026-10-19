"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InstallButton from "@/components/app/InstallButton";

type Info = { version: string; build: number; notes: string; apk: string; apkSizeMB: number };

export default function DownloadPage() {
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then(setInfo)
      .catch(() => {});
  }, []);

  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-5 py-8 text-white">
      <div className="relative z-10 mx-auto max-w-3xl">
        <Link href="/" className="k-glass-button inline-flex rounded-full px-5 py-2.5 text-sm">
          Krypton Ecosystem
        </Link>

        <p className="krypton-eyebrow mt-10">DESCARGAR</p>
        <h1 className="mt-4 text-4xl font-light sm:text-5xl">Lleva Krypton en tu teléfono</h1>
        <p className="mt-4 text-sm leading-7 text-white/80">
          La app se actualiza sola: cada mejora que publicamos llega a tu teléfono sin que tengas que descargar nada otra vez.
        </p>

        <div className="mt-8 space-y-4">
          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">RECOMENDADO</p>
            <h2 className="mt-3 text-lg font-medium">Instalar desde el navegador</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Funciona en Android y iPhone, no pesa casi nada y siempre abre la versión más nueva.
            </p>
            <InstallButton />
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">ANDROID</p>
            <h2 className="mt-3 text-lg font-medium">Descargar el APK</h2>
            {info?.apk ? (
              <>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Versión {info.version}
                  {info.apkSizeMB ? ` · ${info.apkSizeMB} MB` : ""}
                  {info.notes ? ` · ${info.notes}` : ""}
                </p>
                <a href={info.apk} download className="k-glass-button mt-5 inline-flex rounded-full px-5 py-2.5 text-sm">
                  Descargar APK
                </a>
              </>
            ) : (
              <p className="mt-2 text-sm leading-6 text-white/75">El APK estará disponible muy pronto.</p>
            )}
            <ol className="mt-5 list-decimal space-y-1 pl-5 text-sm leading-6 text-white/75">
              <li>Descarga el archivo y ábrelo.</li>
              <li>Si Android lo pide, permite «Instalar apps desconocidas» para tu navegador.</li>
              <li>Abre Krypton e inicia sesión con Google.</li>
            </ol>
          </div>
        </div>

        <p className="mt-6 flex flex-wrap gap-4 pb-6 text-sm text-white/80">
          <Link href="/terms" className="underline underline-offset-4">
            Términos y condiciones
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            Política de privacidad
          </Link>
        </p>
      </div>
    </main>
  );
}
