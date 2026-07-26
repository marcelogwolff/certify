"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { address as solanaAddress } from "@solana/kit";
import {
  useConnect,
  useConnectedWallet,
  useDisconnect,
  useWallets,
  WalletReadyGate,
} from "@solana/kit-plugin-wallet/react";
import { solanaClient } from "@/components/solana-providers";
import { isAuthorizedIssuer, shortenAddress } from "@/lib/solana";

type WalletButtonProps = {
  onConnectionChange?: (walletAddress: string | null, isAuthorized: boolean) => void;
};

function WalletControls({ onConnectionChange }: WalletButtonProps) {
  const wallets = useWallets(solanaClient);
  const connected = useConnectedWallet(solanaClient);
  const { dispatch: connect, isRunning: isConnecting, error: connectionError } = useConnect(solanaClient);
  const { dispatch: disconnect, isRunning: isDisconnecting } = useDisconnect(solanaClient);
  const [balance, setBalance] = useState<{ address: string; value: string } | null>(null);
  const [showWallets, setShowWallets] = useState(false);

  const address = connected?.account.address ?? null;
  const authorized = address ? isAuthorizedIssuer(address) : false;

  useEffect(() => {
    onConnectionChange?.(address, authorized);
  }, [address, authorized, onConnectionChange]);

  useEffect(() => {
    if (!address) {
      return;
    }

    let isCurrent = true;

    solanaClient.rpc
      .getBalance(solanaAddress(address))
      .send()
      .then(({ value }) => {
        if (isCurrent) setBalance({ address, value: (Number(value) / 1_000_000_000).toFixed(4) });
      })
      .catch(() => {
        if (isCurrent) setBalance({ address, value: "indisponível" });
      });

    return () => {
      isCurrent = false;
    };
  }, [address, connected]);

  if (connected) {
    return (
      <div className="wallet-connected" aria-live="polite">
        <div>
          <span className="wallet-network">● Devnet</span>
          <strong>{shortenAddress(address ?? "")}</strong>
          <small>{balance?.address === address ? `${balance.value} SOL` : "Consultando saldo…"}</small>
        </div>
        <button
          className="wallet-disconnect"
          type="button"
          disabled={isDisconnecting}
          onClick={() => disconnect()}
        >
          Desconectar
        </button>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="wallet-unavailable">
        <strong>Nenhuma carteira encontrada</strong>
        <span>Instale ou abra Phantom/Solflare e recarregue a página.</span>
      </div>
    );
  }

  const selectWallet = (wallet: (typeof wallets)[number]) => {
    setShowWallets(false);
    connect(wallet);
  };

  return (
    <div className="wallet-connect-area">
      <button
        className="button button-primary"
        type="button"
        disabled={isConnecting}
        onClick={() => (wallets.length === 1 ? selectWallet(wallets[0]) : setShowWallets((open) => !open))}
      >
        {isConnecting ? "Conectando…" : "Conectar carteira"} <span>→</span>
      </button>
      {showWallets && (
        <div className="wallet-options" role="menu" aria-label="Carteiras disponíveis">
          {wallets.map((wallet) => (
            <button key={wallet.name} type="button" role="menuitem" onClick={() => selectWallet(wallet)}>
              {wallet.name}
            </button>
          ))}
        </div>
      )}
      {Boolean(connectionError) && <p className="wallet-error">Não foi possível conectar. Verifique a carteira e tente novamente.</p>}
    </div>
  );
}

const noopSubscribe = () => () => {};

function useHasMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function WalletButton(props: WalletButtonProps) {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return <span className="wallet-loading">Detectando carteiras…</span>;
  }

  return (
    <WalletReadyGate client={solanaClient} fallback={<span className="wallet-loading">Detectando carteiras…</span>}>
      <WalletControls {...props} />
    </WalletReadyGate>
  );
}
