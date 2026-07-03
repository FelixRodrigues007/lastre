import { buildDemoLotDetail } from "./demoCatalog";
import type { LotDetail, LotListItem } from "./types";

export const DEMO_MINTS_KEY = "casper-demo-mints";
export const DEMO_COLLECTION_INIT_KEY = "casper-demo-collection-init";

/** Showcase assets pre-minted for the My Assets demo layer. */
export const DEMO_COLLECTION_ASSET_IDS = [
  "CARBON-VCS-AMAZONIA-2024-001",
  "MINA-VALEDOURO-LOTE-002",
] as const;

export type DemoMintRecord = {
  assetId: string;
  mintTx: string;
  mintedAt: string;
};

function readMintMap(): Record<string, DemoMintRecord> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(DEMO_MINTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DemoMintRecord>;
  } catch {
    return {};
  }
}

function writeMintMap(map: Record<string, DemoMintRecord>): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(DEMO_MINTS_KEY, JSON.stringify(map));
}

export function readDemoMintIds(): string[] {
  return Object.keys(readMintMap());
}

export function getDemoMintRecord(assetId: string): DemoMintRecord | null {
  return readMintMap()[assetId] ?? null;
}

export function isDemoMinted(assetId: string): boolean {
  return Boolean(readMintMap()[assetId]);
}

export function addDemoMint(assetId: string): DemoMintRecord {
  const map = readMintMap();
  const existing = map[assetId];
  if (existing) return existing;

  const record: DemoMintRecord = {
    assetId,
    mintTx: `demo-mint-${assetId.slice(-8).toLowerCase()}-${Date.now().toString(16)}`,
    mintedAt: new Date().toISOString(),
  };
  map[assetId] = record;
  writeMintMap(map);
  return record;
}

export function seedDemoCollection(): DemoMintRecord[] {
  return DEMO_COLLECTION_ASSET_IDS.map((assetId) => addDemoMint(assetId));
}

export function shouldAutoSeedDemoCollection(apiMintedCount: number): boolean {
  if (typeof localStorage === "undefined") return false;
  if (apiMintedCount > 0) return false;
  if (readDemoMintIds().length > 0) return false;
  return localStorage.getItem(DEMO_COLLECTION_INIT_KEY) !== "1";
}

export function markDemoCollectionInitialized(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(DEMO_COLLECTION_INIT_KEY, "1");
}

export function applyDemoMint<T extends LotDetail | LotListItem>(lot: T): T {
  const record = getDemoMintRecord(lot.artifact.assetId);
  if (!record) return lot;
  return {
    ...lot,
    isMinted: true,
    mintTx: record.mintTx,
  };
}

export function buildDemoMintedLotListItem(assetId: string): LotListItem | null {
  const base = buildDemoLotDetail(assetId);
  if (!base) return null;
  const record = getDemoMintRecord(assetId);
  if (!record) return null;
  return applyDemoMint(base);
}

export function buildDemoMintedLotDetail(assetId: string): LotDetail | null {
  const base = buildDemoLotDetail(assetId);
  if (!base) return null;
  const record = getDemoMintRecord(assetId);
  if (!record) return null;
  return applyDemoMint(base);
}
