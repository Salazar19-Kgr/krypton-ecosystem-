"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type InstallEvent = Event & { prompt: () => Promise<void> };

declare global {
  interface Window {
    __kryptonInstall?: InstallEvent;
  }
}

/** Registra la app instalable y muestra el acceso a la descarga en el inicio. */
export default function PwaClient() {
  const pathname = usePathname();
  const [standalone, setStandalone] = useState(true);

  useEffect(() => {
    setStandalone(window.matchMedia("(display-mode: standalone)").matches);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const onPrompt = (event: Event) => {
      event.preventDefault();
      window.__kryptonInstall = event as InstallEvent;
      window.dispatchEvent(new Event("krypton-install"));
    };
    const onInstalled = () => {
      window.__kryptonInstall = undefined;
      setStandalone(true);
      window.dispatchEvent(new Event("krypton-install"));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (standalone || (pathname !== "/" && pathname !== "/login")) return null;

  return (
    <Link href="/download" className="krypton-pill k-glass-button">
      Descargar app
    </Link>
  );
}
