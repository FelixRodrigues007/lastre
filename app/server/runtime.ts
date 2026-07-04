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
import { randomUUID } from "node:crypto";
import {
  DEFAULT_PAYMENT_REQUIREMENTS,
  MockFacilitator,
  signMockPayment,
  type PaymentPayload,
  type PaymentRequirements,
} from "../../agent/x402/dist/index.js";

export type DeciderMode = "rule" | "llm";

export type LotListItem = {
  artifact: ProvenanceArtifact;
  referenceArtifact: ProvenanceArtifact | null;
  referenceSeal: string | null;
  computedSeal: string;
  sealMatchesReference: boolean | null;
  attested: boolean;
  latestVerdict: VerificationVerdict | null;
  demoRole: string;
  auditRecord: AuditRecord | null;
  isMinted: boolean;
  mintTx: string | null;
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

export type EscalationResolutionAction = "requeued" | "discarded" | "overridden";

export type EscalationActionResult = {
  assetId: string;
  action: EscalationResolutionAction;
  record: AuditRecord;
  previousReasoning: string | null;
  /** True when re-queue/reprocess produced another escalation. */
  requeuedEscalated: boolean;
};

const DEMO_CATALOG: Array<{ key: keyof ReturnType<typeof createDemoArtifacts>; role: string }> = [
  { key: "valid", role: "Genuine lot · expected Valid" },
  { key: "tampered", role: "Tampered mass · expected Invalid" },
  { key: "outOfRegion", role: "Geo outside perimeter · expected escalate" },
  { key: "carbonValid", role: "Carbon credit (VCS REDD+) · expected Valid" },
];

const DEFAULT_BATCH_KEYS: Array<keyof ReturnType<typeof createDemoArtifacts>> = [
  "valid",
  "carbonValid",
  "tampered",
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
  /** Asset IDs awaiting human review in the escalation queue. */
  private pendingEscalations = new Set<string>();

  // User-submitted artifacts (from app upload/camera flows)
  private userArtifacts: ProvenanceArtifact[] = [];

  // Minted state (simulates MintGate.is_minted + on-chain record)
  private mintedAssets = new Set<string>();
  private mintTxs = new Map<string, string>(); // assetId -> tx hash (demo)

  // Simulated on-chain LotMinted events (mirrors the Odra MintGate LotMinted event).
  private lotMintedEvents: Array<{ assetId: string; minter: string; mintTx: string; at: string }> = [];

  // x402 provenance provider (DEMO): agents pay via x402 to query a proof before
  // acting. Reuses the real MockFacilitator seam (HMAC sig + nonce anti-replay +
  // synthetic settlement tx). Not a real Casper settlement.
  private readonly x402Facilitator = new MockFacilitator();
  private readonly x402Issued = new Map<string, PaymentRequirements>();
  private x402QueryCount = 0;

  getDeciderMode(): DeciderMode {
    return this.deciderMode;
  }

  /** Pre-populates audit, chain, escalations, and mints for a complete demo session. */
  async seedDemoSessionIfEmpty(): Promise<void> {
    if (this.auditLog.length > 0) return;

    const assetIds = this.getDefaultBatchAssetIds();
    await this.processBatch(assetIds, "rule");

    for (const record of this.auditLog) {
      if (record.outcome === "tokenizable") {
        this.mintAsset(record.assetId);
      }
    }
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
    const demoItems = DEMO_CATALOG.flatMap(({ key, role }) => {
      const artifact = this.demoArtifacts[key];
      if (!artifact) return [];
      return [this.buildLotItem(artifact, role)];
    });
    const userItems = this.userArtifacts
      .filter((artifact) => artifact?.assetId)
      .map((artifact) =>
        this.buildLotItem(
          artifact,
          `User submitted · ${artifact.category === "carbon_credit" ? "Carbon Credit" : "Mineral"}`,
        ),
      );
    return [...demoItems, ...userItems];
  }

  getLot(assetId: string): LotListItem | null {
    for (const { key, role } of DEMO_CATALOG) {
      const artifact = this.demoArtifacts[key];
      if (!artifact) continue;
      if (artifact.assetId === assetId) {
        return this.buildLotItem(artifact, role);
      }
    }
    const userMatch = this.userArtifacts.find((a) => a.assetId === assetId);
    if (userMatch) {
      return this.buildLotItem(userMatch, "User submitted");
    }
    return null;
  }

  addArtifact(artifact: ProvenanceArtifact): void {
    // Prevent duplicates by assetId
    this.userArtifacts = this.userArtifacts.filter((a) => a.assetId !== artifact.assetId);
    this.userArtifacts.push(artifact);
  }

  getAllArtifacts(): ProvenanceArtifact[] {
    const demo = Object.values(this.demoArtifacts) as ProvenanceArtifact[];
    return [...demo, ...this.userArtifacts];
  }

  mintAsset(assetId: string, minter = "demo-minter"): { success: boolean; txHash?: string; error?: string } {
    if (this.mintedAssets.has(assetId)) {
      return { success: false, error: "Already minted" };
    }

    // Require explicit Valid verdict from agent + attestation for mint (demo of Proof before token + MintGate gate)
    const lot = this.getLot(assetId);
    const hasValidProof = lot?.latestVerdict === "Valid";

    if (!hasValidProof) {
      return { success: false, error: "No Valid proof (must process through agent first)" };
    }

    this.mintedAssets.add(assetId);
    const txHash = `mint-${Date.now().toString(16)}-${assetId.slice(-6)}`;
    this.mintTxs.set(assetId, txHash);

    // Mirror the on-chain MintGate LotMinted event (DEMO / simulated).
    this.lotMintedEvents.unshift({ assetId, minter, mintTx: txHash, at: new Date().toISOString() });

    return { success: true, txHash };
  }

  isMinted(assetId: string): boolean {
    return this.mintedAssets.has(assetId);
  }

  getMintTx(assetId: string): string | null {
    return this.mintTxs.get(assetId) ?? null;
  }

  /** Simulated MintGate LotMinted events + counters (mirrors on-chain reads). */
  getMintSummary() {
    return {
      mintCount: this.mintedAssets.size,
      packageHash: PACKAGE_HASH,
      packageUrl: PACKAGE_URL,
      events: this.lotMintedEvents.slice(0, 20),
    };
  }

  // Simple DeFi collateral simulation (checks minted + proof)
  private lockedCollateral = new Map<string, { owner: string; lockedAt: string }>();

  lockCollateral(assetId: string, owner: string): { success: boolean; error?: string } {
    if (!this.isMinted(assetId)) {
      return { success: false, error: "Asset must be minted first" };
    }
    const lot = this.getLot(assetId);
    if (!lot || lot.latestVerdict !== "Valid") {
      return { success: false, error: "Only Valid proven assets can be used as collateral" };
    }
    if (this.lockedCollateral.has(assetId)) {
      return { success: false, error: "Already locked" };
    }
    this.lockedCollateral.set(assetId, { owner, lockedAt: new Date().toISOString() });
    return { success: true };
  }

  releaseCollateral(assetId: string, owner: string): { success: boolean; error?: string } {
    const lock = this.lockedCollateral.get(assetId);
    if (!lock || lock.owner !== owner) {
      return { success: false, error: "Not locked by you" };
    }
    this.lockedCollateral.delete(assetId);
    return { success: true };
  }

  getLockedStatus(assetId: string) {
    return this.lockedCollateral.get(assetId) || null;
  }

  listLockedBy(owner: string) {
    return Array.from(this.lockedCollateral.entries())
      .filter(([_, lock]) => lock.owner === owner)
      .map(([id, lock]) => ({ assetId: id, ...lock }));
  }

  /**
   * Derived carbon-impact score (DEMO) an agent can consume before acting on a
   * carbon RWA. Deterministic from tonnes + methodology/vintage — fictional.
   */
  carbonImpactScore(artifact: ProvenanceArtifact): number | null {
    if (artifact.category !== "carbon_credit" || artifact.tonnesCO2e == null) return null;
    const tonnes = artifact.tonnesCO2e;
    const base = Math.min(60, Math.round(Math.log10(Math.max(tonnes, 1) + 1) * 15));
    const methodologyBoost = artifact.methodology ? 12 : 0;
    const vintageBoost = artifact.vintage ? 10 : 0;
    const verifierBoost = artifact.verifier ? 10 : 0;
    return Math.min(99, base + methodologyBoost + vintageBoost + verifierBoost);
  }

  /**
   * Provenance snapshot an external agent pays to read via x402 before it acts
   * on a physical/carbon RWA. This is the Lastro "foundation layer" payload.
   */
  getProvenanceSnapshot(assetId: string) {
    const lot = this.getLot(assetId);
    if (!lot) return null;
    const a = lot.artifact;
    const mintTx = this.getMintTx(assetId);
    return {
      assetId,
      category: a.category,
      seal: lot.computedSeal,
      referenceSeal: lot.referenceSeal,
      sealMatch: lot.sealMatchesReference,
      verdict: lot.latestVerdict ?? "Unverified",
      attested: lot.attested,
      mintStatus: this.isMinted(assetId) ? "minted" : "not_minted",
      attestationTx: lot.auditRecord?.onChain?.txHash ?? null,
      mintTx,
      carbonDetails:
        a.category === "carbon_credit"
          ? {
              tonnesCO2e: a.tonnesCO2e ?? null,
              creditType: a.creditType ?? null,
              vintage: a.vintage ?? null,
              methodology: a.methodology ?? null,
              verifier: a.verifier ?? null,
              carbonImpactScore: this.carbonImpactScore(a),
            }
          : null,
      packageHash: PACKAGE_HASH,
      csprLinks: {
        package: PACKAGE_URL,
        attestation: lot.auditRecord?.onChain?.txHash
          ? `https://testnet.cspr.live/transaction/${lot.auditRecord.onChain.txHash}`
          : null,
        mint: mintTx ? `https://testnet.cspr.live/transaction/${mintTx}` : null,
      },
      readAt: new Date().toISOString(),
    };
  }

  /**
   * x402 step 1 — issue a payment quote (HTTP 402 body). The caller signs it and
   * calls `settleProvenanceQuery`. Reuses the real x402 requirements contract.
   */
  quoteProvenanceQuery(assetId: string): { requirements: PaymentRequirements; assetId: string } {
    const requirements: PaymentRequirements = {
      ...DEFAULT_PAYMENT_REQUIREMENTS,
      nonce: randomUUID(),
    };
    this.x402Issued.set(requirements.nonce, requirements);
    return { requirements, assetId };
  }

  /**
   * x402 step 2 — verify + settle the payment through the facilitator seam, then
   * return the paid provenance snapshot. Mirrors the /verify flow in agent/x402.
   */
  async settleProvenanceQuery(
    assetId: string,
    payment: PaymentPayload,
  ): Promise<
    | { ok: true; txHash: string; provenance: ReturnType<AppRuntime["getProvenanceSnapshot"]>; facilitatorMode: string }
    | { ok: false; reason: string; requirements?: PaymentRequirements }
  > {
    const requirements = this.x402Issued.get(payment.nonce);
    if (!requirements) {
      const fresh = this.quoteProvenanceQuery(assetId);
      return { ok: false, reason: "nonce_unknown", requirements: fresh.requirements };
    }

    const verification = await this.x402Facilitator.verifyPayment(payment, requirements);
    if (!verification.ok) {
      return { ok: false, reason: verification.reason, requirements };
    }

    const settlement = await this.x402Facilitator.settlePayment(payment, requirements);
    this.x402Issued.delete(payment.nonce);
    this.x402QueryCount += 1;
    return {
      ok: true,
      txHash: settlement.txHash,
      provenance: this.getProvenanceSnapshot(assetId),
      facilitatorMode: this.x402Facilitator.mode,
    };
  }

  /**
   * DEMO helper: run the full x402 handshake locally (quote → sign → settle) so
   * the UI can show "an agent paid to verify this proof" end-to-end without an
   * external wallet. Uses the mock signer; not a real Casper payment.
   */
  async simulateAgentProvenanceQuery(assetId: string, from = "agent-casper-demo") {
    if (!this.getLot(assetId)) {
      return { ok: false as const, reason: "unknown_asset" };
    }
    const { requirements } = this.quoteProvenanceQuery(assetId);
    const payment: PaymentPayload = {
      nonce: requirements.nonce,
      amount: requirements.maxAmountRequired,
      from,
      sig: signMockPayment({
        nonce: requirements.nonce,
        amount: requirements.maxAmountRequired,
        from,
      }),
    };
    const settled = await this.settleProvenanceQuery(assetId, payment);
    return {
      ...settled,
      requirements,
      amountCspr: requirements.maxAmountRequired / 1_000_000_000,
      payTo: requirements.payTo,
      totalPaidQueries: this.x402QueryCount,
    };
  }

  private buildLotItem(artifact: ProvenanceArtifact, demoRole: string): LotListItem {
    const referenceSeal = this.gateway.getReferenceSeal(artifact.assetId) ?? null;
    const computedSeal = computeSeal(artifact);
    const auditRecord = this.getLatestAuditRecord(artifact.assetId);
    const referenceArtifact = referenceSeal
      ? this.resolveReferenceArtifact(artifact, referenceSeal)
      : null;

    return {
      artifact,
      referenceArtifact,
      referenceSeal,
      computedSeal,
      sealMatchesReference: referenceSeal ? computedSeal === referenceSeal : null,
      attested: this.originChain.isAttested(artifact.assetId),
      latestVerdict:
        auditRecord?.verification?.verdict ?? auditRecord?.onChain?.verdict ?? null,
      demoRole,
      auditRecord,
      isMinted: this.isMinted(artifact.assetId),
      mintTx: this.getMintTx(artifact.assetId),
    };
  }

  private resolveReferenceArtifact(
    artifact: ProvenanceArtifact,
    referenceSeal: string,
  ): ProvenanceArtifact | null {
    if (computeSeal(artifact) === referenceSeal) {
      return JSON.parse(JSON.stringify(artifact)) as ProvenanceArtifact;
    }

    const patchArtifact = (patch: Partial<ProvenanceArtifact>): ProvenanceArtifact => ({
      ...artifact,
      ...patch,
      origin: { ...artifact.origin, ...(patch.origin ?? {}) },
    });

    const numericKeys: Array<"massGrams" | "tonnesCO2e"> = ["massGrams", "tonnesCO2e"];
    for (const key of numericKeys) {
      const current = artifact[key];
      if (typeof current !== "number") continue;
      const span = Math.max(10_000, Math.abs(current) * 0.1);
      for (let value = current - span; value <= current + span; value += 1) {
        if (value === current) continue;
        const trial = patchArtifact({ [key]: value });
        if (computeSeal(trial) === referenceSeal) return trial;
      }
    }

    const lat = artifact.origin.lat;
    const lng = artifact.origin.lng;
    for (let delta = -0.05; delta <= 0.05; delta += 0.0001) {
      const trialLat = patchArtifact({ origin: { lat: lat + delta, lng, site: artifact.origin.site } });
      if (computeSeal(trialLat) === referenceSeal) return trialLat;
      const trialLng = patchArtifact({ origin: { lat, lng: lng + delta, site: artifact.origin.site } });
      if (computeSeal(trialLng) === referenceSeal) return trialLng;
    }

    return null;
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
      llmConfigured: Boolean(process.env.XAI_API_KEY?.trim() || process.env.OPENROUTER_API_KEY?.trim()),
    };
  }

  listEscalations(): AuditRecord[] {
    return Array.from(this.pendingEscalations)
      .map((assetId) => this.getLatestAuditRecord(assetId))
      .filter((record): record is AuditRecord => record != null && record.outcome === "escalated");
  }

  private trackEscalationsFromBatch(records: AuditRecord[]): void {
    for (const record of records) {
      if (record.outcome === "escalated") {
        this.pendingEscalations.add(record.assetId);
      }
    }
  }

  private removePendingEscalation(assetId: string): void {
    this.pendingEscalations.delete(assetId);
  }

  async resolveEscalationRequeue(assetId: string): Promise<EscalationActionResult> {
    if (!this.pendingEscalations.has(assetId)) {
      throw new Error(`No pending escalation for ${assetId}`);
    }

    const previous = this.getLatestAuditRecord(assetId);
    this.removePendingEscalation(assetId);

    const result = await this.processBatch([assetId]);
    const record = result.records[0];
    const requeuedEscalated = record.outcome === "escalated";

    return {
      assetId,
      action: "requeued",
      record,
      previousReasoning: previous?.decision.reasoning ?? null,
      requeuedEscalated,
    };
  }

  resolveEscalationDiscard(assetId: string): EscalationActionResult {
    if (!this.pendingEscalations.has(assetId)) {
      throw new Error(`No pending escalation for ${assetId}`);
    }

    const previous = this.getLatestAuditRecord(assetId);
    const record: AuditRecord = {
      assetId,
      decision: {
        action: "skip",
        reasoning: `Human review: case discarded from escalation queue. Agent had escalated because: ${previous?.decision.reasoning ?? "unknown"}`,
        decidedBy: "rule",
      },
      verification: null,
      onChain: null,
      outcome: "skipped",
    };

    this.auditLog.push(record);
    this.removePendingEscalation(assetId);

    return {
      assetId,
      action: "discarded",
      record,
      previousReasoning: previous?.decision.reasoning ?? null,
      requeuedEscalated: false,
    };
  }

  async resolveEscalationOverride(
    assetId: string,
    overrideAction: "pay" | "skip",
  ): Promise<EscalationActionResult> {
    if (!this.pendingEscalations.has(assetId)) {
      throw new Error(`No pending escalation for ${assetId}`);
    }

    const previous = this.getLatestAuditRecord(assetId);
    const artifact = this.resolveArtifact(assetId);
    this.removePendingEscalation(assetId);

    if (overrideAction === "skip") {
      const record: AuditRecord = {
        assetId,
        decision: {
          action: "skip",
          reasoning: `Human override: skip after escalation review. Agent had escalated because: ${previous?.decision.reasoning ?? "unknown"}`,
          decidedBy: "rule",
        },
        verification: null,
        onChain: null,
        outcome: "skipped",
      };
      this.auditLog.push(record);
      return {
        assetId,
        action: "overridden",
        record,
        previousReasoning: previous?.decision.reasoning ?? null,
        requeuedEscalated: false,
      };
    }

    const decision = {
      action: "pay" as const,
      reasoning: `Human override: pay for verification after escalation review. Agent had escalated because: ${previous?.decision.reasoning ?? "unknown"}`,
      decidedBy: "rule" as const,
    };

    const verification = await this.gateway.verifyAndSettle(artifact.assetId, artifact);
    const onChainResult = this.originChain.attest(artifact.assetId, verification.seal);
    const outcome = verification.verdict === "Valid" ? "tokenizable" : "rejected";

    const record: AuditRecord = {
      assetId,
      decision,
      verification,
      onChain: {
        verdict: onChainResult.verdict,
        txHash: verification.txHash,
      },
      outcome,
    };

    this.auditLog.push(record);

    return {
      assetId,
      action: "overridden",
      record,
      previousReasoning: previous?.decision.reasoning ?? null,
      requeuedEscalated: false,
    };
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
    this.trackEscalationsFromBatch(result.records);
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

    const user = this.userArtifacts.find((a) => a.assetId === assetId);
    if (user) return structuredClone(user);

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
