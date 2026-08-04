import { address } from "@solana/kit";

export const SOLANA_NETWORK = "devnet" as const;

export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export function isAdminWallet(walletAddress: string): boolean {
  const adminWallets = (process.env.NEXT_PUBLIC_ADMIN_WALLETS ?? "")
    .split(",")
    .map((wallet) => wallet.trim())
    .filter(Boolean);

  return adminWallets.includes(walletAddress);
}

export function shortenAddress(
  walletAddress: string,
  visibleCharacters = 4,
): string {
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
