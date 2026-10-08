"use client";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import HealthBackground from "@/components/health/HealthBackground";
import Markdown from "@/components/health/Markdown";

type Msg = { role: "user" | "assistant"; content: string; level?: number };

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

export default function HealthPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
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
      sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || loading) return;
    const history = messages.slice(-14).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    setLoading(true);
    try {
      const res = await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
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
    try {
      sessionStorage.removeItem(STORE);
    } catch {}
  }

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
              Cuéntame qué está pasando y te acompaño paso a paso: te hago las preguntas justas y
              te doy recomendaciones claras.
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
          <div className="flex items-end gap-2">
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
              className="max-h-[140px] flex-1 resize-none rounded-3xl border border-white/30 bg-white/15 px-5 py-3 text-white placeholder-white/60 outline-none backdrop-blur-xl"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
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
