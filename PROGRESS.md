# Lastro Progress

> Thesis: *Proof before token — the chain of proof from land to token, verified offline and anchored on Casper.*

## Snapshot

- **Repo:** `~/Developer/lastro`
- **Branch:** `main`
- **Stack:** Casper / Odra contracts, deterministic sealer, x402 paid-verification prototype, agentic orchestrator
- **Data policy:** fictional public data only

## Milestones

| Area | Status | Notes |
| --- | --- | --- |
| Repo foundation | Done | Monorepo, Rust/Odra skeleton, Node agent packages |
| ProofOfOrigin contract | Done | Stores reference seals and records Valid/Invalid attestations |
| Sealer | Done | Deterministic SHA-256 over fictional provenance artifacts |
| x402 seam | Done | Mock facilitator behind a replaceable interface |
| Orchestrator | Done | LLM/rule action decision; seal still decides verdict |
| Testnet proof | Done | ProofOfOrigin deployed and queried on Casper Testnet |
| Build from clean clone | Done | Root Makefile and setup scripts |
| Final packaging | In progress | README, licensing, docs, demo assets |

## Protocol rules

- The deterministic SHA-256 seal decides the `Valid` / `Invalid` verdict.
- The LLM decides only the operational action: `pay`, `skip`, or `escalate`.
- Both valid and invalid attestations are written on-chain.
- A rejection is permanent proof, not a discarded error.
- Public demos must use fictional data only.

## 10/10 Competition Upgrade (2026-06-25)

**Objective:** Win Casper Agentic Buildathon 2026 (63+ submissions).

**Differentiation vs leaders** (Phoenix Zero, Custodian, helios, Vouch, VeriFeed, OutcomePay, CasperFlow, GrantFlow AI):
- Competitors: AI agents consuming RWA/DeFi data via x402 + MCP.
- Lastro: Prove the *physical origin* of the asset **before** any data or token. Offline deterministic seal + on-chain rejection of fakes.
- Additional edges: Pure demonstration (no investment claims), Spot-the-Fraud interactive moment, full transparency package hash + live counters.

### Phase 1 Delivered at Competition Level
- Live Marketplace fetching real verdicts from ProofOfOrigin.
- Sandbox with instant local compute (tamper demo) + controlled anchor.
- /proof live transparency.
- Spot-the-Fraud game (the memorable "aha" moment).
- Runnable demo: open gateway on :3456 and go to /demo.
- Sticky DEMO banner + explorer links everywhere.
- DEMO.md with exact video script.

### Next (before 30 Jun)
- Finish simple visual custody chain in demo.html.
- Record the video.
- Fresh on-chain attest with demo key.
