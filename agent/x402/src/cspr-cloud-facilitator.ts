/**
 * CsprCloudFacilitator — official MAKE / CSPR.cloud x402 path.
 *
 * Uses WCSPR (CEP-18) via:
 *   GET  https://x402-facilitator.cspr.cloud/supported
 *   POST https://x402-facilitator.cspr.cloud/verify
 *   POST https://x402-facilitator.cspr.cloud/settle
 *
 * Docs: https://docs.cspr.cloud/x402-facilitator-api/reference
 * Examples: https://github.com/make-software/casper-x402
 *
 * Honesty:
 * - Requires a full EIP-712 PaymentPayload (cloud body) — mock X-PAYMENT alone cannot settle.
 * - Judge UI /simulate remains MockFacilitator.
 * - Native CSPR path remains CasperFacilitator (LASTRE_X402_MODE=casper).
 */

import {
  type Facilitator,
  type FacilitatorMode,
  type PaymentPayload,
  type PaymentRequirements,
  type PaymentVerification,
  type Settlement,
} from "./facilitator.js";
import {
  buildCloudQuoteMeta,
  cloudRequirementsFromMeta,
  CSPR_CLOUD_FACILITATOR_URL,
  type CloudPaymentPayload,
  type CloudPaymentRequirements,
  type CloudSettleResponse,
  type CloudSupportedResponse,
  type CloudVerifyRequest,
  type CloudVerifyResponse,
  type CloudQuoteMeta,
  WCSPR_TESTNET_PACKAGE_HASH,
} from "./cspr-cloud-types.js";

export type CsprCloudFacilitatorOptions = {
  /** CSPR.cloud API access token (Authorization header). */
  apiToken: string;
  /** Payee account hash `00` + 64 hex (receives WCSPR). */
  payTo: string;
  /** Optional override of facilitator base URL. */
  facilitatorUrl?: string;
  /** WCSPR / CEP-18 package hash (64 hex, no hash- prefix). */
  assetPackage?: string;
  /** Amount in token base units (string decimal). Default 1e9 (1 WCSPR @ 9 decimals). */
  amountBaseUnits?: string;
  network?: "casper:casper-test" | "casper:casper";
  /** Injectable fetch for tests. */
  fetchImpl?: typeof fetch;
};

export class CsprCloudFacilitator implements Facilitator {
  readonly mode: FacilitatorMode = "cspr_cloud";

  private readonly apiToken: string;
  private readonly payTo: string;
  private readonly facilitatorUrl: string;
  private readonly assetPackage: string;
  private readonly amountBaseUnits: string;
  private readonly network: "casper:casper-test" | "casper:casper";
  private readonly fetchImpl: typeof fetch;
  private readonly settledNonces = new Set<string>();

