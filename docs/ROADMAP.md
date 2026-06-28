# Lastre Roadmap

This roadmap separates demo-critical work from future protocol/product maturity.
It intentionally avoids investment, yield, sale, ownership, or transferable-token
positioning. Lastre is a provenance trust layer.

## North star

Make provenance verification obvious in under 15 seconds:

1. a fictional physical reading becomes a deterministic SHA-256 seal;
2. a one-field tamper changes the seal;
3. the verdict is written on Casper as `Valid` or `Invalid`;
4. the user can verify the proof without trusting the frontend.

## Phase 0 — Protocol live and experience foundation

Status: active/completed.

- ProofOfOrigin package deployed on Casper Testnet.
- Accepted and rejected attestations recorded.
- Render gateway wraps read-only queries and controlled SANDBOX writes.
- Vercel landing builds from `web/`.
- Spot-the-Fraud endpoints and page exist.
- Design system tokens exist.
- Lastre public brand and `lastre.io` domain selected.

Definition of done:

- `/proof` and `/verdict/:assetId` return live data.
- The frontend shows `DEMONSTRATION — simulated assets, no investment offered`.
- LOTE-001 displays `Invalid` and LOTE-002 displays `Valid`.

## Phase 1 — Lastre public launch surface

Priority: P0.

- Attach `lastre.io` to Vercel.
- Add `lastre.io` and `www.lastre.io` to Render `ALLOWED_ORIGINS`.
- Rebrand visible UI copy to Lastre.
- Ship `/`, `/proof`, `/catalog`, and `/spot-fraud` on Vercel.
- Add production smoke-test checklist to release process.
- Record a short demo video showing the fraud detection moment.

Definition of done:

- Incognito opens `https://lastre.io` without Vercel login.
- `Refresh live verdicts` shows gateway requests in Network.
- No prohibited financial language appears in the public UI.

## Phase 2 — Design and demo polish

Priority: P1.

- Build the final Laura-designed visual system on top of the existing API.
- Add asset detail pages.
- Add symbolic ProvenanceCredential card for valid lots.
- Improve mobile layout and hash handling.
- Add reduced-motion compliant reveal choreography.
- Add `api.lastre.io` custom domain when Render is ready.

Definition of done:

- One complete user can verify a lot, play Spot-the-Fraud, and inspect proof in
  under two minutes.
- All important interactions are keyboard accessible.
- The UI distinguishes live, unverified, and simulated states.

## Phase 3 — Operational hardening

Priority: P2.

- Add uptime/status monitoring.
- Add API health and proof smoke tests to CI if network policy allows.
- Add stronger observability to the gateway.
- Add automated banned-word checks for public copy.
- Document incident and rollback procedure.

Definition of done:

- A failed Render gateway is visible in status checks.
- A Vercel rollback can be performed in minutes.
- Demo copy cannot accidentally introduce investment/yield wording.

## Phase 4 — Protocol maturity

Priority: future.

- Review contract semantics before any mainnet consideration.
- Add formal tests around edge cases and storage invariants.
- Decide whether internal namespaces should migrate from `lastro` to `lastre`.
- Evaluate a real x402/Casper facilitator if one exists.
- Consider external audit before production use.

Definition of done:

- No mainnet or real-asset claims without audit, legal review, and operational
  controls.

## Open decisions

| Decision | Owner | Notes |
|---|---|---|
| `api.lastre.io` timing | Felix | Depends on Render custom-domain setup |
| Final logo/mark | Laura/Felix | Current mark is provisional |
| Route name `/catalog` vs `/marketplace` | Laura/Felix | Prefer `/catalog`; avoid commerce framing |
| Internal namespace migration | Engineering | Defer until after demo/hackathon window |
| Public docs site | Felix | Optional `docs.lastre.io` later |

## Release tracks

| Track | Lead | Output |
|---|---|---|
| Frontend | Laura | Vercel app on `lastre.io` |
| Gateway | Fugu/Felix | Render API and smoke tests |
| Protocol | Fugu/Felix | Casper contract read/write flows |
| Design system | Laura/Fugu | Tokens, components, motion, copy guardrails |
| Demo ops | Felix | Recording, domain, deploy dashboard checks |
