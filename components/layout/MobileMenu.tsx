"use client";

import Link from "next/link";

type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileMenu({
  open,
  onClose,
}: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-4 top-20 z-50 k-glass-panel p-3 lg:hidden">
      {[
        ["Inicio", "/dashboard"],
        ["Chat", "/chat"],
        ["Visión", "/vision"],
        ["Información", "/info"],
        ["Configuración", "/settings"],
      ].map(([label, href]) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className="block rounded-2xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
