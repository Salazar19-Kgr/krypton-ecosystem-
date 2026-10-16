"use client";

import { useEffect, useRef } from "react";
import { startSky } from "@/lib/ui/sky";

/** Fondo del chat: nebulosa, constelaciones animadas y estrellas. Reemplaza el agua solo en el chat. */
export default function ChatSky() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("k-sky");
    const stop = canvas.current ? startSky(canvas.current) : () => {};
    return () => {
      stop();
      document.documentElement.classList.remove("k-sky");
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
