import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type CertificateStatus = "active" | "pending" | "revoked";

export type Certificate = {
  id: string;
  verificationCode: string;
  recipientName: string;
  recipientWallet: string;
  courseName: string;
  workloadHours: number;
  issuedAt: string;
  issuerWallet: string;
  issuerName: string | null;
  mintAddress: string | null;
  transactionSignature: string | null;
  metadataUri: string | null;
  status: CertificateStatus;
  createdAt: string;
};

type CertificateRow = {
  id: string;
  verification_code: string;
  recipient_name: string;
  recipient_wallet: string;
  course_name: string;
  workload_hours: number;
  issued_at: string;
  issuer_wallet: string;
  issuer_name: string | null;
  mint_address: string | null;
  transaction_signature: string | null;
  metadata_uri: string | null;
  status: CertificateStatus;
  created_at: string;
};

function toCertificate(row: CertificateRow): Certificate {
  return {
    id: row.id,
    verificationCode: row.verification_code,
    recipientName: row.recipient_name,
    recipientWallet: row.recipient_wallet,
    courseName: row.course_name,
    workloadHours: row.workload_hours,
    issuedAt: row.issued_at,
    issuerWallet: row.issuer_wallet,
    issuerName: row.issuer_name,
    mintAddress: row.mint_address,
    transactionSignature: row.transaction_signature,
    metadataUri: row.metadata_uri,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getCertificateByCode(
  code: string,
): Promise<Certificate | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("verification_code", code)
    .maybeSingle<CertificateRow>();

  if (error) {
    console.error("Unable to load certificate", error.message);
    return null;
  }

  return data ? toCertificate(data) : null;
}

export async function listCertificatesByWallet(
  wallet: string,
): Promise<Certificate[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("recipient_wallet", wallet)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .returns<CertificateRow[]>();

  if (error) {
    console.error("Unable to list certificates", error.message);
    return [];
  }

  return (data ?? []).map(toCertificate);
}

export type NewCertificateInput = {
  verificationCode: string;
  recipientName: string;
  recipientWallet: string;
  courseName: string;
  workloadHours: number;
  issuedAt: string;
  issuerWallet: string;
  issuerName: string;
  metadataUri: string;
  mintAddress: string;
  transactionSignature: string;
};

export class DuplicateCertificateError extends Error {}

export async function createCertificate(
  input: NewCertificateInput,
): Promise<Certificate> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase não está configurado no servidor.");

  const { data, error } = await supabase
    .from("certificates")
    .insert({
      verification_code: input.verificationCode,
      recipient_name: input.recipientName,
      recipient_wallet: input.recipientWallet,
      course_name: input.courseName,
      workload_hours: input.workloadHours,
      issued_at: input.issuedAt,
      issuer_wallet: input.issuerWallet,
      issuer_name: input.issuerName,
      metadata_uri: input.metadataUri,
      mint_address: input.mintAddress,
      transaction_signature: input.transactionSignature,
      status: "active",
    })
    .select("*")
    .single<CertificateRow>();

  if (error) {
    if (error.code === "23505") {
      throw new DuplicateCertificateError(
        "Código de verificação, mint ou assinatura já registrados.",
      );
    }
    throw new Error(error.message);
  }

  return toCertificate(data);
}
