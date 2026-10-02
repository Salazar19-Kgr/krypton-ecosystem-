"use client";

import { useState } from "react";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const sendMessage = () => {
    const value = message.trim();

    if (!value) return;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: value,
      },
    ]);

    setMessage("");
  };

  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-5xl flex-col">

        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="k-glass rounded-full px-5 py-3 text-sm font-medium"
          >
            Krypton Ecosystem
          </Link>

          <button
            type="button"
            className="k-glass-button flex h-11 w-11 items-center justify-center rounded-full"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </header>

        <section className="flex flex-1 flex-col">

          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
              <div className="mb-7">
                <p className="text-2xl font-medium sm:text-4xl">
                  ¿En qué puedo ayudarte?
                </p>

                <p className="mt-3 text-sm text-white/45">
                  Escribe lo que necesites y Krypton se encargará del resto.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4 overflow-y-auto py-8">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`flex ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-6 ${
                      item.role === "user"
                        ? "k-glass"
                        : "k-glass-panel"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pb-4">
            <div className="k-glass-panel relative rounded-[1.7rem] p-3">

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Escribe lo que necesites..."
                rows={2}
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
              />

              <div className="mt-1 flex items-center justify-between px-1">

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((value) => !value)}
                    className="k-glass-button flex h-10 w-10 items-center justify-center rounded-full text-xl"
                    aria-label="Agregar contenido"
                    aria-expanded={menuOpen}
                  >
                    +
                  </button>

                  {menuOpen && (
                    <div className="k-glass-panel absolute bottom-12 left-0 z-20 w-52 rounded-2xl p-2">

                      <button
                        type="button"
                        className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
                      >
                        📷 Imagen
                      </button>

                      <button
                        type="button"
                        className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
                      >
                        📄 Archivo
                      </button>

                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="k-glass-button flex h-10 w-10 items-center justify-center rounded-full text-lg disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Enviar mensaje"
                >
                  ➤
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-[10px] text-white/25">
              Krypton puede cometer errores. Verifica información importante.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
