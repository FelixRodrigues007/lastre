# Demo Day Scorecard — 5 minutes (Agentic Final Round)

**Date:** 2026-07-17  
**Audience:** Casper Agentic Buildathon professional jury  
**Thesis (20s max):** *Claros optimizes the agent network. Lastre is the truth gate under it — proof before token, seal decides, Invalid is permanent on-chain proof.*

> DEMONSTRATION ONLY. Simulated assets; no investment. Only Casper Testnet hashes labeled as evidence are real.

---

## 0. Prep (before the clock)

| Check | URL / command | PASS |
| --- | --- | :---: |
| Landing | https://lastre.io | ☐ |
| App | https://app.lastre.io | ☐ |
| API health | https://app-api.lastre.io/api/health → `"ok":true` | ☐ |
| Evidence | https://app-api.lastre.io/api/evidence → has `trustNetwork`, `originAutonomy` | ☐ |
| Autonomy | https://app-api.lastre.io/api/agent/autonomy → `model: origin_autonomy_loop` | ☐ |
| Tabs open | marketplace · agents · evidence (JSON) · 1 explorer tx · BUIDL | ☐ |
| Video standby | https://youtu.be/UzhKMsKA6QE (só se UI cair) | ☐ |

**One-liner if asked “live?”:**  
*API is casper-mode for real settle; UI simulate stays mock by design — honesty, not fake mint explorer.*

---

## 1. Timeline 0:00 → 5:00

| Clock | Speak (≤1 phrase) | Click / show | Criterion hit |
| ---: | --- | --- | --- |
| **0:00–0:20** | Thesis: proof before token; seal decides Valid/Invalid; agent only pay/skip/escalate. | Landing hero → open **app** | Innovation · Agentic |
| **0:20–1:20** | Full happy path: agent pays (mock), seal matches, carbon Valid, MintGate demo only after Valid. | **Marketplace → Run Demo** | Tech · Agentic · UX · RWA |
| **1:20–1:50** | Invalid is not a failed UX — permanent on-chain rejection proof. | Open Invalid tx explorer (tab) | Contracts · Innovation · Honesty |
| **1:50–2:30** | Multi-party: sealer ≠ attester, both wrote on-chain; mineral + carbon domains. | Evidence JSON: `dualKey`, `trustNetwork` | Tech · Contracts · Ecosystem |
| **2:30–3:10** | Agent surface: 402 → pay → proof payload; compete framing honest vs Claros. | **/agents** page | Agentic · UX · Innovation |
| **3:10–3:50** | Autonomy loop: continuous origin tests, not oracle feed farm. | POST cycle or show `originAutonomy` | Agentic · Tech · Launch |
| **3:50–4:30** | Stack live: MintGate package + mint_lot + CSPR pay sample + composition anchor. | Evidence / explorers (1–2 links) | Contracts · RWA · Ecosystem |
| **4:30–5:00** | Roadmap: mainnet when safe; partners query Lastre before mint/finance; not marketplace. | BUIDL / socials / one plan line | Launch · Ecosystem |
| **+30s buffer** | Q&A only. Do not re-demo unless asked. | — | — |

---

## 2. Official criteria → what the judge must **see**

Weights below are **our simulation** (Casper does not publish numeric weights). Use as self-score 0–5.

### C1 — Technical Execution (sim weight 1.2)

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| End-to-end path works without local install | Marketplace Run Demo | ☐ |
| API evidence pack complete (thesis, dualKey, mintGate, composition, onChain, originAutonomy) | `/api/evidence` | ☐ |
| RPC sample txs `fullyVerified` when node responds | `onChain.rpcEvidence` | ☐ |
| No crash / no blank screens | App + API health | ☐ |

**Target self-score: 4.8–5.0** · Gap if evidence slow: say “node flaky; sample hashes still on cspr.live”.

---

### C2 — Innovation & Originality (1.0)

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| **Invalid as permanent proof** (not discarded error) | Invalid explorer tx | ☐ |
| Seal decides verdict; LLM cannot overwrite | Agents copy + Run Demo | ☐ |
| Dual-key operational (sealer ≠ attester) | `dualKey` + sealer tx | ☐ |
| Origin niche vs payment-rails / oracle rivals | Agents compete section | ☐ |

**Script line:** *Most projects improve how agents pay or publish feeds. We answer: was the physical origin verified before any token or action?*

**Target: 4.7–4.9**

---

