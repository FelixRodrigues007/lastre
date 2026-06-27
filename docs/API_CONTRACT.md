# Lastre Gateway API Contract

This is the contract between the Vercel frontend and the Render gateway.

## Base URLs

Current production gateway:

```text
https://lastro.onrender.com
```

Future custom API domain:

```text
https://api.lastre.io
```

Frontend environment variable:

```text
VITE_GATEWAY_URL=https://lastro.onrender.com
```

## General rules

- All responses are JSON unless a legacy static route is requested with
  `Accept: text/html`.
- Read endpoints do not require keys.
- Write endpoints are SANDBOX-only and disabled by default in production.
- Errors should be shown honestly; never convert an error into a fake verdict.

## TypeScript client

```ts
export const GATEWAY_URL = (
  import.meta.env.VITE_GATEWAY_URL || "https://lastro.onrender.com"
).replace(/\/+$/, "");

export async function fetchGatewayJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${GATEWAY_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : `Gateway request failed with ${response.status}`);
  }

  return data as T;
}
```

## Shared types

```ts
export type Verdict = "Valid" | "Invalid" | "Unverified";

export interface VerdictResponse {
  assetId: string;
  verdict: Verdict;
  seal: string | null;
  referenceSeal: string | null;
  attester: string | null;
  attestationTx: string | null;
  packageHash: string;
  readAt: string;
  accepted?: number;
  rejected?: number;
}

export interface ProofResponse {
  packageHash: string;
  accepted: number;
  rejected: number;
  recentAttestations: Array<{
    assetId: string;
    verdict: "Valid" | "Invalid";
    tx: string | null;
    timestamp: string | null;
  }>;
}

export interface CatalogAsset {
  assetId: string;
  name?: string;
  mineral?: string;
  mineralType?: string;
  operator?: string;
  origin?: { lat: number; lng: number; label: string };
  custodyPath?: Array<{ lat: number; lng: number; step?: string; label?: string }>;
  referenceRegistered?: boolean;
  expectedOnChain?: Verdict;
  simulated?: boolean;
}

export interface CatalogResponse {
  disclaimer?: string;
  perimeter?: unknown;
  assets: CatalogAsset[];
}

export interface ComputeResponse {
  computedSeal: string;
  referenceSeal: string | null;
  match: boolean;
  verdict: "Valid" | "Invalid";
}

export interface CertificateResponse {
  assetId: string;
  verdict: "Valid";
  seal: string;
  attester: string;
  attestationTx: string;
  type: "ProvenanceCredential";
  transferable: false;
}
```

## Endpoints

### `GET /health`

Connectivity check.

Expected use:

- deployment smoke tests;
- optional status page;
- do not use it as proof of chain state.

### `GET /proof`

Returns the live protocol counters and recent public attestations.

Example response:

```json
{
  "packageHash": "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561",
  "accepted": 2,
  "rejected": 1,
  "recentAttestations": [
    {
      "assetId": "MINA-VALEDOURO-LOTE-002",
      "verdict": "Valid",
      "tx": "43b00edd...2e16f6f4",
      "timestamp": null
    }
  ]
}
```

### `GET /catalog`

Returns fictional demo lots.

Frontend behavior:

- show all assets;
- label simulated assets;
- fetch `/verdict/:assetId` only for items expected to have live state;
- never invent live state for simulated items.

### `GET /verdict/:assetId`

Read-only Casper query through the compiled Rust query binary.

Known live assets:

```text
MINA-VALEDOURO-LOTE-001 -> Invalid
MINA-VALEDOURO-LOTE-002 -> Valid
```

Response fields:

- `verdict`: `Valid`, `Invalid`, or `Unverified`;
- `seal`: submitted attestation seal or `null`;
- `referenceSeal`: registered reference seal or `null`;
- `attester`: account hash if available;
- `attestationTx`: transaction hash if available;
- `packageHash`: always included;
- `readAt`: ISO timestamp.

### `GET /certificate/:assetId`

Returns a symbolic non-transferable credential only for a valid lot with symbolic
MintGate status.

Frontend behavior:

- `200`: render the credential card.
- `404`: hide the card or show a muted explanation.

Required card label:

```text
symbolic credential via MintGate event — not a transferable asset
```

### `POST /sandbox/compute`

Local deterministic sealer check. No chain write.

Request:

```json
{
  "assetId": "MINA-VALEDOURO-LOTE-002",
  "measurement": {
    "massGrams": 125000,
    "operator": "Mineradora Vale do Ouro",
    "capturedAtISO": "2026-06-24T15:57:24.000Z"
  }
}
```

or:

```json
{
  "assetId": "MINA-VALEDOURO-LOTE-002",
  "seal": "64-hex-seal"
}
```

### `POST /sandbox/anchor`

Controlled SANDBOX-only chain write.

Production default:

```text
SANDBOX_ANCHOR_ENABLED=false
```

Frontend behavior:

- hide this for public visitors unless Felix explicitly enables demo mode;
- accept only `SANDBOX-*` asset IDs;
- display the transaction link if the backend returns one;
- never collect a secret key in the browser.

### `GET /fraud-challenge?assetId=...&difficulty=easy|hard`

Creates a Spot-the-Fraud round.

### `POST /fraud/guess`

Scores a fraud challenge. The client may pass `currentStreak`.

### `POST /fraud/anchor-tampered`

Optional controlled anchor for the tampered seal. Same SANDBOX guard as
`/sandbox/anchor`.

## Error handling

Recommended mapping:

| Error | UI state |
|---|---|
| Network/CORS failure | `Gateway unavailable — retry` |
| `404` certificate | no credential yet |
| `404` challenge | load a new challenge |
| `409 already_played` | show replay prompt |
| `400 invalid_choice` | validate UI controls |
| sandbox disabled | show `Controlled anchor is disabled for public demo` |

## Smoke tests

```bash
curl -s https://lastro.onrender.com/health
curl -s https://lastro.onrender.com/proof
curl -s https://lastro.onrender.com/catalog
curl -s https://lastro.onrender.com/verdict/MINA-VALEDOURO-LOTE-001
```
