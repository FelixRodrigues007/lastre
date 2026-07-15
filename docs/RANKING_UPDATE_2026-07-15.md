# Ranking ultra-crítico — Casper Agentic Buildathon

**Updated:** 2026-07-15 (final stack + BUIDL Tier 0 complete)  
**Scope:** Lastre vs Claros · AgentGate · CasCet · Faktura · Vouch · campo ~254 BUIDLs  
**Method:** Lastre = **prod curls + explorer txs + BUIDL public**; rivals = prior competitive audit (Dora list WAF-gated; **no official scoreboard**).  
**Discipline:** scores are **rubric estimates**. Inflating to 5.0 without proof is forbidden. Residual gaps stay visible.

---

## 0. Snapshot VERIFIED (prod agora)

```json
{
  "dualKey": true,
  "mintLive": "hash-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1",
  "mintLot": "6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349",
  "anchor": "915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a",
  "anchored": true,
  "fullyVerified": true,
  "x402": "casper"
}
```

Simulate honesty: `settlementKind=synthetic_receipt`, `facilitatorMode=mock`, `mint=null`.

| Surface | Status | Proof |
| --- | --- | --- |
| API evidence | PASS | dualKey + mintLive + anchor + fullyVerified |
| Simulate mock | PASS | no fake mint explorer |
| Payment CSPR | PASS | `27461bd7…199c` |
| MintGate package + mint_lot | PASS | `ea049cd1…` + `6878f3e1…` |
| Composition anchor | PASS | `915c9736…` get-deploy OK |
| Dual-key accounts | PASS | sealer ≠ attester |
| CLI | PASS | prove / pay mock / pay casper / evidence |
| BUIDL public | PASS | Tier 0 hashes on dorahacks.io/buidl/46748 |
| Team Dora profiles | WEAK | “Hacker does not exist” residual |
| Official Dora placement | UNKNOWN | not published to us |

**Tier 0 checklist:** T0.1–T0.6 **all PASS** (technical).  
**Official winner claim:** still **NOT** authorized (no jury data).

---

## 1. Escala 0–5 (critério hostil)

| Nota | Significado |
| ---: | --- |
| **5.0** | Melhor do campo **e** prova on-chain/API irrefutável no eixo |
| **4.7–4.9** | Top-tier verificável; residual cosmético ou 1 gap não-estrutural |
| **4.0–4.6** | Forte e demoável; falta densidade ou 1 eixo estrutural |
| **3.0–3.9** | Crível mas incompleto / semi-demo |
| **≤2.9** | Frágil, marketing > prova |

**Pesos do overall balanceado (juiz exigente “agentic + on-chain”):**

| Eixo | Peso | Por quê |
| --- | ---: | --- |
| Tese / diferenciação | 1.0 | buildathon agentic |
| On-chain verify denso | 1.2 | Casper track |
| Money path (x402) | 1.1 | agent payments |
| Multi-party dual-key | 1.0 | vs Claros-class systems |
| Composition | 1.0 | vs CasCet-class |
| Token/gate economics | 1.0 | MintGate / RWA |
| DX agent | 0.9 | AgentGate-class |
| Honesty / anti-teatro | 1.1 | juiz hostil |
| Demo + BUIDL completeness | 0.9 | submission surface |
| Network/oracle density | 0.8 | Claros-class (Lastre **aceita L**) |

---

## 2. Notas Lastre — ultra-críticas (0–5)

| Dimensão | Nota | Cap 5.0? | Por quê **não** 5.0 pleno (se <5) |
| --- | ---: | --- | --- |
| Tese origin / seal > LLM | **5.0** | sim | Mais coerente e defensável do campo |
| On-chain verify (PoO + live-RPC) | **5.0** | sim | fullyVerified + samples canônicos |
| Invalid-as-proof | **5.0** | sim | Invalid permanente on-chain + narrativa |
| x402 / real CSPR settle | **4.9** | quase | Prod `casper_deploy` + tx; path still “server-as-payer demo” (não wallet UX end-user) |
| Dual-key multi-party | **4.85** | quase | Contas distintas + run; sealer **não** assina tx de attest própria (só identity + attester writes) |
| Composition 2-hop | **4.9** | quase | Hop + kill-switch + anchor real; anchor = transfer-id (não Merkle put custom); 2 hops, não cascade N |
| MintGate live + economics | **4.95** | quase | Package + mint_lot real Valid-only; **symbolic** mint (não NFT marketplace / supply economics rico) |
| DX agent (CLI/API) | **4.85** | quase | CLI forte; sem SDK npm publicado / standards x402 full client ecosystem |
| Honesty / anti-teatro | **5.0** | sim | simulate mock; null fake mint; docs honestos |
| Demo / BUIDL / vídeo | **4.9** | quase | BUIDL completo; vídeo pode não cobrir dual-key/mint/anchor novos |
| **Network / oracle density** | **2.8** | não | **Propositalmente fraco** vs Claros — não é o produto |
| Mainnet / production money | **1.5** | não | Testnet only |

