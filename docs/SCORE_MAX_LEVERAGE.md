# Score-max leverage (2026-07-15)

Goal: raise competitive scorecard dimensions **without diluting** “proof before token” originality.

## What shipped on branch `final/score-max-leverage`

| Gap | Before | Lever | After (expected) |
|---|---|---|---|
| x402 economic realness | 3 | Mock payment **honest** + `settlementKind` + **live-RPC chainEvidence** on paid path | **4–4.5** |
| Casper on-chain | 4.5 | Public `info_get_transaction` verifies install/Invalid/Valid without local binary | **5** when RPC up |
| Multi-party | 2 | Explicit 4-role trust stack (sealer / chain / agent / human) | **4** |
| Agentic integration | 4.5 | Agents page: snippet + Invalid links + stack position + `/api/evidence` | **5** |
| Demo / docs / honesty | 5 | Already strong; BUIDL pack updated | **5** |
| Originality | 4.5 | **Unchanged thesis** | **4.5–5** (relative) |

## New surfaces for judges

| Surface | URL / path |
|---|---|
| Evidence pack | `GET /api/evidence` |
| Mint summary | includes `trustStack` + `onChain.rpcEvidence` |
| x402 simulate/paid | returns `settlementKind`, `chainEvidence`, `honestNote` |
| Agents UI | Valid demo + Invalid sample + stack position |

## Honesty rules (do not break)

1. Never claim mock x402 moved real CSPR.
2. Never invent Casper transaction hashes.
3. `live-rpc` means public node verified **documented** txs — counters may still come from deploy snapshot.
4. Originality = seal decides; do not add LLM on verdict.

## Deploy note

Production `app-api.lastre.io` only exposes `/api/evidence` after this branch is merged and Render redeploys.
