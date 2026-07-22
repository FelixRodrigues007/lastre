# Backend — Sealed Market Rail (2026-07-22)

## Thesis

> Proof before token — and proof before finance.

Server now exposes an explicit **Sealed Market Rail** surface so Laura’s UI and
judges can read one state machine: seal → mock query → MintGate → My Assets →
demo collateral.

## Endpoints

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/rail` | Product overview, honesty, endpoint map |
| `GET` | `/api/rail/:assetId` | 5-step status + eligibility |
| `POST` | `/api/rail/run` | Mock x402 simulate + Valid-only mint (`lock` optional) |
| `GET` | `/api/defi/eligibility/:assetId` | Thin eligibility + full rail |
| `POST` | `/api/mint` | Unchanged gate + **code / honesty / rail** |
| `POST` | `/api/defi/lock` | Valid + minted only + **code / honesty / rail** |
| `POST` | `/api/defi/release` | Owner check + rail snapshot |
| `GET` | `/api/evidence` | Adds `sealedMarketRail` + jury rail links |
| `GET` | `/api/health` | Mentions rail routes |

## Honesty freeze

| Surface | Truth |
|---------|--------|
| `POST /api/rail/run` | **Always mock** x402 (no CSPR) |
| `POST /api/x402/simulate` | Mock |
| `POST /api/x402/settle` | Real testnet only if `facilitatorMode=casper` |
| MintGate session events | Demo simulated |
| Collateral locks | Session memory demo |

## Gate codes

`OK` · `UNKNOWN_ASSET` · `UNVERIFIED` · `INVALID_ORIGIN` · `NOT_MINTED` ·
`ALREADY_MINTED` · `ALREADY_LOCKED` · `NOT_LOCKED` · `OWNER_MISMATCH`

## Sample assets

| Role | assetId |
|------|---------|
| Valid demo | `CARBON-VCS-AMAZONIA-2024-001` |
| Invalid block | `MINA-VALEDOURO-LOTE-001-TAMPERED` |

## Files

- `app/server/sealed-rail.ts` — pure evaluator + product metadata
- `app/server/runtime.ts` — status, run, richer mint/lock
- `app/server/index.ts` — HTTP routes
- `app/src/lib/api.ts` — client helpers for Laura
- `app/test/sealedRail.test.ts` — pure + runtime tests

## Smoke

```bash
# local API
npm run dev:api

curl -s http://127.0.0.1:3001/api/rail | jq .
curl -s http://127.0.0.1:3001/api/rail/CARBON-VCS-AMAZONIA-2024-001 | jq '.financeGateOpen,.steps'
curl -s -X POST http://127.0.0.1:3001/api/rail/run \
  -H 'content-type: application/json' \
  -d '{"assetId":"CARBON-VCS-AMAZONIA-2024-001","owner":"judge"}' | jq '.ok,.mockOnly,.rail.progress'
curl -s http://127.0.0.1:3001/api/rail/MINA-VALEDOURO-LOTE-001-TAMPERED | jq '.financeGateOpen,.blockedReason'
curl -s http://127.0.0.1:3001/api/evidence | jq '.sealedMarketRail'
```

## Deploy

Merge → Render API redeploy (clear build cache if evidence fields missing).

```bash
bash scripts/jury-smoke.sh
curl -s https://app-api.lastre.io/api/rail | jq '.product.id'
curl -s https://app-api.lastre.io/api/evidence | jq '.sealedMarketRail.product.id,.thesis'
```
