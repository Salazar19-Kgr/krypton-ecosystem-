"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import KryptonShell from "@/components/layout/KryptonShell";
import LookCard from "@/components/settings/LookCard";
import { createClient } from "@/lib/supabase/client";
import { applyMotion, readMotion, type MotionMode } from "@/lib/ui/motion";

const WHATSAPP = "584245095002";
const wa = (text: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

const MODES: { id: MotionMode; label: string; hint: string }[] = [
  { id: "on", label: "Activadas", hint: "Constelaciones, esfera y efectos siempre en movimiento." },
  { id: "auto", label: "Automático", hint: "Se reducen solas si tu teléfono va lento. Se aplica al volver a abrir la app." },
  { id: "off", label: "Desactivadas", hint: "Todo queda quieto. Más ligero y ahorra batería." },
];

export default function SettingsPage() {
  const [mode, setMode] = useState<MotionMode>("on");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setMode(readMotion());
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setEmail(data.user?.email ?? "");
        setName(String(data.user?.user_metadata?.full_name ?? ""));
      });
  }, []);

  function chooseMode(next: MotionMode) {
    setMode(next);
    applyMotion(next);
  }

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } finally {
      window.location.replace("/login");
    }
  }

  async function deleteHistory() {
    if (!confirming) {
      setConfirming(true);
      setNotice("");
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { error } = await supabase.from("conversations").delete().eq("user_id", data.user.id);
    setConfirming(false);
    setNotice(error ? "No se pudo borrar el historial. Intenta de nuevo." : "Tu historial se borró por completo.");
  }

  return (
    <KryptonShell>
      <section className="mx-auto max-w-3xl py-10">
        <p className="krypton-eyebrow">KRYPTON ECOSYSTEM</p>
        <h1 className="mt-5 text-4xl font-light sm:text-5xl">Configuración</h1>
        <p className="mt-4 text-sm leading-7 text-white/75">
          Controla tu cuenta, las animaciones y tus datos.
        </p>

        <div className="mt-8 space-y-4">
          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">CUENTA</p>
            <p className="mt-4 text-lg font-medium">{name || "Tu cuenta"}</p>
            <p className="mt-1 text-sm text-white/75">{email || "Cargando…"}</p>
            <button
              type="button"
              onClick={signOut}
              className="k-glass-button mt-5 rounded-full px-5 py-2.5 text-sm"
            >
              Cerrar sesión
            </button>
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">ANIMACIONES</p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Elige cómo quieres ver Krypton. El cambio se guarda en este dispositivo.
            </p>
            <div className="krypton-seg mt-4">
              {MODES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={mode === item.id}
                  onClick={() => chooseMode(item.id)}
                  className="k-glass-button"
                >
                  <span>
                    <span className="block text-sm font-medium">{item.label}</span>
                    <small>{item.hint}</small>
                  </span>
                  <span aria-hidden="true">{mode === item.id ? "●" : "○"}</span>
                </button>
              ))}
            </div>
          </div>

          <LookCard />

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">CONVERSACIONES</p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Borra todo tu historial de forma permanente. Esta acción no se puede deshacer.
            </p>
            <button
              type="button"
              onClick={deleteHistory}
              className="k-glass-button mt-5 rounded-full px-5 py-2.5 text-sm"
            >
              {confirming ? "Toca otra vez para confirmar" : "Borrar mi historial"}
            </button>
            {notice && <p className="mt-3 text-sm text-white/85">{notice}</p>}
          </div>

          <div className="k-glass-card rounded-3xl p-6">
            <p className="krypton-eyebrow">AYUDA Y CONTACTO</p>
            <p className="mt-3 text-sm leading-6 text-white/75">
              ¿Algo no funciona o tienes una idea? Escríbenos por WhatsApp.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={wa("Hola, quiero reportar un error en Krypton Ecosystem:")}
                target="_blank"
                rel="noopener noreferrer"
                className="k-glass-button rounded-full px-5 py-2.5 text-sm"
              >
                Reportar un error
              </a>
              <a
                href={wa("Hola, quiero contactarme con el equipo de Krypton Ecosystem.")}
                target="_blank"
                rel="noopener noreferrer"
                className="k-glass-button rounded-full px-5 py-2.5 text-sm"
              >
                Contacto
              </a>
            </div>
            <p className="mt-4 flex flex-wrap gap-4 text-xs text-white/80"><Link href="/terms" className="underline underline-offset-4">Términos y condiciones</Link><Link href="/privacy" className="underline underline-offset-4">Política de privacidad</Link></p>
          </div>

          <p className="pb-4 text-center text-xs text-white/70">Krypton Ecosystem · versión beta</p>
        </div>
      </section>
    </KryptonShell>
  );
}
