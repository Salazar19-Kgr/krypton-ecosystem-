"use client";

import { useEffect } from "react";

/** Si el teléfono va lento, activa el modo ligero (menos efectos) solo. */
export default function PerformanceGuard() {
  useEffect(() => {
    const root = document.documentElement;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("k-lite");
      return;
    }

    let frame = 0;
    let frames = 0;
    let start = 0;

    const tick = (now: number) => {
      if (!start) start = now;
      frames++;
      if (now - start < 2000) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const fps = (frames * 1000) / (now - start);
      if (fps < 40) root.classList.add("k-lite");
    };

    const timer = setTimeout(() => {
      frame = requestAnimationFrame(tick);
    }, 2500);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
