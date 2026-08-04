# Certify — certificados verificáveis na Solana (MVP)

## 1. Visão do projeto

**Certify** é uma aplicação web que permite a um organizador emitir certificados de participação ou conclusão para carteiras Solana. Cada certificado é representado por um NFT/badge emitido na **Solana Devnet** e possui uma página pública de verificação.

O objetivo é demonstrar uma aplicação full stack com interação real on-chain, sem criar um programa Solana próprio no primeiro MVP.

> Importante: o produto emite certificados de participação/conclusão verificáveis; ele não deve se apresentar como diploma oficial.

## 2. Objetivo para o desafio

Entregar um app publicado que permita:

1. Conectar uma carteira Solana (Phantom ou Solflare).
2. Preencher dados de um certificado.
3. Emitir um badge/NFT para a carteira do participante na Devnet.
4. Salvar os dados de emissão em banco de dados.
5. Mostrar uma página pública de verificação com os dados e links on-chain.

Critérios que a demo deve comprovar:

- Frontend funcional e publicado.
- Transação real na Solana Devnet.
- Link para a transação e/ou mint no Solana Explorer com `cluster=devnet`.
- Repositório público com instruções para rodar localmente.

## 3. Escopo do MVP

### Incluído

- Landing page do produto.
- Conexão de carteira.
- Formulário de emissão de certificado.
- Cadastro de instituições (`/instituicoes`) com aprovação manual por um
  administrador (`/admin`); só instituições aprovadas podem emitir.
- Criação e envio de um NFT/badge para a wallet do participante na Devnet.
- Registro da emissão no banco de dados.
- Página pública em `/verificar/[codigo]`.
- Consulta de certificados pelo endereço da carteira conectada.
- Links para Solana Explorer e indicação explícita de Devnet.

### Fora do escopo inicial

- Smart contract/programa Anchor próprio.
- Pagamentos em mainnet.
- Login tradicional com senha.
- Revogação on-chain.
- PDF oficial assinado digitalmente.
- Múltiplos administradores (só uma carteira admin fixa aprova instituições).

Esses itens podem virar melhorias depois que o fluxo principal estiver funcionando.

## 4. Usuários e fluxos

### Emissor (organizador)

1. Acessa `/emitir`.
2. Conecta a carteira.
3. O app verifica se a chave pública está na lista de emissoras autorizadas.
4. Preenche nome, curso/evento, carga horária, data e wallet do participante.
5. Clica em **Emitir certificado**.
6. A carteira aprova a transação na Devnet.
7. O app cria o NFT/badge, registra a emissão e mostra a tela de sucesso.

### Participante

1. Recebe a URL de validação ou conecta sua carteira.
2. Acessa `/verificar/[codigo]` ou `/meus-certificados`.
3. Visualiza os dados do certificado, o mint, a carteira emissora e a transação.
4. Pode abrir os dados no Solana Explorer.

### Verificador externo

1. Escaneia o QR code ou abre a URL pública.
2. Confere os dados exibidos.
3. Abre o Explorer para confirmar que o mint/transação existe na Devnet.

## 5. Stack recomendada

| Camada | Escolha | Motivo |
| --- | --- | --- |
| Frontend/full stack | Next.js (App Router) + TypeScript | Rotas, API e deploy simples na Vercel. |
| Estilo | Tailwind CSS | Interface rápida de construir. |
| Carteiras | `@solana/wallet-adapter-react` | Suporte a Phantom e Solflare. |
| Solana | `@solana/web3.js` | Conexão, transações e endereços. |
| NFTs | Metaplex Umi + Token Metadata | Caminho comum para criar assets na Solana. |
| Banco e storage | Supabase | Postgres e armazenamento de imagem/metadata. |
| RPC | QuickNode fornecido pelo evento | Melhor confiabilidade na Devnet. |
| Deploy | Vercel | Integração direta com GitHub e Next.js. |

