"use client";

import { useEffect } from "react";
import { readMotion, readLook, applyLook } from "@/lib/ui/motion";

/**
 * Aplica la preferencia de animaciones de Configuración.
 * Activadas: siempre en movimiento. Desactivadas: modo ligero. Automático: se reduce solo si hace falta.
 * También pausa las animaciones mientras haces scroll.
 */
export default function PerformanceGuard() {
  useEffect(() => {
    const root = document.documentElement;
    const mode = readMotion();
    root.classList.toggle("k-motion", mode === "on");
    root.classList.toggle("k-lite", mode === "off");
    const look = readLook();
    applyLook(look.bg, look.ui);

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      root.classList.add("k-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => root.classList.remove("k-scrolling"), 180);
    };
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });

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
    };
  }, []);

  return null;
}
