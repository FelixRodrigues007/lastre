import { useId, useMemo } from "react";
import type { TranslationKey } from "../../i18n/translations";
import type { AuditRecord } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  buildBandProjection,
  buildExpectedProjection,
  buildLiveMarkers,
  buildLiveProjection,
  orderedSelectedLots,
  type ProjectionMarker,
} from "../../lib/processProjection";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  createChartScale,
  smoothAreaToBaseline,
  smoothBandPath,
  smoothLinePath,
  xTickIndices,
  yTickValues,
  type ChartScale,
} from "../../lib/processProjectionChartGeom";
import "./process-projection-chart.css";

type ProcessProjectionChartProps = {
  assetIds: string[];
  selected: string[];
  records: AuditRecord[];
  running: boolean;
  showOnChain: boolean;
  onShowOnChainChange: (value: boolean) => void;
};

type ChartGradientsProps = {
  id: string;
  scale: ChartScale;
};

/** Quicken-style vertical fades — objectBoundingBox clips each band naturally. */
function ChartGradients({ id, scale }: ChartGradientsProps) {
  return (
    <defs>
      <clipPath id={`${id}-plot`}>
        <rect x={scale.plotLeft} y={scale.plotTop} width={scale.plotWidth} height={scale.plotHeight} />
      </clipPath>

      {/* Below low estimate — cool grey wash */}
      <linearGradient id={`${id}-fill-low`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--projection-grey)" stopOpacity="0.38" />
        <stop offset="55%" stopColor="var(--projection-grey)" stopOpacity="0.22" />
        <stop offset="100%" stopColor="var(--projection-grey)" stopOpacity="0.06" />
      </linearGradient>

      {/* Expected − low band — medium seal */}
      <linearGradient id={`${id}-fill-mid`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--projection-seal)" stopOpacity="0.5" />
        <stop offset="45%" stopColor="var(--projection-seal)" stopOpacity="0.32" />
        <stop offset="100%" stopColor="var(--projection-seal)" stopOpacity="0.14" />
      </linearGradient>

      {/* High − expected band — light seal wash */}
      <linearGradient id={`${id}-fill-high`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--projection-seal)" stopOpacity="0.28" />
        <stop offset="50%" stopColor="var(--projection-seal)" stopOpacity="0.16" />
        <stop offset="100%" stopColor="var(--projection-seal)" stopOpacity="0.05" />
      </linearGradient>

      {/* Live session overlay */}
      <linearGradient id={`${id}-fill-live`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--projection-valid)" stopOpacity="0.42" />
        <stop offset="60%" stopColor="var(--projection-valid)" stopOpacity="0.18" />
        <stop offset="100%" stopColor="var(--projection-valid)" stopOpacity="0.02" />
      </linearGradient>

      {/* Line strokes */}
      <linearGradient id={`${id}-stroke-expected`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--projection-seal-deep)" />
        <stop offset="100%" stopColor="var(--projection-seal)" />
      </linearGradient>
    </defs>
  );
}

function markerLabel(
  marker: ProjectionMarker,
  t: (key: TranslationKey) => string,
): string {
  if (marker.label === "tamper") return t("process.projection.markerTamper");
  return t("process.projection.markerBatch");
}

