"use client";

import { useState } from "react";
import { cleanDocText, markdownToPdf, outlineOf, titleOf } from "@/lib/docs/mdpdf";
import { downloadBlob } from "@/lib/docs/imgpdf";

export default function DocCard({ md }: { md: string }) {
  const clean = cleanDocText(md);
  const title = titleOf(clean);
  const items = outlineOf(clean);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  async function download() {
    setBusy(true);
    setErr("");
    try {
      const blob = await markdownToPdf(clean, title);
      const name =
        title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
          .slice(0, 60) || "documento";
      downloadBlob(blob, name + ".pdf");
    } catch {
      setErr("No pude crear el PDF. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="my-1">
      <p className="flex items-center gap-3 text-base font-semibold">
        <span aria-hidden className="inline-block h-7 w-5 rounded-sm bg-red-500" />
        Tu PDF está listo.
      </p>
      <div className="mt-3 rounded-3xl border border-white/20 p-4">
        <p className="text-base font-semibold">{title}</p>
        {items.length > 0 && (
          <>
            <p className="mt-3 text-sm text-white/70">Incluye:</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-white/85">
              {items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-black disabled:opacity-60"
        >
          {busy ? "Creando el PDF…" : "↓ Descargar PDF"}
        </button>
        {err && <p className="mt-2 text-xs text-red-200">{err}</p>}
      </div>
      <button type="button" onClick={() => setOpen(!open)} className="mt-2 text-xs text-white/50 underline">
        {open ? "Ocultar el texto" : "Ver el texto"}
      </button>
      {open && <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-white/70">{clean}</pre>}
    </div>
  );
}
