"use client";
import Link from "next/link";
import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import HealthBackground from "@/components/health/HealthBackground";
import Markdown from "@/components/health/Markdown";

type Att = { name: string; mimeType: string; data: string; thumb?: string; isPdf: boolean };
type AttMeta = { name: string; thumb?: string; isPdf: boolean };
type Msg = { role: "user" | "assistant"; content: string; level?: number; atts?: AttMeta[] };

const LEVELS: Record<number, { text: string; cls: string }> = {
  2: { text: "Consulta profesional recomendada", cls: "bg-sky-500/70" },
  3: { text: "Atención prioritaria", cls: "bg-amber-500/80" },
  4: { text: "Posible emergencia", cls: "bg-red-600/85" },
};

const SUGGESTIONS = [
  "Tengo dolor de cabeza",
  "Tengo fiebre y malestar",
  "Ayúdame a preparar mi consulta médica",
];

const STORE = "krypton-health-chat";
const MAX_FILES = 4;
const MAX_B64 = 2_400_000;

function readAsDataURL(file: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = () => rej(new Error("No pude leer el archivo."));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error("No pude leer esa imagen. Prueba con JPG o PNG."));
    i.src = src;
  });
}

function drawScaled(img: HTMLImageElement, max: number, q: number): string {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(img.naturalWidth * s));
  c.height = Math.max(1, Math.round(img.naturalHeight * s));
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("No pude procesar la imagen.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", q);
}

async function prepare(file: File): Promise<Att> {
  if (file.type === "application/pdf") {
    const url = await readAsDataURL(file);
    const data = url.split(",")[1] ?? "";
    if (data.length > MAX_B64) throw new Error("El PDF es muy grande (máximo cerca de 1.8 MB).");
    return { name: file.name, mimeType: "application/pdf", data, isPdf: true };
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Formato no compatible. Usa una foto o un PDF.");
  }
  const img = await loadImage(await readAsDataURL(file));
  let data = drawScaled(img, 2000, 0.85).split(",")[1] ?? "";
  if (data.length > MAX_B64) data = drawScaled(img, 1500, 0.75).split(",")[1] ?? "";
  if (data.length > MAX_B64) throw new Error("La imagen es demasiado pesada.");
  return {
    name: file.name,
    mimeType: "image/jpeg",
    data,
    thumb: drawScaled(img, 160, 0.6),
    isPdf: false,
  };
}

