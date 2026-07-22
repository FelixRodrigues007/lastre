# Lastre — BUIDL Page Paste Pack

Date: 2026-07-21 (Final Round — finance/Wardens counters + settle samples)

Use this as the single copy-paste source for the DoraHacks/BUIDL page. It is
operational evidence for judges, not marketing copy.

## Dora short description (Edit BUIDL — paste this)

```
Lastre is the origin trust layer for hard RWAs on Casper.

Proof before token — and proof before finance. A deterministic seal decides Valid or Invalid (Invalid is permanent on-chain proof). Separation of duties: field sealer ≠ chain attester. Mint access requires Valid origin (MintGate). Agents may pay via x402 to read provenance; the LLM only chooses pay / skip / escalate — the seal decides truth.

Not an oracle marketplace. Not invoice underwriting. Not continuous collateral monitoring. Those layers come after origin is proven.

Demo: https://app.lastre.io/marketplace
Evidence: https://app-api.lastre.io/api/evidence
Health: https://app-api.lastre.io/api/health
Real testnet settle (2.5 CSPR, latest): https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a
(Also: https://testnet.cspr.live/transaction/b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106)
Honesty: UI simulate = mock receipt; production API can settle real testnet CSPR.
Roadmap: Casper Testnet live today. Mainnet when facilitator ops + keys + monitoring are production-safe — no mainnet money in demo.
```

## One-line thesis

Other agents execute. Lastre lets them verify the source first — proof before token (and before finance).

## Live links

| Surface | URL |
| --- | --- |
| Landing | https://lastre.io |
| App | https://app.lastre.io |
| Judge demo | https://app.lastre.io/marketplace |
| Agents integration | https://app.lastre.io/agents |
| API health | https://app-api.lastre.io/api/health |
| Mint summary | https://app-api.lastre.io/api/mint/summary |
| Evidence pack (trust stack + live RPC) | https://app-api.lastre.io/api/evidence |
| Agent CLI (mock pay) | `node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay` |
| Agent CLI (real CSPR) | `node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay --mode casper` (API must be casper-mode; see docs/X402_CASPER_REAL.md) |
| GitHub repo | https://github.com/FelixRodrigues007/lastre |
| GitHub community profile | https://github.com/FelixRodrigues007/lastre/community |
| Demo video | https://youtu.be/UzhKMsKA6QE |
| Step-by-step judge playbook | https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md |

## How to test in 90 seconds (demo day)

1. Open https://app.lastre.io/marketplace → **Run Demo** (Valid carbon, seal match).
2. Open Invalid sample tx: https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd (permanent rejection proof).
3. Open https://app-api.lastre.io/api/evidence → `dualKey` / `trustStack` (sealer ≠ attester).
4. Point to real settle: https://testnet.cspr.live/transaction/fd23cf3f76d212094da74f3d1f7ad54bad2b07265643a1434857a925dc4b23e1
5. One sentence: *Seal decides Valid/Invalid; MintGate blocks mint without Valid; agent only pay/skip/escalate.*

## How to test in 5 minutes (full)

1. Open https://app.lastre.io/marketplace
2. Click **Run Demo**.
3. Confirm the final payload shows:
   - `Verdict: Valid`
   - `Seal match: true`
   - `Carbon impact score: 92`
   - Casper ProofOfOrigin evidence link
   - `MintGate: demo event`
4. Click **View in MyAssets** and confirm the fictional carbon asset appears with proof details.
5. Open https://app.lastre.io/agents and inspect the quote → `X-PAYMENT` → proof payload flow.
6. Open https://app-api.lastre.io/api/evidence — confirm `trustStack` (4 roles) and `onChain.rpcEvidence` with live-RPC checks when the public node responds.
7. For the Invalid path: open the tampered transaction below **and** marketplace lot `MINA-VALEDOURO-LOTE-001`.

## Casper Testnet evidence

Network: `casper-test`

ProofOfOrigin package hash:

`hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`

Package address:

`package-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`

Package explorer:

https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561

Deployer public key:

`01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad`

Read-only counters at last verification: `accepted=2`, `rejected=1`. These may grow; do not fake counters.

