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

### `GET /fraud-challenge?assetId=...&difficulty=easy|hard`

Spot-the-Fraud generator. Builds a genuine artifact for a fictional lot plus a
tampered copy that changes exactly one field, then computes BOTH seals with the
real sealer. The seal is the only source of the verdict: a card is `Valid` only
when its seal equals the genuine/reference seal.

- `assetId` (optional): defaults to the first `referenceRegistered` catalog lot.
- `difficulty`: `easy` (`massGrams +1`) or `hard` (subtle `+0.1%` mass or an
  origin nudged outside the fictional perimeter). Defaults to `easy`.
- `404 asset_not_in_catalog` when the lot is unknown.

Response shape:

```json
{
  "assetId": "SANDBOX-ESTANHO-LOTE-008",
  "challengeId": "ch_…",
  "difficulty": "easy",
  "sealA": { "seal": "64-hex", "measurement": { "massGrams": 125000, "...": "..." } },
  "sealB": { "seal": "64-hex", "measurement": { "massGrams": 125001, "...": "..." } },
  "correctFraud": "B",
  "difference": "massGrams changed by +1 (125000g → 125001g)",
  "disclaimer": "DEMONSTRATION — simulated assets, no investment offered"
}
```

### `POST /fraud/guess`

Scores one round. Streak is supplied by the client (`currentStreak`) and the
gateway returns the next streak/score. Each challenge can only be guessed once.

Body:

```json
{ "challengeId": "ch_…", "userChoice": "A | B", "currentStreak": 6 }
```

Response:

```json
{
  "correct": true,
  "verdictA": "Valid",
  "verdictB": "Invalid",
  "computedSeals": { "A": "64-hex", "B": "64-hex" },
  "currentStreak": 7,
  "score": 87,
  "difference": "massGrams changed by +1 (125000g → 125001g)",
  "tamperedSide": "B",
  "assetId": "SANDBOX-ESTANHO-LOTE-008"
}
```

- `400 invalid_choice` when `userChoice` is not `A`/`B`.
- `404 challenge_not_found` for an unknown `challengeId`.
- `409 already_played` when a challenge is replayed.

### `POST /fraud/anchor-tampered`

Optional, controlled write that anchors the tampered seal as `Invalid`. It
reuses the exact same SANDBOX anchor guard as `/sandbox/anchor` (SANDBOX-only,
`SANDBOX_ANCHOR_ENABLED=true`, `SANDBOX_SECRET_KEY_PATH`, and the global rate
limit), so no protection can be bypassed.

Body:

```json
{ "challengeId": "ch_…", "assetId": "SANDBOX-…" }
```

`assetId` is optional and defaults to the challenge's lot. Returns the same
`{ txHash, verdict, explorerUrl }` shape as `/sandbox/anchor`, plus the anchored
`assetId` and `tamperedSeal`.

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

## Spot-the-Fraud (Phase 2)

The `/spot-fraud` page is a provenance fraud game built entirely on the existing
protocol: two seals for the same fictional lot (one genuine, one tampered),
computed by the real sealer. The deterministic seal alone decides `Valid` vs
`Invalid`; the game only reveals it.

Example calls:

```bash
# 1) Generate a genuine/tampered pair (easy = +1 gram).
curl -s "http://localhost:3456/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008&difficulty=easy"

# 2) Score a guess (use the challengeId + correctFraud from step 1).
curl -s -X POST "http://localhost:3456/fraud/guess" \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"ch_REPLACE","userChoice":"B","currentStreak":6}'

# 3) (Controlled) anchor the tampered seal as Invalid in a SANDBOX-* lot.
#    Requires SANDBOX_ANCHOR_ENABLED=true and SANDBOX_SECRET_KEY_PATH.
curl -s -X POST "http://localhost:3456/fraud/anchor-tampered" \
  -H "Content-Type: application/json" \
  -d '{"challengeId":"ch_REPLACE"}'
```

Play it in the browser at `http://localhost:3456/spot-fraud` after `make gateway`.
