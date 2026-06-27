# Lastre Deployment Runbook

This runbook covers the current production topology:

- Vercel serves the public frontend on `lastre.io`.
- Render serves the gateway API on `https://lastro.onrender.com` today.
- Future gateway custom domain: `https://api.lastre.io`.

## 1. Pre-flight

From repo root:

```bash
git status --short
cd web
npm install
npm run build
```

Expected:

```text
✓ built
```

## 2. Vercel frontend

Environment variables:

```text
VITE_GATEWAY_URL=https://lastro.onrender.com
VITE_PUBLIC_SITE_URL=https://lastre.io
```

The root `vercel.json` allows Vercel to build from the repository root by
running commands inside `web/`:

```json
{
  "installCommand": "cd web && npm install",
  "buildCommand": "cd web && npm run build",
  "outputDirectory": "web/dist"
}
```

### Domain setup

In Vercel project settings:

1. Add `lastre.io`.
2. Add `www.lastre.io` if desired.
3. Set apex as canonical.
4. Ensure Deployment Protection/Vercel Authentication is off for public demo.

## 3. Render gateway

Required public defaults:

```text
PACKAGE_HASH=hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
NODE_ADDRESS=https://node.testnet.casper.network/rpc
CHAIN_NAME=casper-test
LASTRO_QUERY_BIN=/app/bin/query
SANDBOX_ANCHOR_ENABLED=false
ALLOWED_ORIGINS=https://lastre.io,https://www.lastre.io,http://localhost:5173,http://localhost:3000
```

Do not set any secret key in the public gateway unless Felix is running a
controlled SANDBOX anchor demo with a low-balance demo account.

## 4. Smoke tests

Gateway:

```bash
curl -s https://lastro.onrender.com/health
curl -s https://lastro.onrender.com/proof
curl -s https://lastro.onrender.com/verdict/MINA-VALEDOURO-LOTE-001
curl -s https://lastro.onrender.com/verdict/MINA-VALEDOURO-LOTE-002
```

Expected UI states:

```text
MINA-VALEDOURO-LOTE-001 -> Invalid
MINA-VALEDOURO-LOTE-002 -> Valid
accepted >= 2
rejected >= 1
```

CORS check after `lastre.io` is live:

```bash
curl -sI \
  -H "Origin: https://lastre.io" \
  https://lastro.onrender.com/proof
```

Expected header:

```text
access-control-allow-origin: https://lastre.io
```

Frontend:

1. Open `https://lastre.io` in an incognito window.
2. Confirm no Vercel login wall.
3. Confirm the demonstration banner is visible.
4. Open Network, clear filters, disable cache.
5. Click `Refresh live verdicts`.
6. Confirm `/proof`, `/catalog`, and `/verdict/...` return `200`.

## 5. Rollback

Vercel:

1. Open project deployments.
2. Promote the last known-good deployment.
3. Re-run smoke tests.

Render:

1. Open service events.
2. Roll back to the last known-good deploy.
3. Verify `/health`, `/proof`, `/verdict`.

## 6. Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Vercel build cannot find `package.json` | Root directory mismatch | Root `vercel.json` should run `cd web && npm install` |
| Incognito shows Vercel login | Deployment Protection enabled | Disable for public production demo |
| Network shows CORS error | Missing Vercel domain in Render `ALLOWED_ORIGINS` | Add exact origin and redeploy/restart Render |
| UI stays loading | Render cold start or blocked gateway | Click refresh; check `/health` |
| Certificate 404 | Lot has no symbolic credential | Hide credential card; not a failure |
| Anchor disabled | `SANDBOX_ANCHOR_ENABLED=false` | Expected public default |
