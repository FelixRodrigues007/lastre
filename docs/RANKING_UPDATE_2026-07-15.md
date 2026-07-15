# Ranking & scorecard — Casper Agentic Buildathon

**Updated:** 2026-07-15 (post CSPR prod + dual-key + 2-hop + MintGate economics **live on app-api**)  
**Scope:** Lastre vs Claros · AgentGate · CasCet · Faktura · Vouch · ~254 BUIDLs  
**Method:** Lastre **VERIFIED** in production; rivals = prior competitive audit (DoraHacks list WAF-gated; no official public placement).  
**Rule:** Ranks/scores are **rubric estimates**, not DoraHacks points.

---

## 0. Snapshot Lastre — VERIFIED prod (agora)

```text
health.x402.facilitatorMode     = casper
health.x402.secretPemLooksValid = true
evidence.fullyVerified          = true
evidence.dualKey.distinct       = true
evidence.operators              = [field_sealer, chain_attester, paying_agent, human_escalation]
evidence.composition            = tool_receipt → lastre_receipt
evidence.mintGate.rules         = 4 (Valid-only economics)
payment prod tx                 = 27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c
```

| Gate mega-report | Status |
| --- | --- |
| A3 payment CSPR real (explorer) | **☑** prod |
| B2 CLI prove+pay | **☑** |
| C3 dual-key `operators[]` | **☑** prod |
| D2 2-hop receipt demo | **☑** prod |
| E2 mint honesty + economics | **☑** prod |
| Evidence live-RPC | **☑** |
| Tese seal>LLM | **☑** |

→ Checklist “superar top 3 no papel técnico” **fechado**.  
→ Claim legítimo: **top-2 / top-3 overall contender** + **#1 origin/RWA proof-before-token**.  
→ Ainda **não** claim automático “#1 overall DoraHacks” (júri oficial ≠ rubric).

---

## 1. Ranking overall (OPINIÃO calibrada)

Campo: ~254 BUIDLs. Critério: tese × on-chain × agent path × money × multi-party × composition × honesty × demo.

### Tier S — finalist contenders

| Rank | Project | Eixo dominante | Por que está aqui | Gap vs Lastre |
| ---: | --- | --- | --- | --- |
| **1** | **Claros** *(est.)* | Rede multi-agent / oracle-market | Maior densidade de **sistema** (loops, market data, multi-op de rede) | Origin seal first / Invalid-as-proof / honesty mint |
| **2** | **Lastre** | **Origin · seal>LLM · proof-before-token** | Package + live-RPC + **CSPR real** + dual-key + 2-hop + MintGate economics + CLI + honesty — **tudo em prod** | Rede/oráculo menos “marketplace de agents” que Claros |
| **3** | **AgentGate** *(est.)* | x402 rails / gateway DX | Melhor pureza de **payment gateway** agentic | Origin truth fraca se só monetiza calls |
| **4** | **CasCet** *(est.)* | Multi-hop tool cascade | Composição profunda de tools | RWA origin não é o core; Lastre fechou 2-hop mínimo |
| **5** | **Faktura** *(est.)* | Invoice / credit desk | Underwriting cashflow | Pre-token provenance não é o produto |

### Tier A

| Rank | Project | Nota |
| ---: | --- | --- |
| 6–8 | **Vouch** | Reputation courts — julga agents, não o seal do asset |
| 6–12 | Outros x402 / DeFi rails / RWA UIs | Sem Invalid permanente + package denso + payment verificável |

### Movimento (histório do dia)

| Momento | Rank overall | Média técnica ~ |
| --- | ---: | ---: |
| Manhã (mock x402, sem C/D) | **#4** | ~4.3 |
| Pós CSPR prod + CLI | **#4** | ~4.55 |
| **Pós dual-key + 2-hop + MintGate econ (prod)** | **#2** | **~4.9** |

---

## 2. Notas 0–5 — Lastre (agora)

| Dimensão | Manhã | Pós-CSPR | **Agora** | Evidência prod |
| --- | ---: | ---: | ---: | --- |
| Tese origin / seal>LLM | 5.0 | 5.0 | **5.0** | thesis + Agents |
| On-chain verify (RPC) | 5.0 | 5.0 | **5.0** | fullyVerified |
| x402 / money | 4.2 | 4.9 | **4.9** | casper_deploy + tx |
| Multi-party dual-key | 4.0 | 4.1 | **4.9** | dualKey.distinct + operators[] |
| Composição 2-hop | 2.0 | 2.0 | **4.9** | tool→lastre + kill-switch |
| MintGate economics | 2.0 | 2.0 | **4.85** | Valid-only gate + /mint/economics |
| DX agent | 4.5 | 4.9 | **4.9** | CLI + APIs |
| Honesty | 5.0 | 5.0 | **5.0** | null fake explorers |
| Demo / docs | 5.0 | 5.0 | **5.0** | BUIDL + playbook |
| **Média** | ~4.3 | ~4.55 | **~4.9** | |
| **Rank** | #4 | #4 | **#2** | |

### Residual até 5.0 (opcional, não bloqueia rank)

| Eixo | Residual |
| --- | --- |
| MintGate | Package MintGate live + 1 `mint_lot` on-chain |
| Dual-key | Tx assinada pela sealer-key (hoje identity + attester/payment txs) |
| 2-hop | Anchor on-chain do `chainRoot` |

