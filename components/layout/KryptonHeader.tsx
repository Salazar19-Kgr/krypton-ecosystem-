"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function KryptonHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      createClient()
        .auth.getUser()
        .then(({ data }) => {
          if (!data.user) window.location.replace("/login");
        });
    } catch {
      window.location.replace("/login");
    }
  }, []);

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } finally {
      window.location.replace("/login");
    }
  }

  return (
    <header className="relative z-50 flex items-center justify-between">
      <Link href="/dashboard" className="krypton-brand-capsule k-glass">
        <span className="krypton-brand-dot" />
        <span>Krypton Ecosystem</span>
      </Link>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="k-glass-button krypton-menu-button"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div className="krypton-navigation-menu k-glass-panel">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            Inicio
          </Link>
          <Link href="/chat" onClick={() => setOpen(false)}>
            Chat
          </Link>
          <Link href="/memory" onClick={() => setOpen(false)}>
            Conversaciones
          </Link>
          <Link href="/settings" onClick={() => setOpen(false)}>
            Configuración
          </Link>
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              signOut();
            }}
          >
            Cerrar sesión
          </a>
        </div>
      )}
    </header>
  );
}
