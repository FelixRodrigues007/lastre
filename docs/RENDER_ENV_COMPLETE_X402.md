# Render env — stack x402 **completo** (native CSPR + WCSPR cloud)

**Data:** 2026-07-22  
**Serviço:** app-api (Docker `Dockerfile.app-api`) → `https://app-api.lastre.io`

## Recomendação “completo”

Manter **primary = casper** (settle nativo que já funciona) **e** ligar o **side-car CSPR.cloud** com token + account-hash WCSPR.

Assim você tem **os dois** ao mesmo tempo:
- `POST /api/x402/settle` → native CSPR  
- `POST /api/x402/cloud/settle` → WCSPR via CSPR.cloud  
- UI `/simulate` → mock  

---

## 1. Valores derivados (Lastre payto)

| Campo | Valor |
|-------|--------|
| Public key (hex) | `013a7fadf901393a1ddecefb3fa967d9d782bbe1d3e0729ed526310840217b47f0` |
| Account hash | `700296862def5a9a4a9026d4c0ecad9bb17679499c7e8904aa464adf45a5e56a` |
| **LASTRE_WCSPR_PAY_TO** | `00700296862def5a9a4a9026d4c0ecad9bb17679499c7e8904aa464adf45a5e56a` |
| WCSPR package (testnet) | `3d80df21ba4ee4d66a2a1f60c32570dd5685e4b279f6538162a5fd1314847c1e` |

(fonte: `~/.casper-keys/lastro-payto` + `casper-client account-address` / casper-js-sdk)

Para **native CSPR** continue usando a **public key hex** (ou o que já está em `LASTRE_X402_PAY_TO` hoje).

---

## 2. Colar no Render → Environment

### Já deve existir (manter)

```text
LASTRE_X402_MODE=casper
LASTRE_X402_PAY_TO=013a7fadf901393a1ddecefb3fa967d9d782bbe1d3e0729ed526310840217b47f0
LASTRE_X402_SECRET_KEY_B64=<seu base64 PEM do lastro-deploy — NÃO commitar>
```

### **Novos** (ligar cloud side-car)

```text
CSPR_CLOUD_API_TOKEN=<token da sua conta em https://cspr.cloud>
LASTRE_WCSPR_PAY_TO=00700296862def5a9a4a9026d4c0ecad9bb17679499c7e8904aa464adf45a5e56a
LASTRE_WCSPR_PACKAGE=3d80df21ba4ee4d66a2a1f60c32570dd5685e4b279f6538162a5fd1314847c1e
LASTRE_WCSPR_AMOUNT=1000000000
```

Opcional:

```text
CSPR_CLOUD_FACILITATOR_URL=https://x402-facilitator.cspr.cloud
LASTRE_CAIP2_NETWORK=casper:casper-test
```

### Como obter `CSPR_CLOUD_API_TOKEN`

1. Conta em https://cspr.cloud  
2. Solicitar access token (tiers / dashboard)  
3. Docs: https://docs.cspr.cloud/documentation/overview/authorization  
4. Header: `Authorization: <token>`  
5. Token de exemplo nos docs **não** serve para prod (limitado)

**Sem esse token o side-car não sobe** — o resto (casper + rail) continua.

---

## 3. WCSPR na carteira payto

1. Abrir https://testnet.cspr.trade  
2. Menu **WCSPR** → swap CSPR → WCSPR  
3. Conta = `lastro-payto` (pubkey `013a7f…`)  
4. Facilitator usa `transfer_with_authorization` a partir do **payer** do EIP-712; o **payTo** recebe WCSPR  

---

## 4. Deploy

1. Merge PR #56 (ou branch com dual-stack)  
2. Render → **Clear build cache & deploy**  
3. Confirmar env salvos e redeploy se mudou secrets  

---

## 5. Smoke pós-deploy

```bash
export API=https://app-api.lastre.io

# Primary ainda casper
curl -sS "$API/api/health" | jq '{mode: .x402.facilitatorMode, cloud: .x402.cloud}'

# Cloud side-car ready
curl -sS "$API/api/x402/cloud" | jq '{cloudReady, modeActive, primaryMode, quote: .quote.assetSymbol}'

# Live probe CSPR.cloud (precisa token válido)
curl -sS "$API/api/x402/cloud/supported" | jq '{ok, cloudReady, kinds: .supported.kinds}'

# Sealed rail
curl -sS "$API/api/rail" | jq '.product.id'
curl -sS "$API/api/evidence" | jq '{mode: .x402Mode, cloudReady: .x402.cloud.cloudReady, honesty: .honesty.csprCloud.facilitatorUrl}'

# Native CSPR still works
# lastre prove CARBON-VCS-AMAZONIA-2024-001 --pay --mode casper
# or POST /api/x402/settle/...
```

### PASS “completo”

| Check | Esperado |
|-------|----------|
| `facilitatorMode` | `casper` |
| `cloud.cloudReady` | `true` |
| `/api/x402/cloud/supported` → ok | `true` (token válido) |
| `/api/rail` | `sealed-market-rail` |
| simulate | mock |
| settle native | ainda funciona |

---

## 6. Alternativa: primary só cloud

Só se quiser abandonar auto-settle nativo:

```text
LASTRE_X402_MODE=cspr_cloud
CSPR_CLOUD_API_TOKEN=…
LASTRE_WCSPR_PAY_TO=00700296862def5a9a4a9026d4c0ecad9bb17679499c7e8904aa464adf45a5e56a
```

Aí `POST /api/x402/settle` auto **não** usa casper-client; use só `/api/x402/cloud/settle` + EIP-712.

---

## 7. Segurança

- **Nunca** commitar `CSPR_CLOUD_API_TOKEN` nem `LASTRE_X402_SECRET_KEY_B64`  
- Token só server-side (Render) — docs CSPR.cloud proíbem browser  
- Rotacionar se vazar  

---

## 8. Checklist Felix (ordem)

- [ ] Token CSPR.cloud criado  
- [ ] Env novos colados no Render (WCSPR_PAY_TO + TOKEN + PACKAGE)  
- [ ] Manter `LASTRE_X402_MODE=casper` + secret B64  
- [ ] WCSPR no payto via testnet.cspr.trade  
- [ ] Clear build cache & deploy  
- [ ] Smoke §5  
- [ ] (Opcional) 1 settle WCSPR com client casper-x402 + hash no BUIDL  
