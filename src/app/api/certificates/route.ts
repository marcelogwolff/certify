import { NextRequest, NextResponse } from "next/server";
import {
  createCertificate,
  DuplicateCertificateError,
  listCertificatesByWallet,
} from "@/lib/certificates";
import { getIssuerByWallet } from "@/lib/issuers";
import { isValidSolanaAddress } from "@/lib/solana";

const verificationCodePattern = /^CERT-[A-Z0-9]{6,20}$/;
const signaturePattern = /^[1-9A-HJ-NP-Za-km-z]{64,90}$/;

function isValidDate(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 },
    );
  }

  const {
    verificationCode,
    recipientName,
    recipientWallet,
    courseName,
    workloadHours,
    issuedAt,
    issuerWallet,
    mintAddress,
    transactionSignature,
  } = body as Record<string, unknown>;

  if (typeof issuerWallet !== "string" || !isValidSolanaAddress(issuerWallet)) {
    return NextResponse.json(
      { error: "Wallet emissora inválida." },
      { status: 400 },
    );
  }

  const issuer = await getIssuerByWallet(issuerWallet);

  if (!issuer || issuer.status !== "approved") {
    return NextResponse.json(
      { error: "Esta carteira não está autorizada a emitir certificados." },
      { status: 403 },
    );
  }

  if (
    typeof verificationCode !== "string" ||
    !verificationCodePattern.test(verificationCode)
  ) {
    return NextResponse.json(
      { error: "Código de verificação inválido." },
      { status: 400 },
    );
  }

  if (
    typeof recipientName !== "string" ||
    recipientName.trim().length < 2 ||
    recipientName.length > 120
  ) {
    return NextResponse.json(
      { error: "Nome do participante inválido." },
      { status: 400 },
    );
  }

  if (
    typeof recipientWallet !== "string" ||
    !isValidSolanaAddress(recipientWallet)
  ) {
    return NextResponse.json(
      { error: "Wallet do participante inválida." },
      { status: 400 },
    );
  }

  if (
    typeof courseName !== "string" ||
    courseName.trim().length < 2 ||
    courseName.length > 160
  ) {
    return NextResponse.json(
      { error: "Curso ou evento inválido." },
      { status: 400 },
    );
  }

  if (
    typeof workloadHours !== "number" ||
    !Number.isInteger(workloadHours) ||
    workloadHours <= 0 ||
    workloadHours > 10000
  ) {
    return NextResponse.json(
      { error: "Carga horária inválida." },
      { status: 400 },
    );
  }

  if (!isValidDate(issuedAt)) {
    return NextResponse.json(
      { error: "Data de conclusão inválida." },
      { status: 400 },
    );
  }

  if (typeof mintAddress !== "string" || !isValidSolanaAddress(mintAddress)) {
    return NextResponse.json(
      { error: "Endereço do mint inválido." },
      { status: 400 },
    );
  }

  if (
    typeof transactionSignature !== "string" ||
    !signaturePattern.test(transactionSignature)
  ) {
    return NextResponse.json(
      { error: "Assinatura de transação inválida." },
      { status: 400 },
    );
  }

  const metadataUri = `${new URL(request.url).origin}/api/certificates/${verificationCode}/metadata`;

  try {
    const certificate = await createCertificate({
      verificationCode,
      recipientName: recipientName.trim(),
      recipientWallet,
      courseName: courseName.trim(),
      workloadHours,
      issuedAt,
      issuerWallet,
      issuerName: issuer.name,
      metadataUri,
      mintAddress,
      transactionSignature,
    });

    return NextResponse.json({ certificate }, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateCertificateError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Unable to create certificate", error);
    return NextResponse.json(
      { error: "Não foi possível salvar o certificado." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet");

  if (!wallet || !isValidSolanaAddress(wallet)) {
    return NextResponse.json(
      { error: "Parâmetro wallet inválido." },
      { status: 400 },
    );
  }

  const certificates = await listCertificatesByWallet(wallet);
  return NextResponse.json({ certificates });
}
