import { NextResponse } from "next/server";
import { getCertificateByCode } from "@/lib/certificates";

const verificationCodePattern = /^CERT-[A-Z0-9]{6,20}$/;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const verificationCode = code.toUpperCase();

  if (!verificationCodePattern.test(verificationCode)) {
    return NextResponse.json(
      { error: "Código de verificação inválido." },
      { status: 400 },
    );
  }

  const certificate = await getCertificateByCode(verificationCode);

  if (!certificate) {
    return NextResponse.json(
      { error: "Certificado não encontrado." },
      { status: 404 },
    );
  }

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    name: `Certificado — ${certificate.courseName}`,
    description:
      "Certificado de participação verificável emitido na Solana Devnet. Este selo não é um diploma oficial.",
    image: `${origin}/certificate-badge.svg`,
    external_url: `${origin}/verificar/${certificate.verificationCode}`,
    attributes: [
      { trait_type: "Participante", value: certificate.recipientName },
      { trait_type: "Curso", value: certificate.courseName },
      {
        trait_type: "Carga horária",
        value: `${certificate.workloadHours} horas`,
      },
      { trait_type: "Data de emissão", value: certificate.issuedAt },
      {
        trait_type: "Código de verificação",
        value: certificate.verificationCode,
      },
      { trait_type: "Rede", value: "Devnet" },
    ],
  });
}
