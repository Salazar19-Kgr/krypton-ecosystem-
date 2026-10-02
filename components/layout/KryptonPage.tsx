import type { ReactNode } from "react";
import AquaticBackground from "./AquaticBackground";

type KryptonPageProps = {
  children: ReactNode;
  className?: string;
};

export default function KryptonPage({
  children,
  className = "",
}: KryptonPageProps) {
  return (
    <main className={`krypton-ocean krypton-liquid ${className}`}>
      <AquaticBackground />
      {children}
    </main>
  );
}
