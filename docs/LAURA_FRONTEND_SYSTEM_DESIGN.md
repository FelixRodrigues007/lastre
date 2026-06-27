# Lastre Frontend System Design — Laura Handoff

This document is the product/frontend contract for building a polished React
experience on top of the already-running Lastre backend.

Lastre is a provenance trust layer:

> Proof before token — the chain of proof from land to token, verified offline
> and anchored on Casper.

The frontend must never introduce new trust logic. It only presents data and
controlled demo actions from the existing gateway.

## 1. Current deployment model

There are two public surfaces:

| Surface | URL | Responsibility |
|---|---|---|
| Vercel landing/frontend | `https://lastre.io` | The polished React experience Laura builds. |
| Render gateway/backend | `https://lastro.onrender.com` | JSON API, live protocol reads, controlled sandbox writes, and legacy static demo shells. |

The frontend should consume Render as an API:

```text
VITE_GATEWAY_URL=https://lastro.onrender.com
VITE_PUBLIC_SITE_URL=https://lastre.io
```

Do not treat Render static pages as the final UI. URLs such as
`https://lastro.onrender.com/proof#proof-section` are backend-served demo shells.
The final user experience should live on Vercel and call Render through `fetch`.

When `api.lastre.io` is mapped to Render, switch `VITE_GATEWAY_URL` to:

```text
VITE_GATEWAY_URL=https://api.lastre.io
```

## 2. Non-negotiable product rules

Every public screen must show:

```text
DEMONSTRATION — simulated assets, no investment offered
```

Hard rules:

- Use fictional assets only.
- The user action is **Verify provenance** or **Spot the fraud**.
- Do not use investment, sale, yield, return, profit, price, ownership, or
  transferable-token language.
- The deterministic SHA-256 seal decides `Valid` / `Invalid`.
- The LLM/agent, when shown, decides only an action; it never decides a verdict.
- Both `Valid` and `Invalid` are permanent on-chain proof. A rejection is not a
  discarded error.
- Do not display a fake on-chain verdict. If no attestation exists, show
  `Unverified` or `Simulated`.
- Controlled anchoring is SANDBOX-only and must remain behind backend safety
  controls.

## 3. Visual direction

Lastre should feel like **forensic infrastructure**:

- precise, grounded, and verifiable;
- physical origin plus cryptographic proof;
- dark mineral/olive surfaces with seal-gold accents;
- restrained motion and technical detail;
- both accepted and rejected paths visible.

Avoid generic crypto visuals:

- no purple/cyan hype gradients;
- no speculative financial dashboards;
- no abstract AI magic;
- no market/trading metaphors.

## 4. Design tokens

Use the existing token system as the source of visual truth:

```text
design-system/tokens/lastro.css          canonical project tokens
web/src/styles/lastro-tokens.css         local Vercel-safe copy used by the React app
web/src/styles/global.css                current shared primitives
```

In a Vite app under `web/`, import:

```ts
import "./styles/lastro-tokens.css";
import "./styles/global.css";
```

Do not import tokens from a parent directory in the Vercel app unless the Vercel
Root Directory and Vite filesystem permissions are configured for it. The
current safe path is the local copy inside `web/src/styles/`.

### Core semantic tokens

| Token | Purpose |
|---|---|
| `--lastro-bg-primary` | Page background |
| `--lastro-bg-panel` | Panels/cards |
| `--lastro-bg-elevated` | Elevated surfaces |
| `--lastro-text-primary` | Main text |
| `--lastro-text-secondary` | Secondary text |
| `--lastro-text-muted` | Metadata |
| `--lastro-brand-seal` | CTAs, seal highlights, key hashes |
| `--lastro-status-valid` | Valid verdict |
| `--lastro-status-invalid` | Invalid verdict |
| `--lastro-border-subtle` | Hairline separators |

### Typography

- Display: `Space Grotesk`
- Body: `Inter`
- Hashes / contract references: `JetBrains Mono`

Use monospace only for proof artifacts: hashes, package IDs, asset IDs,
transaction hashes, and timestamps.

## 5. Frontend information architecture

Recommended Vercel routes:

| Route | Purpose | Backend dependency |
|---|---|---|
| `/` | Landing narrative + live proof panel | `/proof`, `/catalog`, `/verdict/:assetId` |
| `/proof` | Live protocol state and recent attestations | `/proof` |
| `/marketplace` or `/catalog` | Fictional asset catalog with verdict badges | `/catalog`, `/verdict/:assetId` |
| `/asset/:assetId` | Asset detail and proof trail | `/verdict/:assetId`, `/certificate/:assetId` |
| `/sandbox` | Compute a seal locally and compare with reference | `/sandbox/compute` |
| `/spot-fraud` | Gamified fraud challenge | `/fraud-challenge`, `/fraud/guess`, optional `/fraud/anchor-tampered` |
| `/map` | Fictional provenance map | `/catalog`, `/verdict/:assetId` |

The frontend can ship pages incrementally. The minimum functional demo is:

1. `/` with live counters and verdicts.
2. `/marketplace` or catalog section with live badges.
3. `/spot-fraud` for the judge/video moment.

