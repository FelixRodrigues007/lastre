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

## Build from a clean clone
The repository is set up so a fresh checkout can rebuild the generated
artifacts that are intentionally ignored by git, including `agent/sealer/dist`
before `agent/x402` imports it.

Prerequisites on macOS:
- Node.js + npm.
- Rust via `rustup`; the contract crate pins its toolchain in
  `contracts/lastro_origin/rust-toolchain`.
- Network access on the first run so `npm ci`, `rustup target add`, and, if
  missing, `cargo install cargo-odra` can populate the local tool cache.

```bash
git clone https://github.com/FelixRodrigues007/lastro.git
cd lastro
make
```

`make` defaults to `make build`.

| Target | What it does |
| --- | --- |
| `make setup` | Installs local Node dependencies for `agent/sealer`, `agent/x402`, and `agent/orchestrator`; validates Rust/Odra tooling; ensures the `wasm32-unknown-unknown` target exists. |
| `make build` | Runs `setup`, builds `agent/sealer` first, then `agent/x402`, then `agent/orchestrator`, checks the Rust contracts with the `livenet` feature, and builds Odra/Casper WASM artifacts. |
| `make test` | Runs the TypeScript package tests and Rust contract tests/format check. |
| `make wasm` | Builds the Odra/Casper WASM artifacts in `contracts/lastro_origin/wasm/`. |
| `make query` | Runs the read-only livenet `ProofOfOrigin` query against the already-deployed package. It requires the standard Odra livenet environment (`ODRA_CASPER_LIVENET_NODE_ADDRESS`, `ODRA_CASPER_LIVENET_CHAIN_NAME`, and any local Odra credentials/config needed by your machine); it does not deploy. |
| `make demo` | Builds the local TypeScript stack and runs the orchestrator demo. If `OPENROUTER_API_KEY` is unset, the `LlmDecider` logs and uses the deterministic rule fallback. |

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
