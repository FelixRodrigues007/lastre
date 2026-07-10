# Lastre Final-Round Judge Playbook

Date: 2026-07-10

This is the concise, step-by-step testing guide for Casper Agentic Buildathon
judges. It is intentionally operational, not marketing copy.

> DEMONSTRATION — simulated assets, no investment offered. All public asset,
> operator, location, collateral, and payment data is fictional unless explicitly
> labeled as Casper Testnet evidence.

## 1. Live links

| Surface | URL |
| --- | --- |
| Landing | `https://lastre.io` |
| Console app | `https://app.lastre.io` |
| Marketplace judge flow | `https://app.lastre.io/marketplace` |
| Agents integration page | `https://app.lastre.io/agents` |
| API health | `https://app-api.lastre.io/api/health` |
| Mint / x402 summary | `https://app-api.lastre.io/api/mint/summary` |
| Demo script | [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) |
| Judge one-pager | [`docs/JUDGE_ONE_PAGER.md`](docs/JUDGE_ONE_PAGER.md) |

## 2. Casper Testnet contract

| Field | Value |
| --- | --- |
| Network | `casper-test` |
| ProofOfOrigin package hash | `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561` |
| Package address form | `package-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561` |
| Deployer public key | `01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad` |
| Current read-only counters | `accepted=2`, `rejected=1` |

## 3. Sample Testnet transactions

All transactions below are successful Casper Testnet transactions.

| Purpose | Transaction hash | Expected result |
| --- | --- | --- |
| Install `ProofOfOrigin` | `c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10` | Contract package installed |
| Register reference for `MINA-VALEDOURO-LOTE-001` | `23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede` | Reference seal stored |
| Tampered attest for `MINA-VALEDOURO-LOTE-001` | `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd` | `Invalid` recorded on-chain |
| Register reference for `MINA-VALEDOURO-LOTE-002` | `bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101` | Reference seal stored |
| Agent-driven attest for `MINA-VALEDOURO-LOTE-002` | `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4` | `Valid` recorded on-chain |
| Earlier genuine attest for `MINA-VALEDOURO-LOTE-001` | `8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f` | `Valid` recorded on-chain |

Open any transaction by appending the hash to:

```text
https://testnet.cspr.live/transaction/<transaction-hash>
```

Open the package at:

```text
https://testnet.cspr.live/contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
```

## 4. UI testing flow, no local setup

### Flow A — Marketplace judge demo

1. Open `https://app.lastre.io/marketplace`.
2. Confirm the page shows the demonstration banner and clearly labels:
   - `Live testnet` or `Fallback snapshot` for ProofOfOrigin data;
   - `Demo simulated` for MintGate/collateral-style UX;
   - no investment, yield, ownership sale, or price promise.
3. Click **Run Demo**.
4. In the modal, confirm these statuses appear in sequence:
   - requesting x402 quote;
   - mock payment submitted;
   - reading provenance payload;
   - MintGate demo event emitted.
5. Confirm the final payload shows:
   - `Verdict: Valid`;
   - `Seal match: true`;
   - `Carbon impact score: 92`;
   - `x402 query #N`;
   - Casper ProofOfOrigin evidence link.
6. Click **View in MyAssets**.
7. Confirm the claimed fictional carbon asset appears with:
   - provenance score;
   - verdict;
   - seal;
   - collateral status clearly labeled as demo/simulated.
8. Optionally click **Lock as Collateral** and **Release Collateral**. These are
   demo UX events, not real financial actions.

### Flow B — Agent integration surface

1. Open `https://app.lastre.io/agents`.
2. Confirm the page shows the x402 flow:
   - request quote;
   - submit `X-PAYMENT`;
   - read proof payload.
3. Confirm the page explains that external agents should inspect the seal,
   verdict, and Casper evidence before taking downstream action.

### Flow C — API smoke checks

Run:

```bash
curl -s https://app-api.lastre.io/api/health
curl -s https://app-api.lastre.io/api/mint/summary
curl -s -X POST https://app-api.lastre.io/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001 \
  -H "Content-Type: application/json" \
  -d '{"from":"casper-buildathon-judge"}'
```

Expected:

- health returns an OK response;
- mint summary includes `source`, `paidX402Queries`, and `onChain`;
- x402 simulation returns `ok: true`, `provenance.verdict: Valid`, and
  `provenance.sealMatch: true`.

`paidX402Queries` may be `0` immediately after a cold Render runtime and then
increments after the UI demo or simulate endpoint runs.

## 5. Optional local verification

Prerequisites: Node.js/npm, Rust/rustup, and network access for first-time tool
installation.

```bash
git clone https://github.com/FelixRodrigues007/lastre.git
cd lastre
make setup
make build
make test
make query
```

`make query` is read-only. It queries the deployed Casper Testnet
`ProofOfOrigin` package and does not write transactions.

## 6. Important trust boundaries

- The deterministic SHA-256 seal decides `Valid` or `Invalid`.
- The LLM/orchestrator can choose an operational action such as `pay`, `skip`,
  or `escalate`; it cannot overwrite the seal verdict.
- x402 settlement currently uses a mock facilitator. The API shape and payment
  seam are implemented, but it does not move real CSPR.
- MintGate, collateral, and My Assets flows in the public app are labeled demo
  events.
- Both accepted and rejected attestations are useful evidence. An `Invalid`
  verdict is intentionally written on-chain, not discarded.