## 6. Component system

Build these components first. They are stable, reusable, and map directly to the
gateway contract.

### Foundation

- `AppShell`
  - fixed demonstration banner;
  - nav links;
  - footer with repo / explorer links.
- `DemoBanner`
  - text exactly: `DEMONSTRATION — simulated assets, no investment offered`.
- `Section`
  - consistent width, rhythm, and responsive spacing.
- `Panel`
  - elevated proof surface using tokenized background/border.
- `HashText`
  - truncates long hashes but exposes full value via `title` and copy action.
- `StatusChip`
  - variants: `valid`, `invalid`, `unverified`, `simulated`, `loading`, `error`.

### Protocol UI

- `LiveGatewayPanel`
  - shows `API: <gateway URL>`;
  - shows `Connected / Loading / Unavailable`;
  - includes a manual `Refresh live verdicts` button;
  - reads `/proof`, `/catalog`, `/verdict/MINA-VALEDOURO-LOTE-001`,
    `/verdict/MINA-VALEDOURO-LOTE-002`.
- `ProofCounters`
  - accepted / rejected counters from `/proof`.
- `RecentAttestationList`
  - links transaction hashes to `https://testnet.cspr.live/transaction/<hash>`.
- `VerdictBadge`
  - `Valid` = green;
  - `Invalid` = red;
  - `Unverified` = muted;
  - `Simulated` = neutral/gold outline.
- `AssetCard`
  - fictional lot metadata;
  - live verdict if `referenceRegistered` or `expectedOnChain` is present;
  - clearly marks simulated lots.
- `ProvenanceCredentialCard`
  - only shown when `/certificate/:assetId` returns `200`;
  - label: `symbolic credential via MintGate event — not a transferable asset`.

### Interactive demo UI

- `SandboxComputeForm`
  - calls `/sandbox/compute`;
  - never writes on-chain;
  - labels result as local deterministic computation.
- `AnchorOnChainControl`
  - optional and hidden behind a demo/admin affordance;
  - calls `/sandbox/anchor`;
  - SANDBOX-only;
  - must display backend errors honestly.
- `SpotFraudGame`
  - calls `/fraud-challenge`;
  - submits guesses to `/fraud/guess`;
  - highlights exactly one changed field;
  - optional controlled anchor through `/fraud/anchor-tampered`.
- `FictionalMap`
  - uses catalog origin/custody paths;
  - labels all coordinates as fictional;
  - colors pins by live verdict where available.

## 7. API client contract

Create one API module and use it everywhere. Do not scatter raw `fetch` calls
through components.

```ts
const DEFAULT_GATEWAY_URL = "https://lastro.onrender.com";

export const LASTRO_GATEWAY_URL = (
  import.meta.env.VITE_GATEWAY_URL || DEFAULT_GATEWAY_URL
).replace(/\/+$/, "");

export async function fetchGatewayJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${LASTRO_GATEWAY_URL}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...init,
      headers: {
        accept: "application/json",
        ...(init?.headers ?? {}),
      },
    },
  );

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : `Gateway request failed with ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}
```

### Core types

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

export interface CertificateResponse {
  assetId: string;
  verdict: "Valid";
  seal: string;
  attester: string;
  attestationTx: string;
  type: "ProvenanceCredential";
  transferable: false;
}

export interface ComputeResponse {
  computedSeal: string;
  referenceSeal: string | null;
  match: boolean;
  verdict: "Valid" | "Invalid";
}
```

## 8. Endpoint contract

### `GET /health`

Use for connection checks.

### `GET /proof`

Live proof counters and recent public attestations.

Expected UI:

- show `accepted`;
- show `rejected`;
- list recent events;
- link any `tx` to CSPR Live.

### `GET /catalog`

Fictional asset catalog.

Expected UI:

- render every asset;
- use `simulated: true` or no on-chain state as `Simulated`;
- do not claim live proof unless `/verdict/:assetId` confirms it.

### `GET /verdict/:assetId`

Read-only live Casper verdict through the gateway. No wallet, no key, no
transaction.

Expected UI:

- `Valid`: green proof path;
- `Invalid`: red proof path, explained as permanent proof;
- `Unverified`: muted state, no fake claim.

Known live lots:

```text
MINA-VALEDOURO-LOTE-001 → Invalid
MINA-VALEDOURO-LOTE-002 → Valid
```

### `GET /certificate/:assetId`

Symbolic non-transferable credential. Only show the credential if the endpoint
returns `200`.

If it returns `404`, show no credential or show:

```text
Credential appears only for Valid lots with a symbolic MintGate event.
```

### `POST /sandbox/compute`

Local deterministic calculation. It does not write on-chain.

Example:

```ts
await fetchGatewayJson<ComputeResponse>("/sandbox/compute", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    assetId: "MINA-VALEDOURO-LOTE-002",
    measurement: {
      massGrams: 125000,
      operator: "Mineradora Vale do Ouro",
      capturedAtISO: "2026-06-24T15:57:24.000Z",
    },
  }),
});
```

### `POST /sandbox/anchor`

Controlled write path. Only available when the backend enables it.

Frontend rules:

