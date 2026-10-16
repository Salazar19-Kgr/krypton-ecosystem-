type Pt = [number, number];
type Constellation = { stars: Pt[]; edges: [number, number][]; seed: number };

// Constelaciones en coordenadas relativas a la pantalla (0 a 1)
const CONSTELLATIONS: Constellation[] = [
  { // Osa Mayor
    stars: [[0.56, 0.17], [0.64, 0.15], [0.72, 0.16], [0.78, 0.2], [0.8, 0.27], [0.7, 0.29], [0.68, 0.23]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]],
    seed: 1,
  },
  { // Casiopea
    stars: [[0.06, 0.52], [0.12, 0.6], [0.19, 0.53], [0.26, 0.61], [0.33, 0.54]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4]],
    seed: 2,
  },
  { // Orión
    stars: [[0.66, 0.5], [0.85, 0.52], [0.72, 0.61], [0.75, 0.6], [0.78, 0.59], [0.68, 0.76], [0.87, 0.75]],
    edges: [[0, 2], [1, 4], [2, 3], [3, 4], [2, 5], [4, 6], [0, 1]],
    seed: 3,
  },
  { // Cisne
    stars: [[0.15, 0.09], [0.15, 0.17], [0.15, 0.27], [0.07, 0.16], [0.24, 0.18]],
    edges: [[0, 1], [1, 2], [3, 1], [1, 4]],
    seed: 4,
  },
  { // Escorpio
    stars: [[0.36, 0.85], [0.42, 0.89], [0.48, 0.92], [0.54, 0.95], [0.6, 0.94], [0.65, 0.9], [0.63, 0.86]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]],
    seed: 5,
  },
  { // Lira
    stars: [[0.44, 0.06], [0.47, 0.12], [0.53, 0.11], [0.5, 0.18], [0.43, 0.17]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]],
    seed: 6,
  },
  { // León
    stars: [[0.07, 0.3], [0.13, 0.26], [0.2, 0.28], [0.22, 0.35], [0.15, 0.38], [0.08, 0.36]],
    edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]],
    seed: 7,
  },
];

function makeGlow() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.18, "rgba(255,226,240,0.85)");
  grad.addColorStop(0.45, "rgba(255,160,210,0.25)");
  grad.addColorStop(1, "rgba(255,120,200,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function startSky(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const glow = makeGlow();

  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.4 + Math.random() * 1.1,
    speed: 0.6 + Math.random() * 1.8,
    phase: Math.random() * 6.28,
    drift: 0.00002 + Math.random() * 0.00005,
  }));

  let width = 0;
  let height = 0;
  let raf = 0;
  let last = 0;
  let shoot = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 };
  let nextShoot = performance.now() + 5000;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now: number, still: boolean) {
    const c = ctx!;
    c.clearRect(0, 0, width, height);

    // estrellas
    for (const s of stars) {
      const tw = still ? 0.7 : 0.45 + 0.45 * Math.sin(now * 0.001 * s.speed + s.phase);
      const x = ((s.x - (still ? 0 : now * s.drift) + 1) % 1) * width;
      c.globalAlpha = clamp(tw, 0.1, 1);
      c.fillStyle = "#ffeaf6";
      c.fillRect(x, s.y * height, s.r, s.r);
    }

    // constelaciones
    for (const k of CONSTELLATIONS) {
      const dx = still ? 0 : Math.sin(now / 9000 + k.seed) * 9;
      const dy = still ? 0 : Math.cos(now / 11000 + k.seed) * 7;
      const u = still ? 0.6 : ((now / 1000 + k.seed * 2.3) % 14) / 14;
      const progress = u < 0.35 ? u / 0.35 : 1;
      const fade = u < 0.8 ? 1 : 1 - (u - 0.8) / 0.2;

      const pts = k.stars.map(([x, y]) => [x * width + dx, y * height + dy] as Pt);

      c.lineCap = "round";
      k.edges.forEach(([a, b], i) => {
        const e = clamp(progress * k.edges.length - i, 0, 1);
        if (e <= 0 || fade <= 0) return;
        const [ax, ay] = pts[a];
        const [bx, by] = pts[b];
        const ex = ax + (bx - ax) * e;
        const ey = ay + (by - ay) * e;
        c.beginPath();
        c.moveTo(ax, ay);
        c.lineTo(ex, ey);
        c.strokeStyle = "rgb(255,150,210)";
        c.globalAlpha = 0.16 * fade;
        c.lineWidth = 3;
        c.stroke();
        c.strokeStyle = "rgb(255,232,244)";
        c.globalAlpha = 0.7 * fade;
        c.lineWidth = 1;
        c.stroke();
      });

      pts.forEach(([x, y], i) => {
        const pulse = still ? 0.6 : 0.5 + 0.5 * Math.sin(now * 0.002 + i * 1.7 + k.seed);
        const size = 14 + 10 * pulse;
        c.globalAlpha = 0.45 + 0.4 * pulse;
        c.drawImage(glow, x - size / 2, y - size / 2, size, size);
        c.globalAlpha = 0.95;
        c.fillStyle = "#fff";
        c.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
      });
    }

    // estrella fugaz
    if (!still) {
      if (!shoot.active && now > nextShoot) {
        shoot = {
          active: true,
          x: Math.random() * width * 0.6 + width * 0.3,
          y: Math.random() * height * 0.3,
          vx: -(0.5 + Math.random() * 0.3) * width,
          vy: (0.3 + Math.random() * 0.2) * height,
          life: 0,
        };
        nextShoot = now + 9000 + Math.random() * 8000;
      }
      if (shoot.active) {
        shoot.life += 0.016;
        const hx = shoot.x + shoot.vx * shoot.life * 0.8;
        const hy = shoot.y + shoot.vy * shoot.life * 0.8;
        const tx = hx - shoot.vx * 0.12;
        const ty = hy - shoot.vy * 0.12;
        const g = c.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(1, "rgba(255,170,220,0)");
        c.globalAlpha = clamp(1 - shoot.life / 0.9, 0, 1);
        c.strokeStyle = g;
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(hx, hy);
        c.lineTo(tx, ty);
        c.stroke();
        if (shoot.life > 0.9) shoot.active = false;
      }
    }

    c.globalAlpha = 1;
  }

  function loop(now: number) {
    raf = requestAnimationFrame(loop);
    if (now - last < 32) return; // ~30 cuadros por segundo
    last = now;
    if (document.hidden || root.classList.contains("k-scrolling")) return;
    if (root.classList.contains("k-lite")) {
      draw(now, true);
      cancelAnimationFrame(raf);
      return;
    }
    draw(now, false);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduced) {
    draw(0, true);
  } else {
    raf = requestAnimationFrame(loop);
  }

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
  };
}
