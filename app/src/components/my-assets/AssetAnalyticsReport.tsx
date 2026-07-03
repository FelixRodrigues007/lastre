import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon";
import type { LotDetail } from "../../lib/types";
import {
  layerStatusCounts,
  type ProofLayer,
} from "../../lib/provenanceScore";
import { assetDisplayName } from "./MyAssetsAssetList";
import "./asset-analytics-report.css";

type TrafficTab = "score" | "layers" | "chain";

const TRAFFIC_TABS: { id: TrafficTab; label: string }[] = [
  { id: "score", label: "Score" },
  { id: "layers", label: "Layers" },
  { id: "chain", label: "Chain" },
];

type AssetAnalyticsReportProps = {
  lot: LotDetail;
  layers: ProofLayer[];
  score: number;
};

function seedNumber(input: string): number {
  return input.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildTrafficSeries(
  assetId: string,
  tab: TrafficTab,
  score: number,
): { attested: number[]; pending: number[] } {
  const seed = seedNumber(`${assetId}-${tab}`);
  const attested: number[] = [];
  const pending: number[] = [];

  for (let i = 0; i < 24; i++) {
    const wave = Math.sin((i + (seed % 7)) * 0.55) * 12;
    const spike = i % 6 === 3 ? 22 : i % 4 === 1 ? 14 : 0;
    const base = tab === "score" ? score * 0.45 : tab === "layers" ? 28 : 18;
    const primary = Math.max(8, Math.round(base + wave + spike + (i % 3) * 4));
    const secondary = Math.max(0, Math.round(primary * (0.22 + (seed % 5) * 0.04) + Math.cos(i * 0.7) * 6));
    attested.push(primary);
    pending.push(secondary);
  }

  return { attested, pending };
}

function trafficTotals(attested: number[], pending: number[]) {
  const attestedSum = attested.reduce((sum, value) => sum + value, 0);
  const pendingSum = pending.reduce((sum, value) => sum + value, 0);
  return {
    total: attestedSum + pendingSum,
    attested: attestedSum,
    pending: pendingSum,
  };
}

function ProofTrafficChart({
  assetId,
  tab,
  score,
}: {
  assetId: string;
  tab: TrafficTab;
  score: number;
}) {
  const { attested, pending } = useMemo(
    () => buildTrafficSeries(assetId, tab, score),
    [assetId, tab, score],
  );

  const W = 800;
  const H = 300;
  const PAD = { top: 28, right: 20, bottom: 36, left: 52 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const allValues = [...attested, ...pending.map((v, i) => v + attested[i])];
  const min = 0;
  const max = Math.max(...allValues, 20);
  const range = max - min || 1;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(min + range * ratio));

  const xAt = (index: number) => PAD.left + (index / (attested.length - 1)) * plotW;
  const yAt = (value: number) => PAD.top + plotH - ((value - min) / range) * plotH;

  const attestedLine = attested.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");
  const pendingTop = pending.map((value, index) => attested[index] + value);
  const pendingLine = pendingTop.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ");

  const baseline = yAt(0);
  const attestedArea = `M ${xAt(0)},${baseline} L ${attestedLine.split(" ").join(" L ")} L ${xAt(attested.length - 1)},${baseline} Z`;

  const pendingTopPts = pendingTop.map((value, index) => `${xAt(index)},${yAt(value)}`);
  const attestedPtsRev = [...attested].reverse().map((value, revIndex) => {
    const index = attested.length - 1 - revIndex;
    return `${xAt(index)},${yAt(value)}`;
  });
  const pendingArea = `M ${pendingTopPts.join(" L ")} L ${attestedPtsRev.join(" L ")} Z`;

  const yLabel =
    tab === "score" ? "Provenance score" : tab === "layers" ? "Layer events" : "Chain events";

  return (
    <div className="aar-traffic-chart">
      <div className="aar-traffic-chart__legend" aria-hidden="true">
        <span><i className="aar-traffic-chart__dot aar-traffic-chart__dot--attested" /> Attested</span>
        <span><i className="aar-traffic-chart__dot aar-traffic-chart__dot--pending" /> Pending</span>
      </div>
      <svg className="aar-traffic-chart__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${yLabel} over time`}>
        {yTicks.map((tick) => {
          const y = yAt(tick);
          return (
            <g key={tick}>
              <line className="aar-traffic-chart__grid" x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} />
              <text className="aar-traffic-chart__tick" x={PAD.left - 8} y={y + 4} textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}
        {Array.from({ length: 7 }, (_, i) => {
          const x = PAD.left + (i / 6) * plotW;
          return (
            <line
              key={i}
              className="aar-traffic-chart__grid aar-traffic-chart__grid--v"
              x1={x}
              y1={PAD.top}
              x2={x}
              y2={PAD.top + plotH}
            />
          );
        })}
        <path className="aar-traffic-chart__area aar-traffic-chart__area--attested" d={attestedArea} />
        <path className="aar-traffic-chart__area aar-traffic-chart__area--pending" d={pendingArea} />
        <polyline className="aar-traffic-chart__line aar-traffic-chart__line--attested" points={attestedLine} fill="none" />
        <polyline className="aar-traffic-chart__line aar-traffic-chart__line--pending" points={pendingLine} fill="none" />
        <text
          className="aar-traffic-chart__ylabel"
          transform={`translate(16 ${PAD.top + plotH / 2}) rotate(-90)`}
          textAnchor="middle"
        >
          {yLabel}
        </text>
      </svg>
    </div>
  );
}

function DistributionColumn({
  label,
  percent,
  tone,
}: {
  label: string;
  percent: number;
  tone: "good" | "partial" | "poor";
}) {
  return (
    <div className="aar-dist__col">
      <span className="aar-dist__label">{label}</span>
      <span className={`aar-dist__value aar-dist__value--${tone}`}>{percent}%</span>
      <div className="aar-dist__track" aria-hidden="true">
        <span
          className={`aar-dist__fill aar-dist__fill--${tone}`}
          style={{ width: `${Math.max(percent, percent > 0 ? 6 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function ProofLayerVitalsSection({
  layers,
  goodPct,
  partialPct,
  poorPct,
}: {
  layers: ProofLayer[];
  goodPct: number;
  partialPct: number;
  poorPct: number;
}) {
  return (
    <section className="aar-proof-layers" aria-label="Proof layer vitals">
      <div className="aar-proof-layers__head">
        <h3 className="aar-proof-layers__title">Proof layer vitals</h3>
        <a className="aar-proof-layers__link" href="#proof-layers-about">
          About proof layers
        </a>
      </div>

      <p id="proof-layers-about" className="aar-proof-layers__desc">
        Distribution of capture, seal, verification, Casper attestation, and mint layers for this asset.
      </p>

      <div className="aar-dist" role="group" aria-label="Layer status distribution">
        <DistributionColumn label="Good" percent={goodPct} tone="good" />
        <DistributionColumn label="Needs improvement" percent={partialPct} tone="partial" />
        <DistributionColumn label="Poor" percent={poorPct} tone="poor" />
      </div>

      <ul className="aar-layer-list">
        {layers.map((layer) => (
          <li key={layer.id} className={`aar-layer-list__item aar-layer-list__item--${layer.status}`}>
            <span className="aar-layer-list__name">{layer.label}</span>
            <span className="aar-layer-list__detail">{layer.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProofTrafficPanel({
  assetId,
  score,
  displayName,
  layers,
  goodPct,
  partialPct,
  poorPct,
}: {
  assetId: string;
  score: number;
  displayName: string;
  layers: ProofLayer[];
  goodPct: number;
  partialPct: number;
  poorPct: number;
}) {
  const [tab, setTab] = useState<TrafficTab>("score");
  const series = useMemo(() => buildTrafficSeries(assetId, tab, score), [assetId, tab, score]);
  const totals = trafficTotals(series.attested, series.pending);

  const panelTitle =
    tab === "score"
      ? "Provenance score through proof pipeline"
      : tab === "layers"
        ? "Layer events through proof pipeline"
        : "Chain events through proof pipeline";

  return (
    <section className="aar-traffic panel" aria-label="Proof traffic">
      <header className="aar-traffic__header">
        <h2 className="aar__asset-title">
          {displayName}
          <Link
            className="aar__external"
            to={`/lots?lot=${encodeURIComponent(assetId)}`}
            title="Open evidence room"
          >
            <Icon name="external" size={18} />
          </Link>
        </h2>
        <div className="aar__control-actions">
          <button type="button" className="aar__range" disabled>
            Last 24 hours (GMT-3) <Icon name="chevron-down" size={14} />
          </button>
          <button type="button" className="aar__print" disabled>
            <Icon name="download" size={16} /> Print report
          </button>
        </div>
      </header>

      <nav className="aar-traffic-tabs" role="tablist" aria-label="Traffic dimensions">
        {TRAFFIC_TABS.map((item, index) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`aar-traffic-tabs__tab${tab === item.id ? " aar-traffic-tabs__tab--active" : ""}${index > 0 ? " aar-traffic-tabs__tab--bordered" : ""}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="aar-traffic__body">
        <h3 className="aar-traffic__heading">{panelTitle}</h3>

        <div className="aar-traffic-kpis" role="group" aria-label="Summary metrics">
          <div className="aar-traffic-kpi">
            <span className="aar-traffic-kpi__label">Total checks</span>
            <span className="aar-traffic-kpi__value">{totals.total.toLocaleString()}</span>
            <span className="aar-traffic-kpi__hint">Previous 24 hours</span>
          </div>
          <div className="aar-traffic-kpi">
            <span className="aar-traffic-kpi__label">Attested</span>
            <span className="aar-traffic-kpi__value">{totals.attested.toLocaleString()}</span>
            <span className="aar-traffic-kpi__hint">Previous 24 hours</span>
          </div>
          <div className="aar-traffic-kpi">
            <span className="aar-traffic-kpi__label">Pending</span>
            <span className="aar-traffic-kpi__value">{totals.pending.toLocaleString()}</span>
            <span className="aar-traffic-kpi__hint">Previous 24 hours</span>
          </div>
        </div>

        <ProofTrafficChart assetId={assetId} tab={tab} score={score} />

        <ProofLayerVitalsSection
          layers={layers}
          goodPct={goodPct}
          partialPct={partialPct}
          poorPct={poorPct}
        />
      </div>
    </section>
  );
}

function KpiMetricCard({
  title,
  value,
  label,
}: {
  title: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="aar-kpi-card">
      <div className="aar-kpi-card__top">
        <span className="aar-kpi-card__title">{title}</span>
      </div>
      <div className="aar-kpi-card__bottom">
        <span className="aar-kpi-card__value">{value}</span>
        <span className="aar-kpi-card__label">{label}</span>
      </div>
    </div>
  );
}

function KpiSidebar({
  score,
  layers,
}: {
  score: number;
  layers: ProofLayer[];
}) {
  const good = layers.filter((l) => l.status === "good").length;
  const partial = layers.filter((l) => l.status === "partial").length;
  const mintOk = layers.find((l) => l.id === "mint")?.status === "good";
  const mintValue = mintOk ? score : Math.max(score - 12, 0);

  return (
    <aside className="aar__kpi-col" aria-label="Proof KPIs">
      <KpiMetricCard title="Provenance score" value={score} label="P50 percentile" />
      <KpiMetricCard title="Good layers" value={good} label="P75 percentile" />
      <KpiMetricCard title="Partial layers" value={partial} label="P90 percentile" />
      <KpiMetricCard title="Mint" value={mintValue} label="P99 percentile" />
    </aside>
  );
}

export function AssetAnalyticsReport({ lot, layers, score }: AssetAnalyticsReportProps) {
  const counts = layerStatusCounts(layers);
  const layerTotal = layers.length || 1;
  const goodPct = Math.round((counts.good / layerTotal) * 100);
  const partialPct = Math.round((counts.partial / layerTotal) * 100);
  const poorPct = Math.round((counts.poor / layerTotal) * 100);
  const displayName = assetDisplayName(lot);

  return (
    <article className="aar">
      <div className="aar__split">
        <KpiSidebar score={score} layers={layers} />

        <div className="aar__detail">
          <ProofTrafficPanel
            assetId={lot.artifact.assetId}
            score={score}
            displayName={displayName}
            layers={layers}
            goodPct={goodPct}
            partialPct={partialPct}
            poorPct={poorPct}
          />
        </div>
      </div>
    </article>
  );
}