## Sample Testnet transactions

All sample transactions below are official existing evidence. Do not replace them with invented hashes.

1. Install ProofOfOrigin package

   `c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10`

   Expected: contract package installed.

2. Register reference for `MINA-VALEDOURO-LOTE-001`

   `23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede`

   Expected: reference seal stored.

3. Tampered attest for `MINA-VALEDOURO-LOTE-001` → Invalid

   `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`

   Expected: Invalid recorded on-chain as permanent rejection proof.

4. Register reference for `MINA-VALEDOURO-LOTE-002`

   `bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101`

   Expected: reference seal stored.

5. Agent-driven attest for `MINA-VALEDOURO-LOTE-002` → Valid

   `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4`

   Expected: Valid recorded on-chain.

6. Earlier genuine attest for `MINA-VALEDOURO-LOTE-001` → Valid

   `8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f`

   Expected: Valid recorded on-chain.

7. **x402 real CSPR payment** (CasperFacilitator → native transfer, 2.5 CSPR)

   Local proof (dev API):  
   `a30d83c78c269caf922d020a96d2ffd8e3eb4654d3c53e8faf3059ea80101f02`

   **Production** (`app-api.lastre.io`, 2026-07-15):  
   `27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c`

   **Production** (`app-api.lastre.io`, 2026-07-19):  
   `4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6`  
   Explorer: https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6

   **Production** (post-deploy, 2026-07-19 later — `paymentExplorerUrl` fix live):  
   `fd23cf3f76d212094da74f3d1f7ad54bad2b07265643a1434857a925dc4b23e1`  
   Explorer: https://testnet.cspr.live/transaction/fd23cf3f76d212094da74f3d1f7ad54bad2b07265643a1434857a925dc4b23e1

   **Production** (2026-07-21 density pass):  
   `b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106`  
   Explorer: https://testnet.cspr.live/transaction/b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106

   **Production** (2026-07-22 priority-close densify):  
   `25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a`  
   Explorer: https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a

   Expected: `settlementKind=casper_deploy`, `facilitatorMode=casper`, paid provenance for `CARBON-VCS-AMAZONIA-2024-001` (Valid + sealMatch).  
   Path: `POST /api/x402/settle/:assetId` or `lastre prove … --pay --mode casper` (not UI `/simulate`).  
   **Honesty:** **native CSPR transfer** via `casper-client` (server-as-payer demo). MAKE/CSPR.cloud **WCSPR** path is optional next.
Transaction explorer format:

`https://testnet.cspr.live/transaction/<hash>`

## Trust boundaries

- The deterministic SHA-256 seal decides `Valid` or `Invalid`.
- The LLM/orchestrator chooses action only: `pay`, `skip`, or `escalate`.
- The LLM cannot overwrite a seal verdict.
- x402 judge demo / UI simulate uses `MockFacilitator` → `settlementKind: synthetic_receipt` (no CSPR moved). HTTP 402 seam is real.
- Real testnet CSPR is live behind `LASTRE_X402_MODE=casper` + keys (`CasperFacilitator` → `casper_deploy`). Sample payment tx listed above. Runbook: `docs/X402_CASPER_REAL.md`. CLI: `lastre prove <id> --pay --mode casper`.
- Paid responses attach `chainEvidence` / `rpcEvidence`: public Casper Testnet JSON-RPC verification of install + Invalid + Valid sample txs (when the node responds).
- Multi-party protocol roles: field sealer → chain attester → paying agent → human escalation (`GET /api/evidence` → `trustStack`).
- MintGate, collateral, and MyAssets paths are demo/simulated where not full on-chain economics.
- Public assets, operators, locations, payments, and collateral values are fictional unless explicitly labeled as Casper Testnet evidence.
- Invalid verdicts are intentionally written on-chain. A rejection is permanent verifiable proof, not a discarded error.

## Differentiation (Final Round field)

Most finalists improve how agents pay, compose tools, publish market data, underwrite invoices, monitor collateral, or rate agents. Lastre answers a different **upstream** question: was the physical origin of this RWA verified **before** any token, payment, or financing action?