### C3 — Use of AI / Agentic Systems (1.3) ★ critical

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| Agent chooses **action only** (pay / skip / escalate) | Run Demo + Agents page | ☐ |
| x402-shaped flow for machine payment | Agents / simulate | ☐ |
| Autonomy loop runs dense origin scenarios | `POST /api/agent/autonomy/cycle` or GET summary | ☐ |
| Composition 2-hop + kill-switch story | Evidence `composition` | ☐ |

**Do not claim:** full multi-agent marketplace like Claros.  
**Do claim:** *autonomous origin verification agent + paying agent path.*

**Target: 4.6–4.8** · Autonomy live is the anti-“dead demo” card.

---

### C4 — Real-World Applicability · DeFi & RWA (1.3) ★ critical

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| Mineral lot + **carbon credit** same seal model | Marketplace / evidence carbon tx | ☐ |
| MintGate: token only if Valid | MintGate package + mint_lot links | ☐ |
| Parallel to Casper RWA story (parking / provenance) | One sentence in pitch | ☐ |
| Fictional labels clear (no fake TVL) | Banner / honesty copy | ☐ |

**Script line:** *Casper is bringing real assets on-chain. Lastre is the gate that stops unverified origin from becoming a token.*

**Target: 4.9–5.0**

---

### C5 — User Experience & Design (0.9)

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| Run Demo < 90s without explanation of CLI | Marketplace | ☐ |
| Labels: Live testnet vs Demo simulated | UI badges | ☐ |
| EN-first UI, clear hierarchy | App | ☐ |
| Agents page readable without reading the repo | /agents | ☐ |

**Target: 4.5–4.7** · If UI glitches → fall back to video + evidence JSON (still score contracts/agentic).

---

### C6 — Working Smart Contracts (1.2)

| Judge must open (pick **3**, not all) | Hash / URL | Self ☐ |
| --- | --- | :---: |
| ProofOfOrigin package | `hash-b8b505fe…` on cspr.live | ☐ |
| Invalid permanent | `5a7b0e01…8773cd` | ☐ |
| Carbon Valid | `a4124ea9…2dc02e` | ☐ |
| Sealer identity (dual-key) | `e82e5738…7b83e` | ☐ |
| MintGate package + mint_lot | `ea049cd1…` / `6878f3e1…` | ☐ |
| Payment CSPR sample | `27461bd7…199c` | ☐ |
| Composition anchor | `915c9736…417a` | ☐ |

**Rule:** Never show mock mint hash as explorer “live mint”. Session mint IDs stay demo.

**Target: 4.9–5.0**

---

### C7 — Long-Term Launch Plans (0.8)

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| Live domains (not only localhost) | lastre.io / app / api | ☐ |
| GitHub open + README / playbook | github.com/FelixRodrigues007/lastre | ☐ |
| After-buildathon plan (1 slide / 15s) | BUIDL paste / spoken | ☐ |
| Socials | X linked on BUIDL | ☐ |

**15s plan:** keep growing testnet evidence → partner agents query before mint → mainnet only when safe → no fake yield.

**Target: 4.4–4.6**

---

### C8 — Potential for Long-Term Ecosystem Impact (1.0)

| Judge must see | Where | Self ☐ |
| --- | --- | :---: |
| Other agent projects can **query** Lastre (CLI / x402 / evidence) | Agents + CLI one-liner | ☐ |
| Honest W/L vs Claros / AgentGate / CasCet | Agents compete matrix | ☐ |
| Fills RWA trust gap under payments/oracles | Pitch close | ☐ |

**Script close:** *Payment rails and oracles still need a truth gate. That’s the layer we ship on Casper.*

**Target: 4.5–4.7**

---

## 3. Self-score sheet (fill after one full dry-run)

| Criterion | Weight | Self (0–5) | Evidence shown? |
| --- | ---: | ---: | :---: |
| Technical Execution | 1.2 | __ | ☐ |
| Innovation & Originality | 1.0 | __ | ☐ |
| Use of AI / Agentic | 1.3 | __ | ☐ |
| Real-World / RWA-DeFi | 1.3 | __ | ☐ |
| UX & Design | 0.9 | __ | ☐ |
| Working Smart Contracts | 1.2 | __ | ☐ |
| Long-Term Launch | 0.8 | __ | ☐ |
| Ecosystem Impact | 1.0 | __ | ☐ |
| **Weighted avg** | | **__** | |

**Weighted formula:**  
`sum(score_i × weight_i) / sum(weights)` · weights sum = **8.7**

| Band | Meaning |
| ---: | --- |
| ≥ 4.7 | Demo-day ready for top-3 contention |
| 4.4–4.6 | Strong; fix the lowest row before day |
| < 4.4 | Do not claim top-1; fix blockers |

---

## 4. Exact click path (operator checklist)

Copy into a sticky note. **One person drives UI; one watches time.**

