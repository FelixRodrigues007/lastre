# Lastre Frontend Routes and Experience Map

The Vercel frontend is the primary public experience. The Render gateway is an
API backend and legacy static fallback.

## Route principles

- Every route shows the demonstration banner.
- Every route uses fictional data only.
- Every route avoids investment, price, return, sale, yield, ownership, and
  transferable-token language.
- Every route distinguishes live on-chain proof from simulated catalog content.
- Every route must have loading, error, empty, and retry states.

## Route table

| Route | Status | Purpose | Primary API calls | Primary CTA |
|---|---:|---|---|---|
| `/` | P0 | Public landing, thesis, live proof panel | `/proof`, `/catalog`, `/verdict/:assetId` | Verify provenance |
| `/proof` | P0 | Live counters, package hash, recent attestations | `/proof` | View on Casper Testnet |
| `/catalog` | P0 | Fictional asset showcase with filters | `/catalog`, `/verdict/:assetId` | Verify provenance |
| `/asset/:assetId` | P1 | Asset detail, seal comparison, proof trail | `/verdict/:assetId`, `/certificate/:assetId` | Verify this seal |
| `/spot-fraud` | P0 | Signature fraud-detection game | `/fraud-challenge`, `/fraud/guess` | Spot the fraud |
| `/sandbox` | P1 | Local deterministic seal computation | `/sandbox/compute`, optional `/sandbox/anchor` | Compute seal |
| `/map` | P2 | Fictional provenance map | `/catalog`, `/verdict/:assetId` | Explore fictional route |
| `/docs` | P2 | Public explainer docs | Static content | Read the protocol |
| `/status` | P2 | Gateway health/status | `/health`, `/proof` | Refresh status |

## `/` landing page

Sections:

1. **Hero** — thesis line and product promise.
2. **Trust gap** — why RWA provenance needs deterministic proof.
3. **Mechanism** — field data → offline SHA-256 seal → Casper verdict.
4. **Live proof** — connected gateway panel with counters and known live lots.
5. **Spot-the-Fraud teaser** — link to the signature demo.
6. **Safety boundary** — demonstration-only, fictional assets, no investment.
7. **Developer proof** — GitHub, package hash, explorer links.

Required live values:

```text
API: https://lastro.onrender.com or https://api.lastre.io
Accepted: from /proof
Rejected: from /proof
MINA-VALEDOURO-LOTE-001: Invalid
MINA-VALEDOURO-LOTE-002: Valid
```

## `/proof`

Purpose: make the on-chain state inspectable.

UI blocks:

- package hash card;
- accepted/rejected counters;
- recent attestations table;
- CSPR Live links;
- explanation that `Valid` and `Invalid` are both recorded.

Empty state:

```text
No recent attestations were returned by the gateway. The contract package is still available for direct verification.
```

## `/catalog`

Purpose: wide fictional showcase without commerce framing.

Filters:

- mineral;
- verdict (`Valid`, `Invalid`, `Unverified`, `Simulated`);
- on-chain reference registered;
- operator;
- region label.

Card states:

| State | Badge | Meaning |
|---|---|---|
| Live valid | `Valid` | Gateway confirms a matching attestation |
| Live invalid | `Invalid` | Gateway confirms a mismatch was recorded |
| No attestation | `Unverified` | The gateway found no on-chain attestation |
| Demo-only | `Simulated` | Catalog item is fictional and not represented as live proof |

Do not call this a trading marketplace in copy. If the route path stays
`/marketplace` for compatibility, title it as a **Provenance Showcase**.

## `/asset/:assetId`

Purpose: detailed proof trail for one fictional lot.

Data dependencies:

- catalog metadata from `/catalog`;
- verdict from `/verdict/:assetId`;
- credential from `/certificate/:assetId` if available.

Required UI:

- asset ID;
- fictional operator and origin label;
- seal/reference seal;
- verdict badge;
- transaction link when present;
- non-transferable credential card only for `200` certificate response.

Credential label:

```text
symbolic credential via MintGate event — not a transferable asset
```

## `/spot-fraud`

Purpose: make provenance fraud detection memorable.

Flow:

1. Load challenge with `/fraud-challenge`.
2. Show Seal A and Seal B.
3. User chooses `This is the fraud`.
4. Score with `/fraud/guess`.
5. Reveal exact changed field and both full seals.
6. Optional SANDBOX-only anchor if backend enables it.

Required copy:

```text
The seal decides the verdict. The UI only reveals it.
```

## `/sandbox`

Purpose: local compute demonstration.

Rules:

- `/sandbox/compute` is safe and local/no-chain.
- `/sandbox/anchor` is disabled by default and must be SANDBOX-only.
- Never ask for keys in the browser.

## `/map`

Purpose: visual polish, not real tracking.

Required label:

```text
Fictional provenance map — not GPS tracking.
```

Pins should poll verdicts where available, but simulated lots remain clearly
labeled.

## Navigation

Recommended nav labels:

```text
Proof
Catalog
Spot the Fraud
Sandbox
Map
GitHub
```

Primary CTA: `Verify provenance`.
Secondary CTA: `Spot the fraud`.