| Rival cluster | Their job | Lastre |
| --- | --- | --- |
| Oracles (e.g. Claros) | Densify feeds / paid reads | Origin gate before mint/pay |
| Invoice / ag finance (Faktura, AgriTrust, Runway) | Underwrite cash flow / unlock capital | **Proof before finance** — seal Valid/Invalid first |
| Continuous collateral (e.g. Wardens) | Fight stale post-token audits | One-shot dual-key origin + **Invalid is permanent proof** (different layer) |
| Carbon MRV registry (e.g. CanopyMRV) | ISSUE/FREEZE credits after MRV hash | Dual-key origin + permanent Invalid + Valid-only MintGate **before** any credit/finance |
| Agent pay rails (AgentPay*, Pico, AiFinPay) | Safe micropayments | Agents may pay for **provenance**, not instead of proof |
| Policy / leash / shield | Cap spend / block bad calls | Constraints on **content of origin**, not only wallet policy |

**Vs finance (one line):** Before invoices or tokens finance origin, the seal decides Valid/Invalid.  
**Vs Wardens (one line):** We decide origin truth with dual-key on-chain Valid/Invalid; continuous collateral monitoring is a different layer after tokenization.  
**Vs CanopyMRV (one line):** Canopy freezes/issues carbon credits after MRV hash; Lastre dual-key seals mineral+carbon origin with permanent Invalid before mint/credit.

Proof before token. Seal decides. LLM only acts. Invalid is permanent on-chain proof.

## After-buildathon plan

1. Keep Casper Testnet evidence growing and evaluate a mainnet ProofOfOrigin package only when safe.
2. Keep judge UI on mock simulate; expand real CSPR settle ops (Render secrets, dual-key operator docs).
3. Harden the offline field-operator capture kit and deterministic sealer runbook.
4. Add partner-agent integrations that query Lastre provenance before mint, finance, or collateral flows.
5. Maintain the public site, demo video, and community updates without fake TVL, yield, or investment claims.

## Final smoke commands

```bash
bash scripts/final-smoke.sh
```

Manual checks:

1. Open https://lastre.io
2. Open https://app.lastre.io/marketplace and click **Run Demo**.
3. Open https://app.lastre.io/agents
4. Open https://github.com/FelixRodrigues007/lastre/community

## Demo guardrail

DEMONSTRATION ONLY. Simulated assets, no investment offered. No yield, return, ownership sale, or financial promise is made.

## Tier 0 Beat-Claros evidence update (2026-07-15)

Dual-key run (both keys write on-chain):

- Script: `scripts/dual-key-pipeline.sh`
- Output: `output/dual-key-run.json`
- Field sealer account: `account-hash-4c8631b8d684faba4f3087c6be0fed6c506a9669bb378e6ee5fff7977b7d1657`
- Chain attester account: `account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2`
- Sealer identity tx: `e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e`
- Sealer explorer: https://testnet.cspr.live/transaction/e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e
- Rule: `Two keys, one seal rule`

Carbon domain (asset-specific, live):

- Asset: `CARBON-VCS-AMAZONIA-2024-001`
- Seal: `2e9feed35f5d887adf94819553cce0b559df2efab8c3a3dfd83c585f813a1d57`
- Register: `f9fdf121951d95c2d10dff6843ef3b7d6d92e292bef21b73aaf103b822c22c88`
- Attest Valid: `a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e`
- Explorer: https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e

Composition anchor:

- chainRoot: `0c40eb1b4164b95305b0c98908dd6c17ce6bfa37b3900095d87304ea566f8d33`
- anchor tx / deploy hash: `915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a`
- explorer: https://testnet.cspr.live/transaction/915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a
- verification: `casper-client get-deploy` shows `execution_result.error_message: null` and transfer id `17290909242139064466`.

MintGate live:

- Status: **PASS**
- Package: `hash-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1`
- mint_lot (MINA-002 Valid): `6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349`
- Details: `docs/MINTGATE_LIVE.md`.

Trust network (evidence API):

- `GET /api/evidence` → `trustNetwork` (multi-party + mineral/carbon domains + mint gate + composition + x402 pay)
- Honest note: not a Claros-style oracle marketplace; origin trust density with live explorer links.
