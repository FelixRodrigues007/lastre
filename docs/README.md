# Lastre Documentation Hub

Lastre is the public product name for this repository's proof-of-provenance stack.
Some technical paths still use the legacy `lastro` prefix (`contracts/lastro_origin`,
`@lastro/*`, `--lastro-*` CSS variables) to avoid breaking deployed contracts,
package imports, and Render/Vercel builds. Treat **Lastre** as the external brand
and **lastro** as a legacy internal namespace until the migration plan is executed.

> Public domain: `https://lastre.io`

## Start here

| Audience | Read first | Then read |
|---|---|---|
| Laura / frontend design | [`LAURA_PLATFORM_ARCHITECTURE_SUPER_FILE.md`](LAURA_PLATFORM_ARCHITECTURE_SUPER_FILE.md) | [`LAURA_DESIGN_SUPER_PROMPT.md`](LAURA_DESIGN_SUPER_PROMPT.md), [`LAURA_FRONTEND_SYSTEM_DESIGN.md`](LAURA_FRONTEND_SYSTEM_DESIGN.md), [`FRONTEND_ROUTES.md`](FRONTEND_ROUTES.md) |
| Frontend engineer | [`FRONTEND_ROUTES.md`](FRONTEND_ROUTES.md) | [`API_CONTRACT.md`](API_CONTRACT.md), [`QUALITY_CHECKLIST.md`](QUALITY_CHECKLIST.md) |
| Backend/deploy operator | [`DEPLOYMENT_RUNBOOK.md`](DEPLOYMENT_RUNBOOK.md) | [`API_CONTRACT.md`](API_CONTRACT.md), [`ARCHITECTURE_FLOWCHARTS.md`](ARCHITECTURE_FLOWCHARTS.md) |
| Product/storytelling | [`LASTRE_BRAND_AND_DOMAIN.md`](LASTRE_BRAND_AND_DOMAIN.md) | [`ROADMAP.md`](ROADMAP.md), [`ARCHITECTURE_FLOWCHARTS.md`](ARCHITECTURE_FLOWCHARTS.md) |
| Reviewer/judge | [`../JUDGES_PLAYBOOK.md`](../JUDGES_PLAYBOOK.md) | [`JUDGE_ONE_PAGER.md`](JUDGE_ONE_PAGER.md), [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md), root [`README.md`](../README.md) |

## Canonical facts

- **Product name:** Lastre.
- **Domain:** `lastre.io`.
- **Public landing today:** `https://lastre.io` on Cloudflare Pages (`web/`).
- **Console app today:** `https://app.lastre.io` on Cloudflare Pages (`app/`).
- **Console API today:** `https://app-api.lastre.io` on Render Docker (`Dockerfile.app-api`).
- **Legacy/public gateway:** `https://lastro.onrender.com` may still be used by older landing/live-proof docs.
- **Frontend host:** Cloudflare Pages.
- **Backend host:** Render Docker service.
- **Chain:** Casper Testnet (`casper-test`).
- **Contract package hash:** `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`.
- **Public data:** fictional demo assets only.

## Non-negotiable guardrails

Every public screen must show:

```text
DEMONSTRATION — simulated assets, no investment offered
```

Lastre must never present itself as an investment, yield, return, sale, price,
ownership, or transferable-token product. The deterministic SHA-256 seal decides
`Valid` / `Invalid`; the UI and any LLM/agent only choose presentation or action.

## Documentation map

- [`LAURA_PLATFORM_ARCHITECTURE_SUPER_FILE.md`](LAURA_PLATFORM_ARCHITECTURE_SUPER_FILE.md) — current all-in-one platform architecture, product explanation, deployment topology, UX guardrails, route/API map, and Laura handoff.
- [`LASTRE_BRAND_AND_DOMAIN.md`](LASTRE_BRAND_AND_DOMAIN.md) — rebrand, domain,
  DNS, naming, and migration rules.
- [`FRONTEND_ROUTES.md`](FRONTEND_ROUTES.md) — complete route map and page-level
  data dependencies.
- [`API_CONTRACT.md`](API_CONTRACT.md) — Render gateway contract for Vercel.
- [`ARCHITECTURE_FLOWCHARTS.md`](ARCHITECTURE_FLOWCHARTS.md) — Mermaid diagrams
  for protocol, frontend, fraud game, deployment, and trust boundaries.
- [`ROADMAP.md`](ROADMAP.md) — phased roadmap and definition of done.
- [`OPERATING_WHEELS.md`](OPERATING_WHEELS.md) — product, proof, design, trust-boundary, and deployment flywheels.
- [`DEPLOYMENT_RUNBOOK.md`](DEPLOYMENT_RUNBOOK.md) — Vercel, Render, DNS, CORS,
  smoke tests, and rollback.
- [`../JUDGES_PLAYBOOK.md`](../JUDGES_PLAYBOOK.md) — final-round judge testing
  flow, contract package hash, and sample Testnet transactions.
- [`FINAL_ROUND_CHECKLIST.md`](FINAL_ROUND_CHECKLIST.md) — buildathon
  requirement-to-evidence checklist and BUIDL page copy/paste block.
- [`QUALITY_CHECKLIST.md`](QUALITY_CHECKLIST.md) — launch-grade QA checklist.
- [`LAURA_FRONTEND_SYSTEM_DESIGN.md`](LAURA_FRONTEND_SYSTEM_DESIGN.md) — detailed
  frontend system design handoff.
- [`LAURA_DESIGN_SUPER_PROMPT.md`](LAURA_DESIGN_SUPER_PROMPT.md) — copy/paste
  prompt for Laura to design/build the public experience.
- [`LANDING_PAGE_CREATIVE_SPEC.md`](LANDING_PAGE_CREATIVE_SPEC.md) — polished
  landing-page copy, motion, and section-by-section creative direction.
