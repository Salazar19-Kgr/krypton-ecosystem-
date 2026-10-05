"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import { createClient } from "@/lib/supabase/client";

type Conversation = { id: string; title: string; updated_at: string };

export default function MemoryPage() {
  const [items, setItems] = useState<Conversation[] | null>(null);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    createClient()
      .from("conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) setProblem("No se pudo cargar el historial.");
        setItems((data ?? []) as Conversation[]);
      });
  }, []);

  async function remove(id: string) {
    setItems((current) => (current ?? []).filter((item) => item.id !== id));
    await createClient().from("conversations").delete().eq("id", id);
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl py-10">
        <p className="krypton-eyebrow">CONVERSACIONES</p>
        <h1 className="mt-4 text-4xl font-light sm:text-5xl">Tu historial.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
          Conserva tus conversaciones y vuelve a ellas cuando quieras continuar
          un trabajo.
        </p>

        <Link
          href="/chat"
          className="k-glass-button mt-8 flex w-full items-center justify-between rounded-full px-6 py-4 text-sm"
        >
          Nueva conversación <span>→</span>
        </Link>

        <div className="mt-6 space-y-3">
          {problem && <p className="text-sm text-red-200">{problem}</p>}
          {items === null && <p className="text-sm text-white/60">Cargando…</p>}

          {items?.length === 0 && !problem && (
            <div className="k-glass-card rounded-3xl p-6">
              <p className="font-medium">Todavía no hay conversaciones</p>
              <p className="mt-2 text-sm text-white/70">
                Cuando empieces a utilizar Krypton, tus conversaciones
                aparecerán aquí.
              </p>
            </div>
          )}

          {items?.map((item) => (
            <div
              key={item.id}
              className="k-glass-card flex items-center justify-between gap-3 rounded-3xl p-4"
            >
              <Link href={`/chat?c=${item.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-white/60">
                  {new Date(item.updated_at).toLocaleString("es")}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="k-glass-button shrink-0 rounded-full px-4 py-2 text-xs"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </section>
    </KryptonShell>
  );
}
