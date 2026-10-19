"use client";

import { useEffect, useState } from "react";
import { APP_BUILD } from "@/lib/app/version";

/** Avisa cuando hay una versión nueva publicada y deja actualizar con un toque. */
export default function UpdateNotice() {
  const [next, setNext] = useState<{ version: string; notes: string } | null>(null);

  useEffect(() => {
    let stopped = false;

    async function check() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!stopped && Number(data.build) > APP_BUILD) {
          setNext({ version: String(data.version), notes: String(data.notes ?? "") });
        }
      } catch {
        // sin conexión: se intenta más tarde
      }
    }

    check();
    const timer = setInterval(check, 30 * 60 * 1000);
    window.addEventListener("focus", check);
    return () => {
      stopped = true;
      clearInterval(timer);
      window.removeEventListener("focus", check);
    };
  }, []);

  async function update() {
    try {
      const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
      await Promise.all(regs.map((r) => r.unregister()));
      const keys = (await caches?.keys?.()) ?? [];
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch {
      // se recarga igualmente
    }
    window.location.reload();
  }

  if (!next) return null;

  return (
    <div className="krypton-update k-glass-panel" role="status">
      <span>
        <strong>Nueva versión {next.version}</strong>
        {next.notes ? <span className="block text-xs opacity-80">{next.notes}</span> : null}
      </span>
      <button type="button" onClick={update} className="k-glass-button rounded-full px-4 py-2 text-xs">
        Actualizar
      </button>
    </div>
  );
}
