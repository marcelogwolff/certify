import { NextRequest, NextResponse } from "next/server";
import { getIssuerByWallet } from "@/lib/issuers";
import { isValidSolanaAddress } from "@/lib/solana";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet || !isValidSolanaAddress(wallet)) {
    return NextResponse.json(
      { error: "Parâmetro wallet inválido." },
      { status: 400 },
    );
  }

  const issuer = await getIssuerByWallet(wallet);

  if (!issuer) {
    return NextResponse.json({ status: "unregistered" });
  }

  return NextResponse.json({ status: issuer.status, name: issuer.name });
}
