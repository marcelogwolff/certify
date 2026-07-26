"use client";

import { createClient } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { walletSigner } from "@solana/kit-plugin-wallet";
import { ClientProvider } from "@solana/react";
import { SOLANA_RPC_URL } from "@/lib/solana";

export const solanaClient = createClient()
  .use(walletSigner({ chain: "solana:devnet" }))
  .use(solanaRpc({ rpcUrl: SOLANA_RPC_URL }));

export type SolanaClient = Awaited<typeof solanaClient>;

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  return <ClientProvider client={solanaClient}>{children}</ClientProvider>;
}
