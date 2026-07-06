# Lastre 90-second judge demo script

Date: 2026-07-06
Guardrail: demonstration only. Fictional data. No real asset sale, valuation, yield, or financial advice.

## Goal

Show that Lastre is the provenance layer autonomous agents query before acting:

Capture/proof preset -> agent decision -> x402 paid provenance query -> MintGate demo claim -> My Assets collateral loop.

## Setup before recording

1. Deploy latest `main` to Cloudflare Pages (`lastre-app`).
2. Deploy latest `main` to Render (`lastre-app-api`).
3. Hard refresh `https://app.lastre.io/marketplace`.
4. Warm the API once: `https://app-api.lastre.io/api/health`.
5. Optional smoke before opening the demo:

```bash
curl -s https://app-api.lastre.io/api/mint/summary
```

Expected summary shape after one x402 simulate/read in the same runtime:

```json
{
  "source": "hybrid-demo",
  "paidX402Queries": 1,
  "onChain": {
    "proofOfOriginAccepted": 2,
    "proofOfOriginRejected": 1,
    "mintGateAvailable": false
  }
}
```

Note: `paidX402Queries` starts at `0` after a fresh Render runtime and increments when the demo or simulate endpoint performs an x402 read.

## 90-second spoken script

### 0:00-0:15 — Open Marketplace

Open `https://app.lastre.io/marketplace`.

Say:

> Lastre is proof before token. It proves a physical or carbon record before an autonomous agent or token flow acts on it.

Point to:

- `ProofOfOrigin` source: `Live testnet` or `Fallback snapshot`.
- `Accepted` and `Rejected` counters.
- `MintGate: Demo simulated`.
- `x402 paid queries`.

### 0:15-0:45 — Run full demo

Click **Run Demo** and keep the modal visible.

Say:

> This single button runs the judge flow: a fictional VCS carbon proof, an agent decision, an x402 paid proof query, and a MintGate demo event. Notice the loading states: quote, mock payment, provenance read, then MintGate demo event.

Point at the modal status messages:

- `Requesting x402 quote...`
- `Mock payment submitted (facilitator: mock)...`
- `Reading provenance payload from Lastre...`
- `MintGate demo event emitted...`

### 0:45-1:05 — Explain the x402 payload

Say:

> This is what an Agent Casper-style executor would see before taking a downstream action. The agent does not need to trust a marketplace card. It pays for a machine-readable proof.

Point at:

- `Verdict: Valid`
- `Seal match: true`
- `Carbon impact score: 92`
- `x402 query #N`
- `Casper ProofOfOrigin evidence`
- `MintGate: demo event`
- `View attestation on cspr.live`

### 1:05-1:25 — My Assets / collateral UX

Click **View in MyAssets** from the finished demo modal.
Select the carbon asset.

Say:

> This closes the product loop. The symbolic asset appears in My Assets with proof details and demo collateral UX. Collateral values are simulated and the screen says so.

Show:

- `X claimed • Y locked`
- Provenance score
- Verdict
- Seal
- Collateral status
- **Lock as Collateral** and **Release Collateral**

### 1:25-1:30 — Agents page close

Open `https://app.lastre.io/agents`.

Say:

> Other agents execute. Lastre lets them verify the source before they move. The Agents page shows the exact quote, X-PAYMENT, proof payload flow builders can integrate.

## Production smoke commands

```bash
curl -s https://app-api.lastre.io/api/health
curl -s https://app-api.lastre.io/api/mint/summary
curl -s -X POST https://app-api.lastre.io/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001 \
  -H "Content-Type: application/json" \
  -d '{"from":"agent-casper-demo"}'
```

Expected x402 result after the API has seeded/processed demo state:

- `ok: true`
- `provenance.verdict: Valid`
- `provenance.sealMatch: true`
- `provenance.carbonDetails.carbonImpactScore: 92`
- `totalPaidQueries` increments in the same runtime

If the API runtime is cold, click **Run Demo** once in the UI; it seeds the demo and opens the x402 payload for judges.
