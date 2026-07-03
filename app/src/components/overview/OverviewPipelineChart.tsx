import { useMemo } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  OVERVIEW_CHART_WIDTH,
  OVERVIEW_PIPELINE_CHART_HEIGHT,
  createOverviewPipelineScale,
  overviewCountTicks,
} from "../../lib/overviewChartGeom";
import "./overview-charts.css";

export type PipelineStage = {
  label: string;
  value: number;
  tone: "muted" | "seal" | "trust" | "accent" | "valid";
};

type OverviewPipelineChartProps = {
  stages: PipelineStage[];
  emptyLabel: string;
};

const PIPELINE_BAR_GAP = 20;
const PIPELINE_BAR_MAX_WIDTH = 44;

export function OverviewPipelineChart({ stages, emptyLabel }: OverviewPipelineChartProps) {
  const { t } = useLocaleContext();
  const max = Math.max(...stages.map((s) => s.value), 1);
  const total = stages.reduce((sum, s) => sum + s.value, 0);
  const scale = createOverviewPipelineScale(stages.length, max);

  const barWidth = Math.min(
    PIPELINE_BAR_MAX_WIDTH,
    (scale.plotWidth - PIPELINE_BAR_GAP * (stages.length - 1)) / stages.length,
  );
  const barsSpan = barWidth * stages.length + PIPELINE_BAR_GAP * (stages.length - 1);
  const barOffsetX = scale.plotLeft + (scale.plotWidth - barsSpan) / 2;

  const yTicks = useMemo(() => overviewCountTicks(max), [max]);

  if (total === 0) {
    return <p className="overview-chart__empty">{emptyLabel}</p>;
  }

  return (
    <div className="overview-chart overview-chart--pipeline">
      <svg
        className="overview-chart__svg overview-chart__svg--pipeline"
        viewBox={`0 0 ${OVERVIEW_CHART_WIDTH} ${OVERVIEW_PIPELINE_CHART_HEIGHT}`}
        role="img"
        aria-label={t("overview.pipeline.title")}
      >
        {yTicks.map((tick) => {
          const y = scale.y(tick);
          return (
            <g key={tick}>
              <line
                className="overview-chart__grid overview-chart__grid--pipeline"
                x1={scale.plotLeft}
                y1={y}
                x2={scale.plotRight}
                y2={y}
              />
              <text
                className="overview-chart__tick overview-chart__tick--y overview-chart__tick--pipeline-y"
                x={scale.plotLeft - 6}
                y={y + 2.5}
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {stages.map((stage, index) => {
          const height = (stage.value / max) * scale.plotHeight;
          const x = barOffsetX + index * (barWidth + PIPELINE_BAR_GAP);
          const y = scale.plotBottom - height;
          return (
            <g
              key={stage.label}
              className="overview-chart__bar-group"
              style={{ animationDelay: `${120 + index * 70}ms` }}
            >
              <rect
                className={`overview-chart__bar overview-chart__bar--${stage.tone}`}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(height, stage.value > 0 ? 2 : 0)}
                rx={2}
              >
                <title>{`${stage.label}: ${stage.value}`}</title>
              </rect>
              <text
                className="overview-chart__tick overview-chart__tick--x overview-chart__tick--pipeline-x"
                x={x + barWidth / 2}
                y={OVERVIEW_PIPELINE_CHART_HEIGHT - 10}
                textAnchor="middle"
              >
                {stage.label}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="overview-chart__legend overview-chart__legend--pipeline" aria-hidden="true">
        {stages.map((stage) => (
          <li key={stage.label}>
            <span className={`overview-chart__swatch overview-chart__swatch--${stage.tone}`} />
            {stage.label}
            <span className="overview-chart__legend-value">{stage.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
