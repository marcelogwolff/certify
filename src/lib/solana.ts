import { address } from "@solana/kit";

export const SOLANA_NETWORK = "devnet" as const;

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export function isAuthorizedIssuer(walletAddress: string): boolean {
  const authorizedWallets = (process.env.NEXT_PUBLIC_ISSUER_WALLETS ?? "")
    .split(",")
    .map((wallet) => wallet.trim())
    .filter(Boolean);

  return authorizedWallets.includes(walletAddress);
}

export function shortenAddress(walletAddress: string, visibleCharacters = 4): string {
  if (walletAddress.length <= visibleCharacters * 2 + 1) return walletAddress;

  return `${walletAddress.slice(0, visibleCharacters)}…${walletAddress.slice(-visibleCharacters)}`;
}

export function isValidSolanaAddress(value: string): boolean {
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
}
