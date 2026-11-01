import { cleanDoc } from "./docclean";

export type ImgIn = { mimeType: string; data: string };

async function toJpeg(img: ImgIn, scan = false): Promise<{ bytes: Uint8Array; w: number; h: number }> {
  const src = "data:" + img.mimeType + ";base64," + img.data;
  const el = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("No pude leer la imagen"));
    i.src = src;
  });
  const k = Math.min(1, 2200 / Math.max(el.naturalWidth, el.naturalHeight));
  const w = Math.max(1, Math.round(el.naturalWidth * k));
  const h = Math.max(1, Math.round(el.naturalHeight * k));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Sin canvas");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(el, 0, 0, w, h);
  const oc = scan ? cleanDoc(c) : c;
  const bin = atob(oc.toDataURL("image/jpeg", 0.92).split(",")[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, w: oc.width, h: oc.height };
}

export async function imagesToPdf(imgs: ImgIn[], scan = false): Promise<Blob> {
  const jp: { bytes: Uint8Array; w: number; h: number }[] = [];
  for (const i of imgs) jp.push(await toJpeg(i, scan));
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
    const land = im.w > im.h;
    const pw = land ? 842 : 595;
    const ph = land ? 595 : 842;
    const m = 24;
    const s = Math.min((pw - 2 * m) / im.w, (ph - 2 * m) / im.h);
    const dw = im.w * s;
    const dh = im.h * s;
    const page = 3 + i * 3;
    begin(page);
    put("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + pw + " " + ph + "] /Resources << /XObject << /Im0 " + (page + 2) + " 0 R >> >> /Contents " + (page + 1) + " 0 R >>\nendobj\n");
    const st = "q " + dw.toFixed(2) + " 0 0 " + dh.toFixed(2) + " " + ((pw - dw) / 2).toFixed(2) + " " + ((ph - dh) / 2).toFixed(2) + " cm /Im0 Do Q";
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

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