### Médias Lastre

| Agregado | Nota | Como |
| --- | ---: | --- |
| Média aritmética (eixos core, **excl.** network + mainnet) | **~4.93** | 10 eixos fortes |
| **Overall weighted (incl. network 2.8)** | **~4.72** | juiz que ainda pesa “rede” |
| **Overall origin/RWA agentic rubric** (network peso 0) | **~4.93** | juiz focado em prova + chain + agent path |
| **Rank overall (rubric hostil balanceado)** | **#1–#2** | ver §3 |
| **Rank origin niche** | **#1** | sem contender sério |

**Leitura hostil:**  
Não damos **5.0 overall cego**. Lastre é **#1 no eixo que o projeto escolheu** e **#1 ou empate técnico no topo overall** *se* o juiz valoriza prova on-chain verificável. Claros ainda pode vencer um juiz de “ecossistema multi-agent marketplace”.

---

## 3. Ranking overall (opinião calibrada · hostil)

Campo ~254. Rank = probabilidade de um juiz **técnico exigente** preferir o projeto **sem** upvotes/social.

| Rank | Projeto | Overall ~ | Força real | Fraqueza hostil |
| ---: | --- | ---: | --- | --- |
| **1** | **Lastre** | **4.72–4.93** | Prova end-to-end: seal → PoO → MintGate → pay → 2-hop anchor → dual-key → evidence API → BUIDL | Network density; mint symbolic; sealer sem write tx; vídeo pode estar stale |
| **2** | **Claros** *(est.)* | **4.35–4.50** | Densidade de rede / multi-agent / market-oracle *vibe* | Origin seal first fraco; Invalid-as-proof; honesty mint; payment+gate RWA menos fechado |
| **3** | **AgentGate** *(est.)* | **4.20–4.35** | Rails x402 / gateway DX | Origin truth; dual-key RWA; mint gate |
| **4** | **CasCet** *(est.)* | **4.05–4.20** | Cascade composition | Origin RWA; permanent Invalid; full stack live |
| **5** | **Faktura** *(est.)* | **3.5–3.7** | Credit desk narrative | Pre-token provenance |
| **6** | **Vouch** *(est.)* | **3.3–3.5** | Agent courts | Asset seal, not agent score |
| 7–254 | Restante | ≤3.5 | Varia | Sem package denso + payment + gate + honesty |

### Movimento do dia (honesto)

| Momento | Rank | Overall ~ |
| --- | ---: | ---: |
| Manhã (mock x402) | #4 | ~4.3 |
| Pós CSPR + CLI | #4 | ~4.55 |
| Pós C/D/E config | #2 | ~4.9 |
| Pós anchor prod | #2 | ~4.88 |
| **Pós MintGate live + BUIDL completo** | **#1 rubric** | **~4.72–4.93** |

**Empate teórico com Claros** só se o juiz **desprezar** prova on-chain e **superponderar** marketplace multi-agent.  
**Derrota teórica de Lastre** se o júri for social/upvote-only (não modelado aqui).

---

## 4. Campo — matriz 0–5 (hostil)

| Dimensão | **Lastre** | Claros | AgentGate | CasCet | Faktura | Vouch |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Tese origin / seal>LLM | **5.0** | 2.5 | 2.0 | 2.0 | 2.5 | 1.5 |
| On-chain verify denso | **5.0** | 3.5 | 3.0 | 3.0 | 2.5 | 2.5 |
| x402 / money | **4.9** | 3.5 | **4.8** | 3.5 | 2.5 | 2.0 |
| Dual-key multi-party | **4.85** | **4.7** | 3.5 | 3.5 | 3.0 | 3.5 |
| Composition | **4.9** | 3.5 | 3.5 | **4.85** | 2.0 | 2.5 |
| Mint / token gate | **4.95** | 2.5 | 2.0 | 2.0 | 2.5 | 1.5 |
| DX agent | **4.85** | 4.0 | **5.0** | 4.0 | 3.5 | 3.5 |
| Honesty | **5.0** | 3.5 | 3.5 | 3.5 | 3.5 | 3.5 |
| Demo + BUIDL | **4.9** | 4.5 | 4.5 | 4.0 | 4.0 | 4.0 |
| Network/oracle density | **2.8** | **4.9** | 3.5 | 3.5 | 3.0 | 3.0 |
| **Weighted overall** | **~4.8** | **~4.4** | **~4.2** | **~4.1** | **~3.5** | **~3.4** |

*Claros dual-key 4.7 = “rede multi-op” plausível, não revalidado live nesta sessão.*

---

## 5. Cruzamento (W / T / L) — juiz hostil

