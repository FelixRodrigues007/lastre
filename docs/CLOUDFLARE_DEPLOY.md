# Lastre — Cloudflare Deploy Runbook (lastre.io)

Este runbook assume que `lastre.io` já está como zona no **Cloudflare** (DNS
gerenciado pela Cloudflare). Ele cobre as duas frentes:

- **Frontend** (`lastre.io`) servido pelo **Cloudflare Pages** (Vite + React em `web/`).
- **Backend/API** (`api.lastre.io`) apontando para o **Render** Docker já existente
  (`lastro.onrender.com`).

> Por que Render continua sendo a origin: o gateway (`agent/gateway`) é Express +
> binário Rust `query` executado via `child_process`. Isso **não roda** em
> Cloudflare Workers/Pages Functions hoje. Mover para 100% Cloudflare exigiria
> reescrever a query Casper para o runtime do Worker — fora do escopo de "subir".

## Topologia

```text
lastre.io          -> Cloudflare Pages (frontend Vite/React)
www.lastre.io      -> redirect 301 para lastre.io
api.lastre.io      -> CNAME -> lastro.onrender.com (gateway/API)
lastro.onrender.com-> fallback direto da API enquanto api.lastre.io propaga
```

---

## 1. Frontend no Cloudflare Pages

Workers & Pages → **Create application** → **Pages** → **Connect to Git** →
repositório `FelixRodrigues007/lastro`.

Build settings:

```text
Production branch:        main
Framework preset:        Vite   (ou "None")
Root directory:          web
Build command:           npm run build
Build output directory:  dist
```

> Observação: com **Root directory = `web`**, o output é `dist` (relativo a `web`),
> NÃO `web/dist`. O `vercel.json` da raiz não é lido pela Cloudflare — quem cuida
> do fallback de SPA aqui é `web/public/_redirects` (já versionado).

Environment variables (aba **Settings → Environment variables**, defina em
**Production** e **Preview**):

```bash
VITE_GATEWAY_URL=https://api.lastre.io
VITE_PUBLIC_SITE_URL=https://lastre.io
NODE_VERSION=22
```

Enquanto `api.lastre.io` ainda não estiver validado no Render, use o fallback:

```bash
VITE_GATEWAY_URL=https://lastro.onrender.com
VITE_PUBLIC_SITE_URL=https://lastre.io
NODE_VERSION=22
```

> `VITE_*` é injetado em **build time**. Ao trocar o valor, é preciso
> **redeploy** (Retry deployment) para o bundle pegar a nova URL.

### Custom domain do Pages

No projeto Pages → **Custom domains** → **Set up a custom domain** → `lastre.io`
(e opcionalmente `www.lastre.io`). Como a zona já está na Cloudflare, ela cria o
registro automaticamente. **Não** crie só um CNAME manual para `*.pages.dev` sem
associar o domínio ao projeto — isso costuma dar erro `522`.

---

## 2. Backend/API: `api.lastre.io` → Render

1. No **Render**, serviço do gateway → **Settings → Custom Domains** → adicionar
   `api.lastre.io`. O Render mostra o alvo CNAME (`lastro.onrender.com`).
2. No **Cloudflare DNS**, criar:

```text
Type:         CNAME
Name:         api
Target:       lastro.onrender.com
Proxy status: DNS only   (nuvem cinza) durante a validação do certificado
TTL:          Auto
```

3. Espere o Render validar o domínio e emitir o certificado TLS.
4. (Opcional) Depois de validado, pode mudar para **Proxied** (nuvem laranja) com
   SSL/TLS mode **Full**. Se proxiar, garanta que **não** há cache em
   `api.lastre.io/*` e que Cloudflare Access/Bot challenge **não** está ativo
   nesse host (senão o `fetch` recebe HTML de challenge em vez de JSON).

### Variáveis no Render (gateway)

```bash
PACKAGE_HASH=hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
NODE_ADDRESS=https://node.testnet.casper.network/rpc
CHAIN_NAME=casper-test
LASTRO_QUERY_BIN=/app/bin/query
SANDBOX_ANCHOR_ENABLED=false
ALLOWED_ORIGINS=https://lastre.io,https://www.lastre.io,https://*.pages.dev,https://*.vercel.app,http://localhost:5173,http://localhost:3000
```

> `https://*.pages.dev` é o que libera o CORS dos previews do Cloudflare Pages.
> O matcher de origins do gateway suporta wildcard (`*`), então esse padrão
> funciona. Localhost é sempre liberado. Nunca coloque chave privada no gateway
> público; `SANDBOX_*` só em demo controlada com conta de baixo saldo.

