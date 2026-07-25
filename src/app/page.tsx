import Link from "next/link";
import { Header } from "@/components/header";

const steps = [
  ["01", "Emita", "Conecte sua carteira e preencha os dados do certificado."],
  ["02", "Registre", "O badge é emitido para a wallet do participante na Devnet."],
  ["03", "Verifique", "Qualquer pessoa valida a conquista por um link público."],
];

export default function Home() {
  return (
    <main>
      <Header />
      <section className="hero page-shell">
        <div className="hero-copy">
          <span className="eyebrow">Certificados na Solana · Devnet</span>
          <h1>Conquistas que não precisam de papel para serem confiáveis.</h1>
          <p>
            Emita certificados de participação verificáveis na Solana. Simples
            para quem organiza, públicos para quem precisa validar.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/emitir">
              Emitir certificado <span>→</span>
            </Link>
            <Link className="button button-secondary" href="/verificar/CERT-7K4M2P">
              Ver exemplo
            </Link>
          </div>
          <p className="hero-note"><span>●</span> Construído para a Solana Devnet</p>
        </div>

        <div className="hero-visual" aria-label="Exemplo de certificado Certify">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <article className="mini-certificate">
            <div className="mini-topline"><span>Certify</span><span>✦</span></div>
            <div className="mini-seal">C</div>
            <p>Certificado de participação</p>
            <h2>Workshop de Desenvolvimento Solana</h2>
            <div className="mini-rule" />
            <strong>Ana Silva</strong>
            <small>Verificável na Devnet</small>
          </article>
          <div className="verification-chip"><span>✓</span> Emissão verificada</div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="page-shell">
          <div className="section-heading">
            <span className="eyebrow">Como funciona</span>
            <h2>Emita em minutos. Verifique para sempre.</h2>
          </div>
          <div className="steps-grid">
            {steps.map(([number, title, description]) => (
              <article className="step-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-section page-shell">
        <div>
          <span className="eyebrow">Transparência por padrão</span>
          <h2>Um link, uma prova, nenhuma dúvida.</h2>
        </div>
        <p>
          Cada emissão terá um registro público na Solana Devnet, uma URL
          compartilhável e acesso direto ao Solana Explorer.
        </p>
      </section>
    </main>
  );
}
