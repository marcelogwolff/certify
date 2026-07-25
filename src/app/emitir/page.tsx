import Link from "next/link";
import { Header } from "@/components/header";

export default function IssueCertificatePage() {
  return (
    <main>
      <Header />
      <section className="page-shell issue-layout">
        <div className="page-heading">
          <span className="eyebrow">Emissão · Devnet</span>
          <h1>Emita uma conquista que pode ser verificada.</h1>
          <p>
            Preencha os dados abaixo. Na próxima etapa, sua carteira Solana
            assinará a emissão do badge na Devnet.
          </p>
        </div>

        <div className="issue-grid">
          <form className="certificate-form">
            <div className="form-intro">
              <div>
                <p className="step">Etapa 1 de 2</p>
                <h2>Dados do certificado</h2>
              </div>
              <span className="network-badge">● Devnet</span>
            </div>

            <label>
              Nome do participante
              <input placeholder="Ex.: Ana Silva" />
            </label>
            <label>
              Curso ou evento
              <input defaultValue="Workshop de Desenvolvimento Solana" />
            </label>

            <div className="form-row">
              <label>
                Carga horária
                <input type="number" min="1" placeholder="4" />
              </label>
              <label>
                Data de conclusão
                <input type="date" />
              </label>
            </div>

            <label>
              Wallet do participante
              <input placeholder="Endereço público Solana" spellCheck="false" />
              <span className="field-hint">
                O badge será enviado para esta carteira na Devnet.
              </span>
            </label>

            <button className="button button-primary" type="button">
              Conectar carteira para emitir <span>→</span>
            </button>
            <p className="form-note">
              Apenas carteiras emissoras autorizadas poderão concluir a emissão.
            </p>
          </form>

          <aside className="preview-card">
            <p className="preview-label">Prévia do certificado</p>
            <div className="certificate-preview">
              <span className="preview-seal">C</span>
              <p className="preview-kicker">Certificado de participação</p>
              <h2>Workshop de Desenvolvimento Solana</h2>
              <div className="preview-line" />
              <p>Conferido a</p>
              <strong>Nome do participante</strong>
              <p className="preview-detail">Carga horária · Data de conclusão</p>
              <span className="preview-footer">Verificável na Solana Devnet</span>
            </div>
            <Link className="text-link" href="/verificar/CERT-7K4M2P">
              Ver exemplo de certificado verificado →
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
