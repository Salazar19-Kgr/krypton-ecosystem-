export const DOC_MARK = "\u2063DOC\u2063";

type Run = { t: string; b?: boolean; i?: boolean; c?: boolean };
type Block =
  | { k: "h"; l: 1 | 2 | 3; runs: Run[] }
  | { k: "p"; runs: Run[] }
  | { k: "li"; d: number; mark: string; runs: Run[] }
  | { k: "code"; lines: string[] }
  | { k: "quote"; runs: Run[] }
  | { k: "table"; rows: Run[][][] }
  | { k: "hr" };

const plain = (runs: Run[]) => runs.map((r) => r.t).join("");

function inline(src: string): Run[] {
  const out: Run[] = [];
  const s = src
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<br\s*\/?>/gi, " ");
  const re = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\*(?=\S)[^*\n]*?\S\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ t: s.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**")) out.push({ t: tok.slice(2, -2), b: true });
    else if (tok.startsWith("`")) out.push({ t: tok.slice(1, -1), c: true });
    else out.push({ t: tok.slice(1, -1), i: true });
    last = m.index + tok.length;
  }
  if (last < s.length) out.push({ t: s.slice(last) });
  return out;
}

function parse(md: string): Block[] {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: Block[] = [];
  const cells = (l: string) =>
    l
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((c) => inline(c.trim()));
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    if (!ln.trim()) {
      i++;
      continue;
    }
    if (/^```/.test(ln.trim())) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      out.push({ k: "code", lines: buf });
      continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(ln)) {
      out.push({ k: "hr" });
      i++;
      continue;
    }
    const h = ln.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      out.push({ k: "h", l: Math.min(3, h[1].length) as 1 | 2 | 3, runs: inline(h[2].replace(/\s*#+\s*$/, "")) });
      i++;
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(ln) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
      const rows: Run[][][] = [cells(ln)];
      i += 2;
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(cells(lines[i]));
        i++;
      }
      out.push({ k: "table", rows });
      continue;
    }
    const q = ln.match(/^\s*>\s?(.*)$/);
    if (q) {
      const buf = [q[1]];
      i++;
      while (i < lines.length && /^\s*>/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      out.push({ k: "quote", runs: inline(buf.join(" ")) });
      continue;
    }
    const li = ln.match(/^(\s*)([-*•]|\d+[.)])\s+(.*)$/);
    if (li) {
      const d = Math.min(3, Math.floor(li[1].replace(/\t/g, "    ").length / 2));
      out.push({ k: "li", d, mark: /\d/.test(li[2]) ? li[2] : "•", runs: inline(li[3]) });
      i++;
      continue;
    }
    const buf = [ln.trim()];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|```|\s*\||\s*>|\s*([-*•]|\d+[.)])\s)/.test(lines[i]) &&
      !/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      buf.push(lines[i].trim());
      i++;
    }
    out.push({ k: "p", runs: inline(buf.join(" ")) });
  }
  return out;
}

