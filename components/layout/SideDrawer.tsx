"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Recent = { id: string; title: string | null };
type Me = { plan?: string; admin?: boolean; email?: string; name?: string };

const ICON: Record<string, string> = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6",
  layers: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  star: "M12 3l2.7 5.5 6 .9-4.4 4.2 1 6L12 16.8 6.7 19.6l1-6L3.3 9.4l6-.9z",
  sliders: "M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  plus: "M12 5v14M5 12h14",
  close: "M6 6l12 12M18 6L6 18",
};

const PLAN_NAMES: Record<string, string> = { free: "Free", basic: "Básico", pro: "Pro", max: "Max" };
const ROW = "flex w-full items-center gap-4 rounded-xl px-3 py-3 text-left text-[15px] text-white/85 active:bg-white/10";

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function SideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<Me>({});
  const [recent, setRecent] = useState<Recent[]>([]);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    fetch("/api/plan").then((r) => r.json()).then((d) => setMe(d ?? {})).catch(() => {});
    fetch("/api/recent").then((r) => r.json()).then((d) => setRecent(d?.items ?? [])).catch(() => {});
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function signOut() {
    try {
      await fetch("/api/signout", { method: "POST" });
    } catch {}
    window.location.href = "/login";
  }

  if (!mounted) return null;

  const on = (h: string) => path === h || path.startsWith(h + "/");
  const nav = [
    { label: "Inicio", href: "/dashboard", icon: ICON.home },
    { label: "Krypton Core", href: "/chat", icon: ICON.chat },
    { label: "Krypton Health", href: "/health", icon: ICON.heart },
    { label: "Krypton Tools", href: "/tools", icon: ICON.grid },
  ];
  const soon = [
    { label: "Krypton Code", icon: ICON.code },
    { label: "Krypton Platform", icon: ICON.layers },
  ];
  const initial = (me.name || me.email || "K").trim().charAt(0).toUpperCase();
  const close = () => closeRef.current();

  return createPortal(
    <div className={"fixed inset-0 " + (open ? "" : "pointer-events-none")} style={{ zIndex: 2147483000 }} aria-hidden={!open}>
      <div onClick={close} className={"absolute inset-0 bg-black/60 transition-opacity duration-200 " + (open ? "opacity-100" : "opacity-0")} />
      <aside
        className={"absolute left-0 top-0 flex h-full w-[84%] max-w-[340px] flex-col bg-[#0b0b0d] text-white transition-transform duration-200 " + (open ? "translate-x-0" : "-translate-x-full")}
        style={{ borderRight: "1px solid rgba(255,255,255,.14)" }}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-6">
          <p className="text-2xl font-light">Krypton</p>
          <button type="button" onClick={close} aria-label="Cerrar menú" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/5">
            <Icon d={ICON.close} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-3">
          {nav.map((i) => (
            <Link key={i.href} href={i.href} onClick={close} className={ROW + (on(i.href) ? " bg-white/10 text-white" : "")}>
              <Icon d={i.icon} />
              <span className="flex-1">{i.label}</span>
            </Link>
          ))}
          {soon.map((i) => (
            <div key={i.label} className={ROW + " opacity-60"}>
              <Icon d={i.icon} />
              <span className="flex-1">{i.label}</span>
              <span className="rounded-full border border-white/30 px-2 py-0.5 text-[10px]">Próximamente</span>
            </div>
          ))}
          <Link href="/memory" onClick={close} className={ROW + (on("/memory") ? " bg-white/10 text-white" : "")}>
            <Icon d={ICON.clock} />
            <span className="flex-1">Conversaciones</span>
          </Link>
          <Link href="/plans" onClick={close} className={ROW + (on("/plans") ? " bg-white/10 text-white" : "")}>
            <Icon d={ICON.star} />
            <span className="flex-1">Planes</span>
            <span className="rounded-full border border-white/30 px-2 py-0.5 text-[10px]">{PLAN_NAMES[me.plan ?? "free"] ?? "Free"}</span>
          </Link>

          <p className="px-3 pb-1 pt-5 text-xs tracking-widest text-white/45">RECIENTES</p>
          {recent.length === 0 && <p className="px-3 py-2 text-sm text-white/40">Aún no hay conversaciones.</p>}
          {recent.map((r) => {
            const t = (r.title ?? "Conversación").trim();
            const tools = t.startsWith("Tools · ");
            return (
              <Link key={r.id} href={(tools ? "/tools?c=" : "/chat?c=") + r.id} onClick={close} className="block truncate rounded-xl px-3 py-3 text-[15px] text-white/75 active:bg-white/10">
                {tools ? t.replace("Tools · ", "") : t}
              </Link>
            );
          })}

          <p className="px-3 pb-1 pt-5 text-xs tracking-widest text-white/45">CUENTA</p>
          <Link href="/settings" onClick={close} className={ROW + (on("/settings") ? " bg-white/10 text-white" : "")}>
            <Icon d={ICON.sliders} />
            <span className="flex-1">Configuración</span>
          </Link>
          {me.admin && (
            <Link href="/admin" onClick={close} className={ROW}>
              <Icon d={ICON.shield} />
              <span className="flex-1">Administración</span>
            </Link>
          )}
          <button type="button" onClick={signOut} className={ROW}>
            <Icon d={ICON.out} />
            <span className="flex-1">Cerrar sesión</span>
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
          <Link href="/settings" onClick={close} aria-label="Mi cuenta" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 text-base font-medium">
            {initial}
          </Link>
          <a href="/chat" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-[15px] font-medium text-black">
            <Icon d={ICON.plus} />
            Nueva conversación
          </a>
        </div>
      </aside>
    </div>,
    document.body
  );
}
