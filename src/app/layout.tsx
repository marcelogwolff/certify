import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Certify — Certificados verificáveis na Solana",
  description: "Emita e verifique certificados de participação na Solana Devnet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
