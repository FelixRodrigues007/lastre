import { createHash } from "node:crypto";

/** x402 fields returned by the server in the HTTP 402 Payment Required response. */
export type PaymentRequirements = {
  scheme: "exact";
  /** Legacy short form (`casper-test`) or CAIP-2 (`casper:casper-test`). */
  network: "casper-test" | "casper:casper-test" | "casper:casper" | string;
  maxAmountRequired: number;
  /** Native CSPR label, or CEP-18 package hash (WCSPR). */
  asset: "CSPR" | "WCSPR" | string;
  payTo: string;
  resource: "/verify" | string;
  nonce: string;
  description: string;
  /** Present when LASTRE_X402_MODE=cspr_cloud — official MAKE quote metadata. */
  cloud?: import("./cspr-cloud-types.js").CloudQuoteMeta;
};

/** Mock payload sent by the client in the X-PAYMENT header. */
export type PaymentPayload = {
  nonce: string;
  amount: number;
  from: string;
  sig: string;
  /**
   * Optional official CSPR.cloud body (EIP-712). Required for
   * CsprCloudFacilitator settle; ignored by Mock/Casper facilitators.
   */
  cloud?: {
    paymentPayload: import("./cspr-cloud-types.js").CloudPaymentPayload;
    paymentRequirements: import("./cspr-cloud-types.js").CloudPaymentRequirements;
  };
};

export type PaymentVerification =
  | { ok: true }
  | { ok: false; reason: "nonce_mismatch" | "amount_insufficient" | "bad_signature" | "nonce_replayed" };

export type Settlement = {
  /** Settlement receipt hash (synthetic for mock; real deploy hash for casper mode). */
  txHash: string;
  /**
   * - synthetic_receipt: local facilitator receipt (judge demo; no CSPR moved)
   * - casper_deploy: reserved for a real on-chain payment deploy
   */
  kind: "synthetic_receipt" | "casper_deploy";
};

/**
 * Identifies which facilitator implementation is active.
 *
 * - `"mock"`       — deterministic local facilitator (no network, no Casper).
 * - `"casper"`     — CasperFacilitator (real testnet native CSPR via casper-client).
 * - `"cspr_cloud"` — CsprCloudFacilitator (official WCSPR + CSPR.cloud verify/settle).
 *
 * Select via createFacilitatorFromEnv() / LASTRE_X402_MODE=mock|casper|cspr_cloud.
 */
export type FacilitatorMode = "mock" | "casper" | "cspr_cloud";

/**
 * x402 payment seam (the single replacement point).
 *
 * Implementations:
 * - `MockFacilitator` — local synthetic_receipt (judge demo default)
 * - `CasperFacilitator` — real casper-client native CSPR transfer (LASTRE_X402_MODE=casper)
 * - `CsprCloudFacilitator` — CSPR.cloud + WCSPR EIP-712 (LASTRE_X402_MODE=cspr_cloud)
 *
 * Inject with createLastroX402Server({ facilitator }) or createFacilitatorFromEnv().
 */
export interface Facilitator {
  /** Implementation label. `MockFacilitator` returns `"mock"`. */
  readonly mode: FacilitatorMode;

  verifyPayment(
    payment: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<PaymentVerification>;

  settlePayment(payment: PaymentPayload, requirements: PaymentRequirements): Promise<Settlement>;
}

/**
 * MOCK secret. This is not a real key: it only lets the mock sign/validate the
 * X-PAYMENT header locally and deterministically.
 */
export const MOCK_PAYMENT_SECRET = "lastre-local-x402-mock-secret";

/**
 * ============================ MOCK ============================
 * MockFacilitator — FAKE FACILITATOR implementation (MOCK).
 *
 * It does NOT talk to Casper and does NOT move CSPR. It is a deterministic
 * local stand-in with anti-replay protection, used to exercise the x402 flow
 * (402 -> payment -> verification) without network access.
 *
 * `verifyPayment` validates a local SHA-256 mock signature (not an on-chain
 * signature), and `settlePayment` returns a synthetic SHA-256 txHash (not a
 * real transaction).
 *
 * For production, do NOT edit this class: create a new `Facilitator`
 * implementation (see "INTEGRATION SEAM" above) and inject it into the server.
 * =============================================================
 */
export class MockFacilitator implements Facilitator {
  /** Explicit label: this implementation is a MOCK. */
  readonly mode: FacilitatorMode = "mock";

  private readonly settledNonces = new Set<string>();

  async verifyPayment(
    payment: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<PaymentVerification> {
    if (this.settledNonces.has(payment.nonce)) {
      return { ok: false, reason: "nonce_replayed" };
    }

    if (payment.nonce !== requirements.nonce) {
      return { ok: false, reason: "nonce_mismatch" };
    }

    if (payment.amount < requirements.maxAmountRequired) {
      return { ok: false, reason: "amount_insufficient" };
    }

    const expectedSig = signMockPayment({
      nonce: payment.nonce,
      amount: payment.amount,
      from: payment.from,
    });

    if (payment.sig !== expectedSig) {
      return { ok: false, reason: "bad_signature" };
    }

    return { ok: true };
  }

  async settlePayment(
    payment: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<Settlement> {
    this.settledNonces.add(payment.nonce);

    return {
      kind: "synthetic_receipt",
      txHash: createHash("sha256")
        .update(
          [
            "lastre-x402-settlement",
            requirements.network,
            requirements.resource,
            requirements.payTo,
            payment.nonce,
            payment.amount.toString(),
            payment.from,
          ].join("|"),
        )
        .digest("hex"),
    };
  }
}

export function signMockPayment(input: { nonce: string; amount: number; from: string }): string {
  return createHash("sha256")
    .update(["lastre-x402-payment", input.nonce, input.amount.toString(), input.from, MOCK_PAYMENT_SECRET].join("|"))
    .digest("hex");
}

export function encodePaymentPayload(payload: PaymentPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodePaymentHeader(headerValue: string): PaymentPayload | null {
  try {
    const raw = Buffer.from(headerValue, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as Partial<PaymentPayload> & {
      cloud?: PaymentPayload["cloud"];
    };

    if (
      typeof parsed.nonce !== "string" ||
      typeof parsed.amount !== "number" ||
      typeof parsed.from !== "string" ||
      typeof parsed.sig !== "string"
    ) {
      return null;
    }

    const out: PaymentPayload = {
      nonce: parsed.nonce,
      amount: parsed.amount,
      from: parsed.from,
      sig: parsed.sig,
    };
    if (parsed.cloud?.paymentPayload && parsed.cloud?.paymentRequirements) {
      out.cloud = parsed.cloud;
    }
    return out;
  } catch {
    return null;
  }
}

/** Test/demo helper: creates the X-PAYMENT header that a mock client would send. */
export function createMockPaymentHeader(
  requirements: PaymentRequirements,
  options: { from?: string; amount?: number } = {},
): string {
  const amount = options.amount ?? requirements.maxAmountRequired;
  const from = options.from ?? "lastre-consumer-mock";
  const payload: PaymentPayload = {
    nonce: requirements.nonce,
    amount,
    from,
    sig: signMockPayment({ nonce: requirements.nonce, amount, from }),
  };

  return encodePaymentPayload(payload);
}
