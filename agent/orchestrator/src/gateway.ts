import type { ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import { computeSeal, verifySeal } from "../../sealer/dist/src/sealer.js";
import {
  createMockPaymentHeader,
  decodePaymentHeader,
  DEFAULT_PAYMENT_REQUIREMENTS,
  MockFacilitator,
  type Facilitator,
  type PaymentRequirements,
} from "../../x402/dist/index.js";
import type { VerificationGateway, VerificationResult } from "./types.js";

/**
 * Local paid-verification gateway.
 *
 * It simulates the x402 flow with MockFacilitator and, after payment, decides
 * the verdict exclusively by comparing the recomputed seal with referenceSeal.
 */
export class LocalGateway implements VerificationGateway {
  private readonly referenceSeals = new Map<string, string>();
  private readonly facilitator: Facilitator;
  private payments = 0;

  constructor(referenceArtifacts: ProvenanceArtifact[], facilitator: Facilitator = new MockFacilitator()) {
    this.facilitator = facilitator;

    for (const artifact of referenceArtifacts) {
      this.referenceSeals.set(artifact.assetId, computeSeal(artifact));
    }
  }

  async verifyAndSettle(assetId: string, artifact: ProvenanceArtifact): Promise<VerificationResult> {
    const referenceSeal = this.referenceSeals.get(assetId);
    if (!referenceSeal) {
      throw new Error(`Reference seal não encontrado para assetId ${assetId}`);
    }

    const requirements = this.createPaymentRequirements(assetId);
    const paymentHeader = createMockPaymentHeader(requirements, { from: "lastro-orchestrator" });
    const payment = decodePaymentHeader(paymentHeader);

    if (!payment) {
      throw new Error("Falha ao montar pagamento mock x402.");
    }

    const paymentVerification = await this.facilitator.verifyPayment(payment, requirements);
    if (!paymentVerification.ok) {
      throw new Error(`Pagamento mock x402 rejeitado: ${paymentVerification.reason}`);
    }

    const settlement = await this.facilitator.settlePayment(payment, requirements);
    this.payments += 1;

    const seal = computeSeal(artifact);
    const verdict = verifySeal(artifact, referenceSeal) ? "Valid" : "Invalid";

    return {
      verdict,
      seal,
      referenceSeal,
      txHash: settlement.txHash,
    };
  }

  /** Helps tests prove that skip/escalate decisions do not pay. */
  paymentCount(): number {
    return this.payments;
  }

  getReferenceSeal(assetId: string): string | undefined {
    return this.referenceSeals.get(assetId);
  }

  private createPaymentRequirements(assetId: string): PaymentRequirements {
    return {
      ...DEFAULT_PAYMENT_REQUIREMENTS,
      nonce: `orchestrator-local-${this.payments + 1}-${assetId}`,
    };
  }
}
