"use client";

import { useRef, useState } from "react";
import TypedContent, { liveStamp } from "@/components/chat/TypedContent";
import ThinkingLabel from "@/components/chat/ThinkingLabel";

type Part = { mimeType: string; data: string };
type Att = { name: string; parts: Part[] };
type Msg = { id: number; role: "user" | "assistant"; content: string; files?: string[]; blocked?: boolean };

const STARTERS = [
  "Analiza este correo sospechoso y dime si es phishing",
  "Explícame qué significa este registro (log) de mi servidor",
  "Dame una lista de endurecimiento para mi sitio",
  "Redacta un informe de incidente de seguridad",
];
const TOOLS: [string, boolean][] = [
  ["Chat inteligente", true],
  ["Búsqueda con fuentes", true],
  ["Análisis de fotos, PDF, texto y video", true],
  ["Escaneo de redes (Nmap, Shodan)", false],
  ["Marcos OSINT (SpiderFoot, Maltego…)", false],
  ["Mapa global, vuelos y cámaras públicas", false],
  ["Laboratorio digital de archivos", false],
];
const TEXT_EXT = /\.(txt|log|csv|json|md|xml|ya?ml|conf|ini|eml|html?)$/i;

function b64(buf: ArrayBuffer): string {
  let s = "";
  const u = new Uint8Array(buf);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, Array.from(u.subarray(i, i + 0x8000)));
  return btoa(s);
}

async function frames(file: File, n = 6): Promise<Part[]> {
  const v = document.createElement("video");
  const url = URL.createObjectURL(file);
  v.src = url;
  v.muted = true;
  v.playsInline = true;
  await new Promise<void>((res, rej) => {
    v.onloadedmetadata = () => res();
    v.onerror = () => rej(new Error("video"));
  });
  const w = v.videoWidth || 800;
  const h = v.videoHeight || 450;
  const k = Math.min(1, 800 / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w * k));
  c.height = Math.max(1, Math.round(h * k));
  const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : 1;
  const out: Part[] = [];
  for (let i = 0; i < n; i++) {
    v.currentTime = (dur * (i + 0.5)) / n;
    await new Promise<void>((res) => {
      v.onseeked = () => res();
    });
    c.getContext("2d")?.drawImage(v, 0, 0, c.width, c.height);
    out.push({ mimeType: "image/jpeg", data: c.toDataURL("image/jpeg", 0.8).split(",")[1] });
  }
  URL.revokeObjectURL(url);
  return out;
}

