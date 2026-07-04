# TODO Handoff — Demo Killer / Agentic Provenance Layer

Date: 2026-07-03
Current base: `main` after Laura UX pass (`e4b4d7d`).

## Guardrails

- DEMONSTRATION ONLY. All assets, collateral, claims, and payments are fictional/simulated unless explicitly labeled as Casper testnet evidence.
- No investment, yield, ROI, real ownership-sale, or financial advice language.
- Core thesis: Proof before token.
- Agent/LLM decides only action (`pay`, `skip`, `escalate`); deterministic SHA-256 seal decides verdict (`Valid`/`Invalid`).

## Delivered in this pass

- Added `app/src/lib/fullDemo.ts` with canonical demo asset/state helpers.
- Added `app/src/components/demo/FullDemoModal.tsx`.
- Added `app/test/fullDemo.test.ts` covering canonical asset id, demo URLs, and state validation.
- Integrated a judge-ready `Run Full End-to-End Demo` banner into the new Marketplace UX.
- The demo flow runs inside the new Laura Marketplace shell:
  1. Focuses the fictional carbon proof (`CARBON-VCS-AMAZONIA-2024-001`).
  2. Ensures agent processing has a `Valid` proof.
  3. Simulates x402 paid provenance query.
  4. Attempts MintGate demo claim.
  5. Leaves the x402 payload modal visible with verdict, seal match, carbon score, and Casper links.
- Added compact `x402 provider` card with copyable external-agent snippet.
- Added MintGate summary cards (`Total minted`, `LotMinted events`).
- Fixed server `LotListItem` type to include `referenceArtifact`, matching runtime output and frontend type.

## Verification evidence

- `cd app && npm run build && npm run lint` — passes. Build emits an existing CSS minify warning from pre-existing `color-mix(...)` CSS, but exits 0.
- `cd app && npx --no-install tsx --test test/fullDemo.test.ts` — 2/2 passing.
- `cd agent/orchestrator && npm test` — 9/9 passing.
- `cd agent/x402 && npm test` — 5/5 passing (requires unsandboxed local loopback server).
- Local API smoke on `LASTRO_APP_API_PORT=3101`:
  - `/api/lots/CARBON-VCS-AMAZONIA-2024-001` -> `Valid`, minted in seeded demo state.
  - `/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001` -> `ok: true`, `verdict: Valid`, `carbonImpactScore: 92`.
  - `/api/mint/summary` -> returns mint count and latest LotMinted event.

## Deploy checklist

1. Push this commit to `main`.
2. Cloudflare Pages: redeploy `lastre-app` from latest `main`.
3. Render: redeploy `lastre-app-api` from latest `main` because `app/server/runtime.ts` changed and production currently may not expose `/api/mint/summary` until redeployed.
4. Production smoke:
   - `curl -s https://app-api.lastre.io/api/health`
   - `curl -s https://app-api.lastre.io/api/mint/summary`
   - Open `https://app.lastre.io/marketplace`, hard refresh, click `Run Demo`.

## Next backlog

- Etapa 2: richer MyAssets locked-position UX.
- Etapa 3: merge simulated mint summary with real Casper contract reads if feasible.
- Etapa 4: dedicated `/agents` route and “Why Lastre wins” narrative.

## 2026-07-04 follow-up

Implemented next backlog slice on `feat/my-assets-agents-polish`:

- Richer My Assets collateral loop:
  - top summary `claimed • locked`.
  - filters `All / Available / Locked`.
  - collateral status panel with demo CSPR value, verdict, seal, carbon/mineral details.
  - Lock and Release actions with API + local demo fallback.
- Mint summary is more explicit about hybrid reality:
  - simulated mints and LotMinted events.
  - live/fallback ProofOfOrigin accepted/rejected counts.
  - note that query_snapshot currently reads ProofOfOrigin, not MintGate.
- Added `/agents` route:
  - x402 quote -> X-PAYMENT -> proof code example.
  - payload fields agents should inspect.
  - Why Lastre wins comparison.
- Added `docs/DEMO_SCRIPT.md` with 90-second judge script.

Additional verification to run before final deploy:

```bash
cd app && npm run build && npm run lint
cd app && npx --no-install tsx --test test/fullDemo.test.ts test/myAssets.test.ts
cd agent/orchestrator && npm test
cd agent/x402 && npm test
```
