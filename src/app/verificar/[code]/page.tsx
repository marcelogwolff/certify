import Link from "next/link";
import { Header } from "@/components/header";
import { getCertificateByCode } from "@/lib/certificates";
import { shortenAddress } from "@/lib/solana";

export const dynamic = "force-dynamic";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const certificateCode = code.toUpperCase();
  const certificate = await getCertificateByCode(certificateCode);

  if (!certificate) {
    return (
      <main>
        <Header />
        <section className="page-shell verification-shell empty-state">
          <span className="eyebrow">Verificação · Devnet</span>
          <h1>Certificado não encontrado.</h1>
          <p>Confira o código de verificação ou peça um novo link ao organizador.</p>
          <Link className="button button-secondary" href="/">Voltar para a página inicial</Link>
        </section>
      </main>
    );
  }

  const isActive = certificate.status === "active";
  const isPending = certificate.status === "pending";
  const statusTitle = isActive
    ? "Certificado encontrado e verificável"
    : isPending
      ? "Certificado aguardando confirmação"
      : "Certificado revogado";
  const statusDescription = isActive
    ? "Os dados abaixo estão associados a uma emissão na Solana Devnet."
    : isPending
      ? "A emissão ainda não foi confirmada na Solana Devnet."
      : "Este certificado não deve mais ser considerado válido.";

  return (
    <main>
      <Header />
      <section className="page-shell verification-shell">
        <div className={`verified-banner ${isActive ? "" : "verification-warning"}`}>
          <span className="verified-icon">{isActive ? "✓" : "!"}</span>
          <div>
            <strong>{statusTitle}</strong>
            <p>{statusDescription}</p>
          </div>
          <span className="network-badge">● Devnet</span>
        </div>

        <div className="verification-grid">
          <article className="certificate-view">
            <span className="certificate-icon">✦</span>
            <p className="eyebrow">Certificado de participação</p>
            <h1>{certificate.courseName}</h1>
            <div className="gold-rule" />
            <p className="awarded">Este certificado foi concedido a</p>
            <h2>{certificate.recipientName}</h2>
            <p className="certificate-meta">{certificate.workloadHours} horas · {formatDate(certificate.issuedAt)}</p>
            <div className="certificate-code">{certificate.verificationCode}</div>
            <p className="certificate-footnote">Registro na Solana Devnet</p>
          </article>

          <aside className="verification-details">
            <div className="details-heading">
              <p className="eyebrow">Registro verificável</p>
              <h2>Dados on-chain</h2>
            </div>

            <dl>
              <div><dt>Participante</dt><dd>{certificate.recipientName}</dd></div>
              <div><dt>Wallet participante</dt><dd><code>{shortenAddress(certificate.recipientWallet, 6)}</code></dd></div>
              <div><dt>Wallet emissora</dt><dd><code>{shortenAddress(certificate.issuerWallet, 6)}</code></dd></div>
              <div><dt>Mint do badge</dt><dd><code>{certificate.mintAddress ? shortenAddress(certificate.mintAddress, 6) : "Aguardando emissão"}</code></dd></div>
            </dl>

            {certificate.transactionSignature ? (
              <a className="button button-dark" href={`https://explorer.solana.com/tx/${certificate.transactionSignature}?cluster=devnet`} target="_blank" rel="noreferrer">
                Abrir no Solana Explorer <span>↗</span>
              </a>
            ) : (
              <p className="explorer-note">O link do Explorer aparecerá após a confirmação da emissão.</p>
            )}
          </aside>
        </div>

        <Link className="back-link" href="/">← Voltar à página inicial</Link>
      </section>
    </main>
  );
}