export default function SentinelChat({ onState }: { onState: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [att, setAtt] = useState<Att[]>([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const file = useRef<HTMLInputElement>(null);

  async function addFiles(list: FileList | null) {
    if (!list) return;
    setNote("");
    const next: Att[] = [];
    for (const f of Array.from(list).slice(0, 4)) {
      try {
        if (f.type.startsWith("video/")) next.push({ name: f.name + " (6 fotogramas)", parts: await frames(f) });
        else if (f.type.startsWith("image/") || f.type === "application/pdf") {
          if (f.size > 8_000_000) {
            setNote(f.name + " pesa demasiado (máximo 8 MB).");
            continue;
          }
          next.push({ name: f.name, parts: [{ mimeType: f.type, data: b64(await f.arrayBuffer()) }] });
        } else if (f.type.startsWith("text/") || TEXT_EXT.test(f.name)) {
          if (f.size > 1_500_000) {
            setNote(f.name + " pesa demasiado (máximo 1,5 MB).");
            continue;
          }
          next.push({ name: f.name, parts: [{ mimeType: "text/plain", data: b64(await f.arrayBuffer()) }] });
        } else setNote("Formato no compatible: " + f.name);
      } catch {
        setNote("No pude leer " + f.name);
      }
    }
    setAtt((c) => [...c, ...next].slice(0, 4));
    if (file.current) file.current.value = "";
  }

  async function send() {
    const text = input.trim();
    if ((!text && !att.length) || loading) return;
    const history = msgs.filter((m) => !m.blocked).slice(-12).map((m) => ({ role: m.role, content: m.content }));
    const sent = att;
    setMsgs((c) => [...c, { id: Date.now(), role: "user", content: text || "(archivos adjuntos)", files: sent.map((a) => a.name) }]);
    setInput("");
    setAtt([]);
    setLoading(true);
    try {
      const r = await fetch("/api/sentinel/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, images: sent.flatMap((a) => a.parts) }),
      });
      const d = await r.json();
      if (r.status === 403) {
        onState();
        return;
      }
      liveStamp.t = Date.now();
      setMsgs((c) => [
        ...c,
        d.ok
          ? { id: Date.now() + 1, role: "assistant", content: d.text, blocked: d.blocked === true }
          : { id: Date.now() + 1, role: "assistant", content: d.error ?? "No pude responder.", blocked: true },
      ]);
      if (d.state === "refresh") onState();
    } catch {
      setMsgs((c) => [...c, { id: Date.now() + 1, role: "assistant", content: "No hay conexión con Krypton. Intenta de nuevo.", blocked: true }]);
    } finally {
      setLoading(false);
    }
  }

  async function lock() {
    try {
      await fetch("/api/sentinel/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "lock" }) });
    } catch {}
    onState();
  }

  return (
    <div>
      <div className="k-glass-card rounded-3xl p-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <p className="flex-1 text-sm font-medium">Chat inteligente</p>
          <button type="button" onClick={() => setMsgs([])} className="rounded-full border border-white/30 px-3 py-1 text-xs">Borrar</button>
          <button type="button" onClick={lock} className="rounded-full border border-white/30 px-3 py-1 text-xs">Bloquear</button>
        </div>

        <div className="mt-4 min-h-[45vh] space-y-4">
          {msgs.length === 0 && (
            <div className="py-6 text-center">
              <p className="text-lg font-light">Bienvenido a KRYTON SENTINEL</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/65">
                Describe lo que necesitas. Analizo, investigo y te entrego resultados con fuentes y nivel de confianza. Solo sobre lo tuyo o lo público.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => setInput(s)} className="k-glass-button rounded-full px-4 py-2 text-xs">{s}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="ml-auto max-w-[88%] rounded-2xl border border-white/25 px-4 py-3 text-sm">
                {m.content}
                {m.files && m.files.length > 0 && <p className="mt-1 text-[11px] text-white/55">Adjuntos: {m.files.join(", ")}</p>}
              </div>
            ) : m.blocked ? (
              <div key={m.id} className="whitespace-pre-wrap rounded-2xl border border-red-300/40 px-4 py-3 text-sm text-red-100">{m.content}</div>
            ) : (
              <TypedContent key={m.id} content={m.content} bot />
            )
          )}
          {loading && <ThinkingLabel />}
        </div>

        {att.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {att.map((a, i) => (
              <span key={i} className="flex items-center gap-2 rounded-full border border-white/25 px-3 py-1 text-xs">
                {a.name}
                <button type="button" onClick={() => setAtt((c) => c.filter((_, j) => j !== i))} aria-label="Quitar">×</button>
              </span>
            ))}
          </div>
        )}
        {note && <p className="mt-2 text-xs text-amber-200">{note}</p>}

        <div className="mt-3 flex items-end gap-2">
          <input ref={file} type="file" multiple hidden accept="image/*,video/*,application/pdf,text/*,.log,.csv,.json,.eml,.yml,.yaml,.conf,.ini" onChange={(e) => addFiles(e.target.files)} />
          <button type="button" onClick={() => file.current?.click()} aria-label="Adjuntar" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/30 text-xl">+</button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Escribe tu solicitud aquí…"
            className="max-h-40 flex-1 resize-none rounded-2xl border border-white/30 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/40"
          />
          <button type="button" onClick={send} disabled={loading} className="flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-black disabled:opacity-50">Enviar</button>
        </div>
        <p className="mt-2 text-[11px] text-white/45">Los archivos no se guardan en Krypton. Se analizan con proveedores de IA. Sin historial permanente.</p>
      </div>
    </div>
  );
}
