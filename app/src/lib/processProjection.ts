import type { AuditRecord } from "./types";

export type LotExpectation = "valid" | "invalid" | "skip" | "escalate";

export type ProjectionMarker = {
  x: number;
  label: string;
  tone: "valid" | "invalid" | "neutral";
};

export type ProjectionSeries = {
  points: number[];
  markers: ProjectionMarker[];
};

function lotExpectation(assetId: string, assetIds: string[]): LotExpectation {
  const idx = assetIds.indexOf(assetId);
  if (idx === 0) return "valid";
  if (idx === 1) return "invalid";
  if (idx === 2) return "skip";
  if (idx === 3) return "escalate";
  return "valid";
}

function expectedContribution(expectation: LotExpectation, onChain: boolean): number {
  if (onChain) {
    if (expectation === "valid" || expectation === "invalid") return 1;
    return 0;
  }
  if (expectation === "valid" || expectation === "invalid") return 1;
  return 0;
}

function recordContribution(record: AuditRecord, onChain: boolean): number {
  if (onChain) return record.onChain ? 1 : 0;
  return record.verification ? 1 : 0;
}

/** Stable demo order: Genuine → Tampered → Duplicate → Escalate. */
export function orderedSelectedLots(assetIds: string[], selected: string[]): string[] {
  return assetIds.filter((id) => selected.includes(id));
}

export function buildExpectedProjection(
  assetIds: string[],
  selected: string[],
  onChain: boolean,
): ProjectionSeries {
  const ordered = orderedSelectedLots(assetIds, selected);
  const points = [0];
  const markers: ProjectionMarker[] = [];
  let cumulative = 0;

  ordered.forEach((assetId, index) => {
    const expectation = lotExpectation(assetId, assetIds);
    cumulative += expectedContribution(expectation, onChain);
    points.push(cumulative);

    if (expectation === "invalid") {
      markers.push({
        x: index + 1,
        label: "tamper",
        tone: "invalid",
      });
    }
  });

  return { points, markers };
}

export function buildBandProjection(
  assetIds: string[],
  selected: string[],
  onChain: boolean,
): { high: number[]; low: number[] } {
  const ordered = orderedSelectedLots(assetIds, selected);
  const high = [0];
  const low = [0];
  let hi = 0;
  let lo = 0;

  ordered.forEach((assetId) => {
    const expectation = lotExpectation(assetId, assetIds);
    hi += 1;
    lo += expectation === "valid" ? 1 : 0;
    if (!onChain && expectation === "escalate") {
      lo += 0;
    }
    high.push(hi);
    low.push(lo);
  });

  if (!onChain) {
    return { high, low };
  }

  const onChainHigh = [0];
  const onChainLow = [0];
  let hiChain = 0;
  let loChain = 0;

  ordered.forEach((assetId) => {
    const expectation = lotExpectation(assetId, assetIds);
    if (expectation === "valid" || expectation === "invalid") {
      hiChain += 1;
      if (expectation === "valid") loChain += 1;
    }
    onChainHigh.push(hiChain);
    onChainLow.push(loChain);
  });

  return { high: onChainHigh, low: onChainLow };
}

export function buildLiveProjection(
  records: AuditRecord[],
  onChain: boolean,
): number[] {
  const points = [0];
  let cumulative = 0;

  records.forEach((record) => {
    cumulative += recordContribution(record, onChain);
    points.push(cumulative);
  });

  return points;
}

export function buildLiveMarkers(
  records: AuditRecord[],
  assetIds: string[],
  batchComplete: boolean,
): ProjectionMarker[] {
  const markers: ProjectionMarker[] = [];

  records.forEach((record, index) => {
    const verdict = record.verification?.verdict ?? record.onChain?.verdict;
    if (verdict === "Invalid" && assetIds.indexOf(record.assetId) === 1) {
      markers.push({
        x: index + 1,
        label: "tamper",
        tone: "invalid",
      });
    }
  });

  if (batchComplete && records.length > 0) {
    markers.push({
      x: records.length,
      label: "batch",
      tone: "neutral",
    });
  }

  return markers;
}
