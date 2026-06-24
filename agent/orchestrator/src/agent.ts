import type { ProvenanceArtifact } from "../../sealer/dist/src/sealer.js";
import type {
  AuditRecord,
  BatchResult,
  Decider,
  KnownLimits,
  OriginChain,
  Outcome,
  VerificationGateway,
} from "./types.js";
import { DEFAULT_LIMITS } from "./types.js";

/** Orquestrador Lastro: decide ação, paga/verifica quando necessário e registra na chain mock. */
export class Agent {
  private readonly auditLog: AuditRecord[] = [];

  constructor(
    private readonly decider: Decider,
    private readonly gateway: VerificationGateway,
    private readonly originChain: OriginChain,
    private readonly limits: KnownLimits = DEFAULT_LIMITS,
  ) {}

  async processLot(artifact: ProvenanceArtifact): Promise<AuditRecord> {
    const alreadyAttested = this.originChain.isAttested(artifact.assetId);
    const decision = await this.decider.decide({
      artifact,
      alreadyAttested,
      limits: this.limits,
    });

    if (decision.action === "skip" || decision.action === "escalate") {
      const record: AuditRecord = {
        assetId: artifact.assetId,
        decision,
        verification: null,
        onChain: null,
        outcome: decision.action === "skip" ? "skipped" : "escalated",
      };
      this.auditLog.push(record);
      return record;
    }

    const verification = await this.gateway.verifyAndSettle(artifact.assetId, artifact);
    const onChainResult = this.originChain.attest(artifact.assetId, verification.seal);
    const outcome: Outcome = verification.verdict === "Valid" ? "tokenizable" : "rejected";

    const record: AuditRecord = {
      assetId: artifact.assetId,
      decision,
      verification,
      onChain: {
        verdict: onChainResult.verdict,
        txHash: verification.txHash,
      },
      outcome,
    };

    this.auditLog.push(record);
    return record;
  }

  async processBatch(artifacts: ProvenanceArtifact[]): Promise<BatchResult> {
    const records: AuditRecord[] = [];

    for (const artifact of artifacts) {
      records.push(await this.processLot(artifact));
    }

    return {
      records,
      summary: {
        tokenizable: countOutcome(records, "tokenizable"),
        rejected: countOutcome(records, "rejected"),
        skipped: countOutcome(records, "skipped"),
        escalated: countOutcome(records, "escalated"),
        onChainAccepted: this.originChain.acceptedCount(),
        onChainRejected: this.originChain.rejectedCount(),
      },
    };
  }

  getAuditLog(): AuditRecord[] {
    return [...this.auditLog];
  }
}

function countOutcome(records: AuditRecord[], outcome: Outcome): number {
  return records.filter((record) => record.outcome === outcome).length;
}
