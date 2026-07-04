# Lastre Judge One-Pager

Date: 2026-07-04

## One-line thesis

**Lastre is the provenance layer autonomous agents query before acting: proof before token, proof before agent action.**

## What judges should look for

1. **Physical/carbon proof before tokenization**
   - Fictional source record is sealed with deterministic SHA-256.
   - The agent can choose an action (`pay`, `skip`, `escalate`), but the seal decides the verdict (`Valid` / `Invalid`).
   - Valid proof gates the MintGate demo claim.

2. **x402 provenance provider**
   - External agents request `/api/x402/provenance/:assetId` and receive HTTP 402 payment requirements.
   - After `X-PAYMENT`, the agent receives a machine-readable proof payload.
   - The demo includes `simulate` for judge flow, using mock settlement with a real x402-shaped seam.

3. **Casper evidence, clearly labeled**
   - ProofOfOrigin testnet package is linked in the app.
   - `/api/mint/summary` returns simulated MintGate events plus real/fallback ProofOfOrigin counters.
   - The UI labels hybrid data clearly: testnet proof evidence vs demo-only mint/collateral actions.

## Demo URLs

- Landing: `https://lastre.io`
- Console: `https://app.lastre.io`
- API health: `https://app-api.lastre.io/api/health`
- Agents page: `https://app.lastre.io/agents`
- 90-second script: [`docs/DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)

## Recommended 90-second path

1. Open `https://app.lastre.io/marketplace`.
2. Click **Run Demo**.
3. Leave the x402 modal open and point to:
   - `verdict: Valid`
   - `sealMatch: true`
   - `carbonImpactScore: 92`
   - Casper links / simulated MintGate note
4. Click **View in MyAssets**.
5. Show the claimed carbon asset, provenance score, seal, collateral panel.
6. Click **Lock as Collateral**, then **Release Collateral**.
7. Open `/agents` and show the integration snippet.

## Why Lastre is different

| Project archetype | What it does well | Why Lastre matters |
| --- | --- | --- |
| Agent Casper-style executor | Autonomous execution and x402 loops | Needs trusted provenance before acting on RWA/carbon records. |
| Helios-style swarm | Multi-agent coordination | Needs a shared proof payload every agent can trust. |
| GhostShift-style automation | Agent handoffs and workflow automation | Needs a trust checkpoint before a workflow treats an asset as usable. |
| ProofPay-style escrow | Milestone and payment logic | Lastre starts earlier: source proof before escrow/token/market actions. |

## Guardrails

- DEMO ONLY.
- Fictional data.
- Simulated collateral values.
- Mock x402 settlement seam.
- No investment, yield, ROI, or real ownership-sale claims.
