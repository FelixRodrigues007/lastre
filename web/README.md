# Lastro Web Experience

Static demo assets served by `agent/gateway`.

This directory is also the Vite + React landing page that Laurinha deploys to
Vercel. It consumes the Render-hosted gateway through `VITE_GATEWAY_URL`.

Laura-facing frontend handoff:

- [`docs/LAURA_FRONTEND_SYSTEM_DESIGN.md`](../docs/LAURA_FRONTEND_SYSTEM_DESIGN.md)

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

Use `web/` as the Vercel root directory.

```bash
cd web
npm install
npm run build
vercel link --project lastro-landing
printf '%s\n' 'https://lastro.onrender.com' | vercel env add VITE_GATEWAY_URL production
printf '%s\n' 'https://lastro.onrender.com' | vercel env add VITE_GATEWAY_URL preview
vercel --prod
```

After Render creates the real gateway URL, update `VITE_GATEWAY_URL` in Vercel
and set Render `ALLOWED_ORIGINS` to the Vercel domain plus localhost origins for
development.
