import { HELV, HELV_BOLD } from "./metrics";

/* =========================================================
   Generador de PDF profesional (sin dependencias).
   Convierte Markdown en un PDF A4 con portada sencilla, encabezados,
   listas, tablas, citas, código y numeración de páginas.
   ========================================================= */

type Style = { bold?: boolean; italic?: boolean; code?: boolean; link?: boolean };
type Run = Style & { text: string };
type Font = "F1" | "F2" | "F3" | "F4" | "F5";

type Block =
  | { t: "h"; level: number; runs: Run[] }
  | { t: "p"; runs: Run[] }
  | { t: "list"; items: { depth: number; marker: string; runs: Run[] }[] }
  | { t: "q"; runs: Run[] }
  | { t: "code"; text: string }
  | { t: "table"; head: Run[][]; rows: Run[][][] }
  | { t: "hr" };

/* ---------- texto: de Unicode a WinAnsi ---------- */

const SPECIAL: Record<string, number> = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88,
  "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93,
  "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b,
  "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
};

const REPLACE: Record<string, string> = {
  "→": "->", "←": "<-", "↔": "<->", "⇒": "=>", "⇐": "<=", "≈": "~", "≠": "!=", "≤": "<=", "≥": ">=",
  "√": "raíz ", "π": "pi", "∞": "infinito", "∑": "suma", "∆": "Delta", "Δ": "Delta", "α": "alfa",
  "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "θ": "theta", "λ": "lambda", "μ": "µ",
  "σ": "sigma", "φ": "phi", "ω": "omega", "Ω": "Ohm", "Σ": "Sigma", "Π": "Pi",
  "⁰": "^0", "⁴": "^4", "⁵": "^5", "⁶": "^6", "⁷": "^7", "⁸": "^8", "⁹": "^9", "ⁿ": "^n", "⁻": "^-",
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4", "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
  "✓": "OK", "✔": "OK", "✗": "x", "✘": "x", "★": "*", "☆": "*", "−": "-", "‐": "-", "‑": "-", "‒": "-",
  "′": "'", "″": '"', "⁄": "/", "ℓ": "l", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8", "·": "·", "\u200b": "",
  "\ufe0f": "", "\u2009": " ", "\u202f": " ", "\u2002": " ", "\u2003": " ",
};

function mapChar(ch: string): string {
  const code = ch.codePointAt(0) ?? 0;
  if (code === 0xa0) return " ";
  if (code === 9) return "    ";
  if (code < 32 || (code >= 127 && code < 160)) return "";
  if (code < 127 || (code >= 160 && code <= 255)) return ch;
  const special = SPECIAL[ch];
  return special !== undefined ? String.fromCharCode(special) : "";
}

/** Convierte a una cadena donde cada carácter es un byte WinAnsi. */
export function toWin(input: string): string {
  let out = "";
  for (const ch of input.normalize("NFC")) {
    const rep = REPLACE[ch];
    if (rep !== undefined) {
      for (const r of rep) out += mapChar(r);
    } else {
      out += mapChar(ch);
    }
  }
  return out;
}

const escapePdf = (s: string) => s.replace(/[\\()]/g, (c) => "\\" + c);

/* ---------- Markdown ---------- */

function unescapeMd(s: string) {
  return s.replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, "$1");
}

