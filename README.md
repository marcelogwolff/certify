# Certify

Aplicação full stack para emissão e validação de certificados verificáveis na **Solana Devnet**.

Construído com Next.js, TypeScript, Tailwind CSS, `@solana/kit` (Wallet Standard) e Supabase. A emissão cria um badge on-chain real: um mint **Token-2022** (decimais 0, supply 1) com nome/URI gravados diretamente no mint via a extensão de metadata, enviado para a wallet do participante.

## Páginas atuais

- `/` — página inicial do produto.
- `/emitir` — conecta a carteira emissora autorizada, minta o badge na Devnet e salva o certificado.
- `/sucesso/[codigo]` — confirmação da emissão com links para o Explorer.
- `/verificar/[codigo]` — página pública de verificação.
- `/meus-certificados` — certificados recebidos pela carteira conectada.
- `/api/certificates` — cria (`POST`) e lista por wallet (`GET ?wallet=`).
- `/api/certificates/[codigo]` — consulta pública por código.
- `/api/certificates/[codigo]/metadata` — JSON de metadata do NFT (usado pelo mint e por carteiras/exploradores).

## Rodar localmente

É necessário Node.js 20 ou superior. Depois de instalar o Node na sua máquina:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Para validar o projeto antes de publicar:

```bash
npm run lint
npm run build
```

## Banco de dados (Supabase)

A consulta pública de certificados usa Supabase no servidor. Crie um projeto no
Supabase, abra o **SQL Editor** e execute o arquivo
[`supabase/migrations/20260725_create_certificates.sql`](./supabase/migrations/20260725_create_certificates.sql).

Em seguida, preencha no `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
SUPABASE_SECRET_KEY=sb_secret_<sua-chave-de-servidor>
```

Em projetos antigos, `SUPABASE_SERVICE_ROLE_KEY` pode ser usado no lugar de
`SUPABASE_SECRET_KEY`. Essas chaves são exclusivas do servidor: nunca use o
prefixo `NEXT_PUBLIC_` nem compartilhe a chave secret/service role.

A rota `GET /api/certificates/CERT-ABC123` e a página
`/verificar/CERT-ABC123` leem o certificado pelo código público. O certificado só
é gravado no Supabase depois que a transação de mint é confirmada na Devnet.

## Autorização de emissão

Instituições se cadastram em `/instituicoes` (carteira + nome) e ficam com
status `pending` até serem aprovadas. Defina `NEXT_PUBLIC_ADMIN_WALLET` no
`.env.local` (e na Vercel) com a chave pública Solana do administrador da
plataforma — ele aprova ou rejeita cadastros em `/admin`. Só instituições
aprovadas (tabela `issuers` no Supabase) conseguem emitir em `/emitir`; a
verificação acontece tanto no cliente (para exibir a UI correta) quanto no
servidor, na rota `POST /api/certificates`.

## Segurança

Nunca adicione seed phrase, chave privada ou `SUPABASE_SERVICE_ROLE_KEY` ao GitHub. Variáveis secretas pertencem apenas ao `.env.local` e às configurações de ambiente da Vercel.
