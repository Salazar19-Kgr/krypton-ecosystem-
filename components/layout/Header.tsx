import Link from "next/link";

export default function Header() {
  return (
    <header className="k-glass flex items-center justify-between rounded-full px-4 py-3">
      <Link href="/dashboard" className="text-sm font-medium text-white/85">
        Krypton Ecosystem
      </Link>

      <Link
        href="/settings"
        className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/10 hover:text-white"
      >
        Configuración
      </Link>
    </header>
  );
}
