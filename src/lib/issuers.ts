import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export type IssuerStatus = "pending" | "approved" | "rejected";

export type Issuer = {
  id: string;
  walletAddress: string;
  name: string;
  status: IssuerStatus;
  createdAt: string;
  reviewedAt: string | null;
};

type IssuerRow = {
  id: string;
  wallet_address: string;
  name: string;
  status: IssuerStatus;
  created_at: string;
  reviewed_at: string | null;
};

function toIssuer(row: IssuerRow): Issuer {
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at,
  };
}

export async function getIssuerByWallet(
  walletAddress: string,
): Promise<Issuer | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("issuers")
    .select("*")
    .eq("wallet_address", walletAddress)
    .maybeSingle<IssuerRow>();

  if (error) {
    console.error("Unable to load issuer", error.message);
    return null;
  }

  return data ? toIssuer(data) : null;
}

export async function listIssuers(): Promise<Issuer[]> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("issuers")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<IssuerRow[]>();

  if (error) {
    console.error("Unable to list issuers", error.message);
    return [];
  }

  return (data ?? []).map(toIssuer);
}

export type RegisterIssuerInput = {
  walletAddress: string;
  name: string;
};

export async function registerIssuer({
  walletAddress,
  name,
}: RegisterIssuerInput): Promise<Issuer> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase não está configurado no servidor.");

  const existing = await getIssuerByWallet(walletAddress);

  if (existing && existing.status !== "rejected") {
    return existing;
  }

  if (existing && existing.status === "rejected") {
    const { data, error } = await supabase
      .from("issuers")
      .update({ name, status: "pending", reviewed_at: null })
      .eq("id", existing.id)
      .select("*")
      .single<IssuerRow>();

    if (error) throw new Error(error.message);
    return toIssuer(data);
  }

  const { data, error } = await supabase
    .from("issuers")
    .insert({ wallet_address: walletAddress, name, status: "pending" })
    .select("*")
    .single<IssuerRow>();

  if (error) {
    if (error.code === "23505") {
      const race = await getIssuerByWallet(walletAddress);
      if (race) return race;
    }
    throw new Error(error.message);
  }

  return toIssuer(data);
}

export async function reviewIssuer(
  id: string,
  status: "approved" | "rejected",
): Promise<Issuer> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error("Supabase não está configurado no servidor.");

  const { data, error } = await supabase
    .from("issuers")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single<IssuerRow>();

  if (error) throw new Error(error.message);
  return toIssuer(data);
}
