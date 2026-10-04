import type { Metadata } from "next";
import "./globals.css";
import AquaticBackground from "@/components/layout/AquaticBackground";
import PerformanceGuard from "@/components/layout/PerformanceGuard";

export const metadata: Metadata = {
  title: "Krypton Ecosystem",
  description:
    "Ecosistema multifuncional diseñado para adaptarse a tus límites y capacidades.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <AquaticBackground />
        <PerformanceGuard />
        {children}
      </body>
    </html>
  );
}
