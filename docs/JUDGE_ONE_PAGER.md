# Lastre Judge One-Pager

Date: 2026-07-06

## One-line thesis

**Other agents execute. Lastre lets them verify the source before they move: proof before token, proof before agent action.**

## Current production state (06/07/2026)

- Cloudflare frontend: OK — `https://app.lastre.io`
- Render API: OK — `https://app-api.lastre.io/api/health`
- x402 simulate + counter: OK — `/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001`
- Agents page: OK — `https://app.lastre.io/agents`
- Demo Killer <90s: OK — `https://app.lastre.io/marketplace` -> **Run Demo**

Expected `/api/mint/summary` shape after one x402 simulate/read in the same runtime:

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

## What judges should look for

1. **Proof before token**
   - Fictional source record is sealed with deterministic SHA-256.
   - The agent can choose an action (`pay`, `skip`, `escalate`), but the seal decides the verdict (`Valid` / `Invalid`).
   - Valid proof gates the MintGate demo claim.

2. **x402 provenance provider**
   - External agents request `/api/x402/provenance/:assetId` and receive HTTP 402 payment requirements.
   - After `X-PAYMENT`, the agent receives a machine-readable proof payload.
   - The judge flow uses `/api/x402/simulate/:assetId` with mock settlement and real x402-shaped seams.

3. **Casper evidence, clearly labeled**
   - ProofOfOrigin package is linked through cspr.live.
   - The app separates ProofOfOrigin evidence from MintGate demo events.
   - The UI says when data is `Live testnet`, `Fallback snapshot`, or `Demo simulated`.

4. **Carbon + mineral provenance scope**
   - The demo highlights carbon credits with tonnes, vintage, methodology, verifier, and carbon impact score.
   - The same proof model supports mineral lots.

5. **Agent economy positioning**
   - Agent Casper-style agents are executors.
   - Helios-style systems coordinate swarms.
   - ProofPay-style flows handle milestones.
   - Lastre is the provenance trust layer they should query first.

## Direct links

- Landing: `https://lastre.io`
- Console: `https://app.lastre.io`
- Marketplace demo: `https://app.lastre.io/marketplace`
- Agents page: `https://app.lastre.io/agents`
- API health: `https://app-api.lastre.io/api/health`
- Mint summary: `https://app-api.lastre.io/api/mint/summary`
- Demo script: [`docs/DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)

## Recommended 90-second path

1. Open `https://app.lastre.io/marketplace`.
2. Click **Run Demo**.
3. Leave the x402 modal open and point to:
   - `Verdict: Valid`
   - `Seal match: true`
   - `Carbon impact score: 92`
   - `x402 query #N`
   - Casper ProofOfOrigin badge and cspr.live buttons
   - `MintGate: demo event`
4. Click **View in MyAssets**.
5. Show the claimed carbon asset, provenance score, seal, collateral panel.
6. Click **Lock as Collateral**, then **Release Collateral**.
7. Open `/agents` and show the integration snippet.

## Final checklist

- [x] Cloudflare frontend: OK
- [x] Render API: OK
- [x] x402 simulate + counter: OK
- [x] `/agents` page: OK
- [x] Demo Killer <90s: OK
- [x] Demo-only labels visible for simulated MintGate/collateral flows

## Guardrails

- DEMO ONLY.
- Fictional data.
- Simulated collateral values.
- Mock x402 settlement seam.
- No investment, yield, ROI, or real ownership-sale claims.
