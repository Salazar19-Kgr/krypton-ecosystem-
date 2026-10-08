"use client";
import { useEffect, useRef } from "react";

const gauss = (p: number, c: number, w: number, a: number) =>
  a * Math.exp(-((p - c) ** 2) / (2 * w * w));
const beat = (p: number) =>
  gauss(p, 0.12, 0.025, 0.14) +
  gauss(p, 0.27, 0.008, -0.16) +
  gauss(p, 0.3, 0.011, 1) +
  gauss(p, 0.335, 0.01, -0.32) +
  gauss(p, 0.55, 0.045, 0.24);

export default function EcgPulse({
  height = 140,
  color = "#e4e8ff",
  glow = "#8c98ff",
}: {
  height?: number;
  color?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let raf = 0;
    let last = 0;
    let ys = new Float32Array(0);
    let cursor = 0;
    let phase = 0;
    let acc = 0;
    const mid = height * 0.55;
    const amp = height * 0.42;
    const speed = 220;
    const beatPx = 190;
    const gap = 26;

    const advance = (px: number) => {
      for (let i = 0; i < px; i++) {
        ys[cursor] = mid - beat(phase) * amp + (Math.random() - 0.5) * 0.8;
        phase += 1 / beatPx;
        if (phase >= 1) phase -= 1;
        cursor = (cursor + 1) % w;
      }
    };

    const strokeBand = (a0: number, a1: number, alpha: number, blur: number) => {
      ctx.beginPath();
      let prevX = -1;
      let started = false;
      for (let a = a0; a < a1; a++) {
        const x = (cursor - 1 - a + w * 2) % w;
        const y = ys[x];
        if (!started || x > prevX) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
        prevX = x;
      }
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = blur;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, height);
      ctx.lineWidth = 2.4;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.shadowColor = glow;
      const total = w - gap;
      strokeBand(Math.floor(total * 0.45) - 1, total, 0.3, 0);
      strokeBand(70 - 1, Math.floor(total * 0.45), 0.6, 4);
      strokeBand(0, 70, 1, 14);
      const x = (cursor - 1 + w) % w;
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, ys[x], 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      acc += speed * dt;
      const px = Math.floor(acc);
      acc -= px;
      if (px > 0) advance(px);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(60, Math.floor(canvas.clientWidth));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ys = new Float32Array(w).fill(mid);
      cursor = 0;
      phase = 0;
      if (reduce) {
        advance(w);
        draw();
      }
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else if (!reduce) start();
    };

    setup();
    const ro = new ResizeObserver(() => {
      setup();
      if (!reduce) start();
    });
    ro.observe(canvas);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) start();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [height, color, glow]);

  return <canvas ref={ref} aria-hidden="true" style={{ width: "100%", height }} />;
}