- only allow `SANDBOX-*`;
- hide by default for public visitors;
- show backend error messages as safety state, not as UI failure;
- never ask for or store a secret key in the browser.

### `GET /fraud-challenge`

Generates the Spot-the-Fraud round with two seals for one fictional lot.

Query:

```text
/fraud-challenge?assetId=SANDBOX-ESTANHO-LOTE-008&difficulty=easy
```

### `POST /fraud/guess`

Scores one challenge. Streak may be client-managed.

### `POST /fraud/anchor-tampered`

Optional SANDBOX-only controlled anchor for the tampered seal. Use only after a
guess is revealed and label it as a demo write.

## 9. State and error handling

Every live component should support:

| State | UI behavior |
|---|---|
| `loading` | skeleton or muted placeholders |
| `ready` | live values shown |
| `error` | explanatory message + retry button |
| `unverified` | no on-chain proof available |
| `simulated` | fictional catalog/demo-only state |

Render may cold-start. The frontend should:

- keep a manual refresh button;
- allow a request timeout of around 45 seconds for first load;
- do not collapse the whole page if one endpoint fails;
- preserve the demonstration message even on error.

## 10. CORS and environment

Render should allow the Vercel domain:

```text
ALLOWED_ORIGINS=https://<vercel-domain>,http://localhost:5173,http://localhost:3000
```

Vercel should set:

```text
VITE_GATEWAY_URL=https://lastro.onrender.com
```

The frontend must not contain:

- Casper secret keys;
- deployer keys;
- OpenRouter keys;
- sandbox secret key paths;
- private Render/Vercel tokens.

## 11. Recommended page behavior

### Landing `/`

Above the fold:

- thesis line;
- proof before token language;
- CTA: `Verify provenance`;
- no investment language.

Live panel:

- `API: https://lastro.onrender.com`;
- `Connected` status;
- accepted/rejected counters;
- LOTE-001 Invalid and LOTE-002 Valid.

### Proof `/proof`

Show:

- package hash;
- accepted/rejected counters;
- recent attestations;
- CSPR Live links;
- explanation that `Valid` and `Invalid` are both written on-chain.

### Catalog `/marketplace` or `/catalog`

Show:

- fictional mineral lots;
- filters by mineral/verdict/simulated;
- live verdict badges for registered lots;
- simulated labels for everything else.

Do not use commerce language such as buy/sell/market price. If the route name
`marketplace` stays for hackathon continuity, page copy must frame it as a
**provenance showcase**, not a trading interface.

### Spot-the-Fraud `/spot-fraud`

This is the signature demo:

- two cards;
- one genuine seal and one tampered seal;
- reveal the changed field;
- explain that the SHA-256 seal alone decides the verdict;
- optional SANDBOX anchor after reveal.

### Map `/map`

Use fictional coordinates only. Label:

```text
Fictional provenance map — not GPS tracking.
```

## 12. Accessibility and quality bar

- Minimum WCAG AA contrast for all text.
- Keyboard-operable controls.
- Visible focus states.
- `prefers-reduced-motion` respected.
- Do not rely on color alone for verdict state; pair color with text/icon.
- Long hashes must wrap or truncate safely on mobile.
- Loading and error states must be readable by screen readers.

## 13. Local development

From repo root:

```bash
cd web
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`:

```text
VITE_GATEWAY_URL=https://lastro.onrender.com
```

Build:

```bash
npm run build
```

The root `vercel.json` also supports Vercel builds from the repository root by
running the web build internally.

## 14. Acceptance checklist for Laura's frontend

- [ ] Every screen has the demonstration banner.
- [ ] The Vercel app reads `VITE_GATEWAY_URL`.
- [ ] `/proof` returns live counters in the UI.
- [ ] `/verdict/MINA-VALEDOURO-LOTE-001` appears as `Invalid`.
- [ ] `/verdict/MINA-VALEDOURO-LOTE-002` appears as `Valid`.
- [ ] Simulated assets are labeled `Simulated`.
- [ ] `Unverified` is shown when there is no attestation.
- [ ] No investment/yield/return/price/buy/sell language appears.
- [ ] No secrets or key paths are committed.
- [ ] Spot-the-Fraud can complete one round in under 25 seconds.
- [ ] `Refresh live verdicts` re-runs the gateway calls in Network.
- [ ] Mobile layout is usable and hashes do not overflow.

## 15. Quick copy block for Laura

Use this as the implementation brief:

```text
Build the Lastre frontend as a Vite + React + TypeScript app on Vercel.
Use https://lastro.onrender.com as the gateway through VITE_GATEWAY_URL.
The frontend must show the fixed banner:
"DEMONSTRATION — simulated assets, no investment offered".

Do not implement trust logic in the frontend. The backend/gateway returns the
live state. The SHA-256 seal decides Valid/Invalid; the UI only presents it.

Start with:
- / landing with live proof panel,
- /proof with counters and recent attestations,
- /catalog with fictional assets and live verdict badges,
- /spot-fraud for the interactive demo.

Use tokens from web/src/styles/lastro-tokens.css and the API contract in
docs/LAURA_FRONTEND_SYSTEM_DESIGN.md.
```
