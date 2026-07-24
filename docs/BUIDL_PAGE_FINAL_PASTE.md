# BUIDL 46748 — Description paste (complete + pioneer narrative)

**Demo video field (principal):** `https://youtu.be/fUItKuiG4l8`

Cola **tudo abaixo da linha** no Description.

---

# Lastre — the origin trust layer for hard RWAs on Casper

**One-line thesis**

Other agents execute. Lastre lets them verify the source first — **proof before token, and proof before finance.**

---

## Why Lastre is the pioneer of this track

This Final Round is full of strong teams improving **what agents do after they already believe a claim**:

- how agents **pay** (x402 rails, receipts, spend guards)
- how oracles **publish feeds** and sell data
- how platforms **underwrite invoices** or unlock ag credit
- how systems **monitor collateral** after tokenization
- how registries **issue or freeze** carbon after an MRV hash

**Lastre is the first full product in this field that treats origin truth as the hard problem *before* all of that.**

We did not build another marketplace, another invoice engine, or another continuous auditor.

We built the **missing upstream layer** for agentic RWA on Casper:

1. A **deterministic offline seal** decides **Valid** or **Invalid**
2. **Invalid is permanent on-chain proof** — not a discarded error
3. **Separation of duties**: field sealer ≠ chain attester (dual-key)
4. **MintGate**: no Valid origin → no mint access
5. Agents may **pay via x402 for provenance** — the LLM only chooses pay / skip / escalate; **the seal decides truth**
6. **Sealed Market Rail**: demo mint + demo collateral unlock **only after** Valid origin

That stack is live today on **Casper Testnet**, with public explorer links, a production evidence API, dual x402 honesty (mock UI vs real settle), and a one-click judge path.

**Category claim (precise, not hype):**  
In this hackathon cohort, Lastre is the pioneer of **origin-gated hard RWA** — the product that forces proof *before* token and *before* finance, instead of densifying what happens after.

We do **not** claim social-vote rank, fake TVL, mainnet money in demo, or that rivals are worthless. We claim a **different and earlier job**.

---

## Demo videos (4K) — watch first

**Main demo (set as BUIDL Demo video):** https://youtu.be/fUItKuiG4l8  
**Sealed Market Rail — Proof Before Token** — full judge path (~60s): Valid seal → agent action shape → MintGate → demo finance unlock → Invalid as permanent proof → real testnet settle honesty.

**Additional clips**

- **One Link for Judges** (rail deep-link `?rail=1`): https://youtu.be/7v3hsU5iBIc
- **Invalid Is Proof**: https://youtu.be/yKaW1eoQYw8
- **Honest Dual x402 — Mock UI, Real Settle**: https://youtu.be/FLBh3Iw8SMA
- **Dual-Key Trust Stack**: https://youtu.be/dCiPq1R5hz4
- **Not an Oracle Marketplace**: https://youtu.be/oWCq5a2KlyI
- **Social cut** (9:16): https://youtu.be/xm4RsKigsaA

Prior longer cut (optional): https://youtu.be/UzhKMsKA6QE

**Video honesty (every clip):** in-app rail run / pay step = **MOCK** facilitator (no value moved). Production settles **real Casper testnet CSPR**. Assets and origins in demo are **fictional**. No investment, yield, or ownership sale is offered.

---

## Sealed Market Rail (judge path — start here)

**Sealed Market Rail** is the product surface judges should click first.

It is **not** a DEX, order book, AMM, token sale, lending market, or investment product.

It is the live demonstration that **tokenization and demo collateral only unlock after a Valid origin seal on Casper**.

- **Sealed Market Rail demo:** https://app.lastre.io/marketplace?rail=1
- **Landing rail section:** https://lastre.io/#sealed-rail
- **My Assets (rail handoff):** https://app.lastre.io/my-assets?rail=1
- **Evidence pack (jury mode):** https://app-api.lastre.io/api/evidence
- **Health:** https://app-api.lastre.io/api/health
- **Rail API:** https://app-api.lastre.io/api/rail
- **Latest real testnet settle (canonical, 2.5 CSPR):** https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a

**Rail steps (Valid path)**

1. Origin seal verified  
2. Optional agent x402 pay shape (UI = mock)  
3. MintGate opens only if Valid  
4. Demo mint event (labeled demo / simulated)  
5. Demo collateral unlock (session demo only)

**Invalid path:** permanent on-chain rejection — mint and demo finance stay closed.

---

## Honesty (read first — non-negotiable)

- UI **Run Sealed Rail demo** / `POST /api/rail/run` / `POST /api/x402/simulate` = **mock** facilitator (`synthetic_receipt`, no value moved). The HTTP **402** seam is real.
- **Real settle** = production API only:
  - native CSPR via `POST /api/x402/settle` when `facilitatorMode=casper`
  - **or** WCSPR via `POST /api/x402/cloud/settle` (official CSPR.cloud facilitator, EIP-712) when `facilitatorMode=cspr_cloud`
