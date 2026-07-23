# ADR-0001: Keep x402 Mock Facilitator for Final-Round Qualification

## Status

Accepted

## Date

2026-07-15

## Context

Lastre already exposes the x402-shaped quote -> `X-PAYMENT` -> provenance payload
flow used by the judge demo. The current facilitator is intentionally a mock
facilitator: it validates payment headers and replay/amount semantics, but it
does not move real CSPR.

The Casper Buildathon review window requires the live app and repository to stay
functional at all times. Replacing settlement during the qualification window
could break the judge path, introduce wallet/key risk, or require new testnet
transactions that are not in the canonical evidence pack.

## Decision

Keep the mock x402 facilitator as the default judge path for final-round
qualification. Document the trust boundary plainly in README, JUDGES_PLAYBOOK,
and BUIDL_PAGE_PASTE. Do not claim real CSPR movement in the current demo.

## Consequences

Positive:

- Judge demo remains stable and zero-downtime.
- x402 integration seam is visible and testable without requiring wallet setup.
- Public copy remains honest: no fake settlement, no hidden financial action.

Negative:

- A competitor can argue Lastre has not completed real settlement yet.
- A future milestone is required for a production facilitator.

Mitigation:

- Maintain the existing `Facilitator` interface as the swap point.
- Add a feature-flagged real Casper facilitator only after qualification smoke is
  green and the existing simulate path remains available.
- Record any future real settlement transaction in a new evidence pack; never
  invent transaction hashes.
