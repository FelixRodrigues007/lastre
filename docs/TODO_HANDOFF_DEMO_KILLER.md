# TODO Handoff — Demo Killer / Agentic Provenance Layer

Date: 2026-07-03
Scope: remaining hackathon stages after x402 provenance provider, Marketplace UI, Capture autonomous loop, LotMinted events, and carbon Valid fix.

## Guardrails

- DEMONSTRATION ONLY. All assets, collateral, and payments are fictional/simulated unless explicitly marked as testnet evidence.
- No investment, yield, ROI, ownership-sale, or financial advice language.
- Core thesis stays: Proof before token.
- Agent/LLM decides action only (`pay`, `skip`, `escalate`); deterministic SHA-256 seal decides verdict (`Valid`/`Invalid`).

## Already Delivered Before This Handoff

- x402 provenance provider endpoints:
  - `GET /api/x402/provenance/:assetId` returns HTTP 402 quote without payment.
  - `POST /api/x402/simulate/:assetId` runs quote -> mock sign -> settle for UI demo.
- Marketplace cards show `x402 queryable` and can simulate an agent query.
- Marketplace includes a `For Agents` section with API snippet.
- Capture can submit + auto-process and can use Grok/LLM path with deterministic fallback.
- Runtime exposes `/api/mint/summary` with simulated `LotMinted` events.
- Carbon credit validation no longer uses mine perimeter; `CARBON-VCS-AMAZONIA-2024-001` is Valid.

## Etapa 0 — Sync Status

Verification run locally on 2026-07-03:

- `cd app && npm run build && npm run lint` — passing.
- `cd agent/orchestrator && npm test` — 9/9 passing.
- `cd agent/x402 && npm test` — 5/5 passing when run outside sandbox because tests open a local loopback server.
- Helper test for full-demo routing/state: `cd app && npx --no-install tsx --test test/fullDemo.test.ts` — 2/2 passing.

Deploy confirmation still needs production action after this branch is pushed:

- Cloudflare Pages project: `lastre-app` should deploy the latest commit containing the Demo Killer flow.
- Render service: `lastre-app-api` only needs redeploy if backend changes are included; this stage is frontend-heavy and uses existing endpoints.

## Etapa 1 — Demo Killer Delivered in This Branch

Files touched:

- `app/src/lib/fullDemo.ts`
- `app/src/components/demo/FullDemoModal.tsx`
- `app/src/routes/Capture.tsx`
- `app/src/routes/Marketplace.tsx`
- `app/src/routes/marketplace.css`
- `app/test/fullDemo.test.ts`

What changed:

1. Added global `Run Full End-to-End Demo` banner on Marketplace.
2. The demo navigates to `/capture?demo=full`, loads the canonical fictional carbon preset, computes the seal, submits the artifact, runs the LLM agent path with rule fallback, and returns to Marketplace.
3. Marketplace auto-filters to carbon/available, simulates an external agent x402 query, attempts MintGate demo claim, refreshes mint summary, and leaves the x402 payload modal visible for judges.
4. Mint summary is now visible above the grid:
   - Total minted.
   - Latest 3 `LotMinted` events with cspr.live-style links.
5. `For Agents` is more prominent and has a `Copy snippet` button.
6. x402 modal now shows:
   - “External agent paid X CSPR via x402…”
   - seal match, verdict, mint status, carbon impact score.
   - attestation/mint links when available.
   - complete JSON payload with `Copy JSON`.

## Demo Script After Deploy

1. Open `https://app.lastre.io/marketplace` and hard refresh.
2. Click `Run Full End-to-End Demo`.
3. Let it auto-run Capture -> Agent -> Marketplace.
4. Stop on x402 modal and narrate:
   - “An external agent paid via x402 to query Lastre before touching the RWA/carbon record.”
   - “The payload returns Valid, sealMatch, carbonImpactScore, and Casper links.”
   - “Only after proof do we emit the MintGate demo event.”

Expected final visual:

- x402 modal open.
- Carbon impact score visible.
- MintGate demo event note visible if mint succeeded or already existed.
- Latest LotMinted event appears in Marketplace summary after refresh.

## Next Stages

### Etapa 2 — UX Polish & MyAssets Rich

- Upgrade `app/src/routes/MyAssets.tsx` with richer minted/locked cards.
- Add filters: Locked / Available.
- Surface runtime locked positions and release collateral clearly.

### Etapa 3 — Casper Real Leverage

- Extend `app/server/casper-read.ts` and `runtime.ts` to merge simulated mint summary with real contract reads if feasible.
- Clearly label current x402 facilitator as mock settlement with real seam.

### Etapa 4 — Dedicated Agents Experience

- Add `/agents` route with full external-agent example.
- Add “Why Lastre wins” narrative section/page.

### Etapa 5 — Final Polish

- Run complete manual flow 5x.
- Verify x402 quote, replay, bad payment, invalid asset.
- Update app README/DEMO.md.
- Deploy Cloudflare + Render as needed.
