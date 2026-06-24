import { createHash } from "node:crypto";

/** Campos x402 que o servidor entrega no HTTP 402 Payment Required. */
export type PaymentRequirements = {
  scheme: "exact";
  network: "casper-test";
  maxAmountRequired: number;
  asset: "CSPR";
  payTo: string;
  resource: "/verify";
  nonce: string;
  description: "Lastro provenance verification";
};

/** Payload mock enviado pelo cliente no header X-PAYMENT. */
export type PaymentPayload = {
  nonce: string;
  amount: number;
  from: string;
  sig: string;
};

export type PaymentVerification =
  | { ok: true }
  | { ok: false; reason: "nonce_mismatch" | "amount_insufficient" | "bad_signature" | "nonce_replayed" };

export type Settlement = {
  txHash: string;
};

/**
 * Interface que espelha o papel de um facilitator x402.
 *
 * No Bloco 4a, usamos `MockFacilitator`. No Bloco 4b, um facilitator Casper
 * real poderá implementar os mesmos dois métodos sem reescrever o servidor.
 */
export interface Facilitator {
  verifyPayment(
    payment: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<PaymentVerification>;

  settlePayment(payment: PaymentPayload, requirements: PaymentRequirements): Promise<Settlement>;
}

export const MOCK_PAYMENT_SECRET = "lastro-local-x402-mock-secret";

/** Facilitator local: sem rede, sem Casper, determinístico e com proteção anti-replay. */
export class MockFacilitator implements Facilitator {
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
      txHash: createHash("sha256")
        .update(
          [
            "lastro-x402-settlement",
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
    .update(["lastro-x402-payment", input.nonce, input.amount.toString(), input.from, MOCK_PAYMENT_SECRET].join("|"))
    .digest("hex");
}

export function encodePaymentPayload(payload: PaymentPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodePaymentHeader(headerValue: string): PaymentPayload | null {
  try {
    const raw = Buffer.from(headerValue, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as Partial<PaymentPayload>;

    if (
      typeof parsed.nonce !== "string" ||
      typeof parsed.amount !== "number" ||
      typeof parsed.from !== "string" ||
      typeof parsed.sig !== "string"
    ) {
      return null;
    }

    return {
      nonce: parsed.nonce,
      amount: parsed.amount,
      from: parsed.from,
      sig: parsed.sig,
    };
  } catch {
    return null;
  }
}

/** Helper de teste/demo: cria o X-PAYMENT que um cliente mock enviaria. */
export function createMockPaymentHeader(
  requirements: PaymentRequirements,
  options: { from?: string; amount?: number } = {},
): string {
  const amount = options.amount ?? requirements.maxAmountRequired;
  const from = options.from ?? "lastro-consumer-mock";
  const payload: PaymentPayload = {
    nonce: requirements.nonce,
    amount,
    from,
    sig: signMockPayment({ nonce: requirements.nonce, amount, from }),
  };

  return encodePaymentPayload(payload);
}
