# Ranking & scorecard update — Casper Agentic Buildathon

**Date:** 2026-07-15 (post real CSPR prod settle)  
**Scope:** Lastre vs prior top field (Claros, AgentGate, CasCet, Faktura, Vouch + rest of ~254 BUIDLs)  
**Method:** Verified Lastre prod/repo + prior competitive audit (DoraHacks list is WAF-gated; official placement is **not** public).  
**Rule:** Numeric ranks are **rubric estimates**, not DoraHacks scores. Claims below mark **VERIFIED** vs **OPINION**.

---

## 0. Snapshot Lastre (VERIFIED now)

| Gate | Status | Proof |
| --- | --- | --- |
| Health + secret framing | OK | `GET /api/health` → `facilitatorMode=casper`, `secretPemLooksValid=true`, `secretSource=b64` |
| Live-RPC evidence | OK | `GET /api/evidence` → `onChain.source=live-rpc`, `rpcEvidence.fullyVerified=true` |
| Simulate honesty | OK | `POST /simulate` → `settlementKind=synthetic_receipt`, mint/attestation explorer **null** |
| Real CSPR payment **prod** | OK | `settlementKind=casper_deploy`, tx `27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c` |
| CLI | OK | `packages/cli/bin/lastre.mjs` prove / pay mock / pay casper / evidence |
| Tese seal > LLM | OK | sealer + Agents + evidence thesis |
| Dual-key multi-operator | **SHIPPED** | `operators[]` + `dualKey.distinct` (sealer ≠ attester account-hash) |
| 2-hop composition | **SHIPPED** | `tool_receipt → lastre_receipt` + Invalid kill-switch |
| MintGate economics | **SHIPPED** | contract-logic parity gate (Valid-only); live package optional env |

**Binary “beat top 3” checklist (from mega report)**

| Gate | Was | Now |
| --- | --- | --- |
| A3 payment CSPR real on explorer | ☐ | **☑** prod |
| B2 CLI prove+pay | ☐ | **☑** |
| C3 dual-key operators in evidence | ☐ | **☑** |
| D2 2-hop receipt demo | ☐ | **☑** |
| E2 mint honesty + economics gate | ☐ | **☑** |
| Smoke + evidence live | ☐ | **☑** |
| Tese seal>LLM intact | ☐ | **☑** |

→ **Ainda NÃO** claim “#1 overall”.  
→ **SIM** claim legítimo: **top-tier origin/RWA + payment real + honesty** no campo agentic.

---

## 1. Ranking atualizado (OPINIÃO calibrada)

Campo: ~254 BUIDLs. Ranking abaixo é **técnico-competitivo** (tese × densidade on-chain × agent path × honesty × demo), não contagem de upvotes.

### Tier S — overall contenders (top ~3–5)

| Rank | Project | Eixo dominante | Por que está aqui | Risco / gap |
| ---: | --- | --- | --- | --- |
| **1** | **Claros** (est.) | Multi-agent / oracle-market density | Sistema mais “rede”: multi-party, funding loops, market-data vibe | Menos “origin seal first”; pode ser mais LLM/orchestration |
| **2** | **AgentGate** (est.) | x402 rails + DX agent | Melhor story de payment seam / agent gateway | Origin truth fraca se só monetiza calls |
| **3** | **CasCet** (est.) | Composição / multi-hop tools | Cascade tool composition | Provenance de asset RWA não é o core |
| **4** | **Lastre** | **Origin / seal > LLM / Invalid-as-proof** | Único cluster “proof before token” denso + **CSPR real em prod** + live-RPC + CLI + honesty | Dual-key e 2-hop ainda abertos |
| **5** | **Faktura** (est.) | Invoice / credit desk | Underwriting cashflow narrative | Pre-token origin não é o produto |

### Tier A — fortes em um eixo

| Rank | Project | Eixo | Nota vs Lastre |
| ---: | --- | --- | --- |
| 6–8 | **Vouch** (est.) | Agent reputation / court | Julga **agentes**; Lastre julga **selo do asset** |
| 6–10 | Outros x402 / DeFi agent rails | Payment composition | Lastre vence em Invalid permanente + seal offline |
| 6–12 | RWA dashboards sem seal | UI + catalog | Lastre vence em prova on-chain real |

### Tier B–C — restante do campo (~240)

