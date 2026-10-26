"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  downloadFile,
  extractSources,
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

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

function SourceIcon({ url }: { url: string }) {
  const host = hostOf(url);
  return (
    <span className="krypton-fav" aria-hidden="true">
      {host.charAt(0).toUpperCase()}
      <img
        src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </span>
  );
}

export default function MessageContent({ content, markdown }: Props) {
  const [flash, setFlash] = useState("");
  const [open, setOpen] = useState(false);

  if (!markdown) return <p className="krypton-plain">{content}</p>;

  const { body, sources } = extractSources(content);
  const segments = splitSegments(body);
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

  function mdFile() {
    downloadFile(md, `${slugify(titleOf(md))}.md`, "text/markdown;charset=utf-8");
    say("Markdown listo");
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

      {sources.length > 0 && (
        <button type="button" className="krypton-sources-chip" onClick={() => setOpen(true)}>
          <span className="krypton-sources-icons">
            {sources.slice(0, 4).map((source) => (
              <SourceIcon key={source.url} url={source.url} />
            ))}
          </span>
          {sources.length} {sources.length === 1 ? "página web" : "páginas web"}
        </button>
      )}

      {open &&
        createPortal(
          <div className="krypton-sheet-backdrop" onClick={() => setOpen(false)}>
            <div
              className="krypton-sheet"
              role="dialog"
              aria-label="Páginas web consultadas"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="krypton-sheet-head">
                <strong>
                  {sources.length} {sources.length === 1 ? "página web" : "páginas web"}
                </strong>
                <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
                  ×
                </button>
              </div>
              <ul>
                {sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      <SourceIcon url={source.url} />
                      <span>
                        <b>{source.title}</b>
                        <small>{hostOf(source.url)}</small>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body
        )}

      {md && (
        <div className="krypton-actions">
          <span className="krypton-actions-label">Descargar como</span>
          <div className="krypton-actions-row">
            <button type="button" onClick={pdf}>PDF</button>
            <button type="button" onClick={txt}>TXT</button>
            <button type="button" onClick={mdFile}>Markdown</button>
            {hasTable(md) && <button type="button" onClick={csv}>CSV</button>}
          </div>
          <div className="krypton-actions-row">
            <button type="button" onClick={copy}>Copiar texto</button>
            {flash && <span className="krypton-flash">{flash}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
