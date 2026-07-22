/**
 * Sealed Market Rail — origin-gated path from seal → query → mint → hold → demo collateral.
 *
 * Pure evaluation + product metadata. Runtime wires live lot/mint/lock state.
 * Not a DEX. Not investment. Finance/mint stay closed unless origin is Valid.
 */

export const SEALED_RAIL_PRODUCT = {
  id: "sealed-market-rail",
  name: "Sealed Market Rail",
  thesis: "Proof before token — and proof before finance.",
  tagline: "Tokenization and demo collateral only unlock after a Valid origin seal on Casper.",
  notA: ["DEX", "order book", "AMM", "token sale", "investment product", "lending market"],
  defaultDemoAssetId: "CARBON-VCS-AMAZONIA-2024-001",
  defaultInvalidAssetId: "MINA-VALEDOURO-LOTE-001-TAMPERED",
  appDeepLink: "https://app.lastre.io/marketplace?rail=1",
  landingAnchor: "https://lastre.io/#sealed-rail",
  myAssetsDeepLink: "https://app.lastre.io/my-assets?rail=1",
} as const;

export const SEALED_RAIL_HONESTY = {
  demonstration: "DEMONSTRATION — simulated assets, no investment offered",
  mintGate: "Demo simulated — session MintGate LotMinted, not free mint",
  x402Ui: "Mock facilitator on UI / POST /api/x402/simulate and POST /api/rail/run (no CSPR moved)",
  x402Settle:
    "Real testnet CSPR only via POST /api/x402/settle when facilitatorMode=casper — never the marketplace button",
  collateral: "Demo collateral — lock/release in session memory; no liquidation, yield, or investment",
  proofOfOrigin: "Live ProofOfOrigin when onChain.source is live | live-rpc; else fallback snapshot",
  phrase:
    "Seal decides Valid/Invalid. Agents pay/skip/escalate only. Invalid permanently closes mint + demo finance.",
} as const;

export type SealedRailStepId =
  | "origin_seal"
  | "provenance_query"
  | "mint_gate"
  | "sealed_asset"
  | "demo_collateral";

export type SealedRailStepStatus =
  | "locked"
  | "ready"
  | "complete"
  | "blocked"
  | "demo_pending";

export type SealedRailStep = {
  id: SealedRailStepId;
  index: number;
  title: string;
  detail: string;
  status: SealedRailStepStatus;
  honesty: string;
  reason: string | null;
};

export type SealedRailGateCode =
  | "OK"
  | "UNKNOWN_ASSET"
  | "UNVERIFIED"
  | "INVALID_ORIGIN"
  | "NOT_MINTED"
  | "ALREADY_MINTED"
  | "ALREADY_LOCKED"
  | "NOT_LOCKED"
  | "OWNER_MISMATCH";

export type SealedRailInput = {
  assetId: string;
  exists: boolean;
  verdict: "Valid" | "Invalid" | "Unverified" | null;
  sealMatch: boolean | null;
  attested: boolean;
  minted: boolean;
  mintTx: string | null;
  paidQueryCount: number;
  /** True if this session recorded at least one paid x402 query (any asset). */
  sessionHasPaidQuery: boolean;
  locked: boolean;
  lockedOwner: string | null;
  lockedAt: string | null;
};

export type SealedRailStatus = {
  product: typeof SEALED_RAIL_PRODUCT;
  honesty: typeof SEALED_RAIL_HONESTY;
  assetId: string;
  exists: boolean;
  verdict: string;
  railOpen: boolean;
  /** True when mint + collateral may proceed (Valid origin). */
  financeGateOpen: boolean;
  blockedReason: string | null;
  gateCode: SealedRailGateCode;
  steps: SealedRailStep[];
  eligibility: {
    canQuery: boolean;
    canMint: boolean;
    canLock: boolean;
    canRelease: boolean;
    mintCode: SealedRailGateCode;
    lockCode: SealedRailGateCode;
  };
  progress: {
    completedSteps: number;
    totalSteps: number;
    complete: boolean;
  };
  links: {
    marketplace: string;
    myAssets: string;
    landing: string;
  };
  evaluatedAt: string;
};

