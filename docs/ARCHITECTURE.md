# Lastro Architecture

## Thesis

Proof before token: before tokenization or data release, Lastro validates a
fictional chain of proof and anchors a verifiable attestation on Casper.

## Blocks

1. Foundation: monorepo, hybrid licensing, Odra skeleton, green tests.
2. `ProofOfOrigin`: on-chain contract for registering reference seals and
   recording both valid and invalid attestations.
3. Sealer: deterministic SHA-256 over fictional provenance input, compatible
   with the contract comparison.
4. x402: HTTP 402 paid-verification flow.
5. Agent: end-to-end orchestration.
6. Testnet + web: live deployment, transaction links, and demo surface.
7. Packaging: demo assets and final README.

## Data

All public documents and examples must use fictional data only.
