# Lastre Agent

TypeScript packages for the Lastre off-chain stack:

- `sealer` — deterministic offline SHA-256 provenance seal.
- `x402` — HTTP 402 paid-verification prototype with a mock facilitator.
- `orchestrator` — action decider and end-to-end agent loop.

The LLM/rule decider chooses the operational action only. The deterministic seal
path decides the provenance verdict.
