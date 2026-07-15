/**
 * MintGate economics — contract-logic parity with contracts/lastro_origin/src/mint_gate.rs
 *
 * On-chain MintGate is symbolic tokenization gated by ProofOfOrigin Valid.
 * This module enforces the same rules for the API/demo layer so "mint economics"
 * is not a free-form counter:
 *   - NoValidProof if verdict !== Valid
 *   - AlreadyMinted if asset already gated
 *   - LotMinted event + mint_count++
 *
 * Optional: LASTRE_MINTGATE_PACKAGE_HASH when a live package is deployed.
 */

export type MintGateErrorCode = "NoValidProof" | "AlreadyMinted" | "NotOwner";

export type MintEconomicsEvent = {
  assetId: string;
  minter: string;
  mintTx: string;
  at: string;
  gate: "LotMinted";
  requiresValidProof: true;
};

export type MintAttemptResult =
  | { ok: true; event: MintEconomicsEvent; mintCount: number }
  | { ok: false; error: MintGateErrorCode; message: string; mintCount: number };

export type MintEconomicsSnapshot = {
  /** Mirrors MintGate contract design */
  contract: {
    name: "MintGate";
    source: "contracts/lastro_origin/src/mint_gate.rs";
    wasm: "contracts/lastro_origin/wasm/MintGate.wasm";
    symbolicMint: true;
    crossContractGate: "ProofOfOrigin.get_attestation → require Verdict::Valid";
    errors: MintGateErrorCode[];
  };
  livePackageHash: string | null;
  livePackageUrl: string | null;
  mintCount: number;
  mintedAssetIds: string[];
  events: MintEconomicsEvent[];
  rules: string[];
  note: string;
};

export class MintEconomicsGate {
  private readonly minted = new Set<string>();
  private readonly events: MintEconomicsEvent[] = [];
  private count = 0;

  /**
   * Attempt symbolic mint — same control flow as MintGate.mint_lot.
   * @param hasValidProof equivalent to on-chain attestation.verdict == Valid
   */
  mintLot(input: {
    assetId: string;
    minter: string;
    hasValidProof: boolean;
    mintTx?: string;
  }): MintAttemptResult {
    if (this.minted.has(input.assetId)) {
      return {
        ok: false,
        error: "AlreadyMinted",
        message: "MintGate: asset already tokenized/registered in this gate",
        mintCount: this.count,
      };
    }
    if (!input.hasValidProof) {
      return {
        ok: false,
        error: "NoValidProof",
        message: "MintGate: NoValidProof — ProofOfOrigin must be Valid before mint",
        mintCount: this.count,
      };
    }

    this.minted.add(input.assetId);
    this.count += 1;
    const event: MintEconomicsEvent = {
      assetId: input.assetId,
      minter: input.minter,
      mintTx: input.mintTx ?? `mint-gate-${Date.now().toString(16)}-${input.assetId.slice(-6)}`,
      at: new Date().toISOString(),
      gate: "LotMinted",
      requiresValidProof: true,
    };
    this.events.unshift(event);
    return { ok: true, event, mintCount: this.count };
  }

  isMinted(assetId: string): boolean {
    return this.minted.has(assetId);
  }

  mintCount(): number {
    return this.count;
  }

  eventsList(limit = 20): MintEconomicsEvent[] {
    return this.events.slice(0, limit);
  }

  snapshot(): MintEconomicsSnapshot {
    const live =
      process.env.LASTRE_MINTGATE_PACKAGE_HASH?.trim() ||
      process.env.MINTGATE_PACKAGE_HASH?.trim() ||
      null;
    const liveHash = live?.replace(/^hash-/, "") ?? null;

    return {
      contract: {
        name: "MintGate",
        source: "contracts/lastro_origin/src/mint_gate.rs",
        wasm: "contracts/lastro_origin/wasm/MintGate.wasm",
        symbolicMint: true,
        crossContractGate: "ProofOfOrigin.get_attestation → require Verdict::Valid",
        errors: ["NoValidProof", "AlreadyMinted", "NotOwner"],
      },
      livePackageHash: live ? (live.startsWith("hash-") ? live : `hash-${live}`) : null,
      livePackageUrl: liveHash
        ? `https://testnet.cspr.live/contract-package/${liveHash}`
        : null,
      mintCount: this.count,
      mintedAssetIds: [...this.minted],
      events: this.eventsList(20),
      rules: [
        "mint_lot only if ProofOfOrigin attestation is Valid",
        "AlreadyMinted reverts on second mint of same asset_id",
        "Invalid / missing attestation → NoValidProof (no token)",
        "Symbolic mint records gate passage — not a free ERC-style mint",
      ],
      note: live
        ? "Live MintGate package hash configured — economics gate enforced in API; on-chain package linked."
        : "MintGate economics enforced in API with full contract-logic parity. Live package optional via LASTRE_MINTGATE_PACKAGE_HASH. WASM + Rust tests ship in repo.",
    };
  }
}
