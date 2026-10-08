"use client";
import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Plus = { x: number; y: number; vx: number; vy: number; s: number; a: number };

export default function HealthBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let nodes: Node[] = [];
    let pluses: Plus[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      const widthChanged = nw !== w;
      w = nw;
      h = nh;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (nodes.length === 0 || widthChanged) {
        const count = Math.min(70, Math.max(28, Math.floor((w * h) / 14000)));
        nodes = Array.from({ length: count }, () => ({
          x: rand(0, w), y: rand(0, h),
          vx: rand(-14, 14), vy: rand(-14, 14),
          r: rand(1.2, 2.6),
        }));
        pluses = Array.from({ length: 9 }, () => ({
          x: rand(0, w), y: rand(0, h),
          vx: rand(-9, 9), vy: rand(-9, 9),
          s: rand(14, 34), a: rand(0.12, 0.3),
        }));
      }
      if (reduce) draw(0);
    };

    const draw = (dt: number) => {
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#0a8f86");
      g.addColorStop(0.55, "#10b9a0");
      g.addColorStop(1, "#0b6f6a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const rg = ctx.createRadialGradient(w * 0.75, h * 0.2, 0, w * 0.75, h * 0.2, Math.max(w, h) * 0.7);
      rg.addColorStop(0, "rgba(120,255,225,0.28)");
      rg.addColorStop(1, "rgba(120,255,225,0)");
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx * dt;
        n.y += n.vy * dt;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      const maxD = Math.min(150, Math.max(100, w * 0.28));
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(255,255,255,${(1 - d / maxD) * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (const p of pluses) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x > w + p.s) p.x = -p.s;
        if (p.x < -p.s) p.x = w + p.s;
        if (p.y > h + p.s) p.y = -p.s;
        if (p.y < -p.s) p.y = h + p.s;
        ctx.fillStyle = `rgba(235,245,245,${p.a})`;
        ctx.fillRect(p.x - p.s * 0.18, p.y - p.s * 0.5, p.s * 0.36, p.s);
        ctx.fillRect(p.x - p.s * 0.5, p.y - p.s * 0.18, p.s, p.s * 0.36);
      }
    };

    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 0.05);
      last = t;
      draw(dt);
      raf = requestAnimationFrame(loop);
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

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (!reduce) start();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-0" />;
}
