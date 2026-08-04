"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/header";
import { WalletButton } from "@/components/wallet-button";
import { mintCertificateBadge } from "@/lib/mint-certificate";

function generateVerificationCode(): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let suffix = "";
  for (const byte of bytes) {
    suffix += alphabet[byte % alphabet.length];
  }
  return `CERT-${suffix}`;
}

type Step = "idle" | "minting" | "saving";

export default function IssueCertificatePage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [recipientName, setRecipientName] = useState("");
  const [courseName, setCourseName] = useState(
    "Workshop de Desenvolvimento Solana",
  );
  const [workloadHours, setWorkloadHours] = useState("4");
  const [issuedAt, setIssuedAt] = useState("");
  const [recipientWallet, setRecipientWallet] = useState("");

  const [step, setStep] = useState<Step>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isBusy = step !== "idle";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!walletAddress || !isAuthorized) {
      setErrorMessage(
        "Conecte uma carteira autorizada para emitir certificados.",
      );
      return;
    }

    const trimmedName = recipientName.trim();
    const trimmedCourse = courseName.trim();
    const hours = Number(workloadHours);

    if (trimmedName.length < 2) {
      setErrorMessage("Informe o nome do participante.");
      return;
    }
    if (trimmedCourse.length < 2) {
      setErrorMessage("Informe o curso ou evento.");
      return;
    }
    if (!Number.isInteger(hours) || hours <= 0) {
      setErrorMessage("Informe uma carga horária válida.");
      return;
    }
    if (!issuedAt) {
      setErrorMessage("Informe a data de conclusão.");
      return;
    }
    if (!recipientWallet.trim()) {
      setErrorMessage("Informe a wallet do participante.");
      return;
    }

    const verificationCode = generateVerificationCode();
    const metadataUri = `${window.location.origin}/api/certificates/${verificationCode}/metadata`;

    try {
      setStep("minting");
      const { mintAddress, transactionSignature } = await mintCertificateBadge({
        recipientWallet: recipientWallet.trim(),
        courseName: trimmedCourse,
        metadataUri,
      });

      setStep("saving");
      const response = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verificationCode,
          recipientName: trimmedName,
          recipientWallet: recipientWallet.trim(),
          courseName: trimmedCourse,
          workloadHours: hours,
          issuedAt,
          issuerWallet: walletAddress,
          mintAddress,
          transactionSignature,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Não foi possível salvar o certificado.");
      }

      router.push(`/sucesso/${verificationCode}`);
    } catch (error) {
      setStep("idle");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível emitir o certificado. Tente novamente.",
      );
    }
  }

  return (
    <main>
      <Header />
      <section className="page-shell issue-layout">
        <div className="page-heading">
          <span className="eyebrow">Emissão · Devnet</span>
          <h1>Emita uma conquista que pode ser verificada.</h1>
          <p>
            Conecte sua carteira Solana na Devnet, preencha os dados e emita um
            badge on-chain para o participante.
          </p>
        </div>

        <div className="issue-grid">
          <form className="certificate-form" onSubmit={handleSubmit}>
            <div className="form-intro">
              <div>
                <p className="step">Etapa 1 de 2</p>
                <h2>Dados do certificado</h2>
              </div>
              <span className="network-badge">● Devnet</span>
            </div>

            <label>
              Nome do participante
              <input
                placeholder="Ex.: Ana Silva"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                disabled={isBusy}
                required
              />
            </label>
            <label>
              Curso ou evento
              <input
                value={courseName}
                onChange={(event) => setCourseName(event.target.value)}
                disabled={isBusy}
                required
              />
            </label>

            <div className="form-row">
              <label>
                Carga horária
                <input
                  type="number"
                  min="1"
                  placeholder="4"
                  value={workloadHours}
                  onChange={(event) => setWorkloadHours(event.target.value)}
                  disabled={isBusy}
                  required
                />
              </label>
              <label>
                Data de conclusão
                <input
                  type="date"
                  value={issuedAt}
                  onChange={(event) => setIssuedAt(event.target.value)}
                  disabled={isBusy}
                  required
                />
              </label>
            </div>

            <label>
              Wallet do participante
              <input
                placeholder="Endereço público Solana"
                spellCheck="false"
                value={recipientWallet}
                onChange={(event) => setRecipientWallet(event.target.value)}
                disabled={isBusy}
                required
              />
              <span className="field-hint">
                O badge será enviado para esta carteira na Devnet.
              </span>
            </label>

            <WalletButton
              onConnectionChange={(address, authorized) => {
                setWalletAddress(address);
                setIsAuthorized(authorized);
              }}
            />
            {walletAddress && (
              <p
                className={
                  isAuthorized
                    ? "issuer-status issuer-authorized"
                    : "issuer-status issuer-denied"
                }
              >
                {isAuthorized
                  ? "Carteira autorizada para emitir certificados."
                  : "Esta carteira está conectada, mas não está autorizada a emitir."}
              </p>
            )}

            <button
              className="button button-primary"
              type="submit"
              disabled={isBusy || !walletAddress || !isAuthorized}
            >
              {step === "minting" && "Aguardando confirmação na Devnet…"}
              {step === "saving" && "Salvando certificado…"}
              {step === "idle" && "Emitir certificado"}
              {!isBusy && <span>→</span>}
            </button>

            {errorMessage && <p className="wallet-error">{errorMessage}</p>}

            <p className="form-note">
              Sua instituição ainda não está autorizada?{" "}
              <Link
                className="text-link"
                href="/instituicoes"
                style={{ display: "inline", marginTop: 0 }}
              >
                Cadastre-se aqui
              </Link>
              .
            </p>
          </form>

          <aside className="preview-card">
            <p className="preview-label">Prévia do certificado</p>
            <div className="certificate-preview">
              <span className="preview-seal">C</span>
              <p className="preview-kicker">Certificado de participação</p>
              <h2>{courseName || "Curso ou evento"}</h2>
              <div className="preview-line" />
              <p>Conferido a</p>
              <strong>{recipientName || "Nome do participante"}</strong>
              <p className="preview-detail">
                {workloadHours || "0"} horas · {issuedAt || "Data de conclusão"}
              </p>
              <span className="preview-footer">
                Verificável na Solana Devnet
              </span>
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
