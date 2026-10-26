"use client";

import { useEffect } from "react";
import { applyColor, readColor, readMotion } from "@/lib/ui/motion";

/**
 * Aplica las preferencias de Configuración (animaciones y brillo).
 * Activadas: siempre en movimiento, también al hacer scroll. Desactivadas: modo ligero.
 * Automático: se reduce solo si el teléfono va lento y pausa mientras haces scroll.
 */
export default function PerformanceGuard() {
  useEffect(() => {
    const root = document.documentElement;
    const mode = readMotion();
    root.classList.toggle("k-motion", mode === "on");
    root.classList.toggle("k-lite", mode === "off");

    applyColor(readColor());

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      // con "Activadas" nunca se pausa nada
      if (root.classList.contains("k-motion")) return;
      root.classList.add("k-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => root.classList.remove("k-scrolling"), 180);
    };
    if (mode !== "on") {
      document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    }

    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    if (mode === "auto") {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        root.classList.add("k-lite");
      } else {
        let frames = 0;
        let start = 0;
        const tick = (now: number) => {
          if (!start) start = now;
          frames++;
          if (now - start < 2000) {
            frame = requestAnimationFrame(tick);
            return;
          }
          if ((frames * 1000) / (now - start) < 40) root.classList.add("k-lite");
        };
        timer = setTimeout(() => {
          frame = requestAnimationFrame(tick);
        }, 2500);
      }
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(scrollTimer);
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", onScroll, true);
      root.classList.remove("k-scrolling");
    };
  }, []);

  return null;
}
