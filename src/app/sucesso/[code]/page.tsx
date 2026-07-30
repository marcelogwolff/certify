import Link from "next/link";
import { Header } from "@/components/header";
import { getCertificateByCode } from "@/lib/certificates";
import { shortenAddress } from "@/lib/solana";

export const dynamic = "force-dynamic";

export default async function CertificateSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const certificate = await getCertificateByCode(code.toUpperCase());

  if (!certificate) {
    return (
      <main>
        <Header />
        <section className="page-shell verification-shell empty-state">
          <span className="eyebrow">Emissão · Devnet</span>
          <h1>Certificado não encontrado.</h1>
          <p>
            O código informado não corresponde a nenhum certificado emitido.
          </p>
          <Link className="button button-secondary" href="/emitir">
            Emitir outro certificado
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main>
      <Header />
      <section className="page-shell verification-shell">
        <div className="verified-banner">
          <span className="verified-icon">✓</span>
          <div>
            <strong>Certificado emitido com sucesso</strong>
            <p>
              O badge foi criado e enviado para a carteira do participante na
              Solana Devnet.
            </p>
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
            <p className="certificate-meta">
              {certificate.workloadHours} horas
            </p>
            <div className="certificate-code">
              {certificate.verificationCode}
            </div>
            <p className="certificate-footnote">Registro na Solana Devnet</p>
          </article>

          <aside className="verification-details">
            <div className="details-heading">
              <p className="eyebrow">Links on-chain</p>
              <h2>Confira a emissão</h2>
            </div>

            <dl>
              <div>
                <dt>Instituição emissora</dt>
                <dd>
                  {certificate.issuerName ??
                    shortenAddress(certificate.issuerWallet, 6)}
                </dd>
              </div>
              <div>
                <dt>Wallet participante</dt>
                <dd>
                  <code>{shortenAddress(certificate.recipientWallet, 6)}</code>
                </dd>
              </div>
              <div>
                <dt>Mint do badge</dt>
                <dd>
                  <code>
                    {shortenAddress(certificate.mintAddress ?? "", 6)}
                  </code>
                </dd>
              </div>
            </dl>

            <a
              className="button button-dark"
              href={`https://explorer.solana.com/tx/${certificate.transactionSignature}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              Ver transação no Explorer <span>↗</span>
            </a>
            <a
              className="button button-secondary"
              style={{ marginTop: 10 }}
              href={`https://explorer.solana.com/address/${certificate.mintAddress}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
            >
              Ver mint no Explorer <span>↗</span>
            </a>

            <Link
              className="text-link"
              href={`/verificar/${certificate.verificationCode}`}
            >
              Ver página pública de verificação →
            </Link>
          </aside>
        </div>

        <Link className="back-link" href="/emitir">
          ← Emitir outro certificado
        </Link>
      </section>
    </main>
  );
}
