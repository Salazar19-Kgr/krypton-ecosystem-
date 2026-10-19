"use client";

import { useEffect } from "react";

type InstallEvent = Event & { prompt: () => Promise<void> };

declare global {
  interface Window {
    __kryptonInstall?: InstallEvent;
  }
}

/** Registra la app instalable y guarda el aviso de instalación (sin botones flotantes). */
export default function PwaClient() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const onPrompt = (event: Event) => {
      event.preventDefault();
      window.__kryptonInstall = event as InstallEvent;
      window.dispatchEvent(new Event("krypton-install"));
    };
    const onInstalled = () => {
      window.__kryptonInstall = undefined;
      window.dispatchEvent(new Event("krypton-install"));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
