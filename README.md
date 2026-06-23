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
