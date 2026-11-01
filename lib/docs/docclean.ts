function trimInk(cv: HTMLCanvasElement): HTMLCanvasElement {
  const w = cv.width;
  const h = cv.height;
  const cx = cv.getContext("2d");
  if (!cx) return cv;
  const d = cx.getImageData(0, 0, w, h).data;
  const col = new Int32Array(w);
  const row = new Int32Array(h);
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (d[(y * w + x) * 4] < 110) {
        col[x]++;
        row[y]++;
      }
    }
  }
  const first = (a: Int32Array) => {
    for (let i = 0; i < a.length; i++) if (a[i] >= 2) return i;
    return -1;
  };
  const last = (a: Int32Array) => {
    for (let i = a.length - 1; i >= 0; i--) if (a[i] >= 2) return i;
    return -1;
  };
  const x0 = first(col);
  const x1 = last(col);
  const y0 = first(row);
  const y1 = last(row);
  if (x0 < 0 || y0 < 0 || x1 <= x0 || y1 <= y0) return cv;
  const m = Math.round(Math.max(w, h) * 0.04);
  const sx = Math.max(0, x0 - m);
  const sy = Math.max(0, y0 - m);
  const ex = Math.min(w, x1 + m);
  const ey = Math.min(h, y1 + m);
  const out = document.createElement("canvas");
  out.width = ex - sx;
  out.height = ey - sy;
  const ox = out.getContext("2d");
  if (!ox) return cv;
  ox.fillStyle = "#fff";
  ox.fillRect(0, 0, out.width, out.height);
  ox.drawImage(cv, sx, sy, ex - sx, ey - sy, 0, 0, ex - sx, ey - sy);
  return out;
}

export function cleanDoc(src: HTMLCanvasElement): HTMLCanvasElement {
  const w = src.width;
  const h = src.height;
  const ctx = src.getContext("2d");
  if (!ctx || w < 50 || h < 50) return src;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const n = w * h;
  const g = new Float32Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) g[i] = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];

  // 1) Brillo del papel en una rejilla pequeña (sin sombras ni tinta)
  const cs = 8;
  const gw = Math.max(3, Math.ceil(w / cs));
  const gh = Math.max(3, Math.ceil(h / cs));
  const grid = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let m = 0;
      const y1 = Math.min(h, (gy + 1) * cs);
      const x1 = Math.min(w, (gx + 1) * cs);
      for (let y = gy * cs; y < y1; y += 2) {
        for (let x = gx * cs; x < x1; x += 2) {
          const v = g[y * w + x];
          if (v > m) m = v;
        }
      }
      grid[gy * gw + gx] = m;
    }
  }
  const dil = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let m = 0;
      for (let yy = Math.max(0, gy - 3); yy <= Math.min(gh - 1, gy + 3); yy++) {
        for (let xx = Math.max(0, gx - 3); xx <= Math.min(gw - 1, gx + 3); xx++) {
          const v = grid[yy * gw + xx];
          if (v > m) m = v;
        }
      }
      dil[gy * gw + gx] = m;
    }
  }
  const bg = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) {
    for (let gx = 0; gx < gw; gx++) {
      let s = 0;
      let c = 0;
      for (let yy = Math.max(0, gy - 2); yy <= Math.min(gh - 1, gy + 2); yy++) {
        for (let xx = Math.max(0, gx - 2); xx <= Math.min(gw - 1, gx + 2); xx++) {
          s += dil[yy * gw + xx];
          c++;
        }
      }
      bg[gy * gw + gx] = s / c;
    }
  }

  // 2) Quitar sombras: pixel / fondo
  const hist = new Uint32Array(256);
  const v8 = new Uint8ClampedArray(n);
  for (let y = 0; y < h; y++) {
    const fy = Math.min(gh - 1.001, Math.max(0, y / cs - 0.5));
    const y0 = Math.floor(fy);
    const ty = fy - y0;
    for (let x = 0; x < w; x++) {
      const fx = Math.min(gw - 1.001, Math.max(0, x / cs - 0.5));
      const x0 = Math.floor(fx);
      const tx = fx - x0;
      const a = bg[y0 * gw + x0];
      const b = bg[y0 * gw + x0 + 1];
      const c = bg[(y0 + 1) * gw + x0];
      const e = bg[(y0 + 1) * gw + x0 + 1];
      const b0 = (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + e * tx) * ty;
      const val = Math.min(255, (g[y * w + x] / Math.max(40, b0)) * 255);
      const q = val | 0;
      v8[y * w + x] = q;
      hist[q]++;
    }
  }

  // 3) Contraste: fondo blanco, tinta negra
  let acc = 0;
  let lo = 0;
  for (; lo < 255; lo++) {
    acc += hist[lo];
    if (acc >= n * 0.01) break;
  }
  lo = Math.min(lo, 110);
  const hi = 232;
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    let t = (v8[i] - lo) / (hi - lo);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    t = t * t * (3 - 2 * t);
    const o = t * 255;
    d[j] = o;
    d[j + 1] = o;
    d[j + 2] = o;
    d[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  // 4) Enderezar: buscar el ángulo donde la tinta forma líneas horizontales
  const xs: number[] = [];
  const ys: number[] = [];
  const stride = Math.max(1, Math.floor(Math.sqrt(n / 40000)));
  for (let y = 0; y < h; y += stride) {
    for (let x = 0; x < w; x += stride) {
      if (d[(y * w + x) * 4] < 110) {
        xs.push(x - w / 2);
        ys.push(y - h / 2);
      }
    }
  }
  if (xs.length < 60) return src;
  const span = w + h;
  const bins = new Int32Array(Math.ceil(span / 4) + 8);
  let best = 0;
  let bestScore = -1;
  for (let a = -10; a <= 10.001; a += 0.5) {
    const th = (a * Math.PI) / 180;
    const c = Math.cos(th);
    const s = Math.sin(th);
    bins.fill(0);
    for (let i = 0; i < xs.length; i++) {
      bins[Math.floor((ys[i] * c - xs[i] * s + span / 2) / 4)]++;
    }
    let score = 0;
    for (let i = 0; i < bins.length; i++) score += bins[i] * bins[i];
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  let out = src;
  if (Math.abs(best) > 0.2) {
    const th = (best * Math.PI) / 180;
    const cw = Math.ceil(w * Math.abs(Math.cos(th)) + h * Math.abs(Math.sin(th)));
    const ch = Math.ceil(w * Math.abs(Math.sin(th)) + h * Math.abs(Math.cos(th)));
    const rc = document.createElement("canvas");
    rc.width = cw;
    rc.height = ch;
    const rx = rc.getContext("2d");
    if (rx) {
      rx.fillStyle = "#fff";
      rx.fillRect(0, 0, cw, ch);
      rx.translate(cw / 2, ch / 2);
      rx.rotate(-th);
      rx.drawImage(src, -w / 2, -h / 2);
      out = rc;
    }
  }

  // 5) Recortar los márgenes sobrantes
  return trimInk(out);
}
