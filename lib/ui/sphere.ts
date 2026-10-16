type V3 = [number, number, number];

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function startSphere(canvas: HTMLCanvasElement, size: number): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const rand = rng(7);
  const N = 54;
  const pts: V3[] = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * 2.399963;
    let p: V3 = [Math.cos(theta) * r + (rand() - 0.5) * 0.16, y + (rand() - 0.5) * 0.16, Math.sin(theta) * r + (rand() - 0.5) * 0.16];
    const len = Math.hypot(...p);
    p = [p[0] / len, p[1] / len, p[2] / len];
    pts.push(p);
  }

  const edges: [number, number][] = [];
  const seen = new Set<string>();
  pts.forEach((p, i) => {
    pts
      .map((q, j) => ({ j, d: Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (!seen.has(key) && rand() > 0.16) {
          seen.add(key);
          edges.push([Math.min(i, j), Math.max(i, j)]);
        }
      });
  });

  const R = size * 0.44;
  const cx = size / 2;
  const cy = size / 2;
  let raf = 0;
  let last = 0;

  function project(p: V3, a: number, t: number) {
    const x1 = p[0] * Math.cos(a) + p[2] * Math.sin(a);
    const z1 = -p[0] * Math.sin(a) + p[2] * Math.cos(a);
    const y1 = p[1] * Math.cos(t) - z1 * Math.sin(t);
    const z2 = p[1] * Math.sin(t) + z1 * Math.cos(t);
    const k = 1 / (1 - z2 * 0.22);
    return { x: cx + x1 * R * k, y: cy + y1 * R * k, z: z2 };
  }

  function draw(now: number) {
    const c = ctx!;
    c.clearRect(0, 0, size, size);
    const a = now * 0.00032;
    const t = 0.42 + Math.sin(now * 0.0003) * 0.1;
    const q = pts.map((p) => project(p, a, t));

    c.lineWidth = 0.8;
    c.strokeStyle = "#fff0f8";
    for (const [i, j] of edges) {
      const depth = (q[i].z + q[j].z) / 2;
      c.globalAlpha = 0.16 + 0.55 * ((depth + 1) / 2);
      c.beginPath();
      c.moveTo(q[i].x, q[i].y);
      c.lineTo(q[j].x, q[j].y);
      c.stroke();
    }

    c.fillStyle = "#fff";
    q.forEach((p, i) => {
      const depth = (p.z + 1) / 2;
      const pulse = i % 7 === 0 ? 1 + 0.5 * Math.sin(now * 0.004 + i) : 1;
      c.globalAlpha = 0.35 + 0.65 * depth;
      c.beginPath();
      c.arc(p.x, p.y, (0.7 + 1.3 * depth) * pulse, 0, 6.2832);
      c.fill();
    });
    c.globalAlpha = 1;
  }

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (now - last < 32) return;
    last = now;
    if (document.hidden || root.classList.contains("k-scrolling")) return;
    if (root.classList.contains("k-lite")) {
      draw(now);
      cancelAnimationFrame(raf);
      return;
    }
    draw(now);
  }

  if (reduced) draw(2000);
  else raf = requestAnimationFrame(loop);

  return () => cancelAnimationFrame(raf);
}
