import { NextRequest, NextResponse } from "next/server";
import { registerIssuer } from "@/lib/issuers";
import { isValidSolanaAddress } from "@/lib/solana";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const { walletAddress, name } = body as Record<string, unknown>;

  if (
    typeof walletAddress !== "string" ||
    !isValidSolanaAddress(walletAddress)
  ) {
    return NextResponse.json({ error: "Wallet inválida." }, { status: 400 });
  }

  if (typeof name !== "string" || name.trim().length < 2 || name.length > 160) {
    return NextResponse.json(
      { error: "Nome da instituição inválido." },
      { status: 400 },
    );
  }

  try {
    const issuer = await registerIssuer({
      walletAddress,
      name: name.trim(),
    });

    return NextResponse.json({ issuer }, { status: 201 });
  } catch (error) {
    console.error("Unable to register issuer", error);
    return NextResponse.json(
      { error: "Não foi possível cadastrar a instituição." },
      { status: 500 },
    );
  }
}
