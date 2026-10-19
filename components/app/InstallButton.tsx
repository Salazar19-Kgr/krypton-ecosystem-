"use client";

import { useEffect, useState } from "react";

export default function InstallButton() {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    const sync = () => setReady(Boolean(window.__kryptonInstall));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);
    sync();
    window.addEventListener("krypton-install", sync);
    return () => window.removeEventListener("krypton-install", sync);
  }, []);

  async function install() {
    const event = window.__kryptonInstall;
    if (!event) {
      setHint(true);
      return;
    }
    await event.prompt();
    window.__kryptonInstall = undefined;
    setReady(false);
  }

  if (installed) return <p className="mt-4 text-sm text-white/85">Ya estás usando la app instalada.</p>;

  return (
    <div>
      <button type="button" onClick={install} className="k-glass-button mt-5 rounded-full px-5 py-2.5 text-sm">
        {ready ? "Instalar ahora" : "Cómo instalar"}
      </button>
      {hint && (
        <p className="mt-3 text-sm leading-6 text-white/80">
          En Chrome toca ⋮ y elige «Instalar aplicación» o «Añadir a la pantalla de inicio». En iPhone usa
          Compartir y «Añadir a pantalla de inicio».
        </p>
      )}
    </div>
  );
}