- MintGate / demo collateral on the rail = **session demo** (not free mint, not liquidation, no investment).
- Seal decides **Valid / Invalid**. Agents only choose **pay / skip / escalate**. Invalid permanently closes mint + demo finance for that origin path.
- Network for live money evidence today: **Casper Testnet**. Mainnet when facilitator ops + keys + monitoring are production-safe — **no mainnet money in demo**.

**DEMONSTRATION ONLY** — fictional sample assets; no investment, yield, ownership sale, or financial promise.

---

## What Lastre is (product definition)

Lastre is the **origin trust layer for hard RWAs on Casper**.

Hard RWAs (mineral lots, carbon claims, physical-origin assets) break agentic systems when the payload is accepted before the origin is proven.

Lastre enforces:

| Layer | Rule |
| --- | --- |
| Seal | Deterministic SHA-256 seal → Valid or Invalid |
| Chain | Invalid is first-class permanent proof on Casper |
| Dual-key | Field sealer ≠ chain attester |
| Mint | MintGate requires Valid origin |
| Agent | May pay for provenance; never rewrites the seal |
| Finance demo | Sealed Market Rail unlocks demo collateral only after Valid |

**What we are not**

- Not an oracle marketplace  
- Not invoice underwriting  
- Not continuous collateral monitoring  
- Not a carbon credit exchange  

Those layers are valuable — and they come **after** origin is proven.

---

## Short description (elevator)

Lastre is the origin trust layer for hard RWAs on Casper.

Proof before token — and proof before finance. A deterministic seal decides Valid or Invalid (Invalid is permanent on-chain proof). Separation of duties: field sealer ≠ chain attester. Mint access requires Valid origin (MintGate). Agents may pay via x402 to read provenance; the LLM only chooses pay / skip / escalate — the seal decides truth.

- **Sealed Market Rail:** https://app.lastre.io/marketplace?rail=1  
- **Evidence:** https://app-api.lastre.io/api/evidence  
- **Health:** https://app-api.lastre.io/api/health  
- **Latest settle (2.5 CSPR):** https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a  
- **Prior settle:** https://testnet.cspr.live/transaction/b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106  

---

## Live links

- Landing — https://lastre.io  
- Landing Sealed Rail — https://lastre.io/#sealed-rail  
- App — https://app.lastre.io  
- **Judge demo (Sealed Market Rail)** — https://app.lastre.io/marketplace?rail=1  
- Agents — https://app.lastre.io/agents  
- My Assets — https://app.lastre.io/my-assets?rail=1  
- API health — https://app-api.lastre.io/api/health  
- Mint summary — https://app-api.lastre.io/api/mint/summary  
- Evidence pack — https://app-api.lastre.io/api/evidence  
- Rail API — https://app-api.lastre.io/api/rail  
- Autonomy — https://app-api.lastre.io/api/agent/autonomy  
- GitHub — https://github.com/FelixRodrigues007/lastre  
- Community — https://github.com/FelixRodrigues007/lastre/community  
- **Demo video (main)** — https://youtu.be/fUItKuiG4l8  
- Judge playbook — https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md  

**CLI (mock pay):**

`node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay`

**CLI (real CSPR):**

`node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay --mode casper`

**Smoke:** `bash scripts/jury-smoke.sh`

---

## How to test in 90 seconds

1. Watch main demo: https://youtu.be/fUItKuiG4l8  
2. Open https://app.lastre.io/marketplace?rail=1 → run **Sealed Market Rail** (Valid carbon, steps 1–5).  
3. Invalid branch (permanent rejection): https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd  
4. Evidence API: https://app-api.lastre.io/api/evidence → `dualKey.distinct`, `honesty`, `lastCasperSettle` (`25088a6a…`), `sealedMarketRail`, `trustStack`.  
5. Latest real settle: https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a  
6. One sentence: *Seal decides Valid/Invalid; MintGate blocks mint without Valid; agent only pay/skip/escalate; Sealed Market Rail only unlocks demo finance after Valid.*

---

## How to test in 5 minutes

1. https://app.lastre.io/marketplace?rail=1  
2. Run **Sealed Market Rail** Valid path (steps 1–5).  
3. Confirm: Verdict **Valid**, seal match **true**, carbon score **92** (sample), MintGate labeled demo, demo collateral only after Valid.  
4. My Assets handoff: https://app.lastre.io/my-assets?rail=1  
5. Agents: https://app.lastre.io/agents — quote → X-PAYMENT → proof (**UI = mock**).  
6. Evidence: https://app-api.lastre.io/api/evidence  
   - `honesty` (uiSimulate=mock · apiSettle=real when casper)  
   - `lastCasperSettle` = `25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a`  
   - `x402Mode=casper`  
   - deep-link includes `rail=1`  
   - `dualKey.distinct=true`  
   - `trustStack` (4 roles)  
