# Lastro Origin Contracts

Odra/Casper contracts for Lastro's origin-proof layer.

- `ProofOfOrigin` registers reference seals and records origin attestations.
- `MintGate` consumes valid `ProofOfOrigin` attestations before symbolic minting.

Both `Valid` and `Invalid` attestations are successful on-chain records. A
rejection is permanent proof, not a discarded error.

## Test

```bash
cargo test
```

## Build WASM

```bash
cargo odra build
```
