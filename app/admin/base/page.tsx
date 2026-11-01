"use client";

import { useEffect, useState } from "react";
import KryptonShell from "@/components/layout/KryptonShell";

type Doc = { id: string; kind: string; title: string; tags: string; content: string; active: boolean };
const KINDS = ["modelo", "conocimiento", "matematicas"];
const FIELD = "w-full rounded-2xl border border-white/35 bg-transparent px-4 py-2 text-sm text-white outline-none placeholder:text-white/40";

export default function KbPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [id, setId] = useState("");
  const [kind, setKind] = useState("modelo");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const r = await fetch("/api/admin/kb");
      if (r.status === 401) {
        window.location.replace("/login");
        return;
      }
      const d = await r.json();
      if (d.ok) setDocs(d.docs ?? []);
      else setMsg(d.error ?? "Error");
    } catch {
      setMsg("Sin conexión.");
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function post(body: unknown): Promise<boolean> {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/kb", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      setMsg(d.ok ? "" : d.error ?? "Error");
      await load();
      return d.ok === true;
    } catch {
      setMsg("Sin conexión.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!title.trim() || !content.trim()) {
      setMsg("Escribe el título y el contenido.");
      return;
    }
    const ok = await post({ action: "save", id: id || null, kind, title, tags, content });
    if (ok) {
      setId("");
      setTitle("");
      setTags("");
      setContent("");
    }
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl px-1 pb-12 pt-4">
        <p className="krypton-eyebrow">BIBLIOTECA DE KRYPTON</p>
        <h1 className="mt-1 text-2xl font-light">Modelos y conocimiento</h1>
        <p className="mt-1 text-sm text-white/60">Lo que guardes aquí lo consulta Krypton automáticamente cuando alguien pregunta algo relacionado.</p>
        {msg && <p className="mt-3 text-xs text-red-200">{msg}</p>}

        <div className="k-glass-card mt-4 rounded-3xl p-4">
          <p className="text-sm font-medium">{id ? "Editar documento" : "Nuevo documento"}</p>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className={FIELD + " mt-3"} style={{ colorScheme: "dark" }}>
            {KINDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (ej. Modelo de carta de renuncia)" className={FIELD + " mt-3"} />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Palabras clave separadas por espacio" className={FIELD + " mt-3"} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={9} placeholder="Contenido del modelo o conocimiento…" className={FIELD + " mt-3"} />
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={save} disabled={busy} className="k-glass-button flex-1 rounded-full px-4 py-2 text-xs disabled:opacity-50">Guardar</button>
            {id && (
              <button type="button" onClick={() => { setId(""); setTitle(""); setTags(""); setContent(""); }} className="k-glass-button rounded-full px-4 py-2 text-xs">Cancelar</button>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {docs.map((d) => (
            <div key={d.id} className="k-glass-card rounded-3xl p-4">
              <p className="text-xs text-white/50">{d.kind}</p>
              <p className="mt-1 text-sm font-medium">{d.title}</p>
              <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-white/60">{d.content}</p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => { setId(d.id); setKind(d.kind); setTitle(d.title); setTags(d.tags); setContent(d.content); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="k-glass-button rounded-full px-4 py-2 text-xs">Editar</button>
                <button type="button" disabled={busy} onClick={() => post({ action: "delete", id: d.id })} className="k-glass-button rounded-full px-4 py-2 text-xs disabled:opacity-50">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </KryptonShell>
  );
}
