import { createClient, generateKeyPairSigner } from "@solana/kit";
import { solanaRpc } from "@solana/kit-plugin-rpc";
import { payer } from "@solana/kit-plugin-signer";
import {
  getCreateMintInstructionPlan,
  getMintToATAInstructionPlanAsync,
} from "@solana-program/token-2022";

const RPC_URL = "https://polished-dry-forest.solana-devnet.quiknode.pro/c5943463eb6799a039aee8340e2028f80bcc570d/";

async function airdropAndWait(address, lamports) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "requestAirdrop",
        params: [address, lamports],
      }),
    }).then((r) => r.json());

    if (res.error) {
      console.log("airdrop attempt failed, retrying in 3s...", res.error.message);
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    for (let i = 0; i < 20; i++) {
      const bal = await fetch(RPC_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address] }),
      }).then((r) => r.json());
      if (bal.result?.value > 0) return bal.result.value;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error("Airdrop did not land in time");
}

async function main() {
  const issuer = await generateKeyPairSigner();
  console.log("issuer:", issuer.address);

  const balance = await airdropAndWait(issuer.address, 1_000_000_000);
  console.log("issuer balance:", balance);

  const client = createClient()
    .use(payer(issuer))
    .use(solanaRpc({ rpcUrl: RPC_URL }));

  const newMint = await generateKeyPairSigner();
  console.log("mint:", newMint.address);

  const createMintPlan = await getCreateMintInstructionPlan(client, {
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
        name: "Certificado - Teste Devnet",
        symbol: "CERT",
        uri: "https://example.com/api/certificates/CERT-TEST01/metadata",
        additionalMetadata: new Map(),
      },
    ],
  });

  const mintToPlan = await getMintToATAInstructionPlanAsync({
    payer: issuer,
    owner: issuer.address,
    mint: newMint.address,
    mintAuthority: issuer,
    amount: 1,
    decimals: 0,
  });

  console.log("Sending transaction...");
  const result = await client.sendTransaction([createMintPlan, mintToPlan]);
  console.log("SUCCESS signature:", result.context.signature);
}

main().catch((error) => {
  console.error("FAILED:", error?.message ?? error);
  if (error?.cause) {
    console.error("--- cause ---");
    console.error(error.cause);
    if (error.cause?.cause) {
      console.error("--- cause.cause ---");
      console.error(error.cause.cause);
    }
    if (error.cause?.context) {
      console.error("--- cause.context ---");
      console.error(error.cause.context);
    }
  }
  if (error?.context) {
    console.error("--- context ---");
    console.error(error.context);
  }
  process.exit(1);
});