function MarkerCallout({
  x,
  y,
  label,
  tone,
}: {
  x: number;
  y: number;
  label: string;
  tone: ProjectionMarker["tone"];
}) {
  const width = Math.max(76, label.length * 5.6 + 18);
  const height = 22;

  return (
    <g className={`process-projection__callout process-projection__callout--${tone}`}>
      <rect x={x - width / 2} y={y - height / 2} width={width} height={height} rx={5} />
      <text x={x} y={y + 4} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

export function ProcessProjectionChart({
  assetIds,
  selected,
  records,
  running,
  showOnChain,
  onShowOnChainChange,
}: ProcessProjectionChartProps) {
  const { t } = useLocaleContext();
  const chartId = useId();
  const ordered = orderedSelectedLots(assetIds, selected);
  const count = ordered.length;

  const expected = useMemo(
    () => buildExpectedProjection(assetIds, selected, showOnChain),
    [assetIds, selected, showOnChain],
  );
  const bands = useMemo(
    () => buildBandProjection(assetIds, selected, showOnChain),
    [assetIds, selected, showOnChain],
  );
  const live = useMemo(
    () => buildLiveProjection(records, showOnChain),
    [records, showOnChain],
  );
  const liveMarkers = useMemo(
    () => buildLiveMarkers(records, assetIds, !running && records.length > 0),
    [records, assetIds, running],
  );

  const markers = records.length > 0 ? liveMarkers : expected.markers;
  const maxY = Math.max(count, 1);
  const scale = useMemo(() => createChartScale(count, maxY), [count, maxY]);
  const yTicks = useMemo(() => yTickValues(maxY), [maxY]);
  const xTicks = useMemo(() => xTickIndices(count), [count]);
  const hasLive = records.length > 0;

  const paths = useMemo(
    () => ({
      lowBase: smoothAreaToBaseline(bands.low, scale),
      midBand: smoothBandPath(expected.points, bands.low, scale),
      highBand: smoothBandPath(bands.high, expected.points, scale),
      highLine: smoothLinePath(bands.high, scale),
      expectedLine: smoothLinePath(expected.points, scale),
      lowLine: smoothLinePath(bands.low, scale),
      liveLine: smoothLinePath(live, scale),
      liveBase: smoothAreaToBaseline(live, scale),
    }),
    [bands, expected.points, live, scale],
  );

  if (count === 0) {
    return (
      <section className="process-projection" aria-labelledby={`${chartId}-title`}>
        <h2 id={`${chartId}-title`} className="process-projection__title">
          {t("process.projection.title")}
        </h2>
        <p className="process-projection__empty">{t("process.projection.emptyHint")}</p>
      </section>
    );
  }

  return (
    <section className="process-projection" aria-labelledby={`${chartId}-title`}>
      <h2 id={`${chartId}-title`} className="process-projection__title">
        {t("process.projection.title")}
      </h2>

      <ul className="process-projection__legend" aria-label={t("process.projection.legendAria")}>
        <li>
          <span className="process-projection__legend-swatch process-projection__legend-swatch--high" />
          {t("process.projection.high")}
        </li>
        <li>
          <span className="process-projection__legend-swatch process-projection__legend-swatch--expected" />
          {t("process.projection.expected")}
        </li>
        <li>
          <span className="process-projection__legend-swatch process-projection__legend-swatch--low" />
          {t("process.projection.low")}
        </li>
        {hasLive ? (
          <li>
            <span className="process-projection__legend-swatch process-projection__legend-swatch--live" />
            {running ? t("process.projection.liveRunning") : t("process.projection.live")}
          </li>
        ) : null}
      </ul>

      <div className="process-projection__plot">
        <svg
          className="process-projection__chart"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("process.projection.chartAria", { count: String(count) })}
        >
          <ChartGradients id={chartId} scale={scale} />

          {yTicks.map((tick) => (
            <line
              key={`h-${tick}`}
              className="process-projection__grid"
              x1={scale.plotLeft}
              x2={scale.plotRight}
              y1={scale.y(tick)}
              y2={scale.y(tick)}
            />
          ))}

          {xTicks.map((tick) => (
            <line
              key={`v-${tick}`}
              className="process-projection__grid"
              x1={scale.x(tick)}
              x2={scale.x(tick)}
              y1={scale.plotTop}
              y2={scale.plotBottom}
            />
          ))}

          {yTicks.map((tick) => (
            <text
              key={`yl-${tick}`}
              className="process-projection__tick"
              x={scale.plotLeft - 8}
              y={scale.y(tick) + 4}
              textAnchor="end"
            >
              {tick}
            </text>
          ))}

          {xTicks.map((tick) => (
            <text
              key={`xl-${tick}`}
              className="process-projection__tick"
              x={scale.x(tick)}
              y={CHART_HEIGHT - 28}
              textAnchor="middle"
            >
              {tick === 0 ? t("process.projection.start") : tick}
            </text>
          ))}

          <text
            className="process-projection__axis"
            x={14}
            y={CHART_HEIGHT / 2}
            transform={`rotate(-90 14 ${CHART_HEIGHT / 2})`}
          >
            {showOnChain ? t("process.projection.yOnChain") : t("process.projection.ySeal")}
          </text>

          <text className="process-projection__axis" x={CHART_WIDTH / 2} y={CHART_HEIGHT - 8} textAnchor="middle">
            {t("process.projection.xAxis")}
          </text>

          <g clipPath={`url(#${chartId}-plot)`}>
            {/* Quicken layer order: low base → mid band → high band */}
            <path className="process-projection__area" d={paths.lowBase} fill={`url(#${chartId}-fill-low)`} />
            <path className="process-projection__area" d={paths.midBand} fill={`url(#${chartId}-fill-mid)`} />
            <path className="process-projection__area" d={paths.highBand} fill={`url(#${chartId}-fill-high)`} />

            {hasLive ? (
              <path className="process-projection__area process-projection__area--live" d={paths.liveBase} fill={`url(#${chartId}-fill-live)`} />
            ) : null}

            <path className="process-projection__line process-projection__line--low" d={paths.lowLine} />
            <path
              className="process-projection__line process-projection__line--expected"
              d={paths.expectedLine}
              stroke={`url(#${chartId}-stroke-expected)`}
            />
            <path className="process-projection__line process-projection__line--high" d={paths.highLine} />

            {hasLive ? (
              <path className="process-projection__line process-projection__line--live" d={paths.liveLine} />
            ) : null}
          </g>

          {markers.map((marker, index) => {
            const x = scale.x(marker.x);
            return (
              <g key={`${marker.label}-${marker.x}-${index}`}>
                <line
                  className={`process-projection__marker process-projection__marker--${marker.tone}`}
                  x1={x}
                  x2={x}
                  y1={scale.plotTop}
                  y2={scale.plotBottom}
                />
                <MarkerCallout
                  x={x}
                  y={scale.plotTop - 16}
                  label={markerLabel(marker, t)}
                  tone={marker.tone}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <footer className="process-projection__footer">
        <label className="process-projection__checkbox">
          <input
            type="checkbox"
            checked={showOnChain}
            onChange={(event) => onShowOnChainChange(event.target.checked)}
          />
          {t("process.projection.onChainToggle")}
        </label>
        <p className="process-projection__disclaimer">{t("process.projection.disclaimer")}</p>
      </footer>
    </section>
  );
}