7. Invalid path: tampered tx + `MINA-VALEDOURO-LOTE-001` / `…-TAMPERED`  
8. Optional clips: https://youtu.be/yKaW1eoQYw8 · https://youtu.be/FLBh3Iw8SMA · https://youtu.be/dCiPq1R5hz4 · https://youtu.be/oWCq5a2KlyI  

---

## Casper Testnet evidence

- **Network:** `casper-test`  
- **ProofOfOrigin package hash:** `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`  
- **Package address:** `package-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`  
- **Package explorer:** https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561  
- **Deployer public key:** `01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad`  
- **Counters (last check):** accepted=2, rejected=1 (may grow; do not fake)  

---

## Sample Testnet transactions

All hashes are real. Do not invent hashes.  
Format: `https://testnet.cspr.live/transaction/<hash>`

1. **Install ProofOfOrigin** — `c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10`  
2. **Register** `MINA-VALEDOURO-LOTE-001` — `23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede`  
3. **Tampered → Invalid** — `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`  
   https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd  
4. **Register** `MINA-VALEDOURO-LOTE-002` — `bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101`  
5. **Agent-driven Valid** — `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4`  
6. **Earlier Valid lote-001** — `8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f`  
7. **x402 real CSPR (2.5 CSPR)** — `settlementKind=casper_deploy`  
   - Local/dev: `a30d83c78c269caf922d020a96d2ffd8e3eb4654d3c53e8faf3059ea80101f02`  
   - Prod 2026-07-15: https://testnet.cspr.live/transaction/27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c  
   - Prod 2026-07-19: https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6  
   - Prod 2026-07-19b: https://testnet.cspr.live/transaction/fd23cf3f76d212094da74f3d1f7ad54bad2b07265643a1434857a925dc4b23e1  
   - Prod 2026-07-21: https://testnet.cspr.live/transaction/b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106  
   - **Latest canonical:** https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a  
     Hash: `25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a`  

Path: `POST /api/x402/settle/:assetId` or CLI `--mode casper` — **not** UI `/simulate`, **not** marketplace mock button.

---

## Dual x402 honesty (Casper + CSPR.cloud)

- UI simulate = **mock** (`synthetic_receipt`). HTTP 402 seam is real.  
- Real native CSPR = `facilitatorMode=casper` + keys → `casper_deploy`.  
- Optional WCSPR = `facilitatorMode=cspr_cloud` → official facilitator `https://x402-facilitator.cspr.cloud` + EIP-712 (`POST /api/x402/cloud/settle`).  
- Docs: https://docs.cspr.cloud/x402-facilitator-api/reference · https://github.com/make-software/casper-x402 · trade: https://testnet.cspr.trade  
- Evidence fields: `honesty`, `lastCasperSettle`, `x402Mode`, `sealedMarketRail`, `accessRights`, `trustStack`, `dualKey`, `originAutonomy`.

---

## Trust boundaries

- Deterministic seal decides Valid or Invalid.  
- LLM/orchestrator chooses action only: pay, skip, escalate — **cannot overwrite** the seal.  
- Judge UI / rail Run = mock facilitator → no value moved.  
- Real testnet CSPR only via production settle.  
- Multi-party roles: field sealer → chain attester → paying agent → human escalation (`trustStack`).  
- Public demo assets, operators, locations, payments, and collateral values are **fictional** unless labeled as Casper Testnet evidence.  
- Invalid is **intentional permanent proof**, not a failed UX.

---

## Differentiation — why we pioneer this job

Most finalists improve how agents pay, publish feeds, underwrite invoices, monitor collateral, or rate agents.

**Lastre answers an earlier question:** was the physical origin verified **before** token, payment, or finance?

- **Oracles (e.g. Claros):** densify feeds / paid reads → Lastre is the **origin gate before** mint/pay  
- **Invoice / ag finance (Faktura, AgriTrust):** unlock capital → Lastre is **proof before finance**  
- **Continuous collateral (Wardens):** post-token audits → Lastre is dual-key origin + **permanent Invalid** (different layer)  
- **Carbon MRV (CanopyMRV):** issue/freeze after MRV hash → Lastre dual-key origin + Valid-only MintGate **before** credit/finance  
- **Agent pay rails:** micropayments → agents may pay for **provenance**, not instead of proof  
- **Policy / leash / spend guards:** wallet caps → Lastre constrains **origin content**, not only spend  

