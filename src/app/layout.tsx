import type { Metadata } from "next";
import "./globals.css";
import { SolanaProviders } from "@/components/solana-providers";

export const metadata: Metadata = {
  title: "Certify — Certificados verificáveis na Solana",
  description:
    "Emita e verifique certificados de participação na Solana Devnet.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
