# Lastro Console (app/) — Deploy Runbook

The **landing** (`web/`) is live at `lastre.io`. The **console** (`app/`) is a
SEPARATE project and is NOT deployed yet — that is why clicking **App** on the
landing just re-serves the landing page (the `/app` path falls through the SPA
`_redirects` rule to the landing's `index.html`).

The console has two parts:

1. **UI** — Vite + React Router SPA in `app/` → static site (Cloudflare Pages).
2. **API** — Node server in `app/server` exposing `/api/*`. It imports the
   orchestrator/sealer `dist` and shells out to a Casper binary, so it CANNOT run
   on Cloudflare Workers. Host it on Render (Docker), like the gateway.

## Topology

```text
app.lastre.io      -> Cloudflare Pages (console UI, root directory = app)
app-api.lastre.io  -> Render (Node app/server, /api/*)
```

## 1. Console UI on Cloudflare Pages

Create a SECOND Pages project from the same repo:

```text
Production branch:        main
Framework preset:        Vite (or None)
Root directory (advanced): app
Build command:           npm run build
Build output directory:  dist
```

> Root directory = `app` makes Cloudflare install/build inside `app/` (it has its
> own `package.json` + `package-lock.json`), so the output is `dist` (not
> `app/dist`). SPA deep links work via `app/public/_redirects` (already added).

Environment variables (Production + Preview):

```bash
NODE_VERSION=22
VITE_API_BASE_URL=https://app-api.lastre.io
```

Custom domain: add `app.lastre.io` in the Pages project → Custom domains. In DNS:

```text
CNAME  app  <console-project>.pages.dev   Proxied
```

## 2. Console API on Render

The API needs the agent stack built (`make build-sealer build-x402
build-orchestrator build-query-snapshot`) and `app/server` running on Node 22.
Add a Docker service (mirror the root `Dockerfile` pattern used by the gateway),
start command `node app/server/dist/index.js` (or `tsx app/server/index.ts`),
listening on `$PORT`. Map custom domain `app-api.lastre.io`.

The API must allow CORS from the console origin and serve `/api/*`. Without it,
the UI loads but every data call fails.

## 3. Point the landing's "App" link at the console

On the LANDING Pages project (`web/`), set:

```bash
VITE_APP_URL=https://app.lastre.io
```

Then redeploy the landing. `web/src/site-links.ts` reads `VITE_APP_URL` and, when
it is an absolute URL, the nav opens it directly. Without this var it falls back
to `/app` (dev only) — which is exactly the broken behavior on production today.

## 4. Smoke tests

```bash
curl -sS -I https://app.lastre.io            # 200, console index
curl -sS https://app-api.lastre.io/api/health # {"ok":true}
```

## Quick interim option (no API host yet)

If you only need the console UI visible for a demo before standing up the API,
deploy step 1 with `VITE_API_BASE_URL` pointing at any reachable API origin. The
UI will render, but data panels stay empty/error until the API is live.
