"use client";

import { useEffect, useRef } from "react";
import { startSphere } from "@/lib/ui/sphere";

export default function NetworkSphere({ size = 68 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return ref.current ? startSphere(ref.current, size) : undefined;
  }, [size]);

  return (
    <canvas
      ref={ref}
      className="krypton-sphere"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
