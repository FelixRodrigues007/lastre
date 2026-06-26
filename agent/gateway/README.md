# Lastro Gateway

Express HTTP gateway with CORS enabled for the Lastro experience layer. It wraps the already-live
ProofOfOrigin protocol and adds no new trust logic: the deterministic SHA-256
seal decides the verdict; the UI and gateway only present reads and controlled
demo actions.

Every public screen served by this gateway must carry the banner:

> DEMONSTRATION — simulated assets, no investment offered

## Endpoints

### `GET /verdict/:assetId`

Read-only Casper query through the compiled Rust `query` binary. No transaction
is submitted and no key is required.

Response shape:

```json
{
  "assetId": "MINA-VALEDOURO-LOTE-001",
  "verdict": "Valid | Invalid | Unverified",
  "seal": "... or null",
  "referenceSeal": "... or null",
  "attester": "... or null",
  "attestationTx": null,
  "packageHash": "hash-b8b505...",
  "readAt": "2026-06-25T00:00:00.000Z"
}
```

If no attestation exists, the gateway returns `Unverified`. It never invents an
on-chain verdict for simulated lots.

### `POST /sandbox/compute`

Local, instant, no-chain computation. The gateway calls the deterministic sealer
and compares the computed seal with the reference seal read from the contract.

Body:

```json
{ "assetId": "MINA-VALEDOURO-LOTE-001", "seal": "64-hex..." }
```

or:

```json
{ "assetId": "...", "measurement": { "massGrams": 100000 } }
```

### `POST /sandbox/anchor`

Controlled write path for the video/demo only. It reuses the existing compiled
Rust `attest` binary, which shells out to `casper-client` and polls for
confirmation.

Safety controls:

- only `SANDBOX-*` asset ids are accepted by default;
- disabled unless `SANDBOX_ANCHOR_ENABLED=true`;
- requires `SANDBOX_SECRET_KEY_PATH` from the environment;
- global in-memory rate limit: one request per minute;
- no secret key is committed or logged.

### `GET /proof`

Returns package hash, accepted/rejected counters from the same query path, and
the public recent attestations used by the demo transparency page.

### `GET /certificate/:assetId`

Returns a symbolic, non-transferable provenance credential only when the
ProofOfOrigin verdict is `Valid` and the demo MintGate status marks the lot as
symbolically recorded. It returns `404` for non-Valid or unavailable credentials.

### `GET /map`

Serves the fictional geolocation map. The page uses MapLibre GL with open tiles
and deck.gl `ArcLayer` custody arcs, then polls `/verdict/:assetId` to recolor
pins. The map does not claim GPS tracking or real-world monitoring.

## Configuration

Public defaults target Casper Testnet:

- `PACKAGE_HASH` or `LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH`
- `NODE_ADDRESS` or `ODRA_CASPER_LIVENET_NODE_ADDRESS`
- `CHAIN_NAME` or `ODRA_CASPER_LIVENET_CHAIN_NAME`
- `PORT` (default: `3456`)
- `CASPER_CLIENT_BIN` or `LASTRO_CASPER_CLIENT_BIN`
- `SANDBOX_ANCHOR_ENABLED=true` for the controlled write demo
- `SANDBOX_SECRET_KEY_PATH=/path/to/demo-secret-key` for the controlled write demo
- `SANDBOX_REGISTER_REFERENCE=true` only when the controlled demo should register
  the sandbox reference before attesting; otherwise the gateway sets
  `LASTRO_AGENT_SKIP_REGISTER=1` and expects the reference to already exist.

Use a low-balance demo account for `SANDBOX_SECRET_KEY_PATH`. Never use the main
deployer key in a public gateway process.

## Run

From the repository root:

```bash
make gateway
```

The target builds the sealer and the livenet Rust binaries first, then serves the
static `web/` directory (`/demo`, `/marketplace`, `/map`, `/public/catalog.json`)
and the JSON API at `http://localhost:3456`.
