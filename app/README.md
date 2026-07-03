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

The Marketplace includes a **Global Mundi Map** tab. The renderer is always
**MapLibre GL JS** (open-source, vendor-neutral). The tile provider is pluggable
and resolved in one place — `app/src/lib/mapProvider.ts` — so you can switch
providers **without touching the map component**. Without any key, or if the
third-party map cannot load, it uses the zero-token SVG fallback for demo
reliability.

### Choose a provider (set exactly one token)

Mapbox:

```text
VITE_MAPBOX_TOKEN=<Mapbox public access token, pk.*>
```

MapTiler:

```text
VITE_MAPTILER_KEY=<MapTiler Cloud key>
```

### Optional overrides

```text
# Only needed if BOTH tokens are set; otherwise the present token wins
# (Mapbox is preferred when both exist). Values: mapbox | maptiler
VITE_MAP_PROVIDER=mapbox

# Use a custom style (e.g. a Mapbox Studio style) instead of the provider default
VITE_MAP_STYLE_URL=mapbox://styles/<user>/<style>
```

Defaults: Mapbox uses the `mapbox/streets-v12` style; MapTiler uses the
`streets-v4` style. `VITE_*` variables are inlined at **build time**, so after
adding/changing a token you must **redeploy** (Cloudflare Pages → Retry
deployment) for the new bundle to pick it up. The SVG fallback stays active
until a valid token is present, so `app.lastre.io` never depends on a
third-party map quota during the demo.
