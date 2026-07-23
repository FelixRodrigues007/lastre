# Ranking ultra-crítico — Casper Agentic Buildathon

**Updated:** 2026-07-15 (carbon live + sealer on-chain + trust network)  
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
| Dual-key multi-party | **5.0** | sim | Contas distintas + sealer **lastTx on-chain** (`e82e5738…`) + attester carbon/mineral writes |
| Composition 2-hop | **4.9** | quase | Hop + kill-switch + anchor real; anchor = transfer-id (não Merkle put custom); 2 hops, não cascade N |
| MintGate live + economics | **4.95** | quase | Package + mint_lot real Valid-only; **symbolic** mint (não NFT marketplace / supply economics rico) |
| DX agent (CLI/API) | **4.85** | quase | CLI forte; sem SDK npm publicado / standards x402 full client ecosystem |
| Honesty / anti-teatro | **5.0** | sim | simulate mock; null fake mint; carbon asset-specific (não mineral masquerade); docs honestos |
| Demo / BUIDL / vídeo | **4.95** | quase | BUIDL + carbon live + sealer tx; vídeo pode não cobrir tudo |
| **Network / trust density** | **4.0** | piso 4 | Multi-party + mineral/carbon domains + mint gate + composition + x402 em `trustNetwork` (API). **Não** marketplace/oracle Claros — eixo oracle permanece L de propósito |
| Mainnet / production money | **1.5** | não | Testnet only |

### Médias Lastre

| Agregado | Nota | Como |
| --- | ---: | --- |
| Média aritmética (eixos core, **excl.** mainnet) | **~4.94** | 10 eixos ≥4.0 |
| **Overall weighted (incl. trust network 4.0)** | **~4.85** | juiz que ainda pesa “rede” |
| **Overall origin/RWA agentic rubric** (network peso 0) | **~4.96** | juiz focado em prova + chain + agent path |
| **Rank overall (rubric hostil balanceado)** | **#1** | ver §3 |
| **Rank origin niche** | **#1** | sem contender sério |

**Leitura hostil:**  
Não damos **5.0 overall cego**. Lastre é **#1 no eixo que o projeto escolheu** e **#1 ou empate técnico no topo overall** *se* o juiz valoriza prova on-chain verificável. Claros ainda pode vencer um juiz de “ecossistema multi-agent marketplace”.

---

## 3. Ranking overall (opinião calibrada · hostil)

Campo ~254. Rank = probabilidade de um juiz **técnico exigente** preferir o projeto **sem** upvotes/social.

| Rank | Projeto | Overall ~ | Força real | Fraqueza hostil |
| ---: | --- | ---: | --- | --- |
| **1** | **Lastre** | **4.85–4.96** | Prova end-to-end: seal → PoO (mineral+carbon) → MintGate → pay → 2-hop → dual-key **both keys write** → trustNetwork → evidence API | Oracle marketplace (aceito L); mint symbolic; vídeo pode estar stale |
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
| Dual-key multi-party | **5.0** | **4.7** | 3.5 | 3.5 | 3.0 | 3.5 |
| Composition | **4.9** | 3.5 | 3.5 | **4.85** | 2.0 | 2.5 |
| Mint / token gate | **4.95** | 2.5 | 2.0 | 2.0 | 2.5 | 1.5 |
| DX agent | **4.85** | 4.0 | **5.0** | 4.0 | 3.5 | 3.5 |
| Honesty | **5.0** | 3.5 | 3.5 | 3.5 | 3.5 | 3.5 |
| Demo + BUIDL | **4.95** | 4.5 | 4.5 | 4.0 | 4.0 | 4.0 |
| Network/trust density | **4.0** | **4.9** | 3.5 | 3.5 | 3.0 | 3.0 |
| **Weighted overall** | **~4.85** | **~4.4** | **~4.2** | **~4.1** | **~3.5** | **~3.4** |

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

1. *“Mint is symbolic, not a real asset token.”* → mint 4.95 not 5.0  
2. *“Anchor is a transfer-id, not a custom receipt contract.”* → composition 4.9  
3. *“No multi-agent market like Claros.”* → trust density 4.0, oracle marketplace still L by design  
4. *“Video may not show carbon/sealer Tier close-out.”* → demo 4.95  

**Ataques que **não** colam mais:**

- Fake mint explorer  
- x402 só mock em prod settle  
- Sem dual-key / sealer sem write on-chain  
- Sem composition  
- Sem MintGate package  
- Carbon sem attest asset-specific  
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
| Dual-key | 2.5 | 4.9 | **5.0** |
| 2-hop | 1.5 | 4.9 | **4.9** |
| MintGate | 2.0 | 4.85→5.0 live | **4.95** |
| DX | 4.5 | 4.9 | **4.85** |
| Honesty | 5.0 | 5.0 | **5.0** |
| Demo/BUIDL | 5.0 | 4.9 | **4.95** |
| Network/trust density | 2.5 | 2.8 | **4.0** |
| **Weighted overall** | ~4.3 | ~4.7 | **~4.85** |
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
| Carbon Valid | https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e |
| Sealer identity | https://testnet.cspr.live/transaction/e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e |
| BUIDL | https://dorahacks.io/buidl/46748 |

---

## 9. Veredito em uma frase

**Lastre is rubric #1 for proof-before-token agentic RWA on Casper: mineral + carbon live attests, dual-key both keys write, MintGate, composition, honest x402, trust-network density ≥4 without becoming an oracle marketplace. Claros remains the only plausible alternative if the jury optimizes pure multi-agent market density over verifiable origin truth.**

---

*Ultra-critical estimate. Not an official DoraHacks ranking. Rivals not re-scraped live this pass.*
