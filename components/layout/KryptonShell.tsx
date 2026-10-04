import type { ReactNode } from "react";
import KryptonHeader from "./KryptonHeader";

type KryptonShellProps = {
  children: ReactNode;
  className?: string;
};

export default function KryptonShell({
  children,
  className = "",
}: KryptonShellProps) {
  return (
    <main
      className={`krypton-ocean krypton-liquid min-h-screen px-4 py-4 text-white sm:px-6 ${className}`}
    >

      <div className="relative z-10 mx-auto min-h-[calc(100vh-32px)] max-w-6xl">
        <KryptonHeader />

        {children}
      </div>
    </main>
  );
}