## 6. Decisão on-chain

O MVP deve criar um **NFT de certificado** na Solana Devnet e enviá-lo à wallet do participante.

Metadados mínimos do NFT:

```json
{
  "name": "Certificado — Workshop Solana",
  "description": "Certificado de participação verificável emitido na Solana Devnet.",
  "image": "https://<storage>/certificate-template.png",
  "attributes": [
    { "trait_type": "Participante", "value": "Ana Silva" },
    { "trait_type": "Curso", "value": "Workshop de Solana" },
    { "trait_type": "Carga horária", "value": "4 horas" },
    { "trait_type": "Data de emissão", "value": "2026-07-25" },
    { "trait_type": "Código de verificação", "value": "CERT-AB12CD" },
    { "trait_type": "Rede", "value": "Devnet" }
  ]
}
```

O NFT prova a emissão e posse. O banco permite buscas rápidas e cria a URL amigável de verificação. A página de verificação deve mostrar que os dados foram registrados na Devnet; o banco não substitui a confirmação on-chain.

## 7. Modelo de dados

Tabela `certificates`:

```ts
type Certificate = {
  id: string;                 // UUID do banco
  verificationCode: string;   // Ex.: CERT-AB12CD, único e público
  recipientName: string;
  recipientWallet: string;    // chave pública Solana
  courseName: string;
  workloadHours: number;
  issuedAt: string;           // ISO 8601
  issuerWallet: string;
  mintAddress: string;        // endereço do NFT
  transactionSignature: string;
  metadataUri: string;
  status: "active" | "revoked";
  createdAt: string;
};
```

Regras importantes:

- `verificationCode`, `mintAddress` e `transactionSignature` devem ser únicos.
- Validar chaves públicas antes de emitir.
- Só salvar o certificado depois que a transação for confirmada.
- Armazenar `status` desde o início, mesmo que revogação fique para uma versão futura.

## 8. Rotas e telas

| Rota | Função |
| --- | --- |
| `/` | Landing page, explicação e CTA para verificar/emitir. |
| `/emitir` | Formulário de emissão para wallet autorizada. |
| `/sucesso/[codigo]` | Confirmação após emissão, com links on-chain. |
| `/verificar/[codigo]` | Página pública de verificação. |
| `/meus-certificados` | Certificados associados à carteira conectada. |
| `/api/certificates` | Criar/listar certificados após validação. |
| `/api/certificates/[code]` | Consultar dados públicos de um certificado. |

Conteúdo obrigatório em `/verificar/[codigo]`:

- Selo `Verificável na Solana Devnet`.
- Nome do participante e curso/evento.
- Data e carga horária.
- Código de verificação.
- Carteira do emissor e do participante, abreviadas mas copiáveis.
- Mint address e assinatura da transação.
- Botões para Explorer: transação e asset/mint.
- Estado claro para certificado inexistente, pendente ou revogado.

## 9. Variáveis de ambiente

Criar `.env.local` a partir de `.env.example`:

