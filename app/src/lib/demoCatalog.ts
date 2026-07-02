import type {
  AssetCategory,
  CarbonCreditType,
  LotDetail,
  ProvenanceArtifact,
  VerificationVerdict,
} from "./types";

/**
 * Shape of a Marketplace/Global-Mundi catalog seed. These are fictional
 * showcase assets that the console API may not know about.
 */
export interface CatalogAsset {
  assetId: string;
  name?: string;
  category?: AssetCategory;
  origin?: { lat: number; lng: number; site?: string; label?: string };
  creditType?: string;
  tonnesCO2e?: number;
  mineral?: string;
  expectedOnChain?: string;
}

/**
 * Frontend demo catalog — the single source of truth for showcase assets that
 * are rendered in the Marketplace grid and the Global Mundi map but do not
 * necessarily exist in the console API.
 *
 * `buildDemoLotDetail()` (below) lets their `/lots/:assetId` detail pages
 * resolve locally instead of dead-ending on a 404 "Unknown lot" + Retry.
 *
 * DEMONSTRATION ONLY — every entry here is fictional data.
 */
export const DEMO_CATALOG: CatalogAsset[] = [
  {
    assetId: "MINA-VALEDOURO-LOTE-002",
    category: "mineral",
    mineral: "Gold",
    expectedOnChain: "Valid",
    origin: { lat: -20.123456, lng: -43.987654, site: "Mina Vale do Ouro — fictional" },
  },
  {
    assetId: "CARBON-VCS-AMAZONIA-2024-001",
    category: "carbon_credit",
    creditType: "VCS",
    tonnesCO2e: 125000,
    expectedOnChain: "Valid",
    origin: { lat: -3.12, lng: -60.01, site: "Amazon REDD+ Zone A — fictional" },
  },
  {
    assetId: "CARBON-GOLDSTANDARD-SOLAR-2025-002",
    category: "carbon_credit",
    creditType: "GoldStandard",
    tonnesCO2e: 45000,
    origin: { lat: -5.78, lng: -35.2, site: "Northeast Solar Park — fictional" },
  },
  {
    assetId: "CARBON-IREC-WIND-2024-004",
    category: "carbon_credit",
    creditType: "IREC",
    tonnesCO2e: 62000,
    origin: { lat: -50.1, lng: -68.4, site: "Patagonia Wind Corridor — fictional" },
  },
];

const DEMO_CAPTURED_ISO = "2026-06-24T12:00:00.000Z";

export function getDemoCatalogAsset(assetId: string): CatalogAsset | undefined {
  return DEMO_CATALOG.find((asset) => asset.assetId === assetId);
}

/**
 * Deterministic demo seal, shared by the Marketplace card and the lot detail so
 * the "computed" and "reference" seals visibly match for catalog assets.
 */
export function demoSeal(assetId: string): string {
  return `a1b2c3d4e5f6${assetId.slice(-6)}`;
}

/** Deterministic fictional hex string for demo-only fields (e.g. frame hash). */
function demoHex(seed: string, length = 64): string {
  let state = 0x811c9dc5;
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const code = seed.charCodeAt(i % Math.max(seed.length, 1)) || 0;
    state = (state * 31 + code + i) >>> 0;
    out += (state & 0xf).toString(16);
  }
  return out;
}

/**
 * Build a browser-only LotDetail for a demo catalog asset so its detail page
 * renders coherently when the API returns 404 for it.
 *
 * Returns null for unknown ids — callers MUST keep the real "Unknown lot"
 * behavior in that case (typos / genuinely missing lots should still 404).
 */
export function buildDemoLotDetail(assetId: string): LotDetail | null {
  const asset = getDemoCatalogAsset(assetId);
  if (!asset) return null;

  const category: AssetCategory =
    asset.category ?? (asset.creditType ? "carbon_credit" : "mineral");
  const isCarbon = category === "carbon_credit";
  const isValid = asset.expectedOnChain === "Valid";
  const seal = demoSeal(assetId);

  const artifact: ProvenanceArtifact = {
    assetId,
    category,
    origin: {
      lat: asset.origin?.lat ?? 0,
      lng: asset.origin?.lng ?? 0,
      site: asset.origin?.site ?? asset.origin?.label ?? "Demo origin — fictional",
    },
    frameHash: demoHex(assetId),
    capturedAtISO: DEMO_CAPTURED_ISO,
    operator: asset.name ?? (isCarbon ? "Demo carbon registry" : "Demo mineral operator"),
  };

  if (isCarbon) {
    if (asset.creditType) artifact.creditType = asset.creditType as CarbonCreditType;
    if (asset.tonnesCO2e != null) artifact.tonnesCO2e = asset.tonnesCO2e;
  } else if (asset.mineral) {
    artifact.mineral = asset.mineral;
  }

  const latestVerdict: VerificationVerdict | null = isValid ? "Valid" : null;

  return {
    artifact,
    referenceSeal: seal,
    computedSeal: seal,
    sealMatchesReference: true,
    attested: isValid,
    latestVerdict,
    demoRole: isCarbon
      ? "Catalog carbon credit · fictional demo asset"
      : "Catalog mineral lot · fictional demo asset",
    auditRecord: null,
    isMinted: false,
    mintTx: null,
    testnetAttestation: null,
  };
}
