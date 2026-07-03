import { useMemo } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  OVERVIEW_CHART_WIDTH,
  OVERVIEW_PROGRESS_CHART_HEIGHT,
  catalogReachPercent,
  createOverviewProgressScale,
  overviewPercentTicks,
  overviewProgressLinePath,
  xLabelAnchor,
} from "../../lib/overviewChartGeom";
import { LiveValue } from "../motion/LiveValue";
import "./overview-charts.css";

type ProgressPoint = {
  label: string;
  value: number;
};

type OverviewProofProgressProps = {
  points: ProgressPoint[];
  baseline: number;
  emptyLabel: string;
};

export function OverviewProofProgress({
  points,
  baseline,
  emptyLabel,
}: OverviewProofProgressProps) {
  const { t } = useLocaleContext();
  const catalogSize = Math.max(baseline, 1);
  const hasData = catalogSize > 0 && points.some((p) => p.value > 0);

  const percentages = useMemo(
    () => points.map((p) => catalogReachPercent(p.value, catalogSize)),
    [catalogSize, points],
  );

  const scale = useMemo(
    () => createOverviewProgressScale(points.length),
    [points.length],
  );

  const coords = useMemo(() => {
    if (!hasData) return [];
    return points.map((point, index) => ({
      ...point,
      x: scale.x(index),
      y: scale.yPct(percentages[index]),
      pct: percentages[index],
    }));
  }, [hasData, percentages, points, scale]);

  const linePath = useMemo(
    () => overviewProgressLinePath(percentages, scale),
    [percentages, scale],
  );

  const yTicks = overviewPercentTicks();

  if (!hasData) {
    return <p className="overview-chart__empty">{emptyLabel}</p>;
  }

  const lastPoint = points[points.length - 1];
  const completion = percentages[percentages.length - 1] ?? 0;

  return (
    <div className="overview-chart overview-chart--progress">
      <header className="overview-chart__progress-head">
        <div className="overview-chart__progress-stat">
          <p className="overview-chart__progress-value">
            <LiveValue value={completion} duration={900} />
            <span className="overview-chart__progress-unit">%</span>
          </p>
          <p className="overview-chart__progress-caption">{t("overview.progress.complete")}</p>
        </div>
        <p className="overview-chart__progress-detail">
          {t("overview.progress.catalogHint", { count: lastPoint.value, total: catalogSize })}
        </p>
      </header>

      <div className="overview-chart__plot">
        <svg
          className="overview-chart__svg overview-chart__svg--progress"
          viewBox={`0 0 ${OVERVIEW_CHART_WIDTH} ${OVERVIEW_PROGRESS_CHART_HEIGHT}`}
          role="img"
          aria-label={t("overview.progress.title")}
        >
          {yTicks.map((tick) => {
            const y = scale.yPct(tick);
            return (
              <g key={tick} className="overview-chart__grid-row">
                <line
                  className="overview-chart__grid overview-chart__grid--progress"
                  x1={scale.plotLeft}
                  y1={y}
                  x2={scale.plotRight}
                  y2={y}
                />
                <text
                  className="overview-chart__tick overview-chart__tick--y"
                  x={scale.plotLeft - 6}
                  y={y + 2.5}
                  textAnchor="end"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {linePath ? (
            <path
              className="overview-chart__line overview-chart__line--draw overview-chart__line--progress"
              d={linePath}
              pathLength={1}
            />
          ) : null}

          {coords.map((point, index) => (
            <circle
              key={point.label}
              className="overview-chart__dot overview-chart__dot--live overview-chart__dot--progress"
              cx={point.x}
              cy={point.y}
              r={2.5}
              style={{ animationDelay: `${400 + index * 80}ms` }}
            />
          ))}

          {coords.map((point, index) => (
            <text
              key={`${point.label}-x`}
              className="overview-chart__tick overview-chart__tick--x overview-chart__tick--progress-x"
              x={point.x}
              y={OVERVIEW_PROGRESS_CHART_HEIGHT - 10}
              textAnchor={xLabelAnchor(index, coords.length)}
            >
              {point.label}
            </text>
          ))}
        </svg>
      </div>

      <ul className="overview-chart__legend" aria-hidden="true">
        <li>
          <span className="overview-chart__swatch overview-chart__swatch--trust" />
          {t("overview.progress.legend")}
        </li>
      </ul>
    </div>
  );
}
