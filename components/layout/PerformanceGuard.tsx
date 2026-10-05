"use client";

import { useEffect } from "react";

/** Pausa las animaciones al hacer scroll y activa un modo ligero si el teléfono va lento. */
export default function PerformanceGuard() {
  useEffect(() => {
    const root = document.documentElement;

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      root.classList.add("k-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => root.classList.remove("k-scrolling"), 180);
    };
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("k-lite");
      return () => document.removeEventListener("scroll", onScroll, true);
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
      clearTimeout(scrollTimer);
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, []);

  return null;
}
