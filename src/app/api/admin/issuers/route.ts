import { NextRequest, NextResponse } from "next/server";
import { listIssuers } from "@/lib/issuers";
import { isAdminWallet } from "@/lib/solana";

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet || !isAdminWallet(wallet)) {
    return NextResponse.json(
      { error: "Carteira não autorizada." },
      { status: 403 },
    );
  }

  const issuers = await listIssuers();
  return NextResponse.json({ issuers });
}