---

## 3. www → apex (Redirect Rule)

Cloudflare → domínio `lastre.io` → **Rules → Redirect Rules → Create**:

```text
If incoming requests host equals  www.lastre.io
Then  Static redirect  ->  https://lastre.io/$1   (301)
```

(Ou adicione `www.lastre.io` como custom domain do Pages e deixe o Pages
redirecionar.)

---

## 4. Rotas (apontamentos) que a Laura conecta no front

Base URL única:

```bash
VITE_GATEWAY_URL=https://api.lastre.io      # fallback: https://lastro.onrender.com
```

Client já existente: `web/src/lib/lastro-api.ts` (`fetchGatewayJson` +
`LASTRO_GATEWAY_URL`).

### Endpoints da API (gateway)

| Método | Rota | Uso no front |
|---|---|---|
| `GET`  | `/health` | Status do gateway (smoke test) |
| `GET`  | `/proof` | packageHash, accepted/rejected, recentAttestations |
| `GET`  | `/catalog` | Catálogo fictício de lotes |
| `GET`  | `/verdict/:assetId` | Veredito live do Casper |
| `GET`  | `/certificate/:assetId` | Credential simbólico (só se `Valid`; senão 404) |
| `POST` | `/sandbox/compute` | Computa seal local, sem escrita on-chain |
| `POST` | `/sandbox/anchor` | Escrita SANDBOX-only (oculto no front público) |
| `GET`  | `/fraud-challenge?assetId=...&difficulty=easy\|hard` | Gera rodada Spot-the-Fraud |
| `POST` | `/fraud/guess` | Pontua o palpite |
| `POST` | `/fraud/anchor-tampered` | Ancora seal adulterado, SANDBOX-only (oculto) |

Lotes live conhecidos:

```text
MINA-VALEDOURO-LOTE-001 -> Invalid
MINA-VALEDOURO-LOTE-002 -> Valid
```

### Rotas públicas do frontend (client-side, cobertas pelo `_redirects`)

```text
/            landing + painel live (P0)
/proof       counters, package hash, attestations (P0)
/catalog     showcase fictício com badges live (P0)
/asset/:id   detalhe do lote, seal/reference/proof trail (P1)
/spot-fraud  demo principal de fraude (P0)
/sandbox     computa seal local (P1)
/map         mapa fictício, não-GPS (P2)
```

---

## 5. Smoke tests pós-deploy

Quando `api.lastre.io` estiver ativo:

```bash
curl -s https://api.lastre.io/health
curl -s https://api.lastre.io/proof
curl -s https://api.lastre.io/catalog
curl -s https://api.lastre.io/verdict/MINA-VALEDOURO-LOTE-001   # Invalid
curl -s https://api.lastre.io/verdict/MINA-VALEDOURO-LOTE-002   # Valid
```

CORS (a partir do apex):

```bash
curl -sI -H "Origin: https://lastre.io" https://api.lastre.io/proof
# Esperado: access-control-allow-origin: https://lastre.io
```

Diagnóstico fim-a-fim do repo:

```bash
make doctor FRONTEND=https://lastre.io GATEWAY=https://api.lastre.io
# fallback:
make doctor FRONTEND=https://lastre.io GATEWAY=https://lastro.onrender.com
```

---

## 6. Rodas operacionais (flywheels)

1. **Proof wheel** — campo fictício → seal determinístico → attestation Casper →
   readback → explicação no front.
2. **Fraud-learning wheel** — challenge → palpite → revela campo alterado →
   usuário entende que tamper mínimo muda o seal.
3. **Design-system wheel** — tokens → componentes → páginas → QA → ajuste visual.
4. **Trust-boundary wheel** — seal decide verdict → docs/copy reforçam → testes →
   demo → feedback.
5. **Deployment wheel** — commit → Cloudflare Pages/Render deploy → smoke tests →
   logs/network → fix pequeno → novo commit.

---

## 7. Apontamentos importantes

- O `vercel.json` (raiz e `web/`) é ignorado pela Cloudflare. O fallback de SPA
  no Pages vem de `web/public/_redirects` (já versionado).
- Se `lastre.io` ficar no Cloudflare Pages, **não** aponte o mesmo apex também na
  Vercel (evita conflito de domínio).
- Não cacheie `api.lastre.io/*`. Mantenha no-store/bypass para a API.
- Não ative Cloudflare Access/challenge no host da API.
- `VITE_GATEWAY_URL` é build-time: trocou, precisa redeploy.
- `child_process` + binário Rust impedem rodar o gateway atual em Workers; por
  isso a API fica no Render.
