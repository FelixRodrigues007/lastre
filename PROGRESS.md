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
