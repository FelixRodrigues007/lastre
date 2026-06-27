import { Agent } from "../../agent/orchestrator/dist/agent.js";
import { LlmDecider, RuleDecider } from "../../agent/orchestrator/dist/decider.js";
import { LocalGateway } from "../../agent/orchestrator/dist/gateway.js";
import { createOriginChainWithReferences } from "../../agent/orchestrator/dist/origin_chain.js";
import {
  createDemoArtifacts,
  createDemoReferenceArtifacts,
} from "../../agent/orchestrator/dist/samples.js";
import type {
  AuditRecord,
  BatchResult,
  VerificationVerdict,
} from "../../agent/orchestrator/dist/types.js";
import { DEFAULT_LIMITS } from "../../agent/orchestrator/dist/types.js";
import type { LiveTestnetSnapshot } from "./casper-read.js";
import { getLiveTestnetSnapshot, getTestnetAttestation } from "./casper-read.js";
import type { ProvenanceArtifact } from "../../agent/sealer/dist/src/sealer.js";
import { computeSeal } from "../../agent/sealer/dist/src/sealer.js";

import { PACKAGE_HASH, PACKAGE_URL } from "./constants.js";

export type DeciderMode = "rule" | "llm";

export type LotListItem = {
  artifact: ProvenanceArtifact;
  referenceSeal: string | null;
  computedSeal: string;
  sealMatchesReference: boolean | null;
  attested: boolean;
  latestVerdict: VerificationVerdict | null;
  demoRole: string;
  auditRecord: AuditRecord | null;
};

export type AuditExport = {
  exportedAt: string;
  records: AuditRecord[];
  lastBatch: BatchResult | null;
  summary: AuditSummary;
};

export type AppSettings = {
  decider: DeciderMode;
  limits: typeof DEFAULT_LIMITS;
  persistence: "session";
  llmConfigured: boolean;
};

export type ChainSummary = {
  packageHash: string;
  packageUrl: string;
  network: "casper-test";
  session: { accepted: number; rejected: number };
  testnet: LiveTestnetSnapshot;
};

export type AuditSummary = {
  total: number;
  tokenizable: number;
  rejected: number;
  skipped: number;
  escalated: number;
};

const DEMO_CATALOG: Array<{ key: keyof ReturnType<typeof createDemoArtifacts>; role: string }> = [
  { key: "valid", role: "Genuine lot · expected Valid" },
  { key: "tampered", role: "Tampered mass · expected Invalid" },
  { key: "outOfRegion", role: "Geo outside perimeter · expected escalate" },
];

const DEFAULT_BATCH_KEYS: Array<keyof ReturnType<typeof createDemoArtifacts>> = [
  "valid",
  "tampered",
  "validDuplicate",
  "outOfRegion",
];

export class AppRuntime {
  private readonly referenceArtifacts = createDemoReferenceArtifacts();
  private readonly demoArtifacts = createDemoArtifacts();
  private readonly originChain = createOriginChainWithReferences(this.referenceArtifacts);
  private readonly gateway = new LocalGateway(this.referenceArtifacts);
  private auditLog: AuditRecord[] = [];
  private deciderMode: DeciderMode = "rule";
  private lastBatch: BatchResult | null = null;

  getDeciderMode(): DeciderMode {
    return this.deciderMode;
  }

  setDeciderMode(mode: DeciderMode): void {
    this.deciderMode = mode;
  }

  getSessionChainSummary(): Omit<ChainSummary, "testnet"> {
    return {
      packageHash: PACKAGE_HASH,
      packageUrl: PACKAGE_URL,
      network: "casper-test",
      session: {
        accepted: this.originChain.acceptedCount(),
        rejected: this.originChain.rejectedCount(),
      },
    };
  }

  async getChainSummary(): Promise<ChainSummary> {
    const testnet = await getLiveTestnetSnapshot();
    return {
      ...this.getSessionChainSummary(),
      testnet,
    };
  }

  async getTestnetAttestationForAsset(assetId: string) {
    const testnet = await getLiveTestnetSnapshot();
    return getTestnetAttestation(testnet, assetId);
  }

