"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import ChatComposer from "@/components/chat/ChatComposer";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function push(role: Message["role"], content: string, error = false) {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role, content, error },
    ]);
  }

  async function sendMessage() {
    const text = message.trim();
    if (!text || loading) return;

    const history = messages
      .filter((item) => !item.error)
      .map((item) => ({ role: item.role, content: item.content }));

    push("user", text);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      const data = await response.json();

      if (data.ok) {
        push("model", data.text || "No recibí respuesta.");
      } else {
        push("model", data.error ?? "No pude responder.", true);
      }
    } catch {
      push("model", "No hay conexión con Krypton. Intenta de nuevo.", true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KryptonShell>
      <section className="mx-auto flex h-[calc(100dvh-104px)] max-w-3xl flex-col pb-2 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="krypton-eyebrow">KRYPTON CORE</p>
            <h1 className="mt-1 text-xl font-light sm:text-2xl">
              Conversación
            </h1>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMessages([])}
              className="k-glass-button rounded-full px-4 py-2 text-xs"
            >
              Nueva
            </button>
            <Link
              href="/memory"
              className="k-glass-button rounded-full px-4 py-2 text-xs"
            >
              Historial
            </Link>
          </div>
        </div>

        <div className="krypton-chat-scroll flex-1 space-y-3 overflow-y-auto py-2">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="krypton-chat-orb mb-6">
                <div />
              </div>
              <p className="max-w-xs text-sm leading-7 text-white/60">
                ¿En qué puedo ayudarte? Escribe tu pregunta o agrega una
                imagen con el botón +.
              </p>
            </div>
          )}

          {messages.map((item) => (
            <div
              key={item.id}
              className={
                item.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  item.role === "user"
                    ? "krypton-msg krypton-msg-user"
                    : item.error
                      ? "krypton-msg krypton-msg-bot krypton-msg-error"
                      : "krypton-msg krypton-msg-bot"
                }
              >
                {item.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="krypton-msg krypton-msg-bot krypton-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="pt-2">
          <ChatComposer
            value={message}
            onChange={setMessage}
            onSend={sendMessage}
          />
          <p className="mt-2 text-center text-[10px] text-white/30">
            Krypton puede cometer errores. Verifica información importante.
          </p>
        </div>
      </section>
    </KryptonShell>
  );
}
