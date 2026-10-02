import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