  getAuditSummary(): AuditSummary {
    const records = this.auditLog;
    return {
      total: records.length,
      tokenizable: records.filter((r) => r.outcome === "tokenizable").length,
      rejected: records.filter((r) => r.outcome === "rejected").length,
      skipped: records.filter((r) => r.outcome === "skipped").length,
      escalated: records.filter((r) => r.outcome === "escalated").length,
    };
  }

  getLastBatch(): BatchResult | null {
    return this.lastBatch;
  }

  listLots(): LotListItem[] {
    return DEMO_CATALOG.map(({ key, role }) =>
      this.buildLotItem(this.demoArtifacts[key], role),
    );
  }

  getLot(assetId: string): LotListItem | null {
    for (const { key, role } of DEMO_CATALOG) {
      const artifact = this.demoArtifacts[key];
      if (artifact.assetId === assetId) {
        return this.buildLotItem(artifact, role);
      }
    }
    return null;
  }

  private buildLotItem(artifact: ProvenanceArtifact, demoRole: string): LotListItem {
    const referenceSeal = this.gateway.getReferenceSeal(artifact.assetId) ?? null;
    const computedSeal = computeSeal(artifact);
    const auditRecord = this.getLatestAuditRecord(artifact.assetId);

    return {
      artifact,
      referenceSeal,
      computedSeal,
      sealMatchesReference: referenceSeal ? computedSeal === referenceSeal : null,
      attested: this.originChain.isAttested(artifact.assetId),
      latestVerdict:
        auditRecord?.verification?.verdict ?? auditRecord?.onChain?.verdict ?? null,
      demoRole,
      auditRecord,
    };
  }

  private getLatestAuditRecord(assetId: string): AuditRecord | null {
    for (let i = this.auditLog.length - 1; i >= 0; i -= 1) {
      if (this.auditLog[i].assetId === assetId) {
        return this.auditLog[i];
      }
    }
    return null;
  }

  listAudit(): AuditRecord[] {
    return [...this.auditLog];
  }

  getAuditRecord(assetId: string): AuditRecord | null {
    return this.getLatestAuditRecord(assetId);
  }

  exportAudit(): AuditExport {
    return {
      exportedAt: new Date().toISOString(),
      records: this.listAudit(),
      lastBatch: this.lastBatch,
      summary: this.getAuditSummary(),
    };
  }

  getSettings(): AppSettings {
    return {
      decider: this.deciderMode,
      limits: DEFAULT_LIMITS,
      persistence: "session",
      llmConfigured: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
    };
  }

  listEscalations(): AuditRecord[] {
    return this.auditLog.filter((record) => record.outcome === "escalated");
  }

  getDefaultBatchAssetIds(): string[] {
    return DEFAULT_BATCH_KEYS.map((key) => this.demoArtifacts[key].assetId);
  }

  async processBatch(
    assetIds: string[],
    deciderMode: DeciderMode = this.deciderMode,
  ): Promise<BatchResult> {
    this.deciderMode = deciderMode;

    const artifacts = assetIds.map((assetId) => this.resolveArtifact(assetId));
    const agent = new Agent(this.createDecider(deciderMode), this.gateway, this.originChain);
    const result = await agent.processBatch(artifacts);

    this.auditLog.push(...result.records);
    this.lastBatch = result;

    return result;
  }

  private resolveArtifact(assetId: string): ProvenanceArtifact {
    for (const key of DEFAULT_BATCH_KEYS) {
      const artifact = this.demoArtifacts[key];
      if (artifact.assetId === assetId) {
        return structuredClone(artifact);
      }
    }

    const lot = this.getLot(assetId);
    if (lot) {
      return structuredClone(lot.artifact);
    }

    throw new Error(`Unknown assetId: ${assetId}`);
  }

  private createDecider(mode: DeciderMode) {
    return mode === "llm" ? new LlmDecider() : new RuleDecider();
  }
}

/** Exposed for lot detail seal preview without processing. */
export function computeArtifactSeal(artifact: ProvenanceArtifact): string {
  return computeSeal(artifact);
}
