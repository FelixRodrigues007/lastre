# Lastre 90-second judge demo script

Date: 2026-07-04
Guardrail: demonstration only. Fictional data. No real asset sale, valuation, yield, or financial advice.

## Goal

Show that Lastre is the provenance layer autonomous agents query before acting:

Capture/proof preset -> agent decision -> x402 paid provenance query -> MintGate demo claim -> My Assets collateral loop.

## Setup before recording

1. Deploy latest `main` to Cloudflare Pages (`lastre-app`).
2. Deploy latest `main` to Render (`lastre-app-api`).
3. Hard refresh `https://app.lastre.io/marketplace`.
4. If API was asleep, open `https://app-api.lastre.io/api/health` once.

## 90-second flow

### 0:00-0:15 — Open Marketplace

Open `https://app.lastre.io/marketplace`.
Say:

> Lastre is proof before token. It proves a physical or carbon record before an autonomous agent or token flow acts on it.

### 0:15-0:45 — Run full demo

Click **Run Demo**.
Let it complete and keep the x402 modal visible.
Say:

> The demo focuses a fictional VCS carbon record, ensures the agent path has a Valid proof, then simulates an external agent paying via x402 to read the provenance payload.

Point at:

- `verdict: Valid`
- `sealMatch: true`
- `carbonImpactScore`
- Casper links / simulated MintGate note

### 0:45-1:05 — Explain the x402 payload

Say:

> This is what an Agent Casper-style executor would see before taking any downstream action. The agent does not need to trust a marketplace card. It pays for a machine-readable proof.

### 1:05-1:25 — My Assets / DeFi loop

Open **My Assets**.
Select the carbon asset.
Show:

- `X claimed • Y locked`
- Provenance score
- Verdict
- Seal
- Collateral status

Click **Lock as Collateral** if available, then **Release Collateral**.
Say:

> This closes the DeFi demo loop. The asset can only enter collateral UX after a Valid proof. Values are simulated and demo-only.

### 1:25-1:30 — Close

Open `/agents` or mention it.
Say:

> The dedicated Agents page shows how another builder can integrate Lastre: quote, X-PAYMENT, proof payload, then decide.

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
- `provenance.carbonDetails.carbonImpactScore: 92`

If the API runtime is cold, first run Process or click Run Demo in the UI.
