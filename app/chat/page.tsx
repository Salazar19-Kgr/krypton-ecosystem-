"use client";

import { useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import ChatComposer from "@/components/chat/ChatComposer";

export default function ChatPage() {
  const [message, setMessage] = useState("");

  function sendMessage() {
    if (!message.trim()) return;

    setMessage("");
  }

  return (
    <KryptonShell>

      <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-4xl flex-col py-8 sm:py-12">

        <div className="mb-8 flex items-center justify-between">

          <div>
            <p className="krypton-eyebrow">
              KRYPTON CORE
            </p>

            <h1 className="mt-2 text-2xl font-light sm:text-3xl">
              ¿En qué puedo ayudarte?
            </h1>
          </div>

          <Link
            href="/memory"
            className="k-glass-button rounded-full px-4 py-2 text-xs"
          >
            Conversaciones
          </Link>

        </div>

        <div className="flex flex-1 items-center justify-center py-10">

          <div className="w-full max-w-2xl text-center">

            <div className="krypton-chat-orb mx-auto mb-8">
              <div />
            </div>

            <p className="text-sm leading-7 text-white/40">
              Escribe tu pregunta, describe lo que necesitas o agrega
              una imagen desde el botón <span className="text-white/70">+</span>.
              Krypton decidirá internamente qué capacidades necesita.
            </p>

          </div>

        </div>

        <div className="mt-auto">

          <ChatComposer
            value={message}
            onChange={setMessage}
            onSend={sendMessage}
          />

          <p className="mt-3 text-center text-[10px] text-white/25">
            Krypton puede cometer errores. Verifica información importante.
          </p>

        </div>

      </section>

    </KryptonShell>
  );
}