const STEP_META: Array<{
  id: SealedRailStepId;
  title: string;
  detail: string;
  honesty: string;
}> = [
  {
    id: "origin_seal",
    title: "Origin seal",
    detail: "Physical reading sealed offline; Casper records Valid or Invalid.",
    honesty: SEALED_RAIL_HONESTY.proofOfOrigin,
  },
  {
    id: "provenance_query",
    title: "Provenance query",
    detail: "Agent or operator reads the verdict before any downstream action.",
    honesty: SEALED_RAIL_HONESTY.x402Ui,
  },
  {
    id: "mint_gate",
    title: "MintGate claim",
    detail: "Demo mint access only after Valid origin attestation.",
    honesty: SEALED_RAIL_HONESTY.mintGate,
  },
  {
    id: "sealed_asset",
    title: "Sealed asset",
    detail: "Claimed lot is inspectable in My Assets (demo collection).",
    honesty: SEALED_RAIL_HONESTY.mintGate,
  },
  {
    id: "demo_collateral",
    title: "Demo collateral",
    detail: "Lock/release is simulated; origin must stay Valid and lot must be minted.",
    honesty: SEALED_RAIL_HONESTY.collateral,
  },
];

function normalizeVerdict(
  verdict: SealedRailInput["verdict"],
): "Valid" | "Invalid" | "Unverified" {
  if (verdict === "Valid" || verdict === "Invalid") return verdict;
  return "Unverified";
}

export function evaluateSealedRail(input: SealedRailInput): SealedRailStatus {
  const verdict = normalizeVerdict(input.verdict);
  const evaluatedAt = new Date().toISOString();

  if (!input.exists) {
    const steps = STEP_META.map((meta, index) => ({
      ...meta,
      index: index + 1,
      status: "blocked" as const,
      reason: "Unknown asset",
    }));
    return {
      product: SEALED_RAIL_PRODUCT,
      honesty: SEALED_RAIL_HONESTY,
      assetId: input.assetId,
      exists: false,
      verdict: "Unverified",
      railOpen: false,
      financeGateOpen: false,
      blockedReason: "Unknown asset — not in demo catalog or session lots",
      gateCode: "UNKNOWN_ASSET",
      steps,
      eligibility: {
        canQuery: false,
        canMint: false,
        canLock: false,
        canRelease: false,
        mintCode: "UNKNOWN_ASSET",
        lockCode: "UNKNOWN_ASSET",
      },
      progress: { completedSteps: 0, totalSteps: 5, complete: false },
      links: {
        marketplace: SEALED_RAIL_PRODUCT.appDeepLink,
        myAssets: SEALED_RAIL_PRODUCT.myAssetsDeepLink,
        landing: SEALED_RAIL_PRODUCT.landingAnchor,
      },
      evaluatedAt,
    };
  }

  const financeGateOpen = verdict === "Valid";
  const invalidBlocked = verdict === "Invalid";
  const unverified = verdict === "Unverified";

  let gateCode: SealedRailGateCode = "OK";
  let blockedReason: string | null = null;
  if (invalidBlocked) {
    gateCode = "INVALID_ORIGIN";
    blockedReason =
      "Invalid is permanent proof. MintGate and demo collateral stay closed.";
  } else if (unverified) {
    gateCode = "UNVERIFIED";
    blockedReason = "No Valid origin attestation yet — rail finance steps stay closed.";
  }

  // Step 1 — origin seal
  let step1: SealedRailStepStatus = "ready";
  let step1Reason: string | null = null;
  if (verdict === "Valid") {
    step1 = "complete";
  } else if (verdict === "Invalid") {
    step1 = "blocked";
    step1Reason = "Origin seal Invalid — rejection is on-chain proof";
  } else {
    step1 = "ready";
    step1Reason = "Awaiting Valid/Invalid attestation";
  }

  // Step 2 — provenance query (session-level paid query counts as progress for demo)
  let step2: SealedRailStepStatus = "locked";
  let step2Reason: string | null = "Complete origin seal first";
  if (step1 === "complete" || step1 === "blocked") {
    if (input.sessionHasPaidQuery || input.paidQueryCount > 0) {
      step2 = "complete";
      step2Reason = null;
    } else {
      step2 = "ready";
      step2Reason = "Run mock x402 query (POST /api/x402/simulate or /api/rail/run)";
    }
  }
  if (step1 === "blocked") {
    // Still allow query so judges can read Invalid payload
    step2 = input.sessionHasPaidQuery || input.paidQueryCount > 0 ? "complete" : "ready";
    step2Reason =
      step2 === "complete"
        ? "Query read Invalid origin (rail remains closed downstream)"
        : "Query allowed — mint/finance still blocked by Invalid";
  }

  // Step 3 — mint gate
  let step3: SealedRailStepStatus = "locked";
  let step3Reason: string | null = "Requires Valid origin";
  let mintCode: SealedRailGateCode = financeGateOpen ? "OK" : gateCode;
  if (invalidBlocked) {
    step3 = "blocked";
    step3Reason = "NoValidProof — Invalid origin";
    mintCode = "INVALID_ORIGIN";
  } else if (unverified) {
    step3 = "locked";
    step3Reason = "NoValidProof — missing Valid attestation";
    mintCode = "UNVERIFIED";
  } else if (input.minted) {
    step3 = "complete";
    step3Reason = null;
    mintCode = "ALREADY_MINTED";
  } else {
    step3 = "ready";
    step3Reason = "Eligible for demo MintGate claim";
    mintCode = "OK";
  }

  // Step 4 — sealed asset (same as minted for this demo surface)
  let step4: SealedRailStepStatus = "locked";
  let step4Reason: string | null = "MintGate claim required";
  if (input.minted) {
    step4 = "complete";
    step4Reason = null;
  } else if (step3 === "blocked") {
    step4 = "blocked";
    step4Reason = step3Reason;
  } else if (step3 === "ready") {
    step4 = "demo_pending";
    step4Reason = "Pending MintGate demo claim";
  }

  // Step 5 — demo collateral
  let step5: SealedRailStepStatus = "locked";
  let step5Reason: string | null = "Requires Valid + minted";
  let lockCode: SealedRailGateCode = "NOT_MINTED";
  if (invalidBlocked) {
    step5 = "blocked";
    step5Reason = "Invalid origin — demo collateral closed";
    lockCode = "INVALID_ORIGIN";
  } else if (!financeGateOpen) {
    step5 = "locked";
    step5Reason = "Valid origin required";
    lockCode = "UNVERIFIED";
  } else if (!input.minted) {
    step5 = "locked";
    step5Reason = "Asset must be minted first";
    lockCode = "NOT_MINTED";
  } else if (input.locked) {
    step5 = "complete";
    step5Reason = null;
    lockCode = "ALREADY_LOCKED";
  } else {
    step5 = "ready";
    step5Reason = "Eligible for demo collateral lock";
    lockCode = "OK";
  }

  const statuses = [step1, step2, step3, step4, step5];
  const reasons = [step1Reason, step2Reason, step3Reason, step4Reason, step5Reason];
  const steps: SealedRailStep[] = STEP_META.map((meta, i) => ({
    ...meta,
    index: i + 1,
    status: statuses[i]!,
    reason: reasons[i] ?? null,
  }));

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const canMint = financeGateOpen && !input.minted;
  const canLock = financeGateOpen && input.minted && !input.locked;
  const canRelease = input.locked;

  return {
    product: SEALED_RAIL_PRODUCT,
    honesty: SEALED_RAIL_HONESTY,
    assetId: input.assetId,
    exists: true,
    verdict,
    railOpen: !invalidBlocked,
    financeGateOpen,
    blockedReason,
    gateCode,
    steps,
    eligibility: {
      canQuery: true,
      canMint,
      canLock,
      canRelease,
      mintCode: canMint ? "OK" : mintCode,
      lockCode: canLock ? "OK" : lockCode,
    },
    progress: {
      completedSteps,
      totalSteps: 5,
      complete: completedSteps === 5,
    },
    links: {
      marketplace: `${SEALED_RAIL_PRODUCT.appDeepLink}&assetId=${encodeURIComponent(input.assetId)}`,
      myAssets: `https://app.lastre.io/my-assets?asset=${encodeURIComponent(input.assetId)}&rail=1`,
      landing: SEALED_RAIL_PRODUCT.landingAnchor,
    },
    evaluatedAt,
  };
}

