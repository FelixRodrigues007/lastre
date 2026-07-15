# Lastre — BUIDL Page Paste Pack

Date: 2026-07-15

Use this as the single copy-paste source for the DoraHacks/BUIDL page. It is
operational evidence for judges, not marketing copy.

## One-line thesis

Other agents execute. Lastre lets them verify the source first — proof before token.

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
| GitHub repo | https://github.com/FelixRodrigues007/lastre |
| GitHub community profile | https://github.com/FelixRodrigues007/lastre/community |
| Demo video | https://youtu.be/UzhKMsKA6QE |
| Step-by-step judge playbook | https://github.com/FelixRodrigues007/lastre/blob/main/JUDGES_PLAYBOOK.md |

## How to test in 5 minutes

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

Transaction explorer format:

`https://testnet.cspr.live/transaction/<hash>`

## Trust boundaries

- The deterministic SHA-256 seal decides `Valid` or `Invalid`.
- The LLM/orchestrator chooses action only: `pay`, `skip`, or `escalate`.
- The LLM cannot overwrite a seal verdict.
- x402 judge demo uses `MockFacilitator` → `settlementKind: synthetic_receipt` (no CSPR moved). HTTP 402 seam is real.
- Paid responses attach `chainEvidence` / `rpcEvidence`: public Casper Testnet JSON-RPC verification of install + Invalid + Valid sample txs (when the node responds). Payment mock ≠ fake chain package.
- Multi-party protocol roles: field sealer → chain attester → paying agent → human escalation (`GET /api/evidence` → `trustStack`).
- MintGate, collateral, and MyAssets paths are demo/simulated where not full on-chain economics.
- Public assets, operators, locations, payments, and collateral values are fictional unless explicitly labeled as Casper Testnet evidence.
- Invalid verdicts are intentionally written on-chain. A rejection is permanent verifiable proof, not a discarded error.

## Differentiation

Most buildathon projects improve how agents pay, compose tools, publish market data, underwrite invoices, or rate agents. Lastre answers a different upstream question: was the physical origin of this RWA verified before any token, payment, or agent action?

- Payment rails monetize calls; Lastre verifies origin before calls matter.
- Market-data oracles publish feeds; Lastre gates asset-origin proof and permanent Invalid evidence.
- Credit desks underwrite cash flow; Lastre is pre-token provenance evidence.
- Agent reputation systems judge agents; Lastre judges the seal of the asset.

Proof before token. Seal decides. LLM only acts. Invalid is permanent on-chain proof.

## After-buildathon plan

1. Keep Casper Testnet evidence growing and evaluate a mainnet ProofOfOrigin package only when safe.
2. Align a real Casper x402 facilitator path behind a feature flag while keeping the current judge demo stable.
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
