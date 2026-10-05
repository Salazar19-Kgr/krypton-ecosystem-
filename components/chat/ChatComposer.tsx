"use client";

import { useEffect, useRef, useState } from "react";

export type Attachment = {
  id: string;
  dataUrl: string;
  mimeType: string;
  data: string;
};

type Props = {
  attachments: Attachment[];
  disabled?: boolean;
  prefill?: { text: string; n: number } | null;
  onSend: (text: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemove: (id: string) => void;
};

export default function ChatComposer({
  attachments,
  disabled,
  prefill,
  onSend,
  onAddFiles,
  onRemove,
}: Props) {
  const [text, setText] = useState("");
  const area = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefill) {
      setText(prefill.text);
      area.current?.focus();
    }
  }, [prefill]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const canSend =
    !disabled && (text.trim().length > 0 || attachments.length > 0);

  function submit() {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      window.matchMedia("(pointer: fine)").matches
    ) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="k-glass-panel krypton-composer">
      {attachments.length > 0 && (
        <div className="krypton-attachments">
          {attachments.map((item) => (
            <div key={item.id} className="krypton-attachment">
              <img src={item.dataUrl} alt="Imagen adjunta" />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label="Quitar imagen"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="krypton-composer-row">
        <button
          type="button"
          className="k-glass-button krypton-icon-btn"
          onClick={() => picker.current?.click()}
          disabled={attachments.length >= 4}
          aria-label="Adjuntar imagen"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        <input
          ref={picker}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            onAddFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <textarea
          ref={area}
          value={text}
          rows={1}
          placeholder="Escribe un mensaje…"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          className="k-glass-button krypton-icon-btn krypton-send"
          onClick={submit}
          disabled={!canSend}
          aria-label="Enviar"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
