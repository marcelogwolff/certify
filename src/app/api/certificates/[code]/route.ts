import { NextResponse } from "next/server";
import { getCertificateByCode } from "@/lib/certificates";

const verificationCodePattern = /^CERT-[A-Z0-9]{6,20}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const verificationCode = code.toUpperCase();

  if (!verificationCodePattern.test(verificationCode)) {
    return NextResponse.json({ error: "Código de verificação inválido." }, { status: 400 });
  }

  const certificate = await getCertificateByCode(verificationCode);

  if (!certificate) {
    return NextResponse.json({ error: "Certificado não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ certificate });
}
