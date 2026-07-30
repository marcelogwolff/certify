"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/header";
import { WalletButton } from "@/components/wallet-button";
import { isAdminWallet, shortenAddress } from "@/lib/solana";
import type { Issuer } from "@/lib/issuers";

type IssuersResult = { wallet: string; issuers: Issuer[] };

export default function AdminPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [issuersResult, setIssuersResult] = useState<IssuersResult | null>(
    null,
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = Boolean(walletAddress && isAdminWallet(walletAddress));

  const loadIssuers = useCallback((wallet: string) => {
    return fetch(`/api/admin/issuers?wallet=${encodeURIComponent(wallet)}`)
      .then((response) => response.json())
      .then((body) => setIssuersResult({ wallet, issuers: body.issuers ?? [] }))
      .catch(() => setIssuersResult({ wallet, issuers: [] }));
  }, []);

  useEffect(() => {
    if (!isAdmin || !walletAddress) {
      return;
    }

    loadIssuers(walletAddress);
  }, [isAdmin, walletAddress, loadIssuers]);

  const issuers =
    isAdmin && issuersResult?.wallet === walletAddress
      ? issuersResult.issuers
      : null;

  async function handleReview(id: string, status: "approved" | "rejected") {
    if (!walletAddress) return;

    setErrorMessage(null);
    setReviewingId(id);

    try {
      const response = await fetch(`/api/admin/issuers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress, status }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          body.error ?? "Não foi possível atualizar a instituição.",
        );
      }

      await loadIssuers(walletAddress);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a instituição.",
      );
    } finally {
      setReviewingId(null);
    }
  }

  const pending =
    issuers?.filter((issuer) => issuer.status === "pending") ?? [];
  const reviewed =
    issuers?.filter((issuer) => issuer.status !== "pending") ?? [];

  return (
    <main>
      <Header />
      <section className="page-shell issue-layout">
        <div className="page-heading">
          <span className="eyebrow">Admin · Devnet</span>
          <h1>Aprovação de instituições.</h1>
          <p>
            Conecte a carteira administradora para aprovar ou rejeitar
            instituições.
          </p>
        </div>

        <div style={{ marginTop: 24, maxWidth: 360 }}>
          <WalletButton
            onConnectionChange={(address) => setWalletAddress(address)}
          />
        </div>

        {walletAddress && !isAdmin && (
          <p className="issuer-status issuer-denied" style={{ marginTop: 24 }}>
            Esta carteira não é a carteira administradora.
          </p>
        )}

        {isAdmin && issuers === null && (
          <p className="form-note" style={{ marginTop: 24, textAlign: "left" }}>
            Carregando instituições…
          </p>
        )}

        {errorMessage && (
          <p className="wallet-error" style={{ marginTop: 24 }}>
            {errorMessage}
          </p>
        )}

        {isAdmin && issuers !== null && (
          <div style={{ marginTop: 24 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 22 }}>
              Pendentes ({pending.length})
            </h2>
            {pending.length === 0 && (
              <p className="form-note" style={{ textAlign: "left" }}>
                Nenhum cadastro pendente.
              </p>
            )}
            <div
              className="issue-grid"
              style={{ marginTop: 16, gridTemplateColumns: "1fr" }}
            >
              {pending.map((issuer) => (
                <div key={issuer.id} className="certificate-form">
                  <div className="form-intro">
                    <div>
                      <p className="step">
                        {shortenAddress(issuer.walletAddress, 6)}
                      </p>
                      <h2>{issuer.name}</h2>
                    </div>
                    <span className="network-badge">● Pendente</span>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={reviewingId === issuer.id}
                      onClick={() => handleReview(issuer.id, "approved")}
                    >
                      Aprovar
                    </button>
                    <button
                      className="button button-secondary"
                      type="button"
                      disabled={reviewingId === issuer.id}
                      onClick={() => handleReview(issuer.id, "rejected")}
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h2
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 22,
                marginTop: 40,
              }}
            >
              Revisadas
            </h2>
            {reviewed.length === 0 && (
              <p className="form-note" style={{ textAlign: "left" }}>
                Nenhuma instituição revisada ainda.
              </p>
            )}
            <div
              className="issue-grid"
              style={{ marginTop: 16, gridTemplateColumns: "1fr" }}
            >
              {reviewed.map((issuer) => (
                <div key={issuer.id} className="certificate-form">
                  <div className="form-intro">
                    <div>
                      <p className="step">
                        {shortenAddress(issuer.walletAddress, 6)}
                      </p>
                      <h2>{issuer.name}</h2>
                    </div>
                    <span className="network-badge">
                      ●{" "}
                      {issuer.status === "approved" ? "Aprovada" : "Rejeitada"}
                    </span>
                  </div>
                  {issuer.status === "rejected" && (
                    <button
                      className="button button-primary"
                      type="button"
                      disabled={reviewingId === issuer.id}
                      onClick={() => handleReview(issuer.id, "approved")}
                    >
                      Aprovar agora
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
