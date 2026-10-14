import type { Metadata } from "next";
import "./globals.css";
import AquaticBackground from "@/components/layout/AquaticBackground";
import PerformanceGuard from "@/components/layout/PerformanceGuard";
import ThemeScope from "@/components/layout/ThemeScope";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AquaticBackground />
        <PerformanceGuard />
        <ThemeScope />
        {children}
      </body>
    </html>
  );
}
