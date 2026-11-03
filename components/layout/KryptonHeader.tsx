"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SideDrawer from "./SideDrawer";

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

  return (
    <header className="relative z-50 flex items-center justify-between">
      <Link href="/dashboard" className="krypton-brand-capsule k-glass">
        <span className="krypton-brand-dot" />
        <span>Krypton Ecosystem</span>
      </Link>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="k-glass-button krypton-menu-button"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <SideDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
