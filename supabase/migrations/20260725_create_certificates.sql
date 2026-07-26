create type public.certificate_status as enum ('active', 'pending', 'revoked');

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  verification_code text not null unique check (verification_code ~ '^CERT-[A-Z0-9]{6,20}$'),
  recipient_name text not null check (char_length(recipient_name) between 2 and 120),
  recipient_wallet text not null,
  course_name text not null check (char_length(course_name) between 2 and 160),
  workload_hours integer not null check (workload_hours > 0 and workload_hours <= 10000),
  issued_at date not null,
  issuer_wallet text not null,
  mint_address text unique,
  transaction_signature text unique,
  metadata_uri text,
  status public.certificate_status not null default 'pending',
  created_at timestamptz not null default now()
);

create index certificates_recipient_wallet_idx on public.certificates (recipient_wallet);
create index certificates_issuer_wallet_idx on public.certificates (issuer_wallet);

alter table public.certificates enable row level security;

-- Nenhuma política pública é criada: o app lê por uma rota no servidor.
-- A chave secret/service_role fica somente nas variáveis do servidor e ignora RLS.
