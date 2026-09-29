"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

export default function VisionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  }

  return (
    <AppShell active="vision">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col">
        <header className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">
            Krypton Vision
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Ve. Analiza. Comprende.
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Sube una imagen para preparar su análisis con inteligencia
            artificial multimodal.
          </p>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="k-glass-panel flex min-h-[480px] flex-col p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-white">
                  Imagen para analizar
                </h2>
                <p className="mt-1 text-xs text-white/40">
                  JPG, PNG, WEBP y otros formatos compatibles.
                </p>
              </div>

              <span className="rounded-full border border-cyan-200/15 bg-cyan-200/5 px-3 py-1 text-[10px] uppercase tracking-wider text-cyan-100/60">
                Vision AI
              </span>
            </div>

            <label className="group relative flex flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-3xl border border-dashed border-white/15 bg-black/15 transition hover:border-cyan-200/30 hover:bg-cyan-200/[0.03]">
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="sr-only"
              />

              <div className="relative z-10 px-6 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-2xl text-cyan-100/70 shadow-[0_0_40px_rgba(60,210,255,0.08)]">
                  ◇
                </div>

                <h3 className="text-base font-medium text-white">
                  {selectedFile
                    ? selectedFile.name
                    : "Selecciona una imagen"}
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                  Toca aquí para seleccionar una imagen desde tu dispositivo.
                </p>

                <span className="mt-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60 transition group-hover:bg-white/10">
                  Explorar archivos
                </span>
              </div>

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(60,210,255,0.08),transparent_55%)]" />
            </label>
          </section>

          <section className="k-glass-panel flex min-h-[480px] flex-col p-4 sm:p-6">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">
                Resultado
              </p>

              <h2 className="mt-2 text-xl font-medium text-white">
                Análisis de Krypton
              </h2>
            </div>

            <div className="flex flex-1 items-center justify-center rounded-3xl border border-white/10 bg-black/15 p-6 text-center">
              <div>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-200/5 text-xl text-cyan-100/40">
                  ✦
                </div>

                <p className="text-sm text-white/50">
                  {selectedFile
                    ? "La imagen está preparada para el análisis."
                    : "El resultado del análisis aparecerá aquí."}
                </p>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-white/25">
                  La conexión con los modelos de visión se añadirá después de
                  completar toda la interfaz.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
