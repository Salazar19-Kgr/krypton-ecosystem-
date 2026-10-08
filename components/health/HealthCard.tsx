"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import HealthIntroModal from "./HealthIntroModal";

export default function HealthCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="k-glass-card block w-full rounded-3xl p-6 text-left"
      >
        <div className="flex items-center justify-between">
          <p className="krypton-eyebrow">KRYPTON HEALTH</p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Beta</span>
        </div>
        <h3 className="mt-4 text-lg font-medium">Médico general</h3>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Asistente médico general, personal y con alta seguridad al responder.
        </p>
        <p className="mt-4 text-sm text-white/80">Abrir →</p>
      </button>
      {open &&
        createPortal(
          <HealthIntroModal open={open} onClose={() => setOpen(false)} />,
          document.body
        )}
    </>
  );
}
