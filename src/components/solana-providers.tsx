"use client";

import { createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";
import { ClientProvider } from "@solana/react";
import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from "@solana-mobile/wallet-standard-mobile";
import { SOLANA_RPC_URL } from "@/lib/solana";

if (typeof window !== "undefined" && /android/i.test(navigator.userAgent)) {
  registerMwa({
    appIdentity: {
      name: "Certify",
      uri: window.location.origin,
      icon: "/favicon.ico",
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ["solana:devnet"],
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  });
}

export const solanaClient = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(solanaRpc({ rpcUrl: SOLANA_RPC_URL }));

export type SolanaClient = Awaited<typeof solanaClient>;

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  return <ClientProvider client={solanaClient}>{children}</ClientProvider>;
}
