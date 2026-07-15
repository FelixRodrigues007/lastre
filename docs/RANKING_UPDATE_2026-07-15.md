# Ranking & scorecard — Casper Agentic Buildathon

**Updated:** 2026-07-15 (post Render redeploy of #38 — composition **anchor live in prod**)  
**Scope:** Lastre vs Claros · AgentGate · CasCet · Faktura · Vouch · ~254 BUIDLs  
**Method:** Lastre **VERIFIED** on `app-api.lastre.io`; rivals = competitive audit (no official DoraHacks placement public).  
**Rule:** Ranks/scores are **rubric estimates**, not DoraHacks points.

---

## 0. Snapshot Lastre — VERIFIED prod (agora)

```json
{
  "dualKey": true,
  "mintLive": null,
  "composition": {
    "model": "tool_receipt → lastre_receipt",
    "chainRoot": "0c40eb1b4164b95305b0c98908dd6c17ce6bfa37b3900095d87304ea566f8d33",
    "anchor": "915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a",
    "anchored": true
  },
  "fullyVerified": true
}
```

| Gate | Status | Prova |
| --- | --- | --- |
| Health casper + PEM | OK | `secretPemLooksValid: true` |
| Live-RPC evidence | OK | `fullyVerified: true` |
| Real CSPR payment prod | OK | `27461bd7…199c` |
| Dual-key operators | OK | `dualKey.distinct: true` + run sealer≠attester |
| 2-hop + **anchor on-chain** | OK | deploy `915c9736…` + evidence `anchored: true` |
| CLI | OK | `packages/cli/bin/lastre.mjs` |
| Compete UI | OK | Agents live copy |
| Simulate honesty | OK | mock + mint explorer **null** |
| MintGate economics (parity) | OK | Valid-only rules ×4 |
| MintGate **live package** | **BLOCKED** | `mintLive: null` — deploy Odra falhou; sem fake hash |

**Tier 0 beat-Claros checklist**

| Item | Status |
| --- | --- |
| T0.1 Dual-key run | **PASS** |
| T0.2 MintGate live package + mint_lot | **FAIL / BLOCKED** (honesto) |
| T0.3 Composition anchor in prod evidence | **PASS** |
| T0.4 UI Compete | **PASS** |
| T0.5 Docs / BUIDL | **PASS** |
| T0.6 Smoke + Render | **PASS** |

→ **Ainda NÃO** claim “beat Claros / #1 overall”.  
→ **SIM** claim: **#1 origin** + **top-2 overall contender** com dual-key + 2-hop **anchored** + CSPR real + honesty.

---

## 1. Ranking overall (OPINIÃO calibrada)

### Tier S

| Rank | Project | Eixo | Nota ~ | Por quê |
| ---: | --- | --- | ---: | --- |
| **1** | **Claros** *(est.)* | Rede multi-agent / oracle-market | **4.4** | Densidade de **sistema/rede** ainda mais “ecossistema” |
| **2** | **Lastre** | Origin · seal>LLM · full stack live | **4.88** | PoO + RPC + CSPR + dual-key + 2-hop **anchored in prod** + CLI + honesty; só falta MintGate package live |
| **3** | **AgentGate** *(est.)* | x402 rails / gateway | **4.25** | Gateway purity; origin mais fraco |
| **4** | **CasCet** *(est.)* | Multi-hop cascade | **4.1** | Composition profundo; Lastre fechou 2-hop+anchor |
| **5** | **Faktura** *(est.)* | Credit / invoice | **3.6** | Outro jogo |
| **6** | **Vouch** *(est.)* | Agent reputation | **3.4** | Julga agents, não o seal |

### Movimento do dia

| Momento | Rank | Média ~ |
| --- | ---: | ---: |
| Manhã (mock x402) | #4 | 4.3 |
| Pós CSPR + CLI | #4 | 4.55 |
| Pós C/D/E config | #2 | 4.9 |
| **Pós anchor prod (#38 redeploy)** | **#2** | **4.88** |

**Niche:** **#1 proof-before-token / RWA origin for agents** (inalterado, reforçado).

---

## 2. Notas 0–5 — Lastre

| Dimensão | Pré-Tier0 | Pós C/D/E | **Agora (anchor prod)** | Evidência |
| --- | ---: | ---: | ---: | --- |
| Tese origin / seal>LLM | 5.0 | 5.0 | **5.0** | thesis + Agents |
| On-chain verify (RPC) | 5.0 | 5.0 | **5.0** | fullyVerified |
| x402 / money | 4.9 | 4.9 | **4.9** | casper_deploy + payment tx |
| Multi-party dual-key | 4.1 | 4.9 | **4.95** | distinct + dual-key-run.json |
| Composição 2-hop | 2.0 | 4.9 | **4.95** | model + **anchorTx live** + get-deploy OK |
| MintGate economics | 2.0 | 4.85 | **4.85** | Valid-only parity |
| MintGate live package | 1.0 | 2.0 | **2.0** | blocked / null |
| DX agent | 4.9 | 4.9 | **4.9** | CLI + APIs |
| Honesty | 5.0 | 5.0 | **5.0** | simulate mock |
| Demo / docs / Compete | 5.0 | 5.0 | **5.0** | Agents + handoff |
| **Média (sem live MintGate)** | — | ~4.9 | **~4.88** | |
| **Rank overall** | #4 | #2 | **#2** | |

### Residual para pressionar Claros (#1)

| Prioridade | Ação | Efeito |
| --- | --- | --- |
| P0 | Destravar Odra MintGate deploy + 1 `mint_lot` | MintGate 2.0→5.0; claim “token economics on-chain” |
| P1 | Dual-key sealer com tx própria (além de identity) | multi-party 4.95→5.0 |
| P2 | Vídeo 60s: dual-key → Invalid abort → CSPR → anchor | percepção juiz exigente |

---

## 3. Campo — mesmas dimensões (0–5)

| Dimensão | **Lastre** | Claros | AgentGate | CasCet | Faktura | Vouch |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tese origin | **5.0** | 2.5 | 2.0 | 2.0 | 2.5 | 1.5 |
| On-chain verify | **5.0** | 3.5 | 3.0 | 3.0 | 2.5 | 2.5 |
| x402 / money | **4.9** | 3.5 | **4.8** | 3.5 | 2.5 | 2.0 |
| Dual-key / multi-party | **4.95** | **4.9** | 3.5 | 3.5 | 3.0 | 3.5 |
| Composição (+anchor) | **4.95** | 3.5 | 3.5 | **4.9** | 2.0 | 2.5 |
| MintGate live | **2.0** | 2.5 | 2.0 | 2.0 | 2.0 | 1.5 |
| DX | **4.9** | 4.0 | **5.0** | 4.0 | 3.5 | 3.5 |
| Honesty | **5.0** | 3.5 | 3.5 | 3.5 | 3.5 | 3.5 |
| Demo / polish | **5.0** | 4.5 | 4.5 | 4.0 | 4.0 | 4.0 |
| **Overall juiz balanceado** | **4.88** | **4.4** | **4.25** | **4.1** | 3.6 | 3.4 |
| **Rank** | **#2** | **#1** | **#3** | **#4** | #5 | #6 |

---

## 4. Cruzamento (battle matrix)

| Eixo | vs Claros | vs AgentGate | vs CasCet |
| --- | --- | --- | --- |
| Origin seal before action | **W** | **W** | **W** |
| Invalid permanent on-chain | **W** | **W** | **W** |
| Live package + RPC samples | **W** | **W** | **W** |
| Real CSPR payment | **W**/T | **T**/W | **W** |
| Dual-key operators | **T**/W | **W** | **W** |
| 2-hop + **on-chain anchor** | **W** | **W** | **T**/W |
| MintGate **live** package | **L**/T | T | T |
| Honesty | **W** | **W** | **W** |
| Oracle / market-network density | **L** | T | T |

**Leitura vs Claros:**  
Ganhamos em origem, honesty, payment verificável, dual-key documentado, composition **ancorada**.  
Eles ainda podem vencer em **densidade de rede/oráculo** e (enquanto T0.2 falhar) em percepção de “token/economic layer on-chain mais completa” se o juiz exigir mint package live.

---

## 5. Claims

### Pode dizer
- Proof before token; seal decides; Invalid is permanent proof.  
- Production real testnet CSPR settle + dual-key + 2-hop **anchored on Casper** (explorer).  
- **#1 for origin verification of RWA agents.**  
- **Technical top-2 overall contender** (rubric).

### Não diga
- “We beat Claros” / “official #1”.  
- “MintGate package live on testnet” (ainda `mintLive: null`).  
- “Mainnet payments”.

### Pitch 20s (atualizado)
> Claros optimizes the agent network. Lastre is the truth gate under it: offline seal decides Valid or Invalid on Casper, agents pay real testnet CSPR, dual-key operators, and 2-hop composition anchored on-chain. Proof before token — live.

---

## 6. Revalidação

```bash
export API=https://app-api.lastre.io
curl -sS "$API/api/evidence" | jq '{
  dualKey: .dualKey.distinct,
  mintLive: .mintGate.livePackageHash,
  composition: {
    model: .composition.model,
    chainRoot: .composition.chainRoot,
    anchor: .composition.anchorTx,
    anchored: .composition.anchored
  },
  fullyVerified: .onChain.rpcEvidence.fullyVerified
}'
# Anchor: https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a
# Payment: https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c
```

---

*Opinion ranking + verified Lastre production facts. Not official DoraHacks scoreboard.*
