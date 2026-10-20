"use client";

import { useEffect, useRef, useState } from "react";

export type Attachment = {
  id: string;
  dataUrl: string;
  mimeType: string;
  data: string;
  name?: string;
  kind?: "image" | "file";
};

type Props = {
  attachments: Attachment[];
  disabled?: boolean;
  prefill?: { text: string; n: number } | null;
  onSend: (text: string) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemove: (id: string) => void;
};

const FILE_TYPES =
  "application/pdf,.pdf,text/*,.txt,.md,.csv,.json,.xml,.html,.htm,.css,.js,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.sql,.log,.yaml,.yml,.ini,.sh";

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
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
  const [menu, setMenu] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const files = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (prefill) {
      setText(prefill.text);
      area.current?.focus();
    }
  }, [prefill]);

  // Altura de la caja: el navegador lo hace solo si puede; si no, se calcula sin bloquear la escritura
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    if (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content")) return;
    const frame = requestAnimationFrame(() => {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
    });
    return () => cancelAnimationFrame(frame);
  }, [text]);

  // El menú del + se cierra al tocar fuera o con Escape
  useEffect(() => {
    if (!menu) return;
    const close = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === "Escape") setMenu(false);
        return;
      }
      if (!wrap.current?.contains(event.target as Node)) setMenu(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  const full = attachments.length >= 4;
  const canSend = !disabled && (text.trim().length > 0 || attachments.length > 0);

  function submit() {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && window.matchMedia("(pointer: fine)").matches) {
      event.preventDefault();
      submit();
    }
  }

  function pick(ref: React.RefObject<HTMLInputElement | null>) {
    setMenu(false);
    ref.current?.click();
  }

  const onPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    onAddFiles(event.target.files);
    event.target.value = "";
  };

  return (
    <div className="krypton-composer-wrap" ref={wrap}>
      {menu && (
        <div className="krypton-attach-menu k-glass-panel" role="menu">
          <button type="button" role="menuitem" onClick={() => pick(gallery)}>
            <svg {...icon}>
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="M21 16l-5-5-8 9" />
            </svg>
            Galería
          </button>
          <button type="button" role="menuitem" onClick={() => pick(camera)}>
            <svg {...icon}>
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Cámara
          </button>
          <button type="button" role="menuitem" onClick={() => pick(files)}>
            <svg {...icon}>
              <path d="M21 12.5l-8.6 8.6a5.5 5.5 0 01-7.8-7.8l9-9a3.7 3.7 0 015.2 5.2l-9 9a1.8 1.8 0 01-2.6-2.6l8.3-8.3" />
            </svg>
            Archivos y PDF
          </button>
        </div>
      )}

      <div className="k-glass-panel krypton-composer">
        {attachments.length > 0 && (
          <div className="krypton-attachments">
            {attachments.map((item) =>
              item.kind === "file" ? (
                <div key={item.id} className="krypton-attachment krypton-attachment-file">
                  <svg {...icon} width="18" height="18">
                    <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
                    <path d="M14 3v5h5" />
                  </svg>
                  <span>{item.name ?? "Archivo"}</span>
                  <button type="button" onClick={() => onRemove(item.id)} aria-label="Quitar archivo">
                    ×
                  </button>
                </div>
              ) : (
                <div key={item.id} className="krypton-attachment">
                  <img src={item.dataUrl} alt="Imagen adjunta" />
                  <button type="button" onClick={() => onRemove(item.id)} aria-label="Quitar imagen">
                    ×
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <div className="krypton-composer-row">
          <button
            type="button"
            className="k-glass-button krypton-icon-btn"
            onClick={() => setMenu((open) => !open)}
            disabled={full}
            aria-label="Adjuntar"
            aria-haspopup="menu"
            aria-expanded={menu}
          >
            <svg {...icon}>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <input ref={gallery} type="file" accept="image/*" multiple hidden onChange={onPicked} />
          <input ref={camera} type="file" accept="image/*" capture="environment" hidden onChange={onPicked} />
          <input ref={files} type="file" accept={FILE_TYPES} multiple hidden onChange={onPicked} />

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
            <svg {...icon}>
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
