"use client";

import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";

const TOOLS = [
  "Contador de palabras",
  "Conversor de formatos",
  "Limpieza de texto",
  "Comparador de textos",
  "Extractor de texto",
  "OCR",
  "Archivos",
  "PDF a imágenes",
  "Imágenes a PDF",
  "Unir PDFs",
  "Dividir PDFs",
  "Comprimir archivos",
  "Convertir documentos",
];

export default function DashboardPage() {
  return (
    <KryptonShell>
      <section className="mx-auto max-w-5xl py-10">
        <p className="krypton-eyebrow">KRYPTON ECOSYSTEM</p>
        <h1 className="mt-5 text-4xl font-light sm:text-6xl">
          Tu espacio inteligente.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
          Conversa, analiza, busca información y trabaja con Krypton desde un
          único espacio.
        </p>

        <div className="k-glass-panel mt-10 rounded-[2rem] p-6 sm:p-8">
          <p className="krypton-eyebrow">ESPACIO DE TRABAJO</p>
          <h2 className="mt-4 text-xl font-semibold">¿Qué quieres hacer?</h2>
          <p className="mt-2 text-sm text-white/75">
            Explícale directamente a Krypton lo que necesitas.
          </p>
          <Link
            href="/chat"
            className="k-glass-button mt-6 flex w-full items-center justify-center rounded-full px-6 py-4 text-sm"
          >
            Nueva conversación <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="mt-12 flex items-end justify-between">
          <div>
            <p className="krypton-eyebrow">TU ECOSISTEMA</p>
            <h2 className="mt-3 text-2xl font-semibold">Continuar</h2>
          </div>
          <Link href="/memory" className="text-sm text-white/75">
            Ver conversaciones →
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/chat" className="k-glass-card block rounded-3xl p-6">
            <h3 className="text-lg font-medium">Nueva conversación</h3>
            <p className="mt-2 text-sm text-white/75">
              Comienza algo nuevo con Krypton.
            </p>
            <p className="mt-6 text-xs text-white/70">Abrir →</p>
          </Link>

          <Link href="/memory" className="k-glass-card block rounded-3xl p-6">
            <h3 className="text-lg font-medium">Continuar conversación</h3>
            <p className="mt-2 text-sm text-white/75">
              Retoma una conversación anterior.
            </p>
            <p className="mt-6 text-xs text-white/70">Abrir →</p>
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="k-glass-card rounded-3xl p-5">
            <p className="krypton-eyebrow">SESIÓN</p>
            <p className="mt-3 font-medium">Activa</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Tu cuenta de Google ya está conectada.
            </p>
          </div>

          <div className="k-glass-card rounded-3xl p-5">
            <p className="krypton-eyebrow">MEMORIA</p>
            <p className="mt-3 font-medium">Activa</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Tus conversaciones se guardan en tu historial.
            </p>
          </div>

          <div className="k-glass-card rounded-3xl p-5">
            <p className="krypton-eyebrow">KRYPTON CORE</p>
            <p className="mt-3 font-medium">Activo</p>
            <p className="mt-1 text-xs leading-5 text-white/70">
              Texto, imágenes, búsqueda, refrigeración y matemáticas.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="k-glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="krypton-eyebrow">KRYPTON HEALTH</p>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-wide">
                Próximamente
              </span>
            </div>
            <h3 className="mt-4 text-lg font-medium">Médico general</h3>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Usará el cerebro de Krypton Ecosystem como herramienta para sus
              usuarios y pacientes.
            </p>
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <p className="krypton-eyebrow">KRYPTON TOOLS</p>
              <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-wide">
                Próximamente
              </span>
            </div>
            <h3 className="mt-4 text-lg font-medium">Herramientas</h3>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Usará el cerebro de Krypton Ecosystem para ofrecer herramientas
              al usuario.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TOOLS.map((tool) => (
                <span
                  key={tool}
                  className="rounded-full bg-white/10 px-3 py-1 text-[11px]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </KryptonShell>
  );
}