**Sealed Market Rail** is the demo surface of that thesis: mint + demo collateral only after Valid origin seal on Casper.

**Vs finance (one line):** Before invoices or tokens finance origin, the seal decides Valid/Invalid.  
**Vs Wardens (one line):** We decide origin truth with dual-key on-chain Valid/Invalid; continuous monitoring is after tokenization.  
**Vs CanopyMRV (one line):** They freeze/issue after MRV hash; we dual-key seal origin with permanent Invalid before mint/credit.

Proof before token. Seal decides. LLM only acts. Invalid is permanent on-chain proof.

---

## Why this matters for Casper + agentic RWA

Casper is becoming a settlement and agent-pay surface (native CSPR, x402, CSPR.cloud WCSPR).  

If agents can pay and mint without origin truth, the chain becomes a **fast laundering rail for unverified claims**.

Lastre makes Casper the place where hard RWAs get **origin-gated** before they become agent-tradable objects:

- on-chain Valid / Invalid  
- dual-key accountability  
- agent pay for provenance  
- mint and demo finance gated by Valid  

That is the pioneer wedge of this BUIDL.

---

## Tier 0 dual-key + carbon + MintGate evidence

Dual-key run (both keys write on-chain):

- Field sealer: `account-hash-4c8631b8d684faba4f3087c6be0fed6c506a9669bb378e6ee5fff7977b7d1657`  
- Chain attester: `account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2`  
- Sealer identity: https://testnet.cspr.live/transaction/e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e  
- Rule: **Two keys, one seal rule**

Carbon domain (live sample):

- Asset: `CARBON-VCS-AMAZONIA-2024-001`  
- Seal: `2e9feed35f5d887adf94819553cce0b559df2efab8c3a3dfd83c585f813a1d57`  
- Valid attest: https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e  

Composition anchor:

- https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a  

MintGate live:

- Status: **PASS**  
- Package: `hash-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1`  
- mint_lot: `6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349`  

Trust network: `GET /api/evidence` → `trustNetwork` / `trustStack` / `sealedMarketRail`.

---

## Architecture (one screen)

```
Field capture → deterministic seal → dual-key attest on Casper
                                      ├─ Valid  → MintGate open → (demo) mint + collateral rail
                                      └─ Invalid → permanent on-chain proof → mint/finance closed
Agent path: quote (HTTP 402) → pay/skip/escalate for provenance only
UI path: mock settle · API path: real testnet CSPR (casper) or WCSPR (cspr_cloud)
```

---

## After-buildathon plan

**Full doc (repo):** https://github.com/FelixRodrigues007/lastre/blob/main/docs/POST_BUILDATHON_ROADMAP.md  

**Today:** Casper **Testnet** only. No mainnet money in the demo.  
**Thesis:** origin proof **before** token/finance — dual-key seal; Invalid is permanent proof. (Not “proof of concept.”)

Once Final Round closes, execute the gated post-hack plan:

1. **Production completion** — freeze demo vs prod, ops smoke, sealer runbook.  
2. **Operator feasibility** — real lots (industrial corridors; e.g. copper-class capacity inquiries), pilot only if docs are real.  
3. **Load / capacity (testnet first)** — institutional RWA **asset-flow class** design (multi-billion USD corridor scale as design target, not live volume claim).  
4. **Multi-site RWA + precision field geolocation** — chain-of-custody from field → seal → Casper → gate.  
5. **Phased mainnet readiness** — only when keys, facilitator, monitoring, runbook, and legal gates are green. First mainnet = minimal PoO/evidence path, not finance theater.  
6. Partner agents that **must** query Lastre before mint / finance / collateral.  
7. Public site & community — **never** fake TVL, yield, ranking, or investment claims.

**One-liner:** Live on Casper Testnet today. Mainnet when facilitator ops + keys + monitoring are production-safe.

---

## Final smoke

```bash
bash scripts/final-smoke.sh
# or
bash scripts/jury-smoke.sh
```

1. https://youtu.be/fUItKuiG4l8  
2. https://app.lastre.io/marketplace?rail=1  
3. https://app-api.lastre.io/api/evidence → settle starts with `25088a6a`  
4. https://lastre.io/#sealed-rail  
5. https://github.com/FelixRodrigues007/lastre/community  

---

## Demo guardrail

**DEMONSTRATION ONLY.** Simulated assets. No investment offered. No yield, return, ownership sale, or financial promise.

**Sealed Market Rail** shows origin-gated mint + demo collateral after Valid.  
UI path = mock pay. Real value movement only via production settle APIs on **Casper testnet**.

---

**Lastre — pioneer origin trust for hard RWAs on Casper.**  
Proof before token. Proof before finance. Seal decides.
