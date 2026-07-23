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
import {
  CANONICAL_EVIDENCE,
  LATEST_CANONICAL_SETTLE_TX,
  explorerTxUrlIfCanonical,
  explorerTxUrlIfDeployHash,
} from "./casper-rpc.js";
import { randomUUID } from "node:crypto";
import {
  DEFAULT_PAYMENT_REQUIREMENTS,
  MockFacilitator,
  createFacilitatorFromEnv,
  signMockPayment,
  CsprCloudFacilitator,
  CSPR_CLOUD_FACILITATOR_URL,
  WCSPR_TESTNET_PACKAGE_HASH,
  buildCloudQuoteMeta,
  createOptionalCsprCloudFromEnv,
  type Facilitator,
  type PaymentPayload,
  type PaymentRequirements,
  type CloudVerifyRequest,
  type CloudQuoteMeta,
} from "../../agent/x402/dist/index.js";
import { getOperators, getTrustNetwork } from "./operators.js";
import { MintEconomicsGate } from "./mint-economics.js";
import { ReceiptStore } from "./receipts.js";
import { getCompositionAnchorEvidence } from "./composition-anchor.js";
import {
  AutonomyStore,
  newCycleId,
  type AutonomyCycleRecord,
  type AutonomyScenarioResult,
  type AutonomySummary,
} from "./autonomy.js";
import {
  evaluateSealedRail,
  sealedRailOverview,
  SEALED_RAIL_HONESTY,
  SEALED_RAIL_PRODUCT,
  type SealedRailGateCode,
  type SealedRailStatus,
} from "./sealed-rail.js";
import { CollateralStore } from "./collateral-store.js";

