"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Páginas del ecosistema Krypton (Health y otros módulos independientes no se tocan)
const ECOSYSTEM = ["/login", "/chat", "/dashboard", "/memory", "/settings", "/vision", "/tools"];

export default function ThemeScope() {
  const pathname = usePathname();

  useEffect(() => {
    const path = pathname || window.location.pathname;
    const inEcosystem =
      path === "/" || ECOSYSTEM.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
    document.documentElement.dataset.scope = inEcosystem ? "ecosystem" : "other";
  }, [pathname]);

  return null;
}
