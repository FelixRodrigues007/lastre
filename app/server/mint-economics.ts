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

/** Live MintGate package on Casper Testnet (deployed 2026-07-15). */
export const DEFAULT_MINTGATE_PACKAGE_HASH =
  "hash-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1";
/** Real mint_lot tx for MINA-VALEDOURO-LOTE-002 (Valid proof → gate pass). */
export const DEFAULT_MINTGATE_MINT_LOT_TX =
  "6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349";
/** Install/deploy session tx for MintGate package. */
export const DEFAULT_MINTGATE_INSTALL_TX =
  "13955752c3836b5fbc0da7281af102cc5f8953eae7ba543232697d3f3f81e8b7";

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
  liveInstallTx: string | null;
  liveMintLotTx: string | null;
  liveMintLotExplorerUrl: string | null;
  liveSampleAssetId: string | null;
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
    const liveRaw =
      process.env.LASTRE_MINTGATE_PACKAGE_HASH?.trim() ||
      process.env.MINTGATE_PACKAGE_HASH?.trim() ||
      DEFAULT_MINTGATE_PACKAGE_HASH;
    const live = liveRaw.startsWith("hash-") ? liveRaw : `hash-${liveRaw.replace(/^hash-/, "")}`;
    const liveHash = live.replace(/^hash-/, "");
    const mintLotTx =
      process.env.LASTRE_MINTGATE_MINT_LOT_TX?.trim().toLowerCase() || DEFAULT_MINTGATE_MINT_LOT_TX;
    const installTx =
      process.env.LASTRE_MINTGATE_INSTALL_TX?.trim().toLowerCase() || DEFAULT_MINTGATE_INSTALL_TX;

    return {
      contract: {
        name: "MintGate",
        source: "contracts/lastro_origin/src/mint_gate.rs",
        wasm: "contracts/lastro_origin/wasm/MintGate.wasm",
        symbolicMint: true,
        crossContractGate: "ProofOfOrigin.get_attestation → require Verdict::Valid",
        errors: ["NoValidProof", "AlreadyMinted", "NotOwner"],
      },
      livePackageHash: live,
      livePackageUrl: `https://testnet.cspr.live/contract-package/${liveHash}`,
      liveInstallTx: installTx,
      liveMintLotTx: mintLotTx,
      liveMintLotExplorerUrl: `https://testnet.cspr.live/transaction/${mintLotTx}`,
      liveSampleAssetId: "MINA-VALEDOURO-LOTE-002",
      mintCount: this.count,
      mintedAssetIds: [...this.minted],
      events: this.eventsList(20),
      rules: [
        "mint_lot only if ProofOfOrigin attestation is Valid",
        "AlreadyMinted reverts on second mint of same asset_id",
        "Invalid / missing attestation → NoValidProof (no token)",
        "Symbolic mint records gate passage — not a free ERC-style mint",
      ],
      note:
        "Live MintGate on Casper Testnet. Cross-contract gate over ProofOfOrigin; sample mint_lot for Valid lot-002 on-chain. API still enforces same economics rules for session mints.",
    };
  }
}
