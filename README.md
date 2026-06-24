# Lastro

**Proof before token** — the chain of proof from the land to the token, verified offline and anchored on Casper.

Lastro is a proof-of-provenance protocol for tokenized Real-World Assets (RWA) on the Casper Network. Most RWA oracles post a number someone typed (price, rent). Lastro verifies the **physical origin** of an asset — from extraction to token — with AI running **offline** (a deterministic, tamper-proof SHA-256 seal), anchored on-chain. And it **rejects on-chain** when the proof does not hold.

## Why it's different
- Verifies a **physical provenance artifact**, not an API number.
- AI runs **offline / on-device** — a deterministic seal, not a cloud LLM rubber-stamp.
- **Rejects** invalid provenance on-chain — not just the happy path.

## Architecture (4 layers)
1. **Origin** — geographic seal (camera/frame at the source), verified offline, anchored on-chain. *(hackathon focus)*
2. **Custody** — gram-by-gram sealed ledger of extraction/transfer events. *(skeleton)*
3. **Commerce** — purchase/sale contracts anchored on-chain. *(roadmap)*
4. **Network** — expandable to the LatAm mineral belt: gold, iron, rare earths. *(roadmap)*

## Stack
Casper · Odra/Rust → WASM · x402 (HTTP-402 micropayments) · offline sealer · TypeScript agent.

## x402 payment verification (mock facilitator)
The x402 paid-verification flow is implemented, but payment is handled by a
**mock facilitator** (`MockFacilitator`): it does **not** talk to the Casper
network and does **not** move real CSPR. It validates the `X-PAYMENT` header with
a local SHA-256 mock signature (nonce, amount, anti-replay) and returns a synthetic
settlement `txHash`. This is intentional for the prototype, and there is **no
real Casper facilitator in this repo yet**.

All payment behavior sits behind a single seam — the `Facilitator` interface in
`agent/x402/src/facilitator.ts`. Swapping the mock for a real Casper facilitator
is **one implementation** of that interface, injected via
`createLastroX402Server({ facilitator })`; the server code does not change. The
exact swap points are marked with `TODO(casper-facilitator)` in
`agent/x402/src/facilitator.ts` and `agent/x402/src/server.ts`, and documented in
`agent/x402/README.md`.

## Status
Early prototype for the Casper Agentic Buildathon 2026. Demo data is fictional ("Mineradora Vale do Ouro"). Not audited; not for production use.

## Layout
- `contracts/` — Odra/Rust smart contracts (BUSL-1.1)
- `agent/` — TypeScript orchestration (sealer + x402)
- `web/` — landing & demo
- `samples/` — fictional sample data
- `docs/` — architecture, roadmap, progress

## License
BUSL-1.1 — see `LICENSE` and `NOTICE`.