| Eixo | vs Claros | vs AgentGate | vs CasCet |
| --- | --- | --- | --- |
| Origin seal before action | **W** | **W** | **W** |
| Invalid permanent on-chain | **W** | **W** | **W** |
| Live PoO + RPC samples | **W** | **W** | **W** |
| Real CSPR payment | **W**/T | **T**/W | **W** |
| Dual-key (documented + distinct) | **T**/W | **W** | **W** |
| 2-hop + on-chain anchor | **W** | **W** | **T**/W |
| MintGate live Valid-only | **W** | **W** | **W** |
| Honesty / anti-teatro | **W** | **W** | **W** |
| BUIDL evidence completeness | **W**/T | **W** | **W** |
| Network / oracle marketplace | **L** | T | T |
| Pure payment-gateway UX | T | **L**/T | T |
| Deep N-hop tool cascade | T | T | **L**/T |

**Ataques hostis que ainda colam (parciais):**

1. *“Sealer key never writes on-chain.”* → dual-key 4.85 not 5.0  
2. *“Mint is symbolic, not a real asset token.”* → mint 4.95 not 5.0  
3. *“Anchor is a transfer-id, not a custom receipt contract.”* → composition 4.9  
4. *“No multi-agent market like Claros.”* → network 2.8 (aceito)  
5. *“Video may not show new Tier 0.”* → demo 4.9  

**Ataques que **não** colam mais:**

- Fake mint explorer  
- x402 só mock em prod settle  
- Sem dual-key  
- Sem composition  
- Sem MintGate package  
- BUIDL sem hashes  

---

## 6. Claims — o que pode / não pode dizer

### Autorizado (fiel ao rigor)

- Proof before token; seal decides; Invalid is permanent on-chain proof.  
- Full live stack: PoO + MintGate + CSPR settle + dual-key + 2-hop anchored + evidence API.  
- **#1 in origin verification for RWA / agentic provenance** in this field.  
- **Technical #1 overall on a demanding on-chain + agent + honesty rubric** (estimate).  
- Contender that closes Claros-class gaps on multi-party / mint / composition **without** becoming an oracle marketplace.

### Proibido (mesmo com stack full)

- “Official DoraHacks #1 / we won the prize.”  
- “Mainnet production money.”  
- “We are better than Claros at multi-agent markets.”  
- “Full NFT / DeFi mint economy.”  
- “Sealer key has attest txs on-chain.” (unless you add them later)

### Pitch 20s (rigoroso)

> Claros optimizes the agent network. Lastre is the truth gate under it. Offline seal decides Valid or Invalid on Casper; MintGate only passes Valid; agents pay real testnet CSPR; dual-key operators; 2-hop composition anchored on-chain; full evidence API. Proof before token — live, honest, judge-mock where it should be mock.

---

## 7. Scorecard final (entrega)

| Dimensão | Manhã | Meio-dia | **Noite (agora)** |
| --- | ---: | ---: | ---: |
| Tese | 5.0 | 5.0 | **5.0** |
| On-chain RPC | 5.0 | 5.0 | **5.0** |
| x402 money | 4.2 | 4.9 | **4.9** |
| Dual-key | 2.5 | 4.9 | **4.85** |
| 2-hop | 1.5 | 4.9 | **4.9** |
| MintGate | 2.0 | 4.85→5.0 live | **4.95** |
| DX | 4.5 | 4.9 | **4.85** |
| Honesty | 5.0 | 5.0 | **5.0** |
| Demo/BUIDL | 5.0 | 4.9 | **4.9** |
| Network density | 2.5 | 2.8 | **2.8** |
| **Weighted overall** | ~4.3 | ~4.7 | **~4.8** |
| **Rank overall (rubric)** | #4 | #2 | **#1** |
| **Rank origin niche** | #1 | #1 | **#1** |

---

## 8. Revalidação (não negociável)

```bash
export API=https://app-api.lastre.io
curl -sS "$API/api/evidence" | jq '{
  dualKey: .dualKey.distinct,
  mintLive: .mintGate.livePackageHash,
  mintLot: .mintGate.liveMintLotTx,
  anchor: .composition.anchorTx,
  fullyVerified: .onChain.rpcEvidence.fullyVerified
}'
curl -sS -X POST "$API/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001" \
  -H 'content-type: application/json' -d '{}' \
  | jq '{settlementKind, facilitatorMode, mint: .provenance.csprLinks.mint}'
```

| Explorer | URL |
| --- | --- |
| Payment | https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c |
| Anchor | https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a |
| MintGate package | https://testnet.cspr.live/contract-package/ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1 |
| mint_lot | https://testnet.cspr.live/transaction/6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349 |
| BUIDL | https://dorahacks.io/buidl/46748 |

---

## 9. Veredito em uma frase

**Lastre is rubric #1 for proof-before-token agentic RWA on Casper with a fully live, honest stack; Claros remains the only plausible #1 alternative if the jury optimizes for multi-agent market density over verifiable origin truth.**

---

*Ultra-critical estimate. Not an official DoraHacks ranking. Rivals not re-scraped live this pass.*
