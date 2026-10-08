import type { ReactNode } from "react";

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
      {children}
    </main>
  );
}
