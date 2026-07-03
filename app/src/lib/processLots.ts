import type { TranslationKey } from "../i18n/translations";
import type { LotListItem } from "./types";

export type LotExpectedKind = "valid" | "invalid" | "skip" | "escalate" | "unknown";

const TAMPERED_SUFFIX = "-TAMPERED";
const OUT_OF_REGION_ID = "LOTE-OUTOFREGION";
const CARBON_PREFIX = "CARBON-";

export function isUserCapturedLot(lot: LotListItem): boolean {
  return lot.demoRole.toLowerCase().includes("user submitted");
}

export function isTamperedDemoLot(lot: LotListItem): boolean {
  return (
    lot.demoRole.toLowerCase().includes("tampered") ||
    lot.artifact.assetId.endsWith(TAMPERED_SUFFIX)
  );
}

export function inferExpectedKind(lot: LotListItem): LotExpectedKind {
  const role = lot.demoRole.toLowerCase();
  const id = lot.artifact.assetId;

  if (role.includes("tampered") || id.endsWith(TAMPERED_SUFFIX)) return "invalid";
  if (role.includes("duplicate")) return "skip";
  if (
    role.includes("outside") ||
    role.includes("perimeter") ||
    id === OUT_OF_REGION_ID
  ) {
    return "escalate";
  }
  if (role.includes("valid") || role.includes("genuine") || id.startsWith(CARBON_PREFIX)) {
    return "valid";
  }
  return "unknown";
}

export function expectedKindLabelKey(kind: LotExpectedKind): TranslationKey | null {
  switch (kind) {
    case "valid":
      return "process.expected.valid";
    case "invalid":
      return "process.expected.invalid";
    case "skip":
      return "process.expected.skip";
    case "escalate":
      return "process.expected.escalate";
    default:
      return null;
  }
}

export type LotPreviewExpectation = {
  actionKey: TranslationKey;
  verdictKey: TranslationKey | null;
};

/** Demo script — what the batch will show before it runs. */
export function lotPreviewExpectation(lot: LotListItem): LotPreviewExpectation {
  const kind = inferExpectedKind(lot);
  switch (kind) {
    case "invalid":
      return { actionKey: "process.preview.pay", verdictKey: "process.preview.invalid" };
    case "escalate":
      return { actionKey: "process.preview.escalate", verdictKey: null };
    case "skip":
      return { actionKey: "process.preview.skip", verdictKey: null };
    case "valid":
    default:
      return { actionKey: "process.preview.pay", verdictKey: "process.preview.valid" };
  }
}

export function expectedKindClass(kind: LotExpectedKind): string {
  return kind === "unknown" ? "neutral" : kind;
}

export function lotShortNameKey(lot: LotListItem): TranslationKey {
  const kind = inferExpectedKind(lot);
  if (isUserCapturedLot(lot)) return "process.lotShort.captured";
  switch (kind) {
    case "valid":
      return lot.artifact.assetId.startsWith(CARBON_PREFIX)
        ? "process.lotShort.carbon"
        : "process.lotShort.genuine";
    case "invalid":
      return "process.lotShort.tampered";
    case "skip":
      return "process.lotShort.duplicate";
    case "escalate":
      return "process.lotShort.escalate";
    default:
      return "process.lotShort.captured";
  }
}

export function partitionProcessLots(
  lots: LotListItem[],
  defaultAssetIds: string[],
): { demoLots: LotListItem[]; capturedLots: LotListItem[] } {
  const defaultSet = new Set(defaultAssetIds);
  const demoLots: LotListItem[] = [];
  const capturedLots: LotListItem[] = [];

  for (const lot of lots) {
    if (defaultSet.has(lot.artifact.assetId)) {
      demoLots.push(lot);
    } else if (isUserCapturedLot(lot)) {
      capturedLots.push(lot);
    }
  }

  demoLots.sort(
    (a, b) =>
      defaultAssetIds.indexOf(a.artifact.assetId) - defaultAssetIds.indexOf(b.artifact.assetId),
  );

  return { demoLots, capturedLots };
}