```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://polished-dry-forest.solana-devnet.quiknode.pro/c5943463eb6799a039aee8340e2028f80bcc570d/
NEXT_PUBLIC_ADMIN_WALLET=COLE_AQUI_A_SUA_WALLET_PUBLICA

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Nunca colocar seed phrase, chave privada ou uma carteira de produção no repositório ou em variáveis `NEXT_PUBLIC_*`.

## 10. Ordem de implementação para iniciantes

### Fase 1 — Aplicação visual

1. Criar o projeto Next.js com TypeScript e Tailwind.
2. Montar páginas `/`, `/emitir` e `/verificar/[codigo]` com dados fictícios.
3. Criar componentes: `Header`, `WalletButton`, `CertificateForm`, `CertificateCard` e `ExplorerLink`.

**Resultado esperado:** dá para navegar e entender o produto, ainda sem blockchain.

### Fase 2 — Carteira e Devnet

1. Adicionar Solana Wallet Adapter.
2. Configurar Devnet e o endpoint QuickNode.
3. Exibir a wallet conectada e seu saldo em SOL.
4. Validar se a wallet conectada pode emitir.

**Resultado esperado:** Phantom/Solflare conecta e o site deixa claro que está na Devnet.

### Fase 3 — Banco de dados

1. Criar projeto Supabase.
2. Criar tabela `certificates` com o modelo descrito acima.
3. Criar API de consulta por código.
4. Fazer `/verificar/[codigo]` buscar dados reais do banco.

**Resultado esperado:** certificados de teste podem ser consultados publicamente.

### Fase 4 — Mint e emissão real

1. Configurar Umi/Metaplex.
2. Fazer upload do JSON de metadados e imagem para storage.
3. Criar o NFT e enviá-lo à wallet do participante.
4. Esperar confirmação da transação.
5. Salvar o certificado no Supabase somente após a confirmação.

**Resultado esperado:** emissão real e verificável no Explorer Devnet.

### Fase 5 — Acabamento e entrega

1. Tratar erros: carteira desconectada, endereço inválido, recusa de assinatura e RPC indisponível.
2. Adicionar loading durante mint/confirmação.
3. Testar o fluxo completo com duas wallets Devnet.
4. Publicar no GitHub e Vercel.
5. Gravar vídeo de 2 a 5 minutos.

## 11. Checklist de testes

- [ ] A aplicação abre em produção sem variáveis expostas.
- [ ] Phantom conecta na Devnet.
- [ ] Wallet não autorizada não vê/usa a emissão.
- [ ] Endereço inválido do participante é bloqueado.
- [ ] Uma emissão gera transação confirmada na Devnet.
- [ ] A URL de verificação mostra dados consistentes.
- [ ] O link do Explorer aponta para `cluster=devnet`.
- [ ] A wallet do participante aparece como dona do badge/NFT.
- [ ] Um código inexistente mostra mensagem adequada.
- [ ] O layout funciona em celular.

## 12. Demonstração em vídeo

Roteiro de 2 a 3 minutos:

1. Mostrar a home: “Certify emite certificados verificáveis na Solana Devnet”.
2. Conectar a wallet emissora.
3. Preencher um certificado com uma segunda wallet de teste.
4. Assinar e confirmar a transação.
5. Mostrar o link da transação no Solana Explorer Devnet.
6. Abrir a URL pública de validação.
7. Conectar a carteira participante e mostrar o certificado em “Meus certificados”.

## 13. Prompt base para usar com outro LLM

```text
Quero construir o MVP “Certify”, um app Next.js full stack para emitir certificados verificáveis na Solana Devnet.

Stack: Next.js App Router, TypeScript, Tailwind, @solana/web3.js, Solana Wallet Adapter, Metaplex Umi/Token Metadata, Supabase e Vercel. O app deve usar Devnet, nunca mainnet.

Funcionalidades: conectar Phantom/Solflare; restringir emissão a wallets autorizadas por variável de ambiente; formulário com nome, curso, carga horária, data e wallet do participante; criar e enviar um NFT/badge de certificado ao participante; salvar no Supabase somente após confirmação; página pública /verificar/[codigo] com dados, mint, assinatura e links Solana Explorer Devnet; página /meus-certificados.

Quero implementar em etapas pequenas. Antes de gerar código, explique em português simples o que será alterado. Não exponha chaves privadas, seed phrases nem service role key no frontend. Use validação de PublicKey e trate erros de wallet/transação. Siga este documento como fonte de requisitos: CERTIFY_MVP.md.
```

## 14. Definição de pronto

O projeto está pronto para submissão quando uma pessoa consegue abrir a URL publicada, emitir ao menos um certificado real na Devnet, abrir sua transação no Explorer e validar o mesmo certificado por uma URL pública — sem intervenção manual do desenvolvedor.
