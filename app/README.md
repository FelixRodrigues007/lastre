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

The Marketplace includes a **Global Mundi Map** tab. When `VITE_MAPTILER_KEY` is set, it lazy-loads **MapLibre GL JS** and renders MapTiler vector tiles. Without a key, or if the third-party map cannot load, it uses the zero-token SVG fallback for demo reliability. For production map tiles, use:

```text
VITE_MAPTILER_KEY=<MapTiler Cloud key>
```

Recommended stack: **MapLibre GL JS** for the open-source renderer and
**MapTiler Cloud** for vector tiles/styles/geocoding. The map uses the MapTiler
`streets-v4` style endpoint so a normal MapTiler API key is enough to activate
the real basemap. Until the key is present, the SVG fallback remains active so
`app.lastre.io` does not depend on a third-party map quota during the buildathon
demo.