```text
[ ] 1. lastre.io (3s) → app.lastre.io
[ ] 2. /marketplace → Run Demo → wait final Valid + seal match + carbon score
[ ] 3. Mention Invalid → open tab: testnet.cspr.live/transaction/5a7b0e01…
[ ] 4. app-api…/api/evidence → dualKey.distinct true, trustNetwork 8/8, originAutonomy
[ ] 5. /agents → 402 / pay / proof + compete table (Lastre vs Claros honest L on marketplace)
[ ] 6. Optional: POST /api/agent/autonomy/cycle → show ok:true (or GET cyclesTotal)
[ ] 7. One more explorer: carbon Valid OR MintGate package
[ ] 8. Close: proof before token · not official #1 claim · roadmap 15s
```

### Autonomy one-liner commands (optional live)

```bash
curl -sS https://app-api.lastre.io/api/agent/autonomy | jq '{cyclesTotal,cyclesOk,last: .lastCycle.ok}'

curl -sS -X POST https://app-api.lastre.io/api/agent/autonomy/cycle \
  -H 'content-type: application/json' \
  -d '{"source":"demo-day"}' | jq '{ok, cycleId: .cycle.cycleId}'
```

---

## 5. Forbidden lines (even if self-score is 5.0)

- “We won / official Dora #1”
- “Mainnet production money”
- “accepted=N” unless API returns that N
- “Better than Claros at multi-agent markets”
- Linking session `mint-gate-…` as a live Casper mint tx
- Claiming autonomy cycles survive Render restart (in-memory)

---

## 6. Failure modes (keep score alive)

| Failure | Pivot (≤20s) | Criteria still scored |
| --- | --- | --- |
| Marketplace broken | Video + evidence JSON | Contracts · Innovation · Launch |
| Evidence RPC slow | Open 2 known explorer hashes | Contracts |
| Autonomy 404 | Skip; stack still has dual-key/carbon | Tech · Agentic via Agents page |
| Simulate weird | Show honestNote: UI mock by design | Honesty (maps to Tech/Launch trust) |

---

## 7. Parallel to past Casper winners (pitch memory)

| Past winner pattern | How you hit it in 5 min |
| --- | --- |
| CasPay = reusable rails | CLI + x402 + “agents query us first” |
| Shroud = serious crypto | Invalid permanent + dual-key + RPC verify |
| CasperLink = agentic UX | Run Demo + Agents + autonomy cycle |
| RWA strategic (Parking) | Carbon + mineral origin before token |

---

## 8. 20s / 60s / 5min scripts

### 20s elevator

> Other agents execute on claims. Lastre verifies origin first. Offline seal decides Valid or Invalid on Casper — for mineral and carbon. MintGate only passes Valid. Agents pay over x402. Dual-key both keys write. Autonomy loop keeps proving it live. Proof before token.

### 60s (if no full demo)

> [Show marketplace result screenshot or video 0:30]  
> Seal decides; agent only chooses pay/skip/escalate. Invalid stays on-chain.  
> [Show evidence dualKey + carbon hash]  
> [Show autonomy cyclesOk]  
> We’re not an oracle market — we’re the truth gate under agentic RWA on Casper.

### 5:00 close

> Judges: full evidence at app-api.lastre.io/api/evidence. BUIDL 46748.  
> We don’t claim the social vote. We claim verifiable origin proof for agentic RWA.

---

## 9. Links (canonical)

| Surface | URL |
| --- | --- |
| Landing | https://lastre.io |
| App | https://app.lastre.io |
| Marketplace | https://app.lastre.io/marketplace |
| Agents | https://app.lastre.io/agents |
| Evidence | https://app-api.lastre.io/api/evidence |
| Autonomy | https://app-api.lastre.io/api/agent/autonomy |
| Health | https://app-api.lastre.io/api/health |
| BUIDL | https://dorahacks.io/buidl/46748 |
| PoO package | https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561 |
| Invalid sample | https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd |
| Carbon Valid | https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e |
| Video | https://youtu.be/UzhKMsKA6QE |
| Full playbook | [JUDGES_PLAYBOOK.md](../JUDGES_PLAYBOOK.md) |

---

## 10. Dry-run protocol (do this twice)

1. Timer 5:00, full path, no pause for “beauty”.  
2. Second run with forced failure (kill wifi mid-demo) → practice pivot §6.  
3. Fill §3 self-score; any row **&lt; 4.4** → fix before demo day.  
4. One person only speaks; one only clicks.

**Done when:** two timed runs ≥ 4.7 weighted **and** every ★ criterion (Agentic + RWA) has a live click, not only words.
