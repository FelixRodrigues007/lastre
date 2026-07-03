/** Shared SVG geometry for Overview dashboard charts (400×192). */

export const OVERVIEW_CHART_WIDTH = 400;
export const OVERVIEW_CHART_HEIGHT = 192;
export const OVERVIEW_PROGRESS_CHART_HEIGHT = 192;
export const OVERVIEW_PIPELINE_CHART_HEIGHT = 192;

export const OVERVIEW_PAD = {
  top: 10,
  right: 10,
  bottom: 40,
  left: 34,
} as const;

/** Extra left room for percent labels; metric lives outside the SVG. */
export const OVERVIEW_PROGRESS_PAD = {
  top: 4,
  right: 6,
  bottom: 30,
  left: 34,
} as const;

/** Compact bar chart — shares progress chart height. */
export const OVERVIEW_PIPELINE_PAD = {
  top: 4,
  right: 6,
  bottom: 30,
  left: 28,
} as const;

export type OverviewChartPad = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type OverviewScale = {
  x: (index: number) => number;
  y: (value: number) => number;
  yPct: (pct: number) => number;
  baseline: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
  plotWidth: number;
  plotHeight: number;
};

export function createOverviewScale(
  pointCount: number,
  maxY: number,
  pad: OverviewChartPad = OVERVIEW_PAD,
): OverviewScale {
  const plotWidth = OVERVIEW_CHART_WIDTH - pad.left - pad.right;
  const plotHeight = OVERVIEW_CHART_HEIGHT - pad.top - pad.bottom;
  const safeCount = Math.max(pointCount - 1, 1);
  const safeMaxY = Math.max(maxY, 1);

  return {
    x: (index) => pad.left + (index / safeCount) * plotWidth,
    y: (value) => pad.top + plotHeight - (value / safeMaxY) * plotHeight,
    yPct: (pct) => pad.top + plotHeight - (pct / 100) * plotHeight,
    baseline: pad.top + plotHeight,
    plotLeft: pad.left,
    plotRight: OVERVIEW_CHART_WIDTH - pad.right,
    plotTop: pad.top,
    plotBottom: pad.top + plotHeight,
    plotWidth,
    plotHeight,
  };
}

/** Share of catalog that reached a stage — capped at 100%. */
export function catalogReachPercent(value: number, catalogSize: number): number {
  if (catalogSize <= 0) return 0;
  return Math.min(100, Math.round((value / catalogSize) * 100));
}

export function createOverviewProgressScale(pointCount: number): OverviewScale {
  const pad = OVERVIEW_PROGRESS_PAD;
  const plotWidth = OVERVIEW_CHART_WIDTH - pad.left - pad.right;
  const plotHeight = OVERVIEW_PROGRESS_CHART_HEIGHT - pad.top - pad.bottom;
  const safeCount = Math.max(pointCount - 1, 1);
  const safeMaxY = 100;

  return {
    x: (index) => pad.left + (index / safeCount) * plotWidth,
    y: (value) => pad.top + plotHeight - (value / safeMaxY) * plotHeight,
    yPct: (pct) => pad.top + plotHeight - (pct / 100) * plotHeight,
    baseline: pad.top + plotHeight,
    plotLeft: pad.left,
    plotRight: OVERVIEW_CHART_WIDTH - pad.right,
    plotTop: pad.top,
    plotBottom: pad.top + plotHeight,
    plotWidth,
    plotHeight,
  };
}

/** Straight-segment line — no spline overshoot on flat pipeline steps. */
export function overviewProgressLinePath(percentages: number[], scale: OverviewScale): string {
  if (percentages.length < 2) return "";

  const pts = percentages.map((pct, index) => ({
    x: scale.x(index),
    y: scale.yPct(pct),
  }));

  return pts
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

export function createOverviewPipelineScale(pointCount: number, maxY: number): OverviewScale {
  const pad = OVERVIEW_PIPELINE_PAD;
  const plotWidth = OVERVIEW_CHART_WIDTH - pad.left - pad.right;
  const plotHeight = OVERVIEW_PIPELINE_CHART_HEIGHT - pad.top - pad.bottom;
  const safeCount = Math.max(pointCount - 1, 1);
  const safeMaxY = Math.max(maxY, 1);

  return {
    x: (index) => pad.left + (index / safeCount) * plotWidth,
    y: (value) => pad.top + plotHeight - (value / safeMaxY) * plotHeight,
    yPct: (pct) => pad.top + plotHeight - (pct / 100) * plotHeight,
    baseline: pad.top + plotHeight,
    plotLeft: pad.left,
    plotRight: OVERVIEW_CHART_WIDTH - pad.right,
    plotTop: pad.top,
    plotBottom: pad.top + plotHeight,
    plotWidth,
    plotHeight,
  };
}

function pointPairs(values: number[], scale: OverviewScale) {
  return values.map((value, index) => ({
    x: scale.x(index),
    y: scale.y(value),
  }));
}

export function overviewSmoothLinePath(values: number[], scale: OverviewScale): string {
  const pts = pointPairs(values, scale);
  if (pts.length < 2) return "";
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} L ${pts[1].x.toFixed(2)} ${pts[1].y.toFixed(2)}`;
  }

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;

  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return d;
}

export function overviewSmoothAreaToBaseline(values: number[], scale: OverviewScale): string {
  const line = overviewSmoothLinePath(values, scale);
  if (!line) return "";

  const pts = pointPairs(values, scale);
  const first = pts[0];
  const last = pts[pts.length - 1];

  return `${line} L ${last.x.toFixed(2)} ${scale.baseline.toFixed(2)} L ${first.x.toFixed(2)} ${scale.baseline.toFixed(2)} Z`;
}

/** Percent axis — three quiet guides, not five. */
export function overviewPercentTicks(): number[] {
  return [0, 50, 100];
}

export function overviewCountTicks(maxY: number): number[] {
  if (maxY <= 4) {
    return Array.from({ length: maxY + 1 }, (_, i) => i);
  }
  const steps = 3;
  return Array.from({ length: steps + 1 }, (_, i) => Math.round((maxY / steps) * i));
}

export function xLabelAnchor(index: number, total: number): "start" | "middle" | "end" {
  if (index === 0) return "start";
  if (index === total - 1) return "end";
  return "middle";
}
