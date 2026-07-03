export const CHART_WIDTH = 680;
export const CHART_HEIGHT = 360;

const PAD = { top: 52, right: 28, bottom: 52, left: 48 } as const;

export type ChartScale = {
  x: (index: number) => number;
  y: (value: number) => number;
  baseline: number;
  plotLeft: number;
  plotRight: number;
  plotTop: number;
  plotBottom: number;
  plotWidth: number;
  plotHeight: number;
};

export function createChartScale(count: number, maxY: number): ChartScale {
  const plotWidth = CHART_WIDTH - PAD.left - PAD.right;
  const plotHeight = CHART_HEIGHT - PAD.top - PAD.bottom;
  const safeCount = Math.max(count, 1);
  const safeMaxY = Math.max(maxY, 1);

  return {
    x: (index) => PAD.left + (index / safeCount) * plotWidth,
    y: (value) => PAD.top + plotHeight - (value / safeMaxY) * plotHeight,
    baseline: PAD.top + plotHeight,
    plotLeft: PAD.left,
    plotRight: CHART_WIDTH - PAD.right,
    plotTop: PAD.top,
    plotBottom: PAD.top + plotHeight,
    plotWidth,
    plotHeight,
  };
}

function pointPairs(values: number[], scale: ChartScale) {
  return values.map((value, index) => ({
    x: scale.x(index),
    y: scale.y(value),
  }));
}

export function smoothLinePath(values: number[], scale: ChartScale): string {
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

export function smoothBandPath(upper: number[], lower: number[], scale: ChartScale): string {
  const upperPath = smoothLinePath(upper, scale);
  if (!upperPath) return "";

  const lo = pointPairs(lower, scale);
  let d = upperPath;
  for (let i = lo.length - 1; i >= 0; i -= 1) {
    d += ` L ${lo[i].x.toFixed(2)} ${lo[i].y.toFixed(2)}`;
  }
  return `${d} Z`;
}

export function smoothAreaToBaseline(values: number[], scale: ChartScale): string {
  const line = smoothLinePath(values, scale);
  if (!line) return "";

  const pts = pointPairs(values, scale);
  const first = pts[0];
  const last = pts[pts.length - 1];

  return `${line} L ${last.x.toFixed(2)} ${scale.baseline.toFixed(2)} L ${first.x.toFixed(2)} ${scale.baseline.toFixed(2)} Z`;
}

export function yTickValues(maxY: number): number[] {
  if (maxY <= 4) {
    return Array.from({ length: maxY + 1 }, (_, i) => i);
  }
  const step = Math.ceil(maxY / 4);
  const ticks: number[] = [];
  for (let v = 0; v <= maxY; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] !== maxY) ticks.push(maxY);
  return ticks;
}

export function xTickIndices(count: number): number[] {
  return Array.from({ length: count + 1 }, (_, i) => i);
}