function parseInline(src: string): Run[] {
  const runs: Run[] = [];
  const re =
    /\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|__([^_]+)__|\*([^*\s][^*]*)\*|(?<![A-Za-z0-9])_([^_\s][^_]*)_(?![A-Za-z0-9])|`([^`]+)`|(!?)\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const plain = (t: string) => {
    if (t) runs.push({ text: unescapeMd(t) });
  };
  while ((m = re.exec(src))) {
    plain(src.slice(last, m.index));
    if (m[1] !== undefined) runs.push({ text: m[1], bold: true, italic: true });
    else if (m[2] !== undefined) runs.push({ text: m[2], bold: true });
    else if (m[3] !== undefined) runs.push({ text: m[3], bold: true });
    else if (m[4] !== undefined) runs.push({ text: m[4], italic: true });
    else if (m[5] !== undefined) runs.push({ text: m[5], italic: true });
    else if (m[6] !== undefined) runs.push({ text: m[6], code: true });
    else if (m[9] !== undefined && m[7] !== "!") {
      const label = m[8] || m[9];
      runs.push({ text: label, link: true });
      if (label !== m[9]) runs.push({ text: ` (${m[9]})` });
    }
    last = re.lastIndex;
  }
  plain(src.slice(last));
  return runs;
}

const LIST_RE = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const isTableSep = (s: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(s);
const splitRow = (s: string) =>
  s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const special = (s: string, next?: string) =>
    /^\s{0,3}#{1,6}\s/.test(s) ||
    /^\s*(```|~~~)/.test(s) ||
    LIST_RE.test(s) ||
    /^\s*>/.test(s) ||
    /^\s*([-*_])(\s*\1){2,}\s*$/.test(s) ||
    (s.includes("|") && next !== undefined && isTableSep(next));

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    const fence = line.match(/^\s*(```|~~~)/);
    if (fence) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) buf.push(lines[i++]);
      i++;
      blocks.push({ t: "code", text: buf.join("\n") });
      continue;
    }

    const h = line.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) {
      blocks.push({ t: "h", level: h[1].length, runs: parseInline(h[2]) });
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    if (line.includes("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = splitRow(line).map(parseInline);
      i += 2;
      const rows: Run[][][] = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
        const cells = splitRow(lines[i]).map(parseInline);
        while (cells.length < head.length) cells.push([]);
        rows.push(cells.slice(0, head.length));
        i++;
      }
      blocks.push({ t: "table", head, rows });
      continue;
    }

    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) buf.push(lines[i++].replace(/^\s*>\s?/, ""));
      blocks.push({ t: "q", runs: parseInline(buf.join(" ")) });
      continue;
    }

    if (LIST_RE.test(line)) {
      const items: { depth: number; marker: string; runs: Run[]; raw: string }[] = [];
      while (i < lines.length) {
        const m = lines[i].match(LIST_RE);
        if (m) {
          const depth = Math.min(3, Math.floor(m[1].replace(/\t/g, "  ").length / 2));
          const marker = /\d/.test(m[2]) ? m[2].replace(")", ".") : "•";
          items.push({ depth, marker, runs: [], raw: m[3] });
          i++;
        } else if (lines[i].trim() && /^\s{2,}\S/.test(lines[i]) && items.length) {
          items[items.length - 1].raw += " " + lines[i].trim();
          i++;
        } else if (!lines[i].trim() && i + 1 < lines.length && LIST_RE.test(lines[i + 1])) {
          i++;
        } else break;
      }
      blocks.push({
        t: "list",
        items: items.map((it) => ({ depth: it.depth, marker: it.marker, runs: parseInline(it.raw) })),
      });
      continue;
    }

    const buf: string[] = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !special(lines[i], lines[i + 1])) buf.push(lines[i++].trim());
    blocks.push({ t: "p", runs: parseInline(buf.join(" ")) });
  }
  return blocks;
}

/* ---------- medición y ajuste de líneas ---------- */

const fontOf = (s: Style): Font =>
  s.code ? "F5" : s.bold && s.italic ? "F4" : s.bold ? "F2" : s.italic ? "F3" : "F1";

function textWidth(text: string, font: Font, size: number) {
  let w = 0;
  const table = font === "F2" || font === "F4" ? HELV_BOLD : HELV;
  for (let i = 0; i < text.length; i++) w += font === "F5" ? 600 : (table[text.charCodeAt(i) & 255] ?? 0);
  return (w * size) / 1000;
}

type Word = { text: string; font: Font; lead: boolean; code: boolean; link: boolean; w: number };

function toWords(runs: Run[], size: number, forceBold = false): Word[] {
  const words: Word[] = [];
  let space = false;
  for (const run of runs) {
    const style: Style = forceBold ? { ...run, bold: true } : run;
    const font = fontOf(style);
    const text = toWin(run.text);
    for (const tok of text.match(/\S+|\s+/g) ?? []) {
      if (/^\s+$/.test(tok)) {
        space = true;
        continue;
      }
      words.push({ text: tok, font, lead: space && words.length > 0, code: !!run.code, link: !!run.link, w: textWidth(tok, font, size) });
      space = false;
    }
  }
  return words;
}

function breakLines(words: Word[], size: number, maxW: number): Word[][] {
  const space = textWidth(" ", "F1", size);
  const lines: Word[][] = [];
  let line: Word[] = [];
  let used = 0;
  for (let word of words) {
    // palabras más largas que la línea (direcciones web, etc.)
    while (word.w > maxW && word.text.length > 1) {
      let cut = word.text.length - 1;
      while (cut > 1 && textWidth(word.text.slice(0, cut), word.font, size) > maxW - used) cut--;
      const head = { ...word, text: word.text.slice(0, cut), w: textWidth(word.text.slice(0, cut), word.font, size) };
      line.push(head);
      lines.push(line);
      line = [];
      used = 0;
      word = { ...word, text: word.text.slice(cut), lead: false, w: textWidth(word.text.slice(cut), word.font, size) };
    }
    const need = (line.length && word.lead ? space : 0) + word.w;
    if (line.length && used + need > maxW) {
      lines.push(line);
      line = [];
      used = 0;
    }
    const lead = line.length > 0 && word.lead;
    line.push({ ...word, lead });
    used += (lead ? space : 0) + word.w;
  }
  if (line.length) lines.push(line);
  return lines;
}

/* ---------- dibujo ---------- */

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const ML = 56;
const MR = 56;
const MT = 78;
const MB = 62;
const CW = PAGE_W - ML - MR;

const COLOR = {
  text: "0.11 0.13 0.18",
  head: "0.04 0.16 0.42",
  accent: "0.12 0.43 0.92",
  muted: "0.42 0.45 0.52",
  line: "0.84 0.86 0.91",
  codeBg: "0.95 0.96 0.98",
  zebra: "0.955 0.97 0.99",
  white: "1 1 1",
  codeText: "0.62 0.12 0.2",
};

export type PdfOptions = { title?: string; date?: string; brand?: string };

export function markdownToPdf(markdown: string, options: PdfOptions = {}): Uint8Array {
  const brand = options.brand ?? "Krypton Ecosystem";
  const date =
    options.date ??
    new Date().toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });

  const blocks = parseBlocks(markdown);
  let title = options.title ?? "";
  if (blocks[0]?.t === "h" && blocks[0].level === 1) {
    title = blocks[0].runs.map((r) => r.text).join("");
  }
  const docTitle = title || "Documento";

  const pages: string[][] = [];
  let ops: string[] = [];
  let y = 0;

  const fmt = (n: number) => n.toFixed(2);
  const text = (s: string, x: number, yy: number, font: Font, size: number, color: string, spacing = 0) =>
    ops.push(
      `BT /${font} ${fmt(size)} Tf ${color} rg ${spacing} Tc ${fmt(x)} ${fmt(yy)} Td (${escapePdf(s)}) Tj ET`
    );
  const rect = (x: number, yy: number, w: number, h: number, color: string) =>
    ops.push(`${color} rg ${fmt(x)} ${fmt(yy)} ${fmt(w)} ${fmt(h)} re f`);
  const line = (x1: number, y1: number, x2: number, y2: number, color: string, width = 0.6) =>
    ops.push(`${color} RG ${width} w ${fmt(x1)} ${fmt(y1)} m ${fmt(x2)} ${fmt(y2)} l S`);

  function newPage() {
    if (ops.length || pages.length) pages.push(ops);
    ops = [];
    const first = pages.length === 0;
    if (first) {
      rect(0, PAGE_H - 7, PAGE_W, 7, COLOR.accent);
      text(toWin(brand.toUpperCase()), ML, PAGE_H - 36, "F2", 8, COLOR.accent, 1.4);
      const dw = textWidth(toWin(date), "F1", 8.5);
      text(toWin(date), PAGE_W - MR - dw, PAGE_H - 36, "F1", 8.5, COLOR.muted);
    } else {
      text(toWin(brand), ML, PAGE_H - 34, "F2", 8, COLOR.muted);
      let t = toWin(docTitle);
      while (t.length > 3 && textWidth(t, "F1", 8) > CW * 0.6) t = t.slice(0, -2);
      if (t !== toWin(docTitle)) t = t.trimEnd() + "...";
      text(t, PAGE_W - MR - textWidth(t, "F1", 8), PAGE_H - 34, "F1", 8, COLOR.muted);
      line(ML, PAGE_H - 42, PAGE_W - MR, PAGE_H - 42, COLOR.line);
    }
    y = PAGE_H - MT;
  }
  const ensure = (h: number) => {
    if (y - h < MB) newPage();
  };

  function drawLines(lines: Word[][], x: number, size: number, leading: number, color: string, onLine?: () => void) {
    const space = textWidth(" ", "F1", size);
    for (const l of lines) {
      ensure(leading);
      onLine?.();
      let cx = x;
      for (const w of l) {
        if (w.lead) cx += space;
        if (w.code) rect(cx - 1.5, y - size * 0.82 - 2.4, w.w + 3, size * 0.82 + 3.6, COLOR.codeBg);
        const c = w.code ? COLOR.codeText : w.link ? COLOR.accent : color;
        text(w.text, cx, y - size * 0.82, w.font, w.code ? size - 0.7 : size, c);
        if (w.link) line(cx, y - size * 0.82 - 1.6, cx + w.w, y - size * 0.82 - 1.6, COLOR.accent, 0.5);
        cx += w.w;
      }
      y -= leading;
    }
  }

  newPage();

  // portada: el título principal
  let start = 0;
  if (blocks[0]?.t === "h" && blocks[0].level === 1) {
    const words = toWords(blocks[0].runs, 24, true);
    const lines = breakLines(words, 24, CW);
    y -= 12;
    drawLines(lines, ML, 24, 29, COLOR.head);
    rect(ML, y - 2, 46, 3, COLOR.accent);
    y -= 22;
    start = 1;
  }

  for (let b = start; b < blocks.length; b++) {
    const block = blocks[b];

    if (block.t === "h") {
      const sizes = [0, 20, 15.5, 13, 11.5, 10.5, 10];
      const size = sizes[block.level] ?? 10.5;
      const lines = breakLines(toWords(block.runs, size, true), size, CW);
      y -= block.level <= 2 ? 10 : 6;
      ensure(size * 1.4 * lines.length + 46);
      drawLines(lines, ML, size, size * 1.35, block.level <= 2 ? COLOR.head : "0.15 0.2 0.32");
      if (block.level === 2) {
        line(ML, y + 2, PAGE_W - MR, y + 2, COLOR.line, 0.8);
        y -= 4;
      }
      y -= 4;
    } else if (block.t === "p") {
      drawLines(breakLines(toWords(block.runs, 10.5), 10.5, CW), ML, 10.5, 15.5, COLOR.text);
      y -= 7;
    } else if (block.t === "list") {
      for (const item of block.items) {
        const indent = item.depth * 16;
        const bulletX = ML + indent + 3;
        const textX = ML + indent + 17;
        const lines = breakLines(toWords(item.runs, 10.5), 10.5, CW - indent - 17);
        ensure(15.5 * Math.min(lines.length, 2));
        const marker = toWin(item.marker);
        const isBullet = item.marker === "•";
        text(marker, isBullet ? bulletX : bulletX - 1, y - 8.6, isBullet ? "F2" : "F2", 10.5, COLOR.accent);
        drawLines(lines, textX, 10.5, 15.5, COLOR.text);
        y -= 2.5;
      }
      y -= 5;
    } else if (block.t === "q") {
      const lines = breakLines(toWords(block.runs.map((r) => ({ ...r, italic: true })), 10.5), 10.5, CW - 18);
      ensure(15.5 * Math.min(lines.length, 2) + 8);
      const startY = y;
      drawLines(lines, ML + 14, 10.5, 15.5, COLOR.muted);
      if (y < startY) rect(ML + 2, y + 2, 2.4, startY - y - 2, COLOR.accent);
      y -= 8;
    } else if (block.t === "code") {
      const size = 8.8;
      const maxChars = Math.floor((CW - 20) / (0.6 * size));
      const rows: string[] = [];
      for (const raw of block.text.split("\n")) {
        let r = toWin(raw).replace(/\s+$/, "");
        if (!r) rows.push("");
        while (r.length > maxChars) {
          rows.push(r.slice(0, maxChars));
          r = r.slice(maxChars);
        }
        if (r) rows.push(r);
      }
      y -= 2;
      ensure(12.5 * Math.min(rows.length, 3) + 12);
      rect(ML, y - 3, CW, 6, COLOR.codeBg);
      y -= 3;
      for (const r of rows) {
        ensure(12.5 + 6);
        rect(ML, y - 12.5 + 3.5, CW, 12.5, COLOR.codeBg);
        rect(ML, y - 12.5 + 3.5, 2.4, 12.5, COLOR.accent);
        if (r) text(r, ML + 10, y - size * 0.9 + 1, "F5", size, COLOR.text);
        y -= 12.5;
      }
      rect(ML, y + 3.5 - 6, CW, 6, COLOR.codeBg);
      y -= 12;
    } else if (block.t === "hr") {
      y -= 4;
      ensure(10);
      line(ML, y, PAGE_W - MR, y, COLOR.line, 0.8);
      y -= 10;
    } else if (block.t === "table") {
      drawTable(block);
    }
  }

  function drawTable(block: Extract<Block, { t: "table" }>) {
    const cols = block.head.length;
    const size = 9.4;
    const pad = 5;
    const leading = 12.6;
    const headWords = block.head.map((c) => toWords(c, size, true));
    const bodyWords = block.rows.map((r) => r.map((c) => toWords(c, size)));
    const natural = new Array(cols).fill(0);
    const narrow = new Array(cols).fill(0);
    const measure = (words: Word[]) => {
      const sp = textWidth(" ", "F1", size);
      return words.reduce((a, w) => a + w.w + (w.lead ? sp : 0), 0);
    };
    const consider = (c: number, words: Word[]) => {
      natural[c] = Math.max(natural[c], measure(words));
      narrow[c] = Math.max(narrow[c], ...words.map((w) => w.w), 0);
    };
    headWords.forEach((w, c) => consider(c, w));
    bodyWords.forEach((r) => r.forEach((w, c) => consider(c, w)));

    const avail = CW - cols * pad * 2;
    const naturalSum = natural.reduce((a, b) => a + b, 0) || 1;
    let widths: number[];
    if (naturalSum <= avail) {
      widths = natural.map((n) => (n / naturalSum) * avail);
    } else {
      const narrowSum = narrow.reduce((a, b) => a + b, 0);
      if (narrowSum >= avail) {
        widths = narrow.map((n) => (n / narrowSum) * avail);
      } else {
        const extra = avail - narrowSum;
        const room = natural.reduce((a, n, c) => a + Math.max(n - narrow[c], 0), 0) || 1;
        widths = narrow.map((n, c) => n + (Math.max(natural[c] - n, 0) / room) * extra);
      }
    }
    const colW = widths.map((w) => w + pad * 2);

    const layoutRow = (cells: Word[][]) => cells.map((w, c) => breakLines(w, size, colW[c] - pad * 2));

    const drawRow = (cells: Word[][], header: boolean, zebra: boolean) => {
      const laid = layoutRow(cells);
      const rows = Math.max(...laid.map((l) => l.length), 1);
      const h = rows * leading + pad * 2 - 1;
      if (y - h < MB) {
        newPage();
        if (!header) drawRow(headWords, true, false);
      }
      const top = y;
      let cx = ML;
      for (let c = 0; c < cols; c++) {
        if (header) rect(cx, top - h, colW[c], h, COLOR.head);
        else if (zebra) rect(cx, top - h, colW[c], h, COLOR.zebra);
        cx += colW[c];
      }
      cx = ML;
      for (let c = 0; c < cols; c++) {
        let ly = top - pad;
        const space = textWidth(" ", "F1", size);
        for (const l of laid[c]) {
          let wx = cx + pad;
          for (const w of l) {
            if (w.lead) wx += space;
            const color = header ? COLOR.white : w.code ? COLOR.codeText : COLOR.text;
            text(w.text, wx, ly - size * 0.85, w.font, size, color);
            wx += w.w;
          }
          ly -= leading;
        }
        cx += colW[c];
      }
      line(ML, top - h, ML + CW, top - h, COLOR.line, 0.6);
      y = top - h;
    };

    y -= 2;
    ensure(leading * 3 + pad * 4);
    drawRow(headWords, true, false);
    bodyWords.forEach((row, r) => drawRow(row, false, r % 2 === 1));
    y -= 10;
  }

  pages.push(ops);

  // pie de página con numeración
  const total = pages.length;
  pages.forEach((page, index) => {
    ops = page;
    line(ML, 46, PAGE_W - MR, 46, COLOR.line);
    text(toWin(`${brand}`), ML, 32, "F1", 8, COLOR.muted);
    const label = `Página ${index + 1} de ${total}`;
    text(label, PAGE_W - MR - textWidth(label, "F1", 8), 32, "F1", 8, COLOR.muted);
  });

  return assemble(pages, toWin(docTitle));
}

/* ---------- archivo PDF ---------- */

function assemble(pages: string[][], title: string): Uint8Array {
  const fonts = ["Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique", "Courier"];
  const objects: string[] = [];
  const pageIds: number[] = [];
  const firstPage = 3 + fonts.length + 1;

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(""); // se completa con la lista de páginas
  fonts.forEach((f) =>
    objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /${f} /Encoding /WinAnsiEncoding >>`)
  );
  const now = new Date();
  const p2 = (n: number) => String(n).padStart(2, "0");
  const stamp = `D:${now.getFullYear()}${p2(now.getMonth() + 1)}${p2(now.getDate())}${p2(now.getHours())}${p2(now.getMinutes())}${p2(now.getSeconds())}`;
  objects.push(`<< /Title (${escapePdf(title)}) /Producer (Krypton Ecosystem) /Creator (Krypton Ecosystem) /CreationDate (${stamp}) >>`);

  const infoId = objects.length;
  const fontRes = fonts.map((_, i) => `/F${i + 1} ${3 + i} 0 R`).join(" ");
  pages.forEach((ops, i) => {
    const pageId = firstPage + i * 2;
    const content = ops.join("\n");
    pageIds.push(pageId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << ${fontRes} >> >> /Contents ${pageId + 1} 0 R >>`
    );
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let out = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((o) => {
    out += `${String(o).padStart(10, "0")} 00000 n \n`;
  });
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xref}\n%%EOF`;

  const bytes = new Uint8Array(out.length);
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 255;
  return bytes;
}
