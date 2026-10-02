"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import KryptonHeader from "@/components/layout/KryptonHeader";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const selectImage = () => {
    setMenuOpen(false);
    imageInputRef.current?.click();
  };

  const selectFile = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  return (
    <main className="krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6">

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
      />

      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-5xl flex-col">

        <KryptonHeader />

        {messages.length === 0 ? (
          <section className="flex flex-1 flex-col items-center justify-center px-2 pb-12 text-center">

            <div className="max-w-2xl">

              <p className="krypton-eyebrow">
                KRYPTON ECOSYSTEM
              </p>

              <h1 className="mt-5 text-3xl font-light tracking-tight sm:text-5xl">
                ¿En qué puedo ayudarte?
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/45">
                Escribe lo que necesites. Puedes preguntar, razonar,
                analizar una imagen o trabajar con Krypton sin elegir
                ninguna herramienta.
              </p>

            </div>

            <div className="mt-10 w-full max-w-3xl">

              <Composer
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                selectImage={selectImage}
                selectFile={selectFile}
              />

            </div>

          </section>
        ) : (
          <section className="flex flex-1 flex-col">

            <div className="flex-1 space-y-5 overflow-y-auto py-8">

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
                    className={
                      item.role === "user"
                        ? "k-glass max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-6"
                        : "k-glass-panel max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-6"
                    }
                  >
                    {item.content}
                  </div>

                </div>
              ))}

            </div>

            <div className="pb-4">

              <Composer
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                selectImage={selectImage}
                selectFile={selectFile}
              />

              <p className="mt-3 text-center text-[10px] text-white/25">
                Krypton puede cometer errores. Verifica información importante.
              </p>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}

type ComposerProps = {
  message: string;
  setMessage: (value: string) => void;
  sendMessage: () => void;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
  selectImage: () => void;
  selectFile: () => void;
};

function Composer({
  message,
  setMessage,
  sendMessage,
  menuOpen,
  setMenuOpen,
  selectImage,
  selectFile,
}: ComposerProps) {
  return (
    <div className="k-glass-panel rounded-[1.8rem] p-3">

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

      <div className="flex items-center justify-between px-1 pt-1">

        <div className="relative">

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="k-glass-button flex h-10 w-10 items-center justify-center rounded-full text-xl"
            aria-label="Agregar"
            aria-expanded={menuOpen}
          >
            +
          </button>

          {menuOpen && (
            <div className="k-glass-panel krypton-chat-menu absolute bottom-12 left-0 z-50 w-52 rounded-2xl p-2">

              <button
                type="button"
                onClick={selectImage}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                <span>◉</span>
                Imagen
              </button>

              <button
                type="button"
                onClick={selectFile}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                <span>□</span>
                Archivo
              </button>

            </div>
          )}

        </div>

        <button
          type="button"
          onClick={sendMessage}
          disabled={!message.trim()}
          className="k-glass-button krypton-send-active flex h-10 w-10 items-center justify-center rounded-full text-lg disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Enviar"
        >
          ➤
        </button>

      </div>

    </div>
  );
}
