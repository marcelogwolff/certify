create type public.issuer_status as enum ('pending', 'approved', 'rejected');

create table public.issuers (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  name text not null check (char_length(name) between 2 and 160),
  status public.issuer_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index issuers_status_idx on public.issuers (status);

alter table public.issuers enable row level security;

-- Nenhuma política pública é criada: o app lê/escreve por rotas no servidor
-- com a chave service_role, que ignora RLS.

alter table public.certificates add column issuer_name text;

-- Mantém o emissor atual (antes autorizado via NEXT_PUBLIC_ISSUER_WALLETS)
-- funcionando sem precisar se recadastrar.
insert into public.issuers (wallet_address, name, status, reviewed_at)
values ('9GF2Mbaj8AUpvzJyRDBtmLXc2pTuXixj33pCYYDFUUWK', 'Certify', 'approved', now());