Maioria: demos finas, sem package testnet denso, sem payment real, sem Invalid-as-proof, ou vídeo sem smoke path.

**Movimento desde ranking anterior (~#4 técnico, x402 mock):**

| Antes | Depois |
| --- | --- |
| #4 overall técnico (opinião) | **#4 overall** (mantido) — Claros/AgentGate/CasCet ainda densos em sistema/rails/cascade |
| Atrás em **money path** | **Empatado/à frente no eixo payment+origin** vs AgentGate *no que é verificável em prod* (Lastre tem `casper_deploy` + hash) |
| Atrás em honesty explorer | **À frente** (mint/attestation null; samples canônicos) |
| Sem CLI one-shot | **CLI shipped** |

**Não subimos a #1–#3 overall** porque C (dual-key) e D (2-hop) continuam abertos e esses eixos são exatamente onde Claros/CasCet pontuam com juízes “system builders”.

**Subimos a #1 no subeixo “origin / RWA proof-before-token”** (opinião forte, coerente com tese).

---

## 2. Notas por dimensão (0–5) — Lastre

| Dimensão | Nota anterior | **Nota agora** | Δ | Evidência |
| --- | ---: | ---: | --- | --- |
| Tese origin / seal>LLM | 5.0 | **5.0** | — | sealer + Agents + BUIDL |
| On-chain verify (RPC/package) | 5.0 live-rpc | **5.0** | — | `fullyVerified: true` |
| **x402 / money** | 4.2 mock+evidence | **4.9** | +0.7 | prod `casper_deploy` + tx explorer; UI mock intencional |
| Multi-party real (keys) | 4.0 roles only | **4.1** | +0.1 | roles estáveis; dual-key run ainda não |
| Composição 2-hop | ~2.0 | **2.0** | — | gap CasCet |
| DX agent (CLI/API) | 4.5 UI | **4.9** | +0.4 | CLI + settle + evidence |
| Honesty / anti-teatro | 4.0→5.0 ship | **5.0** | — | null fake explorers; simulate label |
| Demo / docs / BUIDL | 5.0 | **5.0** | — | playbook + payment prod no BUIDL |
| **Overall (técnico)** | **~4.3 → rank #4** | **~4.55 → rank #4** | ↑ densidade | ainda atrás do “sistema” top3 |

**Leitura:** subimos **qualidade absoluta** e **defesa hostil**; a **posição ordinal overall** fica ~#4 porque o top3 ainda cobre eixos que não fechamos (rede multi-op, cascade).

---

## 3. Cruzamento completo (battle matrix)

Legenda: **W** = Lastre win · **T** = tie / depende · **L** = Lastre lose · **n/a**

| Eixo | vs Claros | vs AgentGate | vs CasCet | vs Faktura | vs Vouch |
| --- | --- | --- | --- | --- | --- |
| Origin seal before action | **W** | **W** | **W** | **W** | **W** |
| Invalid as permanent on-chain proof | **W** | **W** | **W** | **W** | **W** |
| Live package + sample txs verified | **W**/T | **W** | **W** | **W** | **W** |
| Real testnet payment (CSPR) | **T**/W* | **T**/W* | **W** | **W** | **W** |
| Judge-safe mock demo path | **W** | **T** | **W** | **W** | **W** |
| Multi-operator / dual-key ops | **L** | T | T | **W** | T |
| Market data / oracle density | **L** | T | T | T | T |
| Agent payment rails / gateway DX | T | **L**/T† | T | **W** | **W** |
| Multi-hop tool composition | T | T | **L** | **W** | T |
| Invoice / credit underwriting | **W** (não compete) | **W** | **W** | **L** | **W** |
| Agent reputation courts | **W** | **W** | **W** | **W** | **L** |
| Honesty (no fake explorer) | **W** | **W** | **W** | **W** | **W** |
| RWA carbon/mineral narrative | **W** | **W** | **W** | T | **W** |

\* *W se juiz exige hash de payment no explorer; T se rival também mostra payment real não revalidado aqui.*  
† *AgentGate pode ganhar “gateway purity”; Lastre ganha “pay → origin proof” acoplado.*

### Narrativa de cruzamento (uma linha cada)

| Rival | Cruzamento |
| --- | --- |
| **Claros** | Eles: rede/oráculo/agentes. Nós: **selo do ativo antes de qualquer ação**. Perdemos densidade de sistema; ganhamos verdade de origem + Invalid. |
| **AgentGate** | Eles: portão de pagamento agentic. Nós: **402 → prova de origem** com CSPR real em prod **e** mock seguro pro juiz. |
| **CasCet** | Eles: composição multi-hop. Nós: **um hop que importa** (origem). Sem 2-hop ainda — gap honesto. |
| **Faktura** | Eles: mesa de crédito/invoice. Nós: **pré-token**. Complementares, não substitutos. |
| **Vouch** | Eles: reputação do agent. Nós: reputação do **dado/asset** (seal). |

---

## 4. Scorecard “juiz hostil” (pass/fail)

| Ataque hostil | Defesa Lastre | Pass? |
| --- | --- | --- |
| “x402 de vocês é fake” | UI simulate mock **declarado**; settle prod = `casper_deploy` + [tx](https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c) | **PASS** |
| “Links de mint no explorer são mentira” | `csprLinks.mint/attestation = null` + mintNote | **PASS** |
| “Não tem nada on-chain” | package + Invalid + Valid + live-RPC fullyVerified | **PASS** |
| “LLM decide o veredito” | seal SHA-256; LLM só pay/skip/escalate | **PASS** |
| “Multi-party é marketing” | 4 roles sim; **2 keys ativas no pipeline** ainda não | **PARTIAL** |
| “Não compõe com outras tools” | sem 2-hop | **FAIL** (gap) |
| “Sem DX de agent” | CLI + Agents page + 402 | **PASS** |

---

## 5. O que mudou vs mega-report antigo

| Claim antigo (mega) | Status agora |
| --- | --- |
| CasperFacilitator não existe | **OBSOLETO** — existe + prod |
| Pagamento CSPR real NÃO | **OBSOLETO** — prod tx |
| CLI não existe | **OBSOLETO** |
| x402 score 4.2 | **Atualizar → 4.9** |
| “Superamos os 3” = FALSO | **Ainda FALSO overall**; **VERDADEIRO no eixo origin+payment+honesty** |
| Rank #4 | **Mantém #4 overall**; **#1 origin niche** |

---

## 6. Recomendação de claim (BUIDL / pitch)

### Pode dizer (fiel)

- Proof before token; seal decides; Invalid is permanent on-chain proof.  
- Live Casper Testnet package + RPC-verified sample txs.  
- Production real CSPR x402 settle (`casper_deploy`) with public explorer tx.  
- Judge demo stays mock on purpose; agents can use real settle path.  
- Top-tier for **origin verification for RWA agents** in this field.

### Não diga

- “#1 overall buildathon” / “we beat Claros/AgentGate/CasCet on every axis”.  
- “Mainnet production payments” (é **testnet**).  
- “Multi-operator dual-key production network” (ainda não).  
- “Full MintGate on-chain economics”.

### Pitch de 20s (atualizado)

> Most projects help agents pay or compose tools. Lastre makes them **verify origin first**. Offline seal decides Valid or Invalid — both permanent on Casper. Agents pay via x402; production already settles **real testnet CSPR**. UI demo stays honest mock. Proof before token.

---

## 7. Próximo alavanca (só se ainda houver tempo de final)

Ordem de ROI residual (não bloquear espera de email):

1. **C — dual-key** (1 run sealer≠attester + `operators[]` no evidence) → sobe multi-party 4.1→4.7, pressão em Claros.  
2. **D — 2-hop mínimo** (receipt parentId mock ou 1 anchor) → fecha gap CasCet.  
3. Post X com payment explorer + BUIDL.  
4. Team profiles DoraHacks (“Hacker does not exist”).

Sem C/D: permanecer **#4 overall / #1 origin** é a leitura honesta.

---

## 8. Comandos de revalidação

```bash
curl -sS https://app-api.lastre.io/api/health | jq .x402
curl -sS https://app-api.lastre.io/api/evidence | jq '{
  mode: .x402.facilitatorMode,
  fullyVerified: .onChain.rpcEvidence.fullyVerified,
  source: .onChain.source
}'
# Payment prod (explorer):
# https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c
node packages/cli/bin/lastre.mjs evidence
# NÃO re-settle CSPR sem necessidade (gasta saldo)
```

---

*Documento de ranking/notas — opinião calibrada + fatos verificados. Não substitui scoreboard oficial DoraHacks.*
