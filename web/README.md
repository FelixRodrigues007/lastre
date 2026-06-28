# Lastre Web Experience

Static demo assets served by `agent/gateway`, plus the Vite + React public
frontend intended for `https://lastre.io`.

This directory is also the Vite + React landing page that Laurinha deploys to
Vercel. It consumes the Render-hosted gateway through `VITE_GATEWAY_URL`.

Laura-facing frontend handoff:

- [`docs/README.md`](../docs/README.md)
- [`docs/LAURA_FRONTEND_SYSTEM_DESIGN.md`](../docs/LAURA_FRONTEND_SYSTEM_DESIGN.md)
- [`docs/LAURA_DESIGN_SUPER_PROMPT.md`](../docs/LAURA_DESIGN_SUPER_PROMPT.md)
- [`docs/FRONTEND_ROUTES.md`](../docs/FRONTEND_ROUTES.md)
- [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md)

Pages:

- `/demo` — live provenance demo shell.
- `/marketplace` — catalog showcase with live verdict badges.
- `/proof` — browser shell for proof counters and recent events.
- `/map` — fictional geolocation map with MapLibre GL, deck.gl custody arcs,
  and verdict-color polling through the gateway.
- `/spot-fraud` — Spot-the-Fraud game: two seals for one fictional lot (one
  genuine, one tampered), scored by the real sealer. The seal decides the verdict.

All data is fictional and every screen must show:

> DEMONSTRATION — simulated assets, no investment offered

The public action is always **Verify provenance**. The experience must avoid
financial-offer language.

## Vercel

The root `vercel.json` supports builds from the repository root. If configuring
the Vercel dashboard manually, `web/` may also be used as the root directory.

```bash
cd web
npm install
npm run build
vercel link --project lastre
printf '%s\n' 'https://lastro.onrender.com' | vercel env add VITE_GATEWAY_URL production
printf '%s\n' 'https://lastro.onrender.com' | vercel env add VITE_GATEWAY_URL preview
printf '%s\n' 'https://lastre.io' | vercel env add VITE_PUBLIC_SITE_URL production
vercel --prod
```

Render should allow the public domain:

```text
ALLOWED_ORIGINS=https://lastre.io,https://www.lastre.io,https://*.vercel.app,http://localhost:5173,http://localhost:3000
```

If `api.lastre.io` is later mapped to Render, update `VITE_GATEWAY_URL` to
`https://api.lastre.io`.
