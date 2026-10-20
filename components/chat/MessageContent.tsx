"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  downloadFile,
  hasTable,
  markdownToText,
  mimeFor,
  slugify,
  splitSegments,
  tablesToCsv,
  titleOf,
} from "@/lib/docs/export";

type Props = { content: string; markdown?: boolean };

const formatSize = (text: string) => {
  const bytes = new Blob([text]).size;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`;
};

export default function MessageContent({ content, markdown }: Props) {
  const [flash, setFlash] = useState("");

  if (!markdown) return <p className="krypton-plain">{content}</p>;

  const segments = splitSegments(content);
  const md = segments
    .filter((s): s is { type: "md"; text: string } => s.type === "md")
    .map((s) => s.text)
    .join("\n\n")
    .trim();

  const say = (label: string) => {
    setFlash(label);
    setTimeout(() => setFlash(""), 1800);
  };

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdownToText(md || content));
      say("Copiado");
    } catch {
      say("No se pudo copiar");
    }
  }

  async function pdf() {
    say("Creando PDF…");
    try {
      const { markdownToPdf } = await import("@/lib/docs/pdf");
      const title = titleOf(md);
      downloadFile(markdownToPdf(md, { title }) as BlobPart, `${slugify(title)}.pdf`, "application/pdf");
      say("PDF listo");
    } catch {
      say("No se pudo crear el PDF");
    }
  }

  function txt() {
    downloadFile(markdownToText(md), `${slugify(titleOf(md))}.txt`, "text/plain;charset=utf-8");
    say("TXT listo");
  }

  function csv() {
    const data = tablesToCsv(md);
    if (data) {
      downloadFile(data, `${slugify(titleOf(md))}.csv`, "text/csv;charset=utf-8");
      say("CSV listo");
    }
  }

  return (
    <div>
      {segments.map((segment, index) =>
        segment.type === "md" ? (
          <div key={index} className="krypton-md">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{segment.text}</ReactMarkdown>
          </div>
        ) : (
          <div key={index} className="krypton-file-card">
            <div className="krypton-file-info">
              <strong>{segment.name}</strong>
              <small>{formatSize(segment.body)}</small>
            </div>
            <button
              type="button"
              className="k-glass-button"
              onClick={() => downloadFile(segment.body, segment.name, mimeFor(segment.name))}
            >
              Descargar
            </button>
          </div>
        )
      )}

      {md && (
        <div className="krypton-actions">
          <button type="button" onClick={copy}>Copiar</button>
          <button type="button" onClick={pdf}>PDF</button>
          <button type="button" onClick={txt}>TXT</button>
          {hasTable(md) && (
            <button type="button" onClick={csv}>CSV</button>
          )}
          {flash && <span className="krypton-flash">{flash}</span>}
        </div>
      )}
    </div>
  );
}
