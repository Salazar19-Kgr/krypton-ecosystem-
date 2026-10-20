"use client";

import { useEffect, useRef } from "react";
import { startSky } from "@/lib/ui/sky";

/** Fondo del chat (nebulosa y constelaciones) y ajuste al teclado. Reemplaza el agua solo en el chat. */
export default function ChatSky() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("k-sky");
    const stop = canvas.current ? startSky(canvas.current) : () => {};

    // Teclado: el chat se ajusta a la parte visible de la pantalla
    const meta = document.querySelector('meta[name="viewport"]');
    const original = meta?.getAttribute("content") ?? "";
    if (meta && !original.includes("interactive-widget")) {
      meta.setAttribute(
        "content",
        `${original || "width=device-width, initial-scale=1"}, interactive-widget=resizes-content`
      );
    }

    const vv = window.visualViewport;
    const base = Math.max(window.innerHeight, vv?.height ?? 0);
    let lastHeight = -1;
    let pending = 0;

    // se aplica una sola vez por cuadro y solo si la altura cambió (escribir no debe provocar recálculos)
    const apply = () => {
      pending = 0;
      const h = Math.round(vv?.height ?? window.innerHeight);
      if (h !== lastHeight) {
        lastHeight = h;
        root.style.setProperty("--vvh", `${h}px`);
        root.classList.toggle("k-kb", base - h > 120);
      }
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };
    const fit = () => {
      if (!pending) pending = requestAnimationFrame(apply);
    };
    apply();
    vv?.addEventListener("resize", fit);
    vv?.addEventListener("scroll", fit);
    window.addEventListener("resize", fit);

    return () => {
      stop();
      cancelAnimationFrame(pending);
      vv?.removeEventListener("resize", fit);
      vv?.removeEventListener("scroll", fit);
      window.removeEventListener("resize", fit);
      if (meta) meta.setAttribute("content", original);
      root.style.removeProperty("--vvh");
      root.classList.remove("k-sky", "k-kb");
    };
  }, []);

  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-base" />
      <div className="sky-nebula" />
      <canvas ref={canvas} className="sky-canvas" />
      <div className="sky-veil" />
    </div>
  );
}
