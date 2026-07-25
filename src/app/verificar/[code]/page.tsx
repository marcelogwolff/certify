import Link from "next/link";
import { Header } from "@/components/header";

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const certificateCode = code.toUpperCase();
  const participantWallet = "6w4nGgkFsUjHv8yQ9sJQHb7FJk6QrpU9W1nV9zJ2dR5K";
  const issuerWallet = "3Y9cBp8jMRy2W6pHzHq8bX4dV5NmT7fK1sE9aL3wQ6uC";
  const signature = "5HMhLRVh5UzMLGZpY91cMTkv4pt5NMA6vGBxYvLXqkNC";

  return (
    <main>
      <Header />
      <section className="page-shell verification-shell">
        <div className="verified-banner">
          <span className="verified-icon">✓</span>
          <div>
            <strong>Certificado encontrado e verificável</strong>
            <p>Os dados abaixo estão associados a uma emissão na Solana Devnet.</p>
          </div>
          <span className="network-badge">● Devnet</span>
        </div>

        <div className="verification-grid">
          <article className="certificate-view">
            <span className="certificate-icon">✦</span>
            <p className="eyebrow">Certificado de participação</p>
            <h1>Workshop de Desenvolvimento Solana</h1>
            <div className="gold-rule" />
            <p className="awarded">Este certificado foi concedido a</p>
            <h2>Ana Silva</h2>
            <p className="certificate-meta">4 horas · 25 de julho de 2026</p>
            <div className="certificate-code">{certificateCode}</div>
            <p className="certificate-footnote">Emitido e verificável na Solana Devnet</p>
          </article>

          <aside className="verification-details">
            <div className="details-heading">
              <p className="eyebrow">Registro verificável</p>
              <h2>Dados on-chain</h2>
            </div>

            <dl>
              <div>
                <dt>Participante</dt>
                <dd>Ana Silva</dd>
              </div>
              <div>
                <dt>Wallet participante</dt>
                <dd><code>{shortenAddress(participantWallet)}</code></dd>
              </div>
              <div>
                <dt>Wallet emissora</dt>
                <dd><code>{shortenAddress(issuerWallet)}</code></dd>
              </div>
              <div>
                <dt>Mint do badge</dt>
                <dd><code>Em breve na Devnet</code></dd>
              </div>
            </dl>

            <a
              className="button button-dark"
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no Solana Explorer <span>↗</span>
            </a>
            <p className="explorer-note">A visualização do Explorer usa a rede Devnet.</p>
          </aside>
        </div>

        <Link className="back-link" href="/">
          ← Voltar à página inicial
        </Link>
      </section>
    </main>
  );
}
