"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hola. Soy Krypton. Estoy preparado para ayudarte a explorar ideas, resolver problemas y analizar información.",
    },
  ]);

  return (
    <AppShell active="chat">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col">
        <header className="mb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/60">
            Krypton AI
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Conversación inteligente.
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-white/55">
            Un espacio preparado para conectar razonamiento, conocimiento,
            memoria y herramientas.
          </p>
        </header>

        <section className="k-glass-panel relative flex min-h-[520px] flex-1 flex-col overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,220,255,0.10),transparent_45%)]" />

          <div className="relative flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {messages.map((item) => (
              <div
                key={item.id}
                className={`flex ${
                  item.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 sm:max-w-[70%] ${
                    item.role === "user"
                      ? "bg-cyan-300/15 text-white ring-1 ring-cyan-200/20"
                      : "k-glass-card text-white/80"
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}
          </div>

          <div className="relative border-t border-white/10 p-3 sm:p-4">
            <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-black/20 p-2 backdrop-blur-xl">
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="Adjuntar archivo"
              >
                +
              </button>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Escribe un mensaje..."
                rows={1}
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />

              <button
                type="button"
                className="k-glass-button flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg"
                aria-label="Enviar mensaje"
              >
                ↑
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-white/25">
              Krypton puede cometer errores. Verifica información importante.
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
