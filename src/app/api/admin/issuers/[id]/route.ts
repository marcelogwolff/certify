import { NextRequest, NextResponse } from "next/server";
import { reviewIssuer } from "@/lib/issuers";
import { isAdminWallet } from "@/lib/solana";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const { wallet, status } = body as Record<string, unknown>;

  if (typeof wallet !== "string" || !isAdminWallet(wallet)) {
    return NextResponse.json(
      { error: "Carteira não autorizada." },
      { status: 403 },
    );
  }

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  try {
    const issuer = await reviewIssuer(id, status);
    return NextResponse.json({ issuer });
  } catch (error) {
    console.error("Unable to review issuer", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a instituição." },
      { status: 500 },
    );
  }
}
