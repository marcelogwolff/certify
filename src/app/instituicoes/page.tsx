"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { WalletButton } from "@/components/wallet-button";

type IssuerStatus = "unregistered" | "pending" | "approved" | "rejected";

type StatusResult = {
  address: string;
  status: IssuerStatus;
  name: string | null;
};

export default function InstitutionsPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [statusResult, setStatusResult] = useState<StatusResult | null>(null);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    let isCurrent = true;

    fetch(`/api/issuers/status?wallet=${encodeURIComponent(walletAddress)}`)
      .then((response) => response.json())
      .then((body) => {
        if (!isCurrent) return;
        setStatusResult({
          address: walletAddress,
          status: body.status as IssuerStatus,
          name: body.name ?? null,
        });
      })
      .catch(() => {
        if (isCurrent) {
          setStatusResult({
            address: walletAddress,
            status: "unregistered",
            name: null,
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [walletAddress]);

  const status =
    statusResult?.address === walletAddress ? statusResult.status : null;
  const institutionName =
    (statusResult?.address === walletAddress ? statusResult.name : null) ??
    name;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!walletAddress) return;

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setErrorMessage("Informe o nome da instituição.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/issuers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, name: trimmedName }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body.error ?? "Não foi possível enviar o cadastro.");
      }

      setStatusResult({
        address: walletAddress,
        status: body.issuer.status as IssuerStatus,
        name: body.issuer.name,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o cadastro. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isCheckingStatus = walletAddress !== null && status === null;

  return (
    <main>
      <Header />
      <section className="page-shell issue-layout">
        <div className="page-heading">
          <span className="eyebrow">Instituições · Devnet</span>
          <h1>Cadastre sua instituição para emitir certificados.</h1>
          <p>
            Conecte a carteira que sua instituição vai usar para emitir
            certificados. Um administrador precisa aprovar o cadastro antes que
            você possa emitir.
          </p>
        </div>

        <div style={{ marginTop: 24, maxWidth: 360 }}>
          <WalletButton
            onConnectionChange={(address) => setWalletAddress(address)}
          />
        </div>

        {!walletAddress && (
          <p className="form-note" style={{ marginTop: 24, textAlign: "left" }}>
            Conecte uma carteira para ver ou enviar o cadastro da sua
            instituição.
          </p>
        )}

        {isCheckingStatus && (
          <p className="form-note" style={{ marginTop: 24, textAlign: "left" }}>
            Verificando cadastro…
          </p>
        )}

        {walletAddress && status === "pending" && (
          <p className="issuer-status issuer-denied" style={{ marginTop: 24 }}>
            Cadastro enviado como <strong>{institutionName}</strong>. Aguardando
            aprovação do administrador.
          </p>
        )}

        {walletAddress && status === "approved" && (
          <div style={{ marginTop: 24 }}>
            <p className="issuer-status issuer-authorized">
              Instituição <strong>{institutionName}</strong> aprovada. Você já
              pode emitir certificados.
            </p>
            <Link className="text-link" href="/emitir">
              Ir para emissão de certificados →
            </Link>
          </div>
        )}

        {walletAddress &&
          (status === "unregistered" || status === "rejected") && (
            <form
              className="certificate-form"
              style={{ marginTop: 24 }}
              onSubmit={handleSubmit}
            >
              {status === "rejected" && (
                <p className="issuer-status issuer-denied">
                  O cadastro anterior desta carteira foi rejeitado. Você pode
                  enviar um novo cadastro.
                </p>
              )}
              <label>
                Nome da instituição
                <input
                  placeholder="Ex.: Escola Técnica Solana"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </label>
              <button
                className="button button-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando…" : "Enviar cadastro"} <span>→</span>
              </button>
              {errorMessage && <p className="wallet-error">{errorMessage}</p>}
            </form>
          )}
      </section>
    </main>
  );
}
