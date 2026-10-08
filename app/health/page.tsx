"use client";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import HealthBackground from "@/components/health/HealthBackground";

type Msg = { role: "user" | "assistant"; content: string; level?: number };

const LEVELS: Record<number, { text: string; cls: string }> = {
  2: { text: "Consulta profesional recomendada", cls: "bg-sky-500/70" },
  3: { text: "Atención prioritaria", cls: "bg-amber-500/80" },
  4: { text: "Posible emergencia", cls: "bg-red-600/85" },
};

export default function HealthPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const history = messages.slice(-12).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
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

  return (
    <>
      <HealthBackground />
      <main className="relative z-10 flex h-[100dvh] flex-col text-white">
        <header className="flex items-center justify-between px-4 pb-2 pt-4">
          <Link
            href="/"
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur-xl"
          >
            ← Volver
          </Link>
          <div className="text-right">
            <p className="text-[10px] tracking-[0.3em] text-white/70">KRYPTON</p>
            <h1 className="text-lg font-semibold leading-none">Health</h1>
          </div>
        </header>

        <section className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          <div className="max-w-[90%] rounded-3xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-xl">
            Hola, soy Krypton Health. Cuéntame qué está pasando y te haré unas preguntas para
            orientarte mejor. No diagnostico ni reemplazo a un profesional de la salud.
          </div>
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[90%] whitespace-pre-wrap rounded-3xl border px-4 py-3 backdrop-blur-xl " +
                  (m.role === "user"
                    ? "border-white/30 bg-white/25"
                    : "border-white/20 bg-black/25")
                }
              >
                {m.level && LEVELS[m.level] && (
                  <span
                    className={"mb-2 inline-block rounded-full px-3 py-1 text-xs " + LEVELS[m.level].cls}
                  >
                    {LEVELS[m.level].text}
                  </span>
                )}
                <div>{m.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="max-w-[60%] rounded-3xl border border-white/20 bg-black/25 px-4 py-3 text-white/80 backdrop-blur-xl">
              Krypton Health está pensando…
            </div>
          )}
          <div ref={endRef} />
        </section>

        <form onSubmit={send} className="flex gap-2 px-4 pb-4 pt-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="¿Qué sientes o qué quieres consultar?"
            className="flex-1 rounded-full border border-white/30 bg-white/15 px-5 py-3 text-white placeholder-white/60 outline-none backdrop-blur-xl"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full bg-white px-5 py-3 font-medium text-teal-800 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </main>
    </>
  );
}
