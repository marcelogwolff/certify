# Certify

Aplicação para emissão e validação de certificados verificáveis na **Solana Devnet**.

Este repositório contém a primeira etapa do MVP: interface navegável para emissão e verificação, construída com Next.js, TypeScript e Tailwind CSS. A conexão de carteira, o mint do badge e o banco de dados serão adicionados nas próximas etapas descritas em [CERTIFY_MVP.md](./CERTIFY_MVP.md).

## Páginas atuais

- `/` — página inicial do produto.
- `/emitir` — formulário visual de emissão.
- `/verificar/CERT-7K4M2P` — exemplo de página pública de verificação.

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

## Próxima etapa

Adicionar Solana Wallet Adapter e conectar a Phantom na Devnet. Depois disso, implementaremos o fluxo real de emissão e a página de validação consultando dados on-chain e Supabase.

## Segurança

Nunca adicione seed phrase, chave privada ou `SUPABASE_SERVICE_ROLE_KEY` ao GitHub. Variáveis secretas pertencem apenas ao `.env.local` e às configurações de ambiente da Vercel.
