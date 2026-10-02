"use client";

import { useRef, useState } from "react";

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function ChatComposer({
  value,
  onChange,
  onSend,
}: ChatComposerProps) {
  const [open, setOpen] = useState(false);

  const imageInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className="k-glass-panel rounded-[1.8rem] p-3">

      <input
        ref={imageInput}
        type="file"
        accept="image/*"
        className="hidden"
      />

      <input
        ref={fileInput}
        type="file"
        className="hidden"
      />

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onSend();
          }
        }}
        rows={2}
        placeholder="Escribe lo que necesites..."
        className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-white/35"
      />

      <div className="flex items-center justify-between px-1 pt-1">

        <div className="relative">

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="k-glass-button flex h-10 w-10 items-center justify-center rounded-full text-xl"
            aria-label="Agregar imagen o archivo"
            aria-expanded={open}
          >
            +
          </button>

          {open && (
            <div className="k-glass-panel krypton-chat-menu absolute bottom-12 left-0 z-50 w-52 rounded-2xl p-2">

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  imageInput.current?.click();
                }}
                className="w-full rounded-xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                Imagen
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  fileInput.current?.click();
                }}
                className="w-full rounded-xl px-4 py-3 text-left text-sm transition hover:bg-white/10"
              >
                Archivo
              </button>

            </div>
          )}

        </div>

        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim()}
          className="k-glass-button flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
          aria-label="Enviar mensaje"
        >
          ➤
        </button>

      </div>

    </div>
  );
}
