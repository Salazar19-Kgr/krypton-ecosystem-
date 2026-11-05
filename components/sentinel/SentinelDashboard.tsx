"use client";

import { useState } from "react";
import SentinelChat from "./SentinelChat";
import { Atom, Card, Cams, Flights, Globe, Ring, Row } from "./SentinelPanels";

const NAV = [
  { id: "chat", t: "Chat Inteligente", s: "Asistente de IA" },
  { id: "geo", t: "Inteligencia Geoespacial", s: "Mapas • Satélites • Tierra" },
  { id: "vuelos", t: "Seguimiento de Vuelos", s: "En tiempo real" },
  { id: "camaras", t: "Cámaras Públicas", s: "Transmisiones abiertas" },
  { id: "osint", t: "OSINT y Reconocimiento", s: "Fuentes abiertas" },
  { id: "redes", t: "Análisis de Redes", s: "Infraestructura y datos" },
  { id: "lab", t: "Laboratorio Digital", s: "Análisis de archivos" },
  { id: "informes", t: "Informes y Reportes", s: "Resultados detallados" },
  { id: "panel", t: "Panel de Control", s: "Gestión y monitoreo" },
];

const SOON: Record<string, string> = {
  geo: "Mapas y satélites de fuentes públicas. Requiere conectar un proveedor de mapas.",
  vuelos: "Seguimiento de vuelos públicos. Requiere conectar un proveedor de datos aeronáuticos.",
  camaras: "Solo transmisiones que sus dueños publican abiertamente. Requiere conectar fuentes públicas.",
  osint: "Reconocimiento sobre fuentes abiertas y activos propios. Por ahora usa el Chat con búsqueda y fuentes.",
  redes: "Análisis de infraestructura de dominios propios. Necesita un servidor aislado con verificación de propiedad.",
  lab: "El análisis profundo de archivos llegará aquí. Hoy ya puedes adjuntar fotos, PDF, texto y video en el Chat Inteligente.",
  informes: "Biblioteca de informes guardados. Hoy puedes pedirle al Chat un informe con objetivo, fuentes, hallazgos y confianza.",
  panel: "Gestión y monitoreo de tu cuenta Sentinel. Se activa con la consola de administración.",
};

export default function SentinelDashboard({ onState }: { onState: () => void }) {
  const [sel, setSel] = useState("chat");
  const soon = sel !== "chat";
  const cur = NAV.find((n) => n.id === sel);

  return (
    <div>
      <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
        {NAV.map((n) => (
          <button key={n.id} type="button" onClick={() => setSel(n.id)} className={"shrink-0 rounded-full border px-3 py-2 text-xs " + (sel === n.id ? "border-white bg-white/15" : "border-white/25 text-white/70")}>
            {n.t}
          </button>
        ))}
      </div>

      <div className="lg:grid lg:grid-cols-[230px_minmax(0,1fr)_290px] lg:gap-4">
        <aside className="hidden lg:block">
          <div className="k-glass-card rounded-3xl p-4">
            <div className="flex flex-col items-center text-center">
              <Atom size={56} />
              <p className="mt-2 text-sm font-semibold tracking-wide">KRYTON SENTINEL</p>
              <p className="mt-1 text-[11px] text-white/60">Centro Privado de Ciberseguridad e Inteligencia Digital</p>
            </div>
            <nav className="mt-4 space-y-1">
              {NAV.map((n) => (
                <button key={n.id} type="button" onClick={() => setSel(n.id)} className={"block w-full rounded-2xl border px-3 py-2 text-left " + (sel === n.id ? "border-white/60 bg-white/10" : "border-transparent hover:bg-white/5")}>
                  <span className="block text-xs font-medium">{n.t}</span>
                  <span className="block text-[10px] text-white/55">{n.s}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="k-glass-card mt-4 rounded-3xl p-4">
            <p className="text-sm font-medium text-emerald-300">Sesión protegida</p>
            <p className="mt-1 text-[11px] text-white/60">Plan Max verificado, clave propia y conexión cifrada.</p>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="k-glass-card flex items-center justify-between gap-3 overflow-hidden rounded-3xl p-5">
            <div>
              <h2 className="text-3xl font-semibold italic leading-none sm:text-4xl">KRYTON</h2>
              <h2 className="text-4xl font-bold italic leading-none sm:text-5xl">SENTINEL</h2>
              <p className="mt-3 text-xs text-white/70">Investiga • Analiza • Descubre • Protege</p>
            </div>
            <Atom size={84} />
          </div>

          <div className={soon ? "hidden" : ""}>
            <SentinelChat onState={onState} />
          </div>
          {soon && (
            <div className="k-glass-card rounded-3xl p-6">
              <p className="krypton-eyebrow">PRÓXIMAMENTE</p>
              <p className="mt-3 text-lg">{cur?.t}</p>
              <p className="mt-2 text-sm leading-6 text-white/70">{SOON[sel]}</p>
              <button type="button" onClick={() => setSel("chat")} className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-medium text-black">Volver al chat</button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card title="Análisis OSINT" badge="Vista previa">
              <div className="space-y-2"><Row a="Fuentes consultadas" /><Row a="Coincidencias" /><Row a="Nivel de confianza" /></div>
            </Card>
            <Card title="Inteligencia de Redes" badge="Vista previa">
              <div className="space-y-2"><Row a="IPs analizadas" /><Row a="Dominios" /><Row a="Amenazas" /></div>
            </Card>
            <Card title="Laboratorio Digital" badge="Vista previa">
              <Ring label="Adjunta archivos en el Chat para analizarlos" />
            </Card>
            <Card title="Reportes y Estadísticas" badge="Vista previa">
              <div className="space-y-2"><Row a="Informes completados" /><Row a="Análisis realizados" /><Row a="Consultas OSINT" /></div>
            </Card>
          </div>
        </main>

        <aside className="mt-4 space-y-4 lg:mt-0">
          <Card title="Vista Global" badge="Vista previa"><Globe /></Card>
          <Card title="Seguimiento de Vuelos" badge="Vista previa">
            <Flights />
            <div className="mt-2 space-y-1"><Row a="Vuelos activos" /><Row a="Rutas globales" /><Row a="Altitud promedio" /></div>
          </Card>
          <Card title="Cámaras Públicas" badge="Vista previa">
            <Cams />
            <div className="mt-2 space-y-1"><Row a="Ubicación" /><Row a="Tráfico" /></div>
          </Card>
        </aside>
      </div>

      <div className="k-glass-card mt-4 flex flex-wrap items-center justify-between gap-2 rounded-full px-5 py-3 text-[11px] text-white/70">
        <span>KRYTON SENTINEL v1.0 | Conectado a KRYTON ECOSYSTEM</span>
        <span>Privacidad • Seguridad • Inteligencia</span>
        <span className="text-emerald-300">Conexión segura (TLS)</span>
      </div>
    </div>
  );
}