/** Multi-party trust stack — protocol roles, not fake second operators. */
export const TRUST_STACK = [
  {
    role: "field_sealer",
    party: "Field / offline capture",
    duty: "Build canonical provenance artifact and offline SHA-256 seal",
    trust: "Deterministic, no LLM, no network",
  },
  {
    role: "chain_attester",
    party: "ProofOfOrigin (Casper Testnet)",
    duty: "Store reference seal; record Valid and Invalid permanently",
    trust: "On-chain package — live-RPC verified sample txs",
  },
  {
    role: "paying_agent",
    party: "External agent / consumer",
    duty: "HTTP 402 → X-PAYMENT → read proof before acting",
    trust: "Mock facilitator in judge demo; production seam is Facilitator interface",
  },
  {
    role: "human_escalation",
    party: "Human reviewer",
    duty: "Handle escalate outcomes (e.g. out-of-region) without rewriting seal truth",
    trust: "HITL only for action uncertainty — never overwrites Valid/Invalid",
  },
] as const;

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

  // Minted state via MintGate economics (contract-logic parity).
  private readonly mintGate = new MintEconomicsGate();
  private mintTxs = new Map<string, string>(); // assetId -> tx hash (demo)

  // 2-hop composition receipts
  private readonly receipts = new ReceiptStore();

  /** Session-only origin autonomy cycle log (not oracle feed counter). */
  private readonly autonomy = new AutonomyStore();

  // x402: primary facilitator from LASTRE_X402_MODE (mock | casper | cspr_cloud).
  // Optional side-car CSPR.cloud facilitator when CSPR_CLOUD_API_TOKEN is set —
  // enables WCSPR settle alongside native CSPR without switching mode.
  private readonly x402Facilitator: Facilitator = createFacilitatorFromEnv();
  private readonly x402CloudFacilitator: CsprCloudFacilitator | null =
    createOptionalCsprCloudFromEnv();
  private readonly x402Issued = new Map<string, PaymentRequirements>();
  private x402QueryCount = 0;
  /** Session last real casper_deploy settle (null until one succeeds this process). */
  private lastCasperSettle: {
    txHash: string;
    assetId: string;
    at: string;
    paymentExplorerUrl: string | null;
  } | null = null;

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

  mintAsset(
    assetId: string,
    minter = "demo-minter",
  ): {
    success: boolean;
    txHash?: string;
    error?: string;
    code?: SealedRailGateCode | "NoValidProof" | "AlreadyMinted";
    honesty: typeof SEALED_RAIL_HONESTY.mintGate;
    rail?: SealedRailStatus;
  } {
    const honesty = SEALED_RAIL_HONESTY.mintGate;
    const lot = this.getLot(assetId);
    const hasValidProof = lot?.latestVerdict === "Valid";
    const result = this.mintGate.mintLot({ assetId, minter, hasValidProof });
    if (!result.ok) {
      const code: SealedRailGateCode | "NoValidProof" | "AlreadyMinted" =
        result.error === "AlreadyMinted"
          ? "ALREADY_MINTED"
          : lot?.latestVerdict === "Invalid"
            ? "INVALID_ORIGIN"
            : result.error === "NoValidProof"
              ? "NoValidProof"
              : "UNVERIFIED";
      return {
        success: false,
        error: `${result.error}: ${result.message}`,
        code,
        honesty,
        rail: this.getSealedRailStatus(assetId),
      };
    }
    this.mintTxs.set(assetId, result.event.mintTx);
    return {
      success: true,
      txHash: result.event.mintTx,
      code: "OK",
      honesty,
      rail: this.getSealedRailStatus(assetId),
    };
  }

  isMinted(assetId: string): boolean {
    return this.mintGate.isMinted(assetId);
  }

  getMintTx(assetId: string): string | null {
    return this.mintTxs.get(assetId) ?? null;
  }

  getMintEconomics() {
    return this.mintGate.snapshot();
  }

  /** MintGate LotMinted events + counters + economics + live ProofOfOrigin snapshot. */
  async getMintSummary() {
    const testnet = await getLiveTestnetSnapshot();
    const economics = this.mintGate.snapshot();
    return {
      mintCount: economics.mintCount,
      packageHash: PACKAGE_HASH,
      packageUrl: PACKAGE_URL,
      events: economics.events.map((e) => ({
        assetId: e.assetId,
        minter: e.minter,
        mintTx: e.mintTx,
        at: e.at,
      })),
      paidX402Queries: this.x402QueryCount,
      source: "mintgate-economics",
      trustStack: TRUST_STACK,
      economics,
      onChain: {
        source: testnet.source,
        fetchedAt: testnet.fetchedAt,
        packageHash: testnet.packageHash,
        packageUrl: testnet.packageUrl,
        proofOfOriginAccepted: testnet.accepted,
        proofOfOriginRejected: testnet.rejected,
        attestedAssetIds: testnet.attestations.map((row) => row.assetId),
        mintGateAvailable: Boolean(economics.livePackageHash),
        mintCount: economics.mintCount,
        mintGateEconomics: true,
        rpcEvidence: testnet.rpcEvidence ?? null,
        note:
          testnet.source === "live"
            ? "Live query_snapshot reads ProofOfOrigin. MintGate economics enforce Valid-only gate (contract-logic parity)."
            : testnet.source === "live-rpc"
              ? "Public Casper Testnet RPC verified install + Invalid + Valid sample txs. MintGate economics: Valid-only symbolic mint gate (WASM + Rust tests in repo)."
              : "Casper RPC/binary unavailable — README fallback counters. MintGate economics still enforce Valid-only gate.",
      },
    };
  }

  // ---- 2-hop receipts -------------------------------------------------------

  createToolReceipt(assetId: string, payTx?: string | null, note?: string) {
    return this.receipts.createToolReceipt({ assetId, payTx, note });
  }

  composeLastreReceipt(parentId: string, assetId: string, payTx?: string | null) {
    const lot = this.getLot(assetId);
    const isValid = lot?.latestVerdict === "Valid";
    return this.receipts.composeLastreHop({
      parentId,
      assetId,
      lastreVerdict: isValid ? "Valid" : "Invalid",
      sealMatch: isValid,
      payTx,
    });
  }

  listReceipts() {
    return this.receipts.list();
  }

  seedReceiptDemo(assetId = "CARBON-VCS-AMAZONIA-2024-001") {
    return this.receipts.seedDemoGraph(assetId);
  }

  /** Judge-facing evidence bundle: multi-party roles + operators + live-RPC + receipts. */
  async getEvidencePack() {
    const testnet = await getLiveTestnetSnapshot();
    const ops = getOperators();
    const economics = this.mintGate.snapshot();
    const anchor = getCompositionAnchorEvidence();
    // Ensure a demo 2-hop graph exists for judges
    if (this.receipts.list().length === 0) {
      try {
        this.receipts.seedDemoGraph("CARBON-VCS-AMAZONIA-2024-001");
      } catch {
        /* ignore if store race */
      }
    }
    const x402Mode = this.x402Facilitator.mode;
    const sessionSettle = this.lastCasperSettle;
    const canonicalSettleTx = LATEST_CANONICAL_SETTLE_TX;
    const lastCasperSettle = sessionSettle
      ? {
          source: "session" as const,
          txHash: sessionSettle.txHash,
          assetId: sessionSettle.assetId,
          at: sessionSettle.at,
          paymentExplorerUrl: sessionSettle.paymentExplorerUrl,
          settlementKind: "casper_deploy" as const,
        }
      : {
          source: "canonical" as const,
          txHash: canonicalSettleTx,
          assetId: "CARBON-VCS-AMAZONIA-2024-001",
          at: null as string | null,
          paymentExplorerUrl: explorerTxUrlIfDeployHash(canonicalSettleTx),
          settlementKind: "casper_deploy" as const,
        };

    const sealedRail = this.getSealedRailStatus(SEALED_RAIL_PRODUCT.defaultDemoAssetId);
    const sealedRailInvalid = this.getSealedRailStatus(SEALED_RAIL_PRODUCT.defaultInvalidAssetId);

    return {
      thesis:
        "Proof before token — and proof before finance. Seal decides Valid/Invalid; LLM only chooses pay/skip/escalate.",
      packageHash: PACKAGE_HASH,
      packageUrl: PACKAGE_URL,
      /** Sealed Market Rail — origin-gated mint + demo collateral (not a DEX). */
      sealedMarketRail: {
        product: SEALED_RAIL_PRODUCT,
        honesty: SEALED_RAIL_HONESTY,
        endpoints: {
          overview: "GET /api/rail",
          status: "GET /api/rail/:assetId",
          run: "POST /api/rail/run",
          eligibility: "GET /api/defi/eligibility/:assetId",
        },
        sampleValid: {
          assetId: SEALED_RAIL_PRODUCT.defaultDemoAssetId,
          financeGateOpen: sealedRail.financeGateOpen,
          progress: sealedRail.progress,
          gateCode: sealedRail.gateCode,
        },
        sampleInvalid: {
          assetId: SEALED_RAIL_PRODUCT.defaultInvalidAssetId,
          financeGateOpen: sealedRailInvalid.financeGateOpen,
          blockedReason: sealedRailInvalid.blockedReason,
          gateCode: sealedRailInvalid.gateCode,
        },
      },
      /** Access-rights framing (copy layer; contracts unchanged). */
      accessRights: {
        dualKey: "Separation of duties: field sealer ≠ chain attester",
        mintGate: "Mint access requires Valid origin attestation",
        invalid: "Negative attestation is first-class on-chain state",
        agent: "Agent decides action only (pay / skip / escalate) — never seal truth",
        sealedRail: "MintGate + demo collateral only after Valid — proof before finance",
      },
      mainnetRoadmap:
        "Live on Casper Testnet today. Mainnet when facilitator ops + keys + monitoring are production-safe. No mainnet money claims in demo.",
      honesty: {
        uiSimulate: "mock",
        apiSettle:
          x402Mode === "cspr_cloud"
            ? "cspr_cloud_wcspr_eip712"
            : x402Mode === "casper"
              ? "real_testnet_cspr_when_keys"
              : "mock_only",
        phrase:
          "UI / POST /api/x402/simulate + /api/rail/run = mock (no value moved). " +
          "POST /api/x402/settle: native CSPR when facilitatorMode=casper; " +
          "WCSPR via CSPR.cloud when facilitatorMode=cspr_cloud (EIP-712 body). " +
          "Official path: docs.cspr.cloud/x402-facilitator-api + make-software/casper-x402.",
        csprCloud: {
          facilitatorUrl: CSPR_CLOUD_FACILITATOR_URL,
          docs: "https://docs.cspr.cloud/x402-facilitator-api/reference",
          examples: "https://github.com/make-software/casper-x402",
          tradeWcspr: "https://testnet.cspr.trade",
          wcsprTestnetPackage: WCSPR_TESTNET_PACKAGE_HASH,
          note:
            "WCSPR is fully x402-compatible. Swap CSPR↔WCSPR on testnet.cspr.trade (WCSPR menu).",
        },
      },
      trustStack: TRUST_STACK,
      operators: ops.operators,
      dualKey: {
        distinct: ops.dualKeyDistinct,
        rule: ops.rule,
        relatedSampleTxs: ops.relatedSampleTxs,
        sealerHasOnChainTx: Boolean(
          ops.operators.find((o) => o.role === "field_sealer")?.lastTx,
        ),
      },
      trustNetwork: getTrustNetwork(),
      composition: {
        model: "tool_receipt → lastre_receipt",
        killSwitch: "Invalid lastre hop aborts composition (verdict=Aborted)",
        chainRoot: anchor.chainRoot,
        anchorTx: anchor.anchorTx,
        anchorExplorerUrl: anchor.anchorExplorerUrl,
        anchored: anchor.anchored,
        anchorNote: anchor.note,
        receipts: this.receipts.list().slice(0, 10),
      },
      mintGate: economics,
      onChain: {
        source: testnet.source,
        fetchedAt: testnet.fetchedAt,
        accepted: testnet.accepted,
        rejected: testnet.rejected,
        attestations: testnet.attestations,
        rpcEvidence: testnet.rpcEvidence ?? null,
      },
      /** Jury-mode aliases (explicit). */
      x402Mode,
      lastCasperSettle,
      sampleSettles: [
        {
          label: "latest",
          txHash: CANONICAL_EVIDENCE.x402PayProd20260722,
          explorerUrl: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.x402PayProd20260722),
        },
        {
          label: "2026-07-21b",
          txHash: CANONICAL_EVIDENCE.x402PayProd20260721b,
          explorerUrl: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.x402PayProd20260721b),
        },
        {
          label: "2026-07-21",
          txHash: CANONICAL_EVIDENCE.x402PayProd20260721,
          explorerUrl: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.x402PayProd20260721),
        },
        {
          label: "2026-07-19b",
          txHash: CANONICAL_EVIDENCE.x402PayProd20260719b,
          explorerUrl: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.x402PayProd20260719b),
        },
        {
          label: "2026-07-19",
          txHash: CANONICAL_EVIDENCE.x402PayProd20260719,
          explorerUrl: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.x402PayProd20260719),
        },
        {
          label: "2026-07-15",
          txHash: CANONICAL_EVIDENCE.x402PayProd20260715,
          explorerUrl: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.x402PayProd20260715),
        },
      ],
      x402: {
        facilitatorMode: x402Mode,
        x402Mode,
        settlementKind:
          x402Mode === "casper" || x402Mode === "cspr_cloud"
            ? "casper_deploy"
            : "synthetic_receipt",
        assetPath:
          x402Mode === "cspr_cloud"
            ? "WCSPR_CEP18"
            : x402Mode === "casper"
              ? "native_CSPR"
              : "mock",
        lastCasperSettle,
        cloud: this.getCsprCloudInfo(),
        honestNote:
          x402Mode === "cspr_cloud"
            ? "Server facilitator mode=cspr_cloud: CSPR.cloud /verify+/settle with WCSPR (EIP-712). UI /simulate stays mock. Requires CSPR_CLOUD_API_TOKEN + payTo + client-signed cloud body."
            : x402Mode === "casper"
              ? "Server facilitator mode=casper: settleProvenanceQuery can move real testnet native CSPR when keys are configured. UI /simulate stays mock. Optional next: cspr_cloud + WCSPR (MAKE path)."
              : "Judge demo uses MockFacilitator (no CSPR moved). HTTP 402 seam is real. Paid responses attach live-RPC-verified ProofOfOrigin txs as chain evidence. Official WCSPR path documented under honesty.csprCloud.",
      },
      invalidIsProof: true,
      /** Additive: origin autonomy loop summary (session). Does not replace on-chain counters. */
      originAutonomy: this.autonomy.summary(),
      juryLinks: {
        marketplace: "https://app.lastre.io/marketplace",
        marketplaceRail: SEALED_RAIL_PRODUCT.appDeepLink,
        landingRail: SEALED_RAIL_PRODUCT.landingAnchor,
        agents: "https://app.lastre.io/agents",
        health: "https://app-api.lastre.io/api/health",
        evidence: "https://app-api.lastre.io/api/evidence",
        rail: "https://app-api.lastre.io/api/rail",
        railRun: "https://app-api.lastre.io/api/rail/run",
        autonomy: "https://app-api.lastre.io/api/agent/autonomy",
        invalidSample: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.invalidTx),
        carbonValid: explorerTxUrlIfDeployHash(CANONICAL_EVIDENCE.carbonValidTx),
        latestSettle: explorerTxUrlIfDeployHash(canonicalSettleTx),
        package: PACKAGE_URL,
      },
    };
  }

  /** Public autonomy surface for judges / CI — never invents on-chain counters. */
  getAutonomySummary(): AutonomySummary {
    return this.autonomy.summary();
  }

  listAutonomyCycles(limit = 20): AutonomyCycleRecord[] {
    return this.autonomy.list(limit);
  }

  /**
   * One autonomous origin cycle (session-side).
   * - Isolated agent stack for seal/decide/verdict scenarios (does not mutate demo origin chain)
   * - Mock x402 simulate for a known asset (judge-safe; no casper settle)
   * - MintGate dry-run NoValidProof only (no free mints)
   * - Live RPC evidence re-check when public node responds
   */
  async runAutonomyCycle(source = "api"): Promise<AutonomyCycleRecord> {
    const scenarios: AutonomyScenarioResult[] = [];
    const demos = createDemoArtifacts();
    const refs = createDemoReferenceArtifacts();
    const isolatedChain = createOriginChainWithReferences(refs);
    const isolatedGateway = new LocalGateway(refs);
    const agent = new Agent(new RuleDecider(), isolatedGateway, isolatedChain);

    const runLot = async (
      scenario: AutonomyScenarioResult["scenario"],
      artifact: ProvenanceArtifact,
      expect: { outcome: string; verdict?: string | null },
    ) => {
      try {
        const record = await agent.processLot(structuredClone(artifact));
        const verdict = record.verification?.verdict ?? null;
        const ok =
          record.outcome === expect.outcome &&
          (expect.verdict === undefined || verdict === expect.verdict);
        scenarios.push({
          scenario,
          ok,
          outcome: record.outcome,
          detail: verdict ? `verdict=${verdict}` : record.decision.action,
          assetId: artifact.assetId,
        });
      } catch (error) {
        scenarios.push({
          scenario,
          ok: false,
          outcome: "error",
          detail: error instanceof Error ? error.message : String(error),
          assetId: artifact.assetId,
        });
      }
    };

    await runLot("VALID_MINA", demos.valid, { outcome: "tokenizable", verdict: "Valid" });
    await runLot("INVALID_TAMPER", demos.tampered, { outcome: "rejected", verdict: "Invalid" });
    await runLot("VALID_CARBON", demos.carbonValid, { outcome: "tokenizable", verdict: "Valid" });
    await runLot("DUPLICATE_SKIP", demos.validDuplicate, { outcome: "skipped" });
    await runLot("OUT_OF_PERIMETER", demos.outOfRegion, { outcome: "escalated" });

    // Seal honesty: tamper breaks deterministic seal vs reference
    try {
      const validSeal = computeSeal(demos.valid);
      const tamperedSeal = computeSeal(demos.tampered);
      const sealOk = validSeal !== tamperedSeal && validSeal.length === 64;
      scenarios.push({
        scenario: "INVALID_TAMPER",
        ok: sealOk,
        outcome: sealOk ? "seal_mismatch_detected" : "seal_check_failed",
        detail: `valid=${validSeal.slice(0, 12)}… tampered=${tamperedSeal.slice(0, 12)}…`,
        assetId: demos.tampered.assetId,
      });
    } catch (error) {
      scenarios.push({
        scenario: "INVALID_TAMPER",
        ok: false,
        outcome: "seal_error",
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    // MintGate dry-run: Invalid never mints (isolated gate — does not touch session mintGate)
    const dryGate = new MintEconomicsGate();
    const noProof = dryGate.mintLot({
      assetId: demos.tampered.assetId,
      minter: "autonomy-dry-run",
      hasValidProof: false,
    });
    const noProofOk = !noProof.ok && noProof.error === "NoValidProof";
    scenarios.push({
      scenario: "INVALID_TAMPER",
      ok: noProofOk,
      outcome: noProof.ok ? "mint_unexpected" : noProof.error,
      detail: noProof.ok ? "minted without proof" : noProof.message,
      assetId: demos.tampered.assetId,
    });

    // Mock pay (real runtime path — always synthetic; never casper settle from autonomy)
    let mockPayOk: boolean | null = null;
    try {
      const pay = await this.simulateAgentProvenanceQuery(
        "CARBON-VCS-AMAZONIA-2024-001",
        `autonomy-${source}`,
      );
      mockPayOk = Boolean(
        pay.ok &&
          pay.settlementKind === "synthetic_receipt" &&
          pay.facilitatorMode === "mock",
      );
      scenarios.push({
        scenario: "MOCK_PAY",
        ok: mockPayOk,
        outcome: pay.ok ? String(pay.settlementKind) : "pay_failed",
        detail: pay.ok
          ? `facilitator=${pay.facilitatorMode}; mint=${pay.provenance?.csprLinks?.mint ?? null}`
          : "simulate_failed",
        assetId: "CARBON-VCS-AMAZONIA-2024-001",
      });
    } catch (error) {
      mockPayOk = false;
      scenarios.push({
        scenario: "MOCK_PAY",
        ok: false,
        outcome: "pay_error",
        detail: error instanceof Error ? error.message : String(error),
        assetId: "CARBON-VCS-AMAZONIA-2024-001",
      });
    }

    // Live RPC re-verify (read-only)
    let evidenceFullyVerified: boolean | null = null;
    try {
      const testnet = await getLiveTestnetSnapshot();
      evidenceFullyVerified = testnet.rpcEvidence?.fullyVerified ?? null;
      const rpcOk = evidenceFullyVerified === true;
      scenarios.push({
        scenario: "EVIDENCE_RPC",
        ok: rpcOk || evidenceFullyVerified === null,
        outcome: rpcOk
          ? "fullyVerified"
          : evidenceFullyVerified === null
            ? "rpc_unavailable"
            : "not_fully_verified",
        detail: `accepted=${testnet.accepted}; rejected=${testnet.rejected}; source=${testnet.source}`,
      });
    } catch (error) {
      scenarios.push({
        scenario: "EVIDENCE_RPC",
        ok: false,
        outcome: "rpc_error",
        detail: error instanceof Error ? error.message : String(error),
      });
    }

    // Core agent + mock-pay must pass. Live RPC is informational (node can be flaky).
    const hard = scenarios.filter((s) => s.scenario !== "EVIDENCE_RPC");
    const cycleOk = hard.every((s) => s.ok);

    const record: AutonomyCycleRecord = {
      cycleId: newCycleId(),
      at: new Date().toISOString(),
      source,
      ok: cycleOk,
      scenarios,
      evidenceFullyVerified,
      mockPayOk,
      facilitatorMode: "mock",
    };
    this.autonomy.record(record);
    return record;
  }

  // Demo collateral (Sealed Market Rail step 5) — Valid + minted only.
  // Persisted to disk so Render restarts don't wipe locks mid-demo.
  private readonly collateralStore = new CollateralStore();

  lockCollateral(
    assetId: string,
    owner: string,
  ): {
    success: boolean;
    error?: string;
    code?: SealedRailGateCode;
    honesty: typeof SEALED_RAIL_HONESTY.collateral;
    rail?: SealedRailStatus;
  } {
    const honesty = SEALED_RAIL_HONESTY.collateral;
    if (!this.isMinted(assetId)) {
      return {
        success: false,
        error: "Asset must be minted first (MintGate claim after Valid)",
        code: "NOT_MINTED",
        honesty,
        rail: this.getSealedRailStatus(assetId),
      };
    }
    const lot = this.getLot(assetId);
    if (!lot || lot.latestVerdict !== "Valid") {
      const code: SealedRailGateCode =
        lot?.latestVerdict === "Invalid" ? "INVALID_ORIGIN" : "UNVERIFIED";
      return {
        success: false,
        error:
          code === "INVALID_ORIGIN"
            ? "Invalid origin — demo collateral permanently closed"
            : "Only Valid proven assets can be used as demo collateral",
        code,
        honesty,
        rail: this.getSealedRailStatus(assetId),
      };
    }
    if (this.collateralStore.has(assetId)) {
      return {
        success: false,
        error: "Already locked",
        code: "ALREADY_LOCKED",
        honesty,
        rail: this.getSealedRailStatus(assetId),
      };
    }
    this.collateralStore.set(assetId, owner);
    return {
      success: true,
      code: "OK",
      honesty,
      rail: this.getSealedRailStatus(assetId),
    };
  }

  releaseCollateral(
    assetId: string,
    owner: string,
  ): {
    success: boolean;
    error?: string;
    code?: SealedRailGateCode;
    honesty: typeof SEALED_RAIL_HONESTY.collateral;
    rail?: SealedRailStatus;
  } {
    const honesty = SEALED_RAIL_HONESTY.collateral;
    const lock = this.collateralStore.get(assetId);
    if (!lock) {
      return {
        success: false,
        error: "Not locked",
        code: "NOT_LOCKED",
        honesty,
        rail: this.getSealedRailStatus(assetId),
      };
    }
    if (lock.owner !== owner) {
      return {
        success: false,
        error: "Not locked by you",
        code: "OWNER_MISMATCH",
        honesty,
        rail: this.getSealedRailStatus(assetId),
      };
    }
    this.collateralStore.delete(assetId);
    return {
      success: true,
      code: "OK",
      honesty,
      rail: this.getSealedRailStatus(assetId),
    };
  }

  getLockedStatus(assetId: string) {
    return this.collateralStore.get(assetId);
  }

  listLockedBy(owner: string) {
    return this.collateralStore.listByOwner(owner);
  }

  /** Sealed Market Rail overview (product + endpoints + honesty). */
  getSealedRailOverview() {
    return sealedRailOverview();
  }

  /** Per-asset 5-step rail status for UI / judges. */
  getSealedRailStatus(assetId: string): SealedRailStatus {
    const lot = this.getLot(assetId);
    const lock = this.collateralStore.get(assetId);
    const verdict =
      lot?.latestVerdict === "Valid" || lot?.latestVerdict === "Invalid"
        ? lot.latestVerdict
        : lot
          ? "Unverified"
          : null;

    return evaluateSealedRail({
      assetId,
      exists: Boolean(lot),
      verdict,
      sealMatch: lot?.sealMatchesReference ?? null,
      attested: Boolean(lot?.attested),
      minted: this.isMinted(assetId),
      mintTx: this.getMintTx(assetId),
      paidQueryCount: this.x402QueryCount,
      sessionHasPaidQuery: this.x402QueryCount > 0,
      locked: Boolean(lock),
      lockedOwner: lock?.owner ?? null,
      lockedAt: lock?.lockedAt ?? null,
    });
  }

  getDefiEligibility(assetId: string) {
    const rail = this.getSealedRailStatus(assetId);
    return {
      assetId,
      product: SEALED_RAIL_PRODUCT.id,
      verdict: rail.verdict,
      financeGateOpen: rail.financeGateOpen,
      eligibility: rail.eligibility,
      blockedReason: rail.blockedReason,
      honesty: SEALED_RAIL_HONESTY,
      rail,
    };
  }

  /**
   * Server-side Sealed Rail demo (judge-safe):
   * 1) mock x402 provenance query
   * 2) MintGate claim only if Valid (skips if already minted / Invalid)
   * 3) Optionally lock demo collateral when input.lock + input.owner are set.
   */
  async runSealedRailDemo(input: {
    assetId: string;
    owner?: string;
    minter?: string;
    lock?: boolean;
  }): Promise<{
    ok: boolean;
    assetId: string;
    stepsRun: Array<{
      step: string;
      ok: boolean;
      detail: string;
      code?: string;
      txHash?: string | null;
    }>;
    rail: SealedRailStatus;
    honesty: typeof SEALED_RAIL_HONESTY;
    mockOnly: true;
  }> {
    const assetId = input.assetId || SEALED_RAIL_PRODUCT.defaultDemoAssetId;
    const stepsRun: Array<{
      step: string;
      ok: boolean;
      detail: string;
      code?: string;
      txHash?: string | null;
    }> = [];

    const before = this.getSealedRailStatus(assetId);
    if (!before.exists) {
      stepsRun.push({
        step: "origin_seal",
        ok: false,
        detail: "Unknown asset",
        code: "UNKNOWN_ASSET",
      });
      return {
        ok: false,
        assetId,
        stepsRun,
        rail: before,
        honesty: SEALED_RAIL_HONESTY,
        mockOnly: true,
      };
    }

    stepsRun.push({
      step: "origin_seal",
      ok: before.verdict === "Valid" || before.verdict === "Invalid",
      detail: `verdict=${before.verdict}`,
      code: before.gateCode,
    });

    // Step 2 — always mock simulate (never casper settle from rail/run)
    try {
      const pay = await this.simulateAgentProvenanceQuery(
        assetId,
        input.owner ?? "sealed-rail-demo",
      );
      stepsRun.push({
        step: "provenance_query",
        ok: Boolean(pay.ok),
        detail: pay.ok
          ? `mock x402; facilitator=${pay.facilitatorMode}; settlement=${pay.settlementKind}`
          : "simulate_failed",
        txHash: pay.ok ? pay.txHash : null,
        code: pay.ok ? "OK" : "QUERY_FAILED",
      });
    } catch (error) {
      stepsRun.push({
        step: "provenance_query",
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
        code: "QUERY_ERROR",
      });
    }

    // Step 3 — mint only if Valid
    if (before.verdict === "Valid") {
      if (this.isMinted(assetId)) {
        stepsRun.push({
          step: "mint_gate",
          ok: true,
          detail: "AlreadyMinted — demo event already in session",
          code: "ALREADY_MINTED",
          txHash: this.getMintTx(assetId),
        });
      } else {
        const mint = this.mintAsset(assetId, input.minter ?? "sealed-rail-demo");
        stepsRun.push({
          step: "mint_gate",
          ok: mint.success,
          detail: mint.success
            ? "MintGate demo LotMinted after Valid"
            : (mint.error ?? "mint_failed"),
          code: mint.success ? "OK" : "MINT_FAILED",
          txHash: mint.txHash ?? null,
        });
      }
    } else {
      const dry = this.mintAsset(assetId, input.minter ?? "sealed-rail-demo");
      stepsRun.push({
        step: "mint_gate",
        ok: !dry.success,
        detail: dry.success
          ? "unexpected mint without Valid"
          : (dry.error ?? "NoValidProof"),
        code: before.verdict === "Invalid" ? "INVALID_ORIGIN" : "UNVERIFIED",
      });
    }

    stepsRun.push({
      step: "sealed_asset",
      ok: this.isMinted(assetId),
      detail: this.isMinted(assetId)
        ? "Asset available in My Assets (session mint)"
        : "Not minted — collection step closed",
      code: this.isMinted(assetId) ? "OK" : "NOT_MINTED",
    });

    // Optional lock (only if requested + eligible)
    if (input.lock && input.owner) {
      const lock = this.lockCollateral(assetId, input.owner);
      // ALREADY_LOCKED is idempotent success for the shared demo collateral —
      // the Valid lot is already locked (mirrors ALREADY_MINTED on mint_gate),
      // so the rail's step 5 is complete, not a judge-facing failure.
      const lockOk = lock.success || lock.code === "ALREADY_LOCKED";
      stepsRun.push({
        step: "demo_collateral",
        ok: lockOk,
        detail: lock.success
          ? "Demo collateral locked"
          : lock.code === "ALREADY_LOCKED"
            ? "AlreadyLocked — demo collateral already held for this Valid lot"
            : (lock.error ?? "lock_failed"),
        code: lock.code,
      });
    } else {
      const railMid = this.getSealedRailStatus(assetId);
      stepsRun.push({
        step: "demo_collateral",
        ok: true,
        detail: railMid.eligibility.canLock
          ? "Eligible — call POST /api/defi/lock or pass lock:true with owner"
          : (railMid.blockedReason ?? "Not eligible for demo lock"),
        code: railMid.eligibility.lockCode,
      });
    }

    const rail = this.getSealedRailStatus(assetId);
    const hardOk = stepsRun
      .filter((s) => s.step !== "demo_collateral" || input.lock)
      .every((s) => s.ok);

    return {
      ok: hardOk,
      assetId,
      stepsRun,
      rail,
      honesty: SEALED_RAIL_HONESTY,
      mockOnly: true,
    };
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
   * on a physical/carbon RWA. This is the Lastre "foundation layer" payload.
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
        // Only link a real on-chain attestation. Session `synthetic_receipt`
        // hashes are not on Casper, so they must not become explorer links.
        attestation: explorerTxUrlIfCanonical(lot.auditRecord?.onChain?.txHash ?? null),
        // MintGate mints are simulated (`mint-*`); never link them as live txs.
        mint: explorerTxUrlIfCanonical(mintTx),
        /** Always surface the canonical Invalid sample so agents see rejection is proof. */
        invalidSample:
          "https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd",
        validSample:
          "https://testnet.cspr.live/transaction/43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4",
      },
      /** Honest label: the mint event is a simulated MintGate demo, not on-chain. */
      mintNote: mintTx ? "MintGate demo event (simulated) — not a Casper transaction." : null,
      trustRule: "Seal decides Valid/Invalid. Agent chooses pay/skip/escalate only.",
      readAt: new Date().toISOString(),
    };
  }

  /**
   * x402 step 1 — issue a payment quote (HTTP 402 body). The caller signs it and
   * calls `settleProvenanceQuery`. Reuses the real x402 requirements contract.
   * When facilitatorMode=cspr_cloud, attaches official WCSPR / CSPR.cloud quote meta.
   */
  quoteProvenanceQuery(assetId: string): { requirements: PaymentRequirements; assetId: string } {
    const payTo =
      process.env.LASTRE_X402_PAY_TO?.trim() ||
      process.env.LASTRE_X402_TARGET_ACCOUNT?.trim() ||
      DEFAULT_PAYMENT_REQUIREMENTS.payTo;
    const requirements: PaymentRequirements = {
      ...DEFAULT_PAYMENT_REQUIREMENTS,
      payTo,
      nonce: randomUUID(),
    };

    // Always attach official cloud quote meta when side-car (or primary) cloud is live.
    const cloudFacilitator = this.getCloudFacilitator();
    if (cloudFacilitator) {
      const cloud = cloudFacilitator.getQuoteMeta();
      requirements.cloud = cloud;
      if (this.x402Facilitator.mode === "cspr_cloud") {
        requirements.asset = "WCSPR";
        requirements.network = cloud.network;
        requirements.description =
          "Lastre provenance verification (WCSPR via CSPR.cloud facilitator)";
        const base = Number(cloud.amountBaseUnits);
        if (Number.isFinite(base) && base > 0) {
          requirements.maxAmountRequired = base;
        }
      }
    }

    this.x402Issued.set(requirements.nonce, requirements);
    return { requirements, assetId };
  }

  /** Primary or side-car CSPR.cloud facilitator (complete stack). */
  private getCloudFacilitator(): CsprCloudFacilitator | null {
    if (this.x402Facilitator instanceof CsprCloudFacilitator) {
      return this.x402Facilitator;
    }
    return this.x402CloudFacilitator;
  }

  /** Static + live (if token) CSPR.cloud / WCSPR path info for evidence + health. */
  getCsprCloudInfo(): {
    path: "official_make";
    facilitatorUrl: string;
    docs: string;
    examples: string;
    tradeWcspr: string;
    wcsprTestnetPackage: string;
    /** Primary mode is cspr_cloud */
    modeActive: boolean;
    /** Token present and facilitator constructed (primary or side-car) */
    cloudReady: boolean;
    primaryMode: string;
    quote: CloudQuoteMeta | null;
    envTokenConfigured: boolean;
  } {
    const envToken = Boolean(
      process.env.CSPR_CLOUD_API_TOKEN?.trim() ||
        process.env.LASTRE_CSPR_CLOUD_TOKEN?.trim() ||
        process.env.FACILITATOR_API_KEY?.trim(),
    );
    const cloud = this.getCloudFacilitator();
    const quote = cloud
      ? cloud.getQuoteMeta()
      : null;
    return {
      path: "official_make",
      facilitatorUrl: CSPR_CLOUD_FACILITATOR_URL,
      docs: "https://docs.cspr.cloud/x402-facilitator-api/reference",
      examples: "https://github.com/make-software/casper-x402",
      tradeWcspr: "https://testnet.cspr.trade",
      wcsprTestnetPackage: WCSPR_TESTNET_PACKAGE_HASH,
      modeActive: this.x402Facilitator.mode === "cspr_cloud",
      cloudReady: Boolean(cloud),
      primaryMode: this.x402Facilitator.mode,
      quote,
      envTokenConfigured: envToken,
    };
  }

  async probeCsprCloudSupported(): Promise<{
    ok: boolean;
    mode: string;
    primaryMode: string;
    cloudReady: boolean;
    supported?: unknown;
    error?: string;
  }> {
    const cloud = this.getCloudFacilitator();
    if (!cloud) {
      return {
        ok: false,
        mode: "unavailable",
        primaryMode: this.x402Facilitator.mode,
        cloudReady: false,
        error:
          "Set CSPR_CLOUD_API_TOKEN + LASTRE_WCSPR_PAY_TO (00+64hex account hash). Keep LASTRE_X402_MODE=casper for native settle side-by-side.",
      };
    }
    try {
      const supported = await cloud.getSupported();
      return {
        ok: true,
        mode: "cspr_cloud",
        primaryMode: this.x402Facilitator.mode,
        cloudReady: true,
        supported,
      };
    } catch (error) {
      return {
        ok: false,
        mode: "cspr_cloud",
        primaryMode: this.x402Facilitator.mode,
        cloudReady: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Settle with official CSPR.cloud body (EIP-712). Used by agents built on
   * make-software/casper-x402 — not by mock UI simulate.
   */
  async settleCsprCloudOfficial(
    assetId: string,
    body: CloudVerifyRequest,
  ): Promise<
    | {
        ok: true;
        txHash: string;
        settlementKind: "casper_deploy";
        paymentExplorerUrl: string | null;
        provenance: ReturnType<AppRuntime["getProvenanceSnapshot"]>;
        facilitatorMode: "cspr_cloud";
        network: string;
        payer: string;
        chainEvidence: Awaited<ReturnType<AppRuntime["getMintSummary"]>>["onChain"];
      }
    | { ok: false; reason: string; message?: string; facilitatorMode: string }
  > {
    if (!this.getLot(assetId)) {
      return { ok: false, reason: "unknown_asset", facilitatorMode: this.x402Facilitator.mode };
    }
    const cloud = this.getCloudFacilitator();
    if (!cloud) {
      return {
        ok: false,
        reason: "cloud_facilitator_unavailable",
        message:
          "Set CSPR_CLOUD_API_TOKEN + LASTRE_WCSPR_PAY_TO (00+64hex). Native CSPR: mode=casper + keys.",
        facilitatorMode: this.x402Facilitator.mode,
      };
    }
    const settled = await cloud.settleOfficial(body);
    if (!settled.ok) {
      return {
        ok: false,
        reason: settled.reason,
        message: settled.message,
        facilitatorMode: "cspr_cloud",
      };
    }
    this.x402QueryCount += 1;
    const paymentExplorerUrl = explorerTxUrlIfDeployHash(settled.txHash);
    this.lastCasperSettle = {
      txHash: settled.txHash,
      assetId,
      at: new Date().toISOString(),
      paymentExplorerUrl,
    };
    const summary = await this.getMintSummary();
    return {
      ok: true,
      txHash: settled.txHash,
      settlementKind: "casper_deploy",
      paymentExplorerUrl,
      provenance: this.getProvenanceSnapshot(assetId),
      facilitatorMode: "cspr_cloud",
      network: settled.network,
      payer: settled.payer,
      chainEvidence: summary.onChain,
    };
  }

  /**
   * x402 step 2 — verify + settle the payment through the facilitator seam, then
   * return the paid provenance snapshot. Mirrors the /verify flow in agent/x402.
   */
  async settleProvenanceQuery(
    assetId: string,
    payment: PaymentPayload,
  ): Promise<
    | {
        ok: true;
        txHash: string;
        settlementKind: "synthetic_receipt" | "casper_deploy";
        paymentExplorerUrl: string | null;
        provenance: ReturnType<AppRuntime["getProvenanceSnapshot"]>;
        facilitatorMode: string;
        chainEvidence: Awaited<ReturnType<AppRuntime["getMintSummary"]>>["onChain"];
      }
    | { ok: false; reason: string; message?: string; requirements?: PaymentRequirements }
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

    let settlement: { kind: "synthetic_receipt" | "casper_deploy"; txHash: string };
    try {
      settlement = await this.x402Facilitator.settlePayment(payment, requirements);
    } catch (error) {
      return {
        ok: false,
        reason: "settle_failed",
        message: error instanceof Error ? error.message : String(error),
        requirements,
      };
    }

    this.x402Issued.delete(payment.nonce);
    this.x402QueryCount += 1;
    const paymentExplorerUrl =
      settlement.kind === "casper_deploy"
        ? explorerTxUrlIfDeployHash(settlement.txHash)
        : null;
    if (settlement.kind === "casper_deploy") {
      this.lastCasperSettle = {
        txHash: settlement.txHash,
        assetId,
        at: new Date().toISOString(),
        paymentExplorerUrl,
      };
    }
    const summary = await this.getMintSummary();
    return {
      ok: true,
      txHash: settlement.txHash,
      settlementKind: settlement.kind,
      paymentExplorerUrl,
      provenance: this.getProvenanceSnapshot(assetId),
      facilitatorMode: this.x402Facilitator.mode,
      chainEvidence: summary.onChain,
    };
  }

  /**
   * Server-as-agent payer: quote → sign mock X-PAYMENT → settle via env facilitator.
   * - mock mode: refuses (use /api/x402/simulate — keeps paths honest)
   * - casper mode: real testnet native CSPR transfer via CasperFacilitator
   * - cspr_cloud mode: refuses mock-header settle; use POST /api/x402/cloud/settle with EIP-712 body
   */
  async settleAsAgent(
    assetId: string,
    from = "lastre-cli-agent",
  ): Promise<
    | {
        ok: true;
        txHash: string;
        settlementKind: "synthetic_receipt" | "casper_deploy";
        paymentExplorerUrl: string | null;
        provenance: ReturnType<AppRuntime["getProvenanceSnapshot"]>;
        facilitatorMode: string;
        chainEvidence: Awaited<ReturnType<AppRuntime["getMintSummary"]>>["onChain"];
        requirements: PaymentRequirements;
        amountCspr: number;
        payTo: string;
        totalPaidQueries: number;
      }
    | { ok: false; reason: string; message?: string; facilitatorMode: string }
  > {
    if (!this.getLot(assetId)) {
      return { ok: false, reason: "unknown_asset", facilitatorMode: this.x402Facilitator.mode };
    }
    if (this.x402Facilitator.mode === "cspr_cloud") {
      return {
        ok: false,
        reason: "use_cloud_settle_endpoint",
        message:
          "Primary mode is cspr_cloud — use POST /api/x402/cloud/settle with EIP-712 body. " +
          "For native auto-settle, set LASTRE_X402_MODE=casper (cloud side-car stays available if token set). " +
          "Judge mock: POST /api/x402/simulate.",
        facilitatorMode: "cspr_cloud",
      };
    }
    if (this.x402Facilitator.mode !== "casper") {
      return {
        ok: false,
        reason: "facilitator_not_casper",
        message:
          "Server is in mock mode. Set LASTRE_X402_MODE=casper + keys for native CSPR settle, " +
          "or LASTRE_X402_MODE=cspr_cloud + CSPR_CLOUD_API_TOKEN for WCSPR (POST /api/x402/cloud/settle), " +
          "or use POST /api/x402/simulate for judge-safe mock.",
        facilitatorMode: this.x402Facilitator.mode,
      };
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
    if (!settled.ok) {
      return {
        ok: false,
        reason: settled.reason,
        message: settled.message,
        facilitatorMode: this.x402Facilitator.mode,
      };
    }

    return {
      ok: true,
      txHash: settled.txHash,
      settlementKind: settled.settlementKind,
      paymentExplorerUrl: settled.paymentExplorerUrl,
      provenance: settled.provenance,
      facilitatorMode: settled.facilitatorMode,
      chainEvidence: settled.chainEvidence,
      requirements,
      amountCspr: requirements.maxAmountRequired / 1_000_000_000,
      payTo: requirements.payTo,
      totalPaidQueries: this.x402QueryCount,
    };
  }

  /**
   * DEMO helper: quote → sign → settle for the UI.
   * - Default / judge path: always uses a temporary MockFacilitator so Run Demo
   *   never requires a faucet key (even if LASTRE_X402_MODE=casper on the server).
   * - Real CSPR path: use settleProvenanceQuery with the env facilitator, or CLI.
   */
  async simulateAgentProvenanceQuery(assetId: string, from = "agent-casper-demo") {
    if (!this.getLot(assetId)) {
      return { ok: false as const, reason: "unknown_asset" };
    }
    // Force mock for the in-app judge demo so Casper mode never breaks UX.
    const mock = new MockFacilitator();
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
    // Temporarily settle with mock only (do not use this.x402Facilitator).
    const verification = await mock.verifyPayment(payment, requirements);
    if (!verification.ok) {
      return { ok: false as const, reason: verification.reason };
    }
    const settlement = await mock.settlePayment(payment, requirements);
    this.x402Issued.delete(payment.nonce);
    this.x402QueryCount += 1;
    const summary = await this.getMintSummary();
    return {
      ok: true as const,
      txHash: settlement.txHash,
      settlementKind: settlement.kind,
      provenance: this.getProvenanceSnapshot(assetId),
      facilitatorMode: mock.mode,
      chainEvidence: summary.onChain,
      requirements,
      amountCspr: requirements.maxAmountRequired / 1_000_000_000,
      payTo: requirements.payTo,
      totalPaidQueries: this.x402QueryCount,
      honestNote:
        "UI simulate path always uses mock synthetic_receipt. For real CSPR set LASTRE_X402_MODE=casper + keys and use CLI/API settle (not simulate).",
    };
  }

  getX402FacilitatorMode(): string {
    return this.x402Facilitator.mode;
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
