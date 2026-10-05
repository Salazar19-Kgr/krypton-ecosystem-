"use client";

import { memo, useEffect, useRef, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import ChatComposer, { type Attachment } from "@/components/chat/ChatComposer";
import MessageContent from "@/components/chat/MessageContent";
import { createClient } from "@/lib/supabase/client";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
  error?: boolean;
  images?: string[];
  hadImage?: boolean;
};

const SUGGESTIONS = [
  "Diagnosticar una nevera que no enfría",
  "Resolver un problema de matemáticas",
  "Explicar un concepto de física",
];

const MAX_SIDE = 1280;
const MAX_FILES = 4;

async function prepareImage(file: File): Promise<Attachment> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  return {
    id: crypto.randomUUID(),
    dataUrl,
    mimeType: "image/jpeg",
    data: dataUrl.split(",")[1],
  };
}

const Bubble = memo(function Bubble({ item }: { item: Message }) {
  const isUser = item.role === "user";
  const className = isUser
    ? "krypton-msg krypton-msg-user"
    : item.error
      ? "krypton-msg krypton-msg-bot krypton-msg-error"
      : "krypton-msg krypton-msg-bot";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={className}>
        {item.images && item.images.length > 0 && (
          <div className="krypton-msg-imgs">
            {item.images.map((src, index) => (
              <img key={index} src={src} alt="Imagen adjunta" />
            ))}
          </div>
        )}
        {!item.images?.length && item.hadImage && (
          <span className="krypton-msg-tag">Imagen adjunta</span>
        )}
        {item.content && item.content !== "[Imagen adjunta]" && (
          <MessageContent
            content={item.content}
            markdown={!isUser && !item.error}
          />
        )}
      </div>
    </div>
  );
});

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [prefill, setPrefill] = useState<{ text: string; n: number } | null>(
    null
  );
  const endRef = useRef<HTMLDivElement>(null);

  // Abrir una conversación guardada (/chat?c=ID)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("c");
    if (!id) return;
    setConversationId(id);
    createClient()
      .from("messages")
      .select("id,role,content,has_image")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        const rows = (data ?? []) as {
          id: string;
          role: "user" | "model";
          content: string;
          has_image: boolean;
        }[];
        setMessages(
          rows.map((row) => ({
            id: row.id,
            role: row.role,
            content: row.content,
            hadImage: row.has_image,
          }))
        );
      });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      block: "end",
      behavior: messages.length > 2 ? "smooth" : "auto",
    });
  }, [messages, loading]);

  function push(
    role: Message["role"],
    content: string,
    extra: Partial<Message> = {}
  ) {
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role, content, ...extra },
    ]);
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const room = Math.max(MAX_FILES - attachments.length, 0);
    const picked = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, room);

    const ready: Attachment[] = [];
    for (const file of picked) {
      try {
        ready.push(await prepareImage(file));
      } catch {
        setNotice("No pude leer una de las imágenes.");
      }
    }
    if (ready.length) setAttachments((current) => [...current, ...ready]);
  }

  async function sendMessage(text: string) {
    if ((!text && attachments.length === 0) || loading) return;

    const sent = attachments;
    const history = messages
      .filter((item) => !item.error)
      .map((item) => ({ role: item.role, content: item.content }));

    push("user", text, { images: sent.map((item) => item.dataUrl) });
    setAttachments([]);
    setNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationId,
          history,
          images: sent.map((item) => ({
            mimeType: item.mimeType,
            data: item.data,
          })),
        }),
      });

      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }

      const data = await response.json();

      if (data.ok) {
        push("model", data.text || "No recibí respuesta.");
        if (data.conversationId && data.conversationId !== conversationId) {
          setConversationId(data.conversationId);
          window.history.replaceState(null, "", `/chat?c=${data.conversationId}`);
        }
      } else {
        push("model", data.error ?? "No pude responder.", { error: true });
      }
    } catch {
      push("model", "No hay conexión con Krypton. Intenta de nuevo.", {
        error: true,
      });
    } finally {
      setLoading(false);
    }
  }

  function newChat() {
    setMessages([]);
    setAttachments([]);
    setConversationId(null);
    setNotice("");
    window.history.replaceState(null, "", "/chat");
  }

  return (
    <KryptonShell>
      <section className="mx-auto flex h-[calc(100dvh-104px)] max-w-3xl flex-col pb-2 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="krypton-eyebrow">KRYPTON CORE</p>
            <h1 className="mt-1 text-xl font-light">Conversación</h1>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={newChat}
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
            <div className="flex h-full flex-col items-center justify-center px-2 text-center">
              <h2 className="text-2xl font-light">¿En qué trabajamos hoy?</h2>
              <div className="krypton-suggestions">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="k-glass-button"
                    onClick={() =>
                      setPrefill({ text: suggestion, n: Date.now() })
                    }
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((item) => (
            <Bubble key={item.id} item={item} />
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
          {notice && (
            <p className="mb-2 text-center text-xs text-red-200">{notice}</p>
          )}
          <ChatComposer
            attachments={attachments}
            disabled={loading}
            prefill={prefill}
            onSend={sendMessage}
            onAddFiles={addFiles}
            onRemove={(id) =>
              setAttachments((current) => current.filter((a) => a.id !== id))
            }
          />
          <p className="mt-2 text-center text-[10px] text-white/50">
            Krypton puede cometer errores. Verifica información importante.
          </p>
        </div>
      </section>
    </KryptonShell>
  );
}
