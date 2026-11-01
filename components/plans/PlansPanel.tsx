"use client";

import { useEffect, useState } from "react";

const WA = "584245095002";

type Plan = { id: string; name: string; price: string; tag: string; feats: string[]; soon?: string[] };

const PLANS: Plan[] = [
  { id: "free", name: "Free", price: "$0", tag: "Para conocer Krypton", feats: ["40 mensajes por día", "Core, Health y Tools", "Lectura de fotos, PDF y archivos", "5 imágenes por día"] },
  { id: "basic", name: "Básico", price: "$4.99", tag: "Completo para el día a día", feats: ["300 mensajes por día", "Core, Health y Tools completos", "Lectura de fotos, PDF y archivos", "Descargas en PDF, TXT, Markdown y CSV", "5 imágenes por día"] },
  { id: "pro", name: "Pro", price: "$9.99", tag: "Con todo disponible", feats: ["1000 mensajes por día", "Razonamiento profundo y verificación", "Todo lo del plan Básico"], soon: ["Más imágenes por día", "Prioridad en horas de alta demanda"] },
  { id: "max", name: "Max", price: "$14.99", tag: "Disponibilidad total", feats: ["3000 mensajes por día", "Acceso anticipado a Krypton Code", "Todo lo del plan Pro"], soon: ["Imágenes con límite ampliado", "Ver y escuchar audios y videos"] },
];

const wa = (t: string) => "https://wa.me/" + WA + "?text=" + encodeURIComponent(t);

export default function PlansPanel() {
  const [plan, setPlan] = useState("free");

  useEffect(() => {
    fetch("/api/plan")
      .then((r) => r.json())
      .then((d) => d?.plan && setPlan(d.plan))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {PLANS.map((p) => (
        <div key={p.id} className="k-glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <p className="krypton-eyebrow">{p.name.toUpperCase()}</p>
            {plan === p.id && <span className="rounded-full bg-cyan-200/25 px-3 py-1 text-[10px] tracking-wide">Tu plan</span>}
          </div>
          <p className="mt-3 text-3xl font-light">
            {p.price}
            <span className="ml-1 text-xs text-white/60">USD / mes</span>
          </p>
          <p className="mt-1 text-sm text-white/70">{p.tag}</p>
          <ul className="mt-4 space-y-1 text-sm text-white/90">
            {p.feats.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
            {p.soon?.map((f) => (
              <li key={f} className="text-white/50">◌ {f} · próximamente</li>
            ))}
          </ul>
          {p.id !== "free" && plan !== p.id && (
            <a
              href={wa("Hola, quiero el plan " + p.name + " de Krypton Ecosystem")}
              target="_blank"
              rel="noreferrer"
              className="k-glass-button mt-5 block w-full rounded-full px-4 py-3 text-center text-sm font-medium"
            >
              Solicitar plan {p.name} →
            </a>
          )}
        </div>
      ))}
      <div className="k-glass-card rounded-3xl p-6">
        <p className="krypton-eyebrow">PLAN ANUAL</p>
        <p className="mt-3 text-sm leading-6 text-white/80">
          ¿Prefieres pagar por año? Habla con el equipo de Krypton Ecosystem y te armamos una oferta.
        </p>
        <a
          href={wa("Hola, me interesa un plan anual de Krypton Ecosystem")}
          target="_blank"
          rel="noreferrer"
          className="k-glass-button mt-4 block w-full rounded-full px-4 py-3 text-center text-sm font-medium"
        >
          Hablar con el equipo →
        </a>
      </div>
      <p className="px-1 text-xs leading-5 text-white/50">
        Los métodos de pago disponibles te los indicamos por WhatsApp al solicitar el plan.
      </p>
    </div>
  );
}