export default function HealthPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Att[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [attError, setAttError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORE);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!list.length) return;
    setAttError("");
    const room = MAX_FILES - pending.length;
    if (room <= 0) {
      setAttError("Máximo " + MAX_FILES + " archivos por consulta.");
      return;
    }
    setPreparing(true);
    try {
      const out: Att[] = [];
      for (const f of list.slice(0, room)) out.push(await prepare(f));
      setPending((p) => [...p, ...out]);
    } catch (err) {
      setAttError(err instanceof Error ? err.message : "No pude leer el archivo.");
    } finally {
      setPreparing(false);
    }
  }

  async function send(raw: string) {
    const text = raw.trim();
    if ((!text && pending.length === 0) || loading || preparing) return;
    const files = pending;
    const history = messages.slice(-14).map((m) => ({
      role: m.role,
      content: (
        m.content +
        (m.atts?.length ? " [Adjuntó: " + m.atts.map((a) => a.name).join(", ") + "]" : "")
      ).trim(),
    }));
    setMessages((m) => [
      ...m,
      {
        role: "user",
        content: text,
        atts: files.map(({ name, thumb, isPdf }) => ({ name, thumb, isPdf })),
      },
    ]);
    setPending([]);
    setAttError("");
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setLoading(true);
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          images: files.map((f) => ({ mimeType: f.mimeType, data: f.data })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.ok ? data.reply : data.error ?? "No pude responder. Intenta de nuevo.",
          level: data.ok ? data.triage?.level : undefined,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Hubo un problema de conexión. Intenta de nuevo." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      if (window.matchMedia("(pointer: fine)").matches) {
        e.preventDefault();
        send(input);
      }
    }
  }

  function newConsult() {
    setMessages([]);
    setPending([]);
    setAttError("");
    try {
      sessionStorage.removeItem(STORE);
    } catch {}
  }

  const canSend = !loading && !preparing && (input.trim().length > 0 || pending.length > 0);

  return (
    <>
      <HealthBackground />
      <main className="relative z-10 flex h-[100dvh] flex-col text-white">
        <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl"
            >
              ← Volver
            </Link>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={newConsult}
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl"
              >
                Nueva consulta
              </button>
            )}
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.3em] text-white/70">KRYPTON</p>
            <h1 className="text-lg font-semibold leading-none">Health</h1>
          </div>
        </header>

        <section className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div className="max-w-[92%] rounded-3xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
            <p className="font-medium">Hola, soy Krypton Health.</p>
            <p className="mt-1 text-white/90">
              Cuéntame qué está pasando y te acompaño paso a paso. También puedes adjuntar fotos o
              PDF de exámenes, análisis y radiografías para que los analice contigo.
            </p>
          </div>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl"
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl"
              >
                Subir examen o radiografía
              </button>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[92%] rounded-3xl border px-4 py-3 backdrop-blur-xl " +
                  (m.role === "user"
                    ? "whitespace-pre-wrap border-white/30 bg-white/25"
                    : "border-white/20 bg-black/25")
                }
              >
                {m.role === "assistant" && m.level && LEVELS[m.level] && (
                  <span
                    className={"mb-2 inline-block rounded-full px-3 py-1 text-xs " + LEVELS[m.level].cls}
                  >
                    {LEVELS[m.level].text}
                  </span>
                )}
                {m.atts && m.atts.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {m.atts.map((a, j) =>
                      a.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={j}
                          src={a.thumb}
                          alt={a.name}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                      ) : (
                        <span key={j} className="rounded-xl bg-white/20 px-3 py-2 text-xs">
                          PDF · {a.name.slice(0, 22)}
                        </span>
                      )
                    )}
                  </div>
                )}
                {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex">
              <div className="flex items-center gap-1.5 rounded-3xl border border-white/20 bg-black/25 px-5 py-4 backdrop-blur-xl">
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/80" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-white/80 [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </section>

        <form onSubmit={onSubmit} className="px-4 pb-3 pt-2">
          {(pending.length > 0 || preparing || attError) && (
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {pending.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 p-1.5 pr-3 backdrop-blur-xl"
                >
                  {a.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.thumb} alt={a.name} className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xs">
                      PDF
                    </span>
                  )}
                  <span className="max-w-[110px] truncate text-xs">{a.name}</span>
                  <button
                    type="button"
                    aria-label="Quitar archivo"
                    onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                    className="text-white/80"
                  >
                    ×
                  </button>
                </div>
              ))}
              {preparing && <span className="text-xs text-white/80">Preparando archivo…</span>}
              {attError && <span className="text-xs text-amber-200">{attError}</span>}
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={onFiles}
            />
            <button
              type="button"
              aria-label="Adjuntar foto o PDF"
              onClick={() => fileRef.current?.click()}
              disabled={loading || preparing}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-xl disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <textarea
              ref={taRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
              }}
              onKeyDown={onKey}
              placeholder="¿Qué sientes o qué quieres consultar?"
              className="max-h-[140px] min-w-0 flex-1 resize-none rounded-3xl border border-white/30 bg-white/15 px-5 py-3 text-white placeholder-white/60 outline-none backdrop-blur-xl"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-full bg-white px-5 py-3 font-medium text-teal-800 disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-white/60">
            Orientación general. No reemplaza la valoración de un profesional de la salud.
          </p>
        </form>
      </main>
    </>
  );
}
