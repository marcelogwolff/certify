"use client";

import { address } from "@solana/kit";
import { generateKeyPairSigner } from "@solana/kit";
import {
  getCreateMintInstructionPlan,
  getMintToATAInstructionPlanAsync,
} from "@solana-program/token-2022";
import { solanaClient } from "@/components/solana-providers";

export type MintCertificateBadgeInput = {
  recipientWallet: string;
  courseName: string;
  metadataUri: string;
};

export type MintCertificateBadgeResult = {
  mintAddress: string;
  transactionSignature: string;
};

export async function mintCertificateBadge({
  recipientWallet,
  courseName,
  metadataUri,
}: MintCertificateBadgeInput): Promise<MintCertificateBadgeResult> {
  const issuer = solanaClient.payer;
  const recipient = address(recipientWallet);
  const newMint = await generateKeyPairSigner();

  const createMintPlan = await getCreateMintInstructionPlan(solanaClient, {
    payer: issuer,
    newMint,
    decimals: 0,
    mintAuthority: issuer,
    extensions: [
      {
        __kind: "MetadataPointer",
        authority: issuer.address,
        metadataAddress: newMint.address,
      },
      {
        __kind: "TokenMetadata",
        updateAuthority: issuer.address,
        mint: newMint.address,
        name: `Certificado - ${courseName}`.slice(0, 64),
        symbol: "CERT",
        uri: metadataUri,
        additionalMetadata: new Map(),
      },
    ],
  });

  const mintToPlan = await getMintToATAInstructionPlanAsync({
    payer: issuer,
    owner: recipient,
    mint: newMint.address,
    mintAuthority: issuer,
    amount: 1,
    decimals: 0,
  });

  const result = await solanaClient.sendTransaction([createMintPlan, mintToPlan]);

  return {
    mintAddress: newMint.address,
    transactionSignature: result.context.signature,
  };
}
