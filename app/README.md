# Lastro App

Product console for the Lastro provenance workflow — separate from the marketing landing in `web/`.

See [`docs/APP-UI-ARCHITECTURE.md`](../docs/APP-UI-ARCHITECTURE.md) for the full UI spec.

## Prerequisites

Build the agent stack first (the API imports the orchestrator):

```bash
make build-sealer build-x402 build-orchestrator
```

## Run locally

```bash
cd app
npm install
npm run dev
```

This starts:

- **API** — http://127.0.0.1:3001 (`/api/*`)
- **UI** — http://localhost:5174 (proxies `/api` to the API)

Or from repo root:

```bash
make app-dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | API + Vite dev server |
| `npm run dev:api` | API only |
| `npm run dev:web` | UI only |
| `npm run build` | Typecheck + production UI build |
| `npm run lint` | Typecheck client + server |

## Phase 1 features

- `POST /api/process/batch` — runs the orchestrator demo batch
- `GET /api/audit` — session audit log
- `GET /api/chain/summary` — testnet snapshot + session mock-chain counts
- Process screen with live stepper
- Audit log table + detail views

## Phase 2 features

- `ArtifactPanel` + `ProofRail` on lot detail
- Rich lot list (computed seal, mismatch indicator)
- Escalations queue with highlighted triggering fields
- `GET /api/audit/export` — JSON download from Audit screen
- Settings: theme (dark/light), decider preference, limits display
- `GET/POST /api/settings`

## Global Mundi map

The Marketplace split view lazy-loads **MapLibre GL JS** (MapTiler) or **Mapbox GL JS**
when a map token is set. Provider resolution lives in `app/src/lib/mapConfig.ts`.
Copy `app/.env.example` to `app/.env.local` and add one token:

Mapbox (preferred when both are set):

```text
VITE_MAPBOX_TOKEN=<Mapbox public access token, pk.*>
```

MapTiler:

```text
VITE_MAPTILER_KEY=<MapTiler Cloud API key>
```

Without a key, or if the third-party map cannot load, a zero-token SVG fallback
keeps the demo stable. `VITE_*` variables are inlined at **build time**, so after
adding or changing a token you must **redeploy** for the new bundle to pick it up.

## Hackathon demo surfaces

- `/marketplace` — includes **Run Demo**, x402 provider card, hybrid MintGate summary,
  and Global Mundi map.
- `/my-assets` — rich claimed asset view with provenance score, seal/verdict,
  simulated collateral status, Lock/Release controls, and `All / Available / Locked`
  filters.
- `/agents` — dedicated integration narrative: x402 quote → `X-PAYMENT` → proof
  payload, plus the “Why Lastre wins” comparison.

Demo script: [`docs/DEMO_SCRIPT.md`](../docs/DEMO_SCRIPT.md).