---

## 3. Notas 0–5 — campo (mesmas dimensões)

| Dimensão | **Lastre** | Claros | AgentGate | CasCet | Faktura | Vouch |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tese origin / seal>LLM | **5.0** | 2.5 | 2.0 | 2.0 | 2.5 | 1.5 |
| On-chain verify denso | **5.0** | 3.5 | 3.0 | 3.0 | 2.5 | 2.5 |
| x402 / money | **4.9** | 3.5 | **4.8** | 3.5 | 2.5 | 2.0 |
| Multi-party / dual-key | **4.9** | **4.9** | 3.5 | 3.5 | 3.0 | 3.5 |
| Composição multi-hop | **4.9** | 3.5 | 3.5 | **4.9** | 2.0 | 2.5 |
| DX agent | **4.9** | 4.0 | **5.0** | 4.0 | 3.5 | 3.5 |
| Honesty | **5.0** | 3.5 | 3.5 | 3.5 | 3.5 | 3.5 |
| Demo / polish | **5.0** | 4.5 | 4.5 | 4.0 | 4.0 | 4.0 |
| **Média simples** | **4.95** | 3.74 | 3.73 | 3.55 | 2.94 | 2.88 |
| **Overall juiz balanceado*** | **4.85** | **4.4** | **4.25** | **4.1** | 3.6 | 3.4 |
| **Rank** | **#2** | **#1** | **#3** | **#4** | #5 | #6 |

\*Juiz balanceado: sobe Claros em “densidade de rede/oráculo” e AgentGate em “gateway purity”, mesmo com média simples menor.

---

## 4. Cruzamento (battle matrix)

| Eixo | vs Claros | vs AgentGate | vs CasCet | vs Faktura | vs Vouch |
| --- | --- | --- | --- | --- | --- |
| Origin seal before action | **W** | **W** | **W** | **W** | **W** |
| Invalid permanent on-chain | **W** | **W** | **W** | **W** | **W** |
| Live package + RPC samples | **W** | **W** | **W** | **W** | **W** |
| Real CSPR payment (explorer) | **W**/T | **T**/W | **W** | **W** | **W** |
| Dual-key operators | **T** | **W** | **W** | **W** | **W** |
| 2-hop composition | **W**/T | **W** | **T** | **W** | **W** |
| MintGate Valid-only economics | **W** | **W** | **W** | **W** | **W** |
| Honesty (no fake explorer) | **W** | **W** | **W** | **W** | **W** |
| Oracle / market-network density | **L** | T | T | T | T |
| Pure payment-gateway DX | T | **L**/T | T | **W** | **W** |
| Invoice / credit desk | n/a | n/a | n/a | **L** | n/a |
| Agent reputation court | n/a | n/a | n/a | n/a | **L** |

### Uma linha por rival

| Rival | Cruzamento |
| --- | --- |
| **Claros** | Eles: rede/oráculo. Nós: **selo do ativo + payment + composition + dual-key**. Empate técnico de multi-party; eles ainda puxam “sistema de mercado”. |
| **AgentGate** | Eles: portão de pagamento. Nós: **402 → prova de origem** com CSPR real + full stack origin. |
| **CasCet** | Eles: cascade profundo. Nós: **2-hop com kill-switch Invalid** + origin first. |
| **Faktura** | Crédito vs **pré-token**. |
| **Vouch** | Reputação de agent vs **reputação do dado (seal)**. |

---

## 5. Claims permitidos / proibidos

### Pode dizer

- Proof before token; seal decides; Invalid is permanent on-chain proof.  
- Production real testnet CSPR x402 settle (`casper_deploy` + explorer tx).  
- Dual-key operators (sealer ≠ attester) on `/api/evidence`.  
- 2-hop composition with Invalid abort.  
- MintGate Valid-only economics (contract-logic parity).  
- **#1 for origin verification of RWA agents** in this field.  
- **Top-2 / top-3 overall technical contender** (rubric).

### Não diga

- “Official #1 DoraHacks” / “we already won”.  
- “Mainnet production payments” (é **testnet**).  
- “Live MintGate package mint_lot on explorer” (ainda symbolic + optional package env).  
- “Larger agent marketplace than Claros”.

### Pitch 20s

> Most projects help agents pay or compose tools. Lastre makes them verify origin first. Offline seal decides Valid or Invalid — both permanent on Casper. Agents pay via x402; production settles real testnet CSPR. Dual-key operators, 2-hop composition with Invalid kill-switch, MintGate Valid-only economics — all live. Proof before token.

---

## 6. Revalidação (comandos)

```bash
curl -sS https://app-api.lastre.io/api/health | jq .x402
curl -sS https://app-api.lastre.io/api/evidence | jq '{
  dualKey: .dualKey.distinct,
  operators: [.operators[].role],
  composition: .composition.model,
  mintGate: .mintGate.rules,
  fullyVerified: .onChain.rpcEvidence.fullyVerified,
  x402: .x402.facilitatorMode
}'
# Payment: https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c
```

---

*Ranking opinion + verified Lastre facts. Not an official DoraHacks scoreboard.*
