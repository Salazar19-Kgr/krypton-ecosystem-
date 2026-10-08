"use client";
import Link from "next/link";
import { useEffect } from "react";
import EcgPulse from "./EcgPulse";

export default function HealthIntroModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Krypton Health"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/25 shadow-2xl"
        style={{ background: "linear-gradient(160deg,#2a2f9c 0%,#4a58d8 55%,#2b2f9c 100%)" }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.10) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 90"
          className="kh-heartbeat absolute -left-10 -top-6 w-56 opacity-25"
        >
          <path
            d="M50 85 C10 55 0 30 15 15 C28 3 44 8 50 22 C56 8 72 3 85 15 C100 30 90 55 50 85Z"
            fill="white"
          />
        </svg>
        <div className="relative px-6 pb-6 pt-8 text-white">
          <p className="text-xs tracking-[0.3em] text-white/70">KRYPTON HEALTH</p>
          <h2 className="mt-2 text-2xl font-semibold">Asistente médico general</h2>
          <div className="-mx-6 my-4">
            <EcgPulse height={130} />
          </div>
          <p className="text-base text-white/95">
            Personal, con alta seguridad al responder cualquier pregunta.
          </p>
          <p className="mt-2 text-sm text-white/70">
            Orienta y explica, pero no diagnostica ni reemplaza a un profesional de la salud. Ante
            señales de alarma te indicará buscar atención.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/health"
              className="flex-1 rounded-full bg-white px-5 py-3 text-center font-medium text-[#2a2f9c]"
            >
              Entrar
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/40 px-5 py-3 text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