export function cleanDocText(md: string): string {
  const ps = md.replace(/\r/g, "").trim().split(/\n{2,}/);
  const firstHead = ps.findIndex((p) => /^#{1,3}\s/.test(p.trim()));
  if (firstHead > 0 && firstHead <= 2) {
    const lead = ps.slice(0, firstHead);
    if (lead.every((p) => p.length < 260 && !/^[|>*-]/.test(p.trim()))) ps.splice(0, firstHead);
  }
  const tail =
    /(^¿|puedes indicar|si deseas|si quieres|av[ií]same|d[ií]me si|quieres que|no dudes|te gustar[ií]a|puedo (ayudarte|agregar|ampliar))/i;
  for (let k = 0; k < 2 && ps.length > 2; k++) {
    const last = ps[ps.length - 1].trim();
    if (last.length < 320 && tail.test(last) && !/^#/.test(last)) ps.pop();
    else break;
  }
  return ps.join("\n\n").trim();
}

export function titleOf(md: string): string {
  const h = md.match(/^#{1,2}\s+(.+)$/m);
  const t = h ? h[1] : md.split("\n").find((l) => l.trim()) ?? "Documento";
  return t.replace(/[*_`#>]/g, "").trim().slice(0, 90) || "Documento";
}

export function outlineOf(md: string): string[] {
  const grab = (re: RegExp) => {
    const out: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(md))) {
      const t = m[1].replace(/[*_`]/g, "").replace(/^\d+[.)]\s*/, "").trim();
      if (t) out.push(t);
    }
    return out;
  };
  let items = grab(/^##\s+(.+)$/gm);
  if (!items.length) items = grab(/^###\s+(.+)$/gm);
  if (items.length > 6) {
    const more = items.length - 5;
    items = items.slice(0, 5);
    items.push("y " + more + " secciones más");
  }
  return items;
}

function demote(md: string): string {
  let inCode = false;
  return md
    .split("\n")
    .map((l) => {
      if (/^```/.test(l.trim())) inCode = !inCode;
      if (inCode) return l;
      const m = l.match(/^(#{1,6})\s+(.*)$/);
      return m ? "### " + m[2] : l;
    })
    .join("\n");
}

export function chatToMarkdown(msgs: { role: string; content: string; error?: boolean }[]): string {
  const parts: string[] = [];
  let n = 0;
  for (const m of msgs) {
    if (m.error) continue;
    const c = (m.content || "").replace(DOC_MARK, "").trim();
    if (!c || c === "[Imagen adjunta]") continue;
    if (m.role === "user") {
      n++;
      const first = c.split("\n")[0];
      parts.push("## " + n + ". " + first.slice(0, 90) + (first.length > 90 ? "…" : ""));
      if (c.length > 90) parts.push("> " + c.replace(/\n+/g, " "));
    } else {
      parts.push(demote(cleanDocText(c)));
    }
  }
  if (!n) return "";
  return "# Conversación con Krypton\n\n" + parts.join("\n\n");
}

const S = 2;
const PW = 595;
const PH = 842;
const MX = 52;
const MT = 56;
const MB = 62;
const CW = PW - MX * 2;
const FONT = '"Inter","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
const MONO = '"Roboto Mono","JetBrains Mono",Consolas,"Courier New",monospace';
const C = {
  ink: "#1f2937",
  mute: "#6b7280",
  navy: "#0b2a5b",
  accent: "#1d4ed8",
  rule: "#d5dbe6",
  zebra: "#f3f6fb",
  code: "#f1f5f9",
  quote: "#eef2ff",
};

const fnt = (r: Run, size: number, bold = false) =>
  (r.i ? "italic " : "") + (r.b || bold ? "700 " : "400 ") + size + "px " + (r.c ? MONO : FONT);

type Piece = { t: string; run: Run; x: number };
type Line = Piece[];
type Img = { bytes: Uint8Array; w: number; h: number };

function pagesToPdf(jp: Img[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let len = 0;
  const offs: number[] = [];
  const put = (b: Uint8Array | string) => {
    const u = typeof b === "string" ? enc.encode(b) : b;
    chunks.push(u);
    len += u.length;
  };
  const begin = (id: number) => {
    offs[id] = len;
    put(id + " 0 obj\n");
  };
  put("%PDF-1.4\n");
  begin(1);
  put("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  begin(2);
  put("<< /Type /Pages /Kids [" + jp.map((_, i) => 3 + i * 3 + " 0 R").join(" ") + "] /Count " + jp.length + " >>\nendobj\n");
  jp.forEach((im, i) => {
    const page = 3 + i * 3;
    begin(page);
    put("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + PW + " " + PH + "] /Resources << /XObject << /Im0 " + (page + 2) + " 0 R >> >> /Contents " + (page + 1) + " 0 R >>\nendobj\n");
    const st = "q " + PW + " 0 0 " + PH + " 0 0 cm /Im0 Do Q";
    begin(page + 1);
    put("<< /Length " + st.length + " >>\nstream\n" + st + "\nendstream\nendobj\n");
    begin(page + 2);
    put("<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + im.bytes.length + " >>\nstream\n");
    put(im.bytes);
    put("\nendstream\nendobj\n");
  });
  const total = 3 + jp.length * 3;
  const xrefAt = len;
  let xr = "xref\n0 " + total + "\n0000000000 65535 f \n";
  for (let id = 1; id < total; id++) xr += String(offs[id]).padStart(10, "0") + " 00000 n \n";
  xr += "trailer\n<< /Size " + total + " /Root 1 0 R >>\nstartxref\n" + xrefAt + "\n%%EOF";
  put(xr);
  return new Blob(chunks as unknown as BlobPart[], { type: "application/pdf" });
}

class Doc {
  title: string;
  jpegs: Img[] = [];
  cv!: HTMLCanvasElement;
  cx!: CanvasRenderingContext2D;
  y = MT;

  constructor(title: string) {
    this.title = title;
    this.newPage(false);
  }

  private flush() {
    const x = this.cx;
    const n = this.jpegs.length + 1;
    x.strokeStyle = C.rule;
    x.lineWidth = 0.7;
    x.beginPath();
    x.moveTo(MX, PH - 42);
    x.lineTo(PW - MX, PH - 42);
    x.stroke();
    x.fillStyle = C.mute;
    x.font = "400 8px " + FONT;
    x.textAlign = "left";
    x.fillText(this.title.slice(0, 70), MX, PH - 28);
    x.textAlign = "right";
    x.fillText("Página " + n, PW - MX, PH - 28);
    x.textAlign = "left";
    const bin = atob(this.cv.toDataURL("image/jpeg", 0.88).split(",")[1]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    this.jpegs.push({ bytes, w: this.cv.width, h: this.cv.height });
    this.cv.width = 0;
    this.cv.height = 0;
  }

  private newPage(flushPrev = true) {
    if (flushPrev) this.flush();
    const c = document.createElement("canvas");
    c.width = Math.round(PW * S);
    c.height = Math.round(PH * S);
    const x = c.getContext("2d");
    if (!x) throw new Error("Sin canvas");
    x.scale(S, S);
    x.fillStyle = "#ffffff";
    x.fillRect(0, 0, PW, PH);
    this.cv = c;
    this.cx = x;
    this.y = MT;
  }

  private ensure(h: number) {
    if (this.y + h > PH - MB) this.newPage();
  }

  private wrap(runs: Run[], size: number, width: number, bold = false): Line[] {
    const cx = this.cx;
    const lines: Line[] = [[]];
    let x = 0;
    for (const r of runs) {
      const run: Run = bold ? { ...r, b: true } : r;
      for (const w of r.t.split(/(\s+)/)) {
        if (!w) continue;
        cx.font = fnt(run, size);
        const cur = lines[lines.length - 1];
        if (/^\s+$/.test(w)) {
          if (cur.length && x > 0) {
            cur.push({ t: " ", run, x });
            x += cx.measureText(" ").width;
          }
          continue;
        }
        const wd = cx.measureText(w).width;
        if (wd > width) {
          if (lines[lines.length - 1].length) {
            lines.push([]);
            x = 0;
          }
          let chunk = "";
          for (const ch of Array.from(w)) {
            if (chunk && cx.measureText(chunk + ch).width > width) {
              lines[lines.length - 1].push({ t: chunk, run, x: 0 });
              lines.push([]);
              chunk = ch;
            } else chunk += ch;
          }
          lines[lines.length - 1].push({ t: chunk, run, x: 0 });
          x = cx.measureText(chunk).width;
          continue;
        }
        if (x + wd > width && cur.length) {
          while (cur.length && cur[cur.length - 1].t === " ") cur.pop();
          lines.push([]);
          x = 0;
        }
        lines[lines.length - 1].push({ t: w, run, x });
        x += wd;
      }
    }
    return lines;
  }

  private paint(lines: Line[], x0: number, y0: number, size: number, lh: number, color: string) {
    const x = this.cx;
    lines.forEach((ln, li) => {
      const base = y0 + li * lh + lh * 0.74;
      for (const p of ln) {
        x.font = fnt(p.run, size);
        if (p.run.c) {
          x.fillStyle = C.code;
          x.fillRect(x0 + p.x - 1.5, base - size * 0.95, x.measureText(p.t).width + 3, size * 1.3);
        }
        x.fillStyle = color;
        x.fillText(p.t, x0 + p.x, base);
      }
    });
  }

  private flow(lines: Line[], x0: number, size: number, lh: number, color: string) {
    for (const ln of lines) {
      this.ensure(lh);
      this.paint([ln], x0, this.y, size, lh, color);
      this.y += lh;
    }
  }

  heading(b: { l: 1 | 2 | 3; runs: Run[] }) {
    const cfg =
      b.l === 1
        ? { s: 19, lh: 25, top: 16, col: C.navy }
        : b.l === 2
          ? { s: 14, lh: 20, top: 14, col: C.navy }
          : { s: 11.5, lh: 17, top: 8, col: C.ink };
    const lines = this.wrap(b.runs, cfg.s, CW, true);
    this.ensure(cfg.top + cfg.lh * lines.length + 44);
    if (this.y > MT + 2) this.y += cfg.top;
    this.flow(lines, MX, cfg.s, cfg.lh, cfg.col);
    if (b.l <= 2) {
      const x = this.cx;
      x.strokeStyle = b.l === 1 ? C.accent : C.rule;
      x.lineWidth = b.l === 1 ? 2 : 0.8;
      x.beginPath();
      x.moveTo(MX, this.y + 1);
      x.lineTo(b.l === 1 ? MX + 44 : PW - MX, this.y + 1);
      x.stroke();
      this.y += 8;
    } else this.y += 3;
  }

  para(runs: Run[]) {
    if (!plain(runs).trim()) return;
    this.flow(this.wrap(runs, 10.5, CW), MX, 10.5, 16, C.ink);
    this.y += 7;
  }

  item(b: { d: number; mark: string; runs: Run[] }) {
    const ind = b.d * 16;
    const mw = /\d/.test(b.mark) ? 20 : 14;
    const lines = this.wrap(b.runs, 10.5, CW - ind - mw);
    this.ensure(16);
    this.cx.font = "400 10.5px " + FONT;
    this.cx.fillStyle = C.accent;
    this.cx.fillText(b.mark, MX + ind, this.y + 16 * 0.74);
    this.flow(lines, MX + ind + mw, 10.5, 16, C.ink);
    this.y += 3;
  }

  quote(runs: Run[]) {
    const lines = this.wrap(runs.map((r) => ({ ...r, i: true })), 10.5, CW - 22);
    this.y += 2;
    for (const ln of lines) {
      this.ensure(16);
      this.cx.fillStyle = C.quote;
      this.cx.fillRect(MX, this.y, CW, 16);
      this.cx.fillStyle = C.accent;
      this.cx.fillRect(MX, this.y, 3, 16);
      this.paint([ln], MX + 14, this.y, 10.5, 16, C.mute);
      this.y += 16;
    }
    this.y += 8;
  }

  code(src: string[]) {
    const size = 8.8;
    const lh = 12.6;
    this.cx.font = "400 " + size + "px " + MONO;
    const rows: string[] = [];
    for (const l of src.length ? src : [""]) {
      let cur = "";
      for (const ch of Array.from(l.replace(/\t/g, "  "))) {
        if (cur && this.cx.measureText(cur + ch).width > CW - 20) {
          rows.push(cur);
          cur = ch;
        } else cur += ch;
      }
      rows.push(cur);
    }
    this.y += 3;
    this.ensure(5);
    this.cx.fillStyle = C.code;
    this.cx.fillRect(MX, this.y, CW, 5);
    this.y += 5;
    for (const r of rows) {
      this.ensure(lh);
      this.cx.fillStyle = C.code;
      this.cx.fillRect(MX, this.y, CW, lh);
      this.cx.font = "400 " + size + "px " + MONO;
      this.cx.fillStyle = "#0f172a";
      this.cx.fillText(r, MX + 10, this.y + lh * 0.78);
      this.y += lh;
    }
    this.ensure(5);
    this.cx.fillStyle = C.code;
    this.cx.fillRect(MX, this.y, CW, 5);
    this.y += 13;
  }

  hr() {
    this.ensure(14);
    this.cx.strokeStyle = C.rule;
    this.cx.lineWidth = 0.8;
    this.cx.beginPath();
    this.cx.moveTo(MX, this.y + 6);
    this.cx.lineTo(PW - MX, this.y + 6);
    this.cx.stroke();
    this.y += 14;
  }

  private colWidths(rows: Run[][][], size: number, n: number): number[] {
    const cx = this.cx;
    const maxW: number[] = Array(n).fill(30);
    const minW: number[] = Array(n).fill(30);
    rows.forEach((r, ri) =>
      r.forEach((cell, ci) => {
        if (ci >= n) return;
        const txt = plain(cell);
        cx.font = fnt({ t: "", b: ri === 0 }, size);
        maxW[ci] = Math.max(maxW[ci], cx.measureText(txt).width + 14);
        const longest = txt.split(/\s+/).reduce((a, w) => Math.max(a, cx.measureText(w).width), 0);
        minW[ci] = Math.max(minW[ci], Math.min(longest + 14, CW / 2));
      })
    );
    const sumMax = maxW.reduce((a, b) => a + b, 0);
    if (sumMax <= CW) return maxW.map((w) => (w * CW) / sumMax);
    const sumMin = minW.reduce((a, b) => a + b, 0);
    if (sumMin >= CW) return minW.map((w) => (w * CW) / sumMin);
    const extra = CW - sumMin;
    const need = maxW.map((w, i) => Math.max(0, w - minW[i]));
    const sumNeed = need.reduce((a, b) => a + b, 0) || 1;
    return minW.map((w, i) => w + (extra * need[i]) / sumNeed);
  }

  table(rows: Run[][][]) {
    const size = 9.5;
    const lh = 13;
    const n = Math.max(...rows.map((r) => r.length));
    const cw = this.colWidths(rows, size, n);
    const measure = (r: Run[][], head: boolean) => {
      const cells = Array.from({ length: n }, (_, ci) => this.wrap(r[ci] ?? [], size, cw[ci] - 12, head));
      return { cells, h: Math.max(...cells.map((c) => c.length)) * lh + 10 };
    };
    const paintRow = (m: { cells: Line[][]; h: number }, head: boolean, zebra: boolean) => {
      this.cx.fillStyle = head ? C.navy : zebra ? C.zebra : "#ffffff";
      this.cx.fillRect(MX, this.y, CW, m.h);
      let x0 = MX;
      m.cells.forEach((lines, ci) => {
        this.paint(lines, x0 + 6, this.y + 5, size, lh, head ? "#ffffff" : C.ink);
        x0 += cw[ci];
      });
      this.cx.strokeStyle = C.rule;
      this.cx.lineWidth = 0.6;
      this.cx.beginPath();
      this.cx.moveTo(MX, this.y + m.h);
      this.cx.lineTo(MX + CW, this.y + m.h);
      this.cx.stroke();
      this.y += m.h;
    };
    const head = measure(rows[0], true);
    this.ensure(head.h + 40);
    this.y += 3;
    paintRow(head, true, false);
    rows.slice(1).forEach((r, ri) => {
      const m = measure(r, false);
      if (this.y + m.h > PH - MB) {
        this.newPage();
        paintRow(head, true, false);
      }
      paintRow(m, false, ri % 2 === 1);
    });
    this.y += 10;
  }

  cover(title: string) {
    const lines = this.wrap([{ t: title, b: true }], 24, CW, true);
    const h = Math.max(100, 46 + lines.length * 31 + 34);
    const g = this.cx.createLinearGradient(0, 0, PW, 0);
    g.addColorStop(0, C.navy);
    g.addColorStop(1, C.accent);
    this.cx.fillStyle = g;
    this.cx.fillRect(0, 0, PW, h);
    this.paint(lines, MX, 34, 24, 31, "#ffffff");
    this.cx.font = "400 9.5px " + FONT;
    this.cx.fillStyle = "rgba(255,255,255,0.8)";
    this.cx.fillText(new Date().toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" }), MX, h - 20);
    this.y = h + 24;
  }

  finish(): Blob {
    this.flush();
    return pagesToPdf(this.jpegs);
  }
}

export async function markdownToPdf(md: string, title?: string): Promise<Blob> {
  const fs = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts;
  if (fs) await fs.ready;
  const blocks = parse(md);
  const first = blocks[0];
  let start = 0;
  let ttl = title || "";
  if (first && first.k === "h" && first.l === 1) {
    ttl = plain(first.runs);
    start = 1;
  }
  ttl = ttl || "Documento";
  const doc = new Doc(ttl);
  doc.cover(ttl);
  for (const b of blocks.slice(start)) {
    if (b.k === "h") doc.heading(b);
    else if (b.k === "p") doc.para(b.runs);
    else if (b.k === "li") doc.item(b);
    else if (b.k === "code") doc.code(b.lines);
    else if (b.k === "quote") doc.quote(b.runs);
    else if (b.k === "table") doc.table(b.rows);
    else doc.hr();
  }
  return doc.finish();
}
