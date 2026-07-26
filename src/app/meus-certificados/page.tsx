"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { WalletButton } from "@/components/wallet-button";
import type { Certificate } from "@/lib/certificates";

type WalletCertificates = { wallet: string; certificates: Certificate[] };

export default function MyCertificatesPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [result, setResult] = useState<WalletCertificates | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    let isCurrent = true;

    fetch(`/api/certificates?wallet=${encodeURIComponent(walletAddress)}`)
      .then((response) => response.json())
      .then((body) => {
        if (isCurrent) setResult({ wallet: walletAddress, certificates: body.certificates ?? [] });
      })
      .catch(() => {
        if (isCurrent) setResult({ wallet: walletAddress, certificates: [] });
      });

    return () => {
      isCurrent = false;
    };
  }, [walletAddress]);

  const certificates = result?.wallet === walletAddress ? result.certificates : null;
  const isLoading = walletAddress !== null && certificates === null;

  return (
    <main>
      <Header />
      <section className="page-shell issue-layout">
        <div className="page-heading">
          <span className="eyebrow">Participante · Devnet</span>
          <h1>Seus certificados.</h1>
          <p>Conecte a carteira que recebeu os badges para ver os certificados emitidos para ela.</p>
        </div>

        <div style={{ marginTop: 24, maxWidth: 360 }}>
          <WalletButton onConnectionChange={(address) => setWalletAddress(address)} />
        </div>

        {!walletAddress && (
          <p className="form-note" style={{ marginTop: 24, textAlign: "left" }}>
            Conecte uma carteira para consultar seus certificados.
          </p>
        )}

        {walletAddress && isLoading && (
          <p className="form-note" style={{ marginTop: 24, textAlign: "left" }}>Carregando certificados…</p>
        )}

        {walletAddress && !isLoading && certificates && certificates.length === 0 && (
          <p className="form-note" style={{ marginTop: 24, textAlign: "left" }}>
            Nenhum certificado encontrado para esta carteira.
          </p>
        )}

        {walletAddress && certificates && certificates.length > 0 && (
          <div className="issue-grid" style={{ marginTop: 24, gridTemplateColumns: "1fr" }}>
            {certificates.map((certificate) => (
              <Link
                key={certificate.id}
                href={`/verificar/${certificate.verificationCode}`}
                className="certificate-form"
                style={{ display: "block", textDecoration: "none" }}
              >
                <div className="form-intro">
                  <div>
                    <p className="step">{certificate.verificationCode}</p>
                    <h2>{certificate.courseName}</h2>
                  </div>
                  <span className="network-badge">● Devnet</span>
                </div>
                <p style={{ margin: 0, color: "var(--muted)" }}>
                  {certificate.recipientName} · {certificate.workloadHours} horas
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
