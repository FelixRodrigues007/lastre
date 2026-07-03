import { useMemo } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import { LiveValue } from "../motion/LiveValue";
import {
  OVERVIEW_CHART_HEIGHT,
  OVERVIEW_CHART_WIDTH,
  createOverviewScale,
} from "../../lib/overviewChartGeom";
import "./overview-charts.css";

type TrustSegment = {
  label: string;
  value: number;
  tone: "valid" | "invalid" | "accent" | "muted";
};

type OverviewTrustChartProps = {
  segments: TrustSegment[];
  emptyLabel: string;
  compact?: boolean;
};

const BAR_HEIGHT = 22;
const BAR_HEIGHT_COMPACT = 10;

export function OverviewTrustChart({ segments, emptyLabel, compact = false }: OverviewTrustChartProps) {
  const { t } = useLocaleContext();
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const scale = createOverviewScale(1, total);
  const validCount = segments.find((s) => s.tone === "valid")?.value ?? 0;
  const validPct = total > 0 ? Math.round((validCount / total) * 100) : 0;
  const barHeight = compact ? BAR_HEIGHT_COMPACT : BAR_HEIGHT;

  const slices = useMemo(() => {
    const visible = segments.filter((s) => s.value > 0);
    let x = scale.plotLeft;
    return visible.map((segment, index, list) => {
      const width = Math.max((segment.value / total) * scale.plotWidth, segment.value > 0 ? 3 : 0);
      const slice = {
        segment,
        x,
        width,
        isFirst: index === 0,
        isLast: index === list.length - 1,
      };
      x += width;
      return slice;
    });
  }, [scale.plotLeft, scale.plotWidth, segments, total]);

  if (total === 0) {
    return <p className="overview-chart__empty">{emptyLabel}</p>;
  }

  const barY = scale.plotTop + (scale.plotHeight - barHeight) / 2;
  const rootClass = compact
    ? "overview-chart overview-chart--trust overview-chart--trust-compact"
    : "overview-chart overview-chart--trust";

  return (
    <div className={rootClass}>
      <div className="overview-trust__metric-row">
        <div className="overview-trust__metric">
          <span className="overview-trust__headline-value">
            <LiveValue value={validPct} />
            <span className="overview-trust__headline-unit">%</span>
          </span>
          <span className="overview-trust__headline-label">{t("overview.trust.validShare")}</span>
        </div>
        <p className="overview-trust__total">
          <span className="overview-trust__total-label">{t("overview.trust.session")}</span>
          <LiveValue value={total} className="overview-trust__total-value" />
        </p>
      </div>

      <svg
        className="overview-chart__svg overview-chart__svg--trust"
        viewBox={`0 0 ${OVERVIEW_CHART_WIDTH} ${OVERVIEW_CHART_HEIGHT}`}
        role="img"
        aria-label={t("overview.trust.title")}
      >
        {[0.25, 0.5, 0.75].map((fraction) => {
          const x = scale.plotLeft + scale.plotWidth * fraction;
          return (
            <line
              key={fraction}
              className="overview-trust__guide"
              x1={x}
              y1={scale.plotTop}
              x2={x}
              y2={scale.plotBottom}
            />
          );
        })}

        <rect
          className="overview-trust__track"
          x={scale.plotLeft}
          y={barY}
          width={scale.plotWidth}
          height={barHeight}
          rx={compact ? 3 : 5}
        />

        {slices.map(({ segment, x, width, isFirst, isLast }, index) => (
          <rect
            key={segment.label}
            className={`overview-trust__slice overview-trust__slice--${segment.tone}`}
            style={{ animationDelay: `${80 + index * 60}ms` }}
            x={x}
            y={barY}
            width={width}
            height={barHeight}
            rx={isFirst && isLast ? (compact ? 3 : 5) : isFirst ? (compact ? 3 : 5) : isLast ? (compact ? 3 : 5) : 0}
          >
            <title>{`${segment.label}: ${segment.value}`}</title>
          </rect>
        ))}

        <text
          className="overview-chart__tick overview-trust__tick-start"
          x={scale.plotLeft}
          y={barY + barHeight + (compact ? 12 : 16)}
          textAnchor="start"
        >
          0
        </text>
        <text
          className="overview-chart__tick overview-trust__tick-end"
          x={scale.plotRight}
          y={barY + barHeight + (compact ? 12 : 16)}
          textAnchor="end"
        >
          {total}
        </text>
      </svg>

      <ul className="overview-chart__legend overview-trust__legend" aria-hidden="true">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className={`overview-chart__swatch overview-chart__swatch--${segment.tone}`} />
            <span className="overview-trust__legend-label">{segment.label}</span>
            <LiveValue value={segment.value} className="overview-chart__legend-value" />
          </li>
        ))}
      </ul>
    </div>
  );
}