  constructor(options: CsprCloudFacilitatorOptions) {
    if (!options.apiToken?.trim()) {
      throw new Error("CsprCloudFacilitator: apiToken (CSPR.cloud access token) is required");
    }
    if (!options.payTo?.trim()) {
      throw new Error("CsprCloudFacilitator: payTo account hash is required");
    }
    this.apiToken = options.apiToken.trim();
    this.payTo = options.payTo.trim();
    this.facilitatorUrl = (options.facilitatorUrl ?? CSPR_CLOUD_FACILITATOR_URL).replace(/\/+$/, "");
    this.assetPackage = (options.assetPackage ?? WCSPR_TESTNET_PACKAGE_HASH).replace(/^hash-/, "");
    this.amountBaseUnits = options.amountBaseUnits ?? "1000000000";
    this.network = options.network ?? "casper:casper-test";
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Product metadata for 402 quotes / evidence / health. */
  getQuoteMeta(): CloudQuoteMeta {
    return buildCloudQuoteMeta({
      payTo: this.payTo,
      amountBaseUnits: this.amountBaseUnits,
      network: this.network,
      assetPackage: this.assetPackage,
    });
  }

  getCloudPaymentRequirements(): CloudPaymentRequirements {
    return cloudRequirementsFromMeta(this.getQuoteMeta());
  }

  async getSupported(): Promise<CloudSupportedResponse> {
    const res = await this.fetchImpl(`${this.facilitatorUrl}/supported`, {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: this.apiToken,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `CSPR.cloud /supported HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`,
      );
    }
    return (await res.json()) as CloudSupportedResponse;
  }

  async verifyCloud(body: CloudVerifyRequest): Promise<CloudVerifyResponse> {
    const res = await this.fetchImpl(`${this.facilitatorUrl}/verify`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: this.apiToken,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `CSPR.cloud /verify HTTP ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
      );
    }
    return (await res.json()) as CloudVerifyResponse;
  }

  async settleCloud(body: CloudVerifyRequest): Promise<CloudSettleResponse> {
    const res = await this.fetchImpl(`${this.facilitatorUrl}/settle`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: this.apiToken,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `CSPR.cloud /settle HTTP ${res.status}${text ? `: ${text.slice(0, 300)}` : ""}`,
      );
    }
    return (await res.json()) as CloudSettleResponse;
  }

  /**
   * Facilitator interface — accepts Lastre X-PAYMENT with optional `cloud` body.
   * Without `payment.cloud`, verification fails with a clear reason (need EIP-712).
   */
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

    const cloud = payment.cloud;
    if (!cloud?.paymentPayload || !cloud?.paymentRequirements) {
      return { ok: false, reason: "bad_signature" };
    }

    try {
      const result = await this.verifyCloud({
        paymentPayload: cloud.paymentPayload,
        paymentRequirements: cloud.paymentRequirements,
      });
      if (!result.isValid) {
        return { ok: false, reason: "bad_signature" };
      }
      return { ok: true };
    } catch {
      return { ok: false, reason: "bad_signature" };
    }
  }

  async settlePayment(
    payment: PaymentPayload,
    _requirements: PaymentRequirements,
  ): Promise<Settlement> {
    const cloud = payment.cloud;
    if (!cloud?.paymentPayload || !cloud?.paymentRequirements) {
      throw new Error(
        "CsprCloudFacilitator: settle requires payment.cloud with EIP-712 paymentPayload " +
          "(see make-software/casper-x402). Mock X-PAYMENT cannot settle WCSPR.",
      );
    }

    const result = await this.settleCloud({
      paymentPayload: cloud.paymentPayload,
      paymentRequirements: cloud.paymentRequirements,
    });

    if (!result.success || !result.transaction) {
      throw new Error(
        `CSPR.cloud settle failed: ${result.errorReason ?? "unknown"} — ${result.errorMessage ?? ""}`.trim(),
      );
    }

    this.settledNonces.add(payment.nonce);
    return {
      kind: "casper_deploy",
      txHash: result.transaction.toLowerCase().replace(/^0x/, ""),
    };
  }

  /**
   * Direct settle when the client already built the official body
   * (resource server / agent with @make-software/casper-x402).
   */
  async settleOfficial(body: CloudVerifyRequest): Promise<{
    ok: true;
    txHash: string;
    network: string;
    payer: string;
    settlementKind: "casper_deploy";
  } | {
    ok: false;
    reason: string;
    message?: string;
  }> {
    try {
      const verified = await this.verifyCloud(body);
      if (!verified.isValid) {
        return {
          ok: false,
          reason: verified.invalidReason ?? "verification_failed",
          message: verified.invalidMessage,
        };
      }
      const settled = await this.settleCloud(body);
      if (!settled.success || !settled.transaction) {
        return {
          ok: false,
          reason: settled.errorReason ?? "settle_failed",
          message: settled.errorMessage,
        };
      }
      const txHash = settled.transaction.toLowerCase().replace(/^0x/, "");
      this.settledNonces.add(body.paymentPayload.payload.authorization.nonce);
      return {
        ok: true,
        txHash,
        network: settled.network,
        payer: settled.payer,
        settlementKind: "casper_deploy",
      };
    } catch (error) {
      return {
        ok: false,
        reason: "settle_error",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

/** Type guard: payment carries official cloud body. */
export function hasCloudPaymentBody(
  payment: PaymentPayload,
): payment is PaymentPayload & {
  cloud: {
    paymentPayload: CloudPaymentPayload;
    paymentRequirements: CloudPaymentRequirements;
  };
} {
  return Boolean(
    payment.cloud?.paymentPayload?.x402Version === 2 &&
      payment.cloud?.paymentRequirements?.asset,
  );
}
