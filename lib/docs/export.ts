/* Ayudas para descargar respuestas como archivos (PDF, TXT, CSV) y para mostrar los archivos que crea Krypton. */

export type Segment = { type: "md"; text: string } | { type: "file"; name: string; body: string };

const FILE_RE = /```(?:archivo|file)[ \t]+([^\n`]+)\n([\s\S]*?)```/g;

export const safeName = (name: string) =>
  name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").trim().slice(0, 80) || "archivo.txt";

/** Separa el texto normal de los archivos que Krypton entrega en bloques «archivo nombre.ext». */
export function splitSegments(content: string): Segment[] {
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  FILE_RE.lastIndex = 0;
  while ((m = FILE_RE.exec(content))) {
    if (m.index > last) out.push({ type: "md", text: content.slice(last, m.index) });
    out.push({ type: "file", name: safeName(m[1]), body: m[2].replace(/\n$/, "") });
    last = FILE_RE.lastIndex;
  }
  if (last < content.length) out.push({ type: "md", text: content.slice(last) });
  return out.filter((s) => s.type === "file" || s.text.trim());
}

export function slugify(text: string) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "documento";
}

const stripMd = (s: string) =>
  s
    .replace(/!?\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, (_, t, u) => (t && t !== u ? `${t} (${u})` : u))
    .replace(/(\*\*\*|\*\*|__|\*|`)/g, "")
    .replace(/\\([\\`*_{}\[\]()#+\-.!|>])/g, "$1")
    .trim();

export function titleOf(md: string) {
  const heading = md.match(/^\s{0,3}#{1,2}\s+(.+?)\s*#*\s*$/m);
  const raw = heading ? heading[1] : (md.split("\n").find((l) => l.trim()) ?? "Documento");
  return stripMd(raw).slice(0, 90) || "Documento";
}

/** Texto limpio, sin símbolos de Markdown. */
export function markdownToText(md: string) {
  return md
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => !/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(l))
    .map((l) => {
      let t = l.replace(/^\s{0,3}#{1,6}\s+/, "").replace(/^(\s*)[*+]\s+/, "$1- ").replace(/^\s*>\s?/, "");
      if (/^\s*\|.*\|\s*$/.test(t)) t = t.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()).join("  |  ");
      return stripMd(t) === "" ? "" : t.replace(/!?\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, "$1 ($2)").replace(/(\*\*\*|\*\*|__|`)/g, "");
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const rowCells = (s: string) => s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => stripMd(c));
const isSep = (s: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(s);

export function hasTable(md: string) {
  const lines = md.split("\n");
  return lines.some((l, i) => l.includes("|") && i + 1 < lines.length && isSep(lines[i + 1]));
}

/** Tablas del texto a CSV (separado por punto y coma, para que Excel en español lo abra bien). */
export function tablesToCsv(md: string): string | null {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const rows: string[][] = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("|") && i + 1 < lines.length && isSep(lines[i + 1])) {
      if (rows.length) rows.push([]);
      rows.push(rowCells(lines[i]));
      i += 2;
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) rows.push(rowCells(lines[i++]));
      i--;
    }
  }
  if (!rows.length) return null;
  const q = (c: string) => (/[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c);
  return "\uFEFF" + rows.map((r) => r.map(q).join(";")).join("\r\n");
}

export function downloadFile(data: BlobPart, filename: string, mime: string) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export const mimeFor = (name: string) => {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    csv: "text/csv;charset=utf-8", json: "application/json", html: "text/html;charset=utf-8", htm: "text/html;charset=utf-8",
    xml: "application/xml", md: "text/markdown;charset=utf-8", pdf: "application/pdf", svg: "image/svg+xml",
  };
  return map[ext] ?? "text/plain;charset=utf-8";
};
