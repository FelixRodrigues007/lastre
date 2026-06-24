# @lastro/x402 — paid provenance verification (HTTP 402)

This package implements the Lastro x402 flow: a client requests `/verify`, the
server answers `402 Payment Required` with x402 `requirements`, the client pays,
and the server then runs the deterministic provenance check and returns the
verdict (`Valid` / `Invalid`).

## ⚠️ Payment verification uses a MOCK facilitator

The payment step is handled by a **mock facilitator** (`MockFacilitator`). It is
a local, deterministic stand-in: **it does not talk to the Casper network and it
does not move real CSPR.**

- `verifyPayment` validates a **local SHA-256 mock signature** over the
  `X-PAYMENT` header (not an on-chain signature), with nonce-match, amount, and
  anti-replay checks.
- `settlePayment` returns a **synthetic SHA-256 `txHash`** (not a real Casper
  transaction).

The mock is intentional for the hackathon prototype. It exists so the end-to-end
x402 flow can be exercised and tested offline. There is **no real Casper
facilitator in this repo yet**, and we do not ship a fake one.

## The integration seam (where a real facilitator plugs in)

All payment behavior lives behind a single interface — the seam:

```ts
// agent/x402/src/facilitator.ts
export interface Facilitator {
  readonly mode: FacilitatorMode; // "mock" | "casper"
  verifyPayment(payment, requirements): Promise<PaymentVerification>;
  settlePayment(payment, requirements): Promise<Settlement>;
}
```

The server depends only on this interface and accepts an injected instance:

```ts
// agent/x402/src/server.ts
const facilitator = options.facilitator ?? new MockFacilitator();
```

To go real, swapping the mock is **one implementation** of `Facilitator` — no
changes to `server.ts`:

1. Add `class CasperFacilitator implements Facilitator` in its own file
   (e.g. `src/casper-facilitator.ts`).
   - `verifyPayment`: verify the x402 payment for real (network, asset, amount,
     nonce, signature) via the real Casper facilitator / on-chain checks.
   - `settlePayment`: settle for real and return the real `txHash`.
2. Inject it:
   ```ts
   createLastroX402Server({ facilitator: new CasperFacilitator(/* ... */) });
   ```

The exact `TODO(casper-facilitator)` markers are in:
- `src/facilitator.ts` — on the `Facilitator` interface ("INTEGRATION SEAM").
- `src/server.ts` — at the default `new MockFacilitator()` instantiation.

`mode` lets callers detect at runtime which implementation is active
(`MockFacilitator.mode === "mock"`).

## Run

```bash
npm run build
npm test
```

All sample data is fictional.