/** Product overview without a specific asset (GET /api/rail). */
export function sealedRailOverview() {
  return {
    product: SEALED_RAIL_PRODUCT,
    honesty: SEALED_RAIL_HONESTY,
    steps: STEP_META.map((meta, index) => ({
      id: meta.id,
      index: index + 1,
      title: meta.title,
      detail: meta.detail,
      honesty: meta.honesty,
    })),
    endpoints: {
      overview: "GET /api/rail",
      status: "GET /api/rail/:assetId",
      run: "POST /api/rail/run  { assetId, owner?, minter? }  // mock query + Valid-only mint",
      mint: "POST /api/mint  // Valid-only MintGate demo",
      simulateX402: "POST /api/x402/simulate/:assetId  // mock only",
      settleX402: "POST /api/x402/settle/:assetId  // real CSPR when casper mode",
      lock: "POST /api/defi/lock  // Valid + minted only",
      release: "POST /api/defi/release",
      eligibility: "GET /api/defi/eligibility/:assetId",
      evidence: "GET /api/evidence",
    },
    sampleAssets: {
      validDemo: SEALED_RAIL_PRODUCT.defaultDemoAssetId,
      invalidDemo: SEALED_RAIL_PRODUCT.defaultInvalidAssetId,
    },
  };
}
