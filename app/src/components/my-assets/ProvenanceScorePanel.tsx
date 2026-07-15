import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { Tabs } from "../ui/Tabs";
import { shortHash } from "../../lib/format";
import type { LotDetail } from "../../lib/types";
import { explorerUrlFromTx, resolveAttestationUrl } from "../../lib/chainTimeline";
import {
  buildScoreComponents,
  buildTimeline,
  formatTimelineDate,
  layerStatusCounts,
  scoreTier,
  scoreTierLabel,
  type ProofLayer,
  type ScoreComponent,
} from "../../lib/provenanceScore";
import "./provenance-score-panel.css";

type DetailTab = "layers" | "fields" | "timeline" | "chain";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "layers", label: "Layers" },
  { id: "fields", label: "Fields" },
  { id: "timeline", label: "Timeline" },
  { id: "chain", label: "Chain" },
];

const LAYER_KPI_TONES = ["base", "attested", "seal", "verdict"] as const;

type ProvenanceScorePanelProps = {
  lot: LotDetail;
  layers: ProofLayer[];
  score: number;
  /** When true, hides standalone page chrome and fits the split-pane My Assets layout. */
  embedded?: boolean;
};

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
    <div className="prov-dist__col">
      <span className="prov-dist__label">{label}</span>
      <span className={`prov-dist__value prov-dist__value--${tone}`}>{percent}%</span>
      <div className="prov-dist__track" aria-hidden="true">
        <span
          className={`prov-dist__fill prov-dist__fill--${tone}`}
          style={{ width: `${Math.max(percent, percent > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function ScoreBreakdownBar({ components }: { components: ScoreComponent[] }) {
  const earnedTotal = components.filter((c) => c.earned).reduce((sum, c) => sum + c.points, 0);

  return (
    <div className="prov-breakdown">
      <div className="prov-breakdown__track" role="img" aria-label="Score component breakdown">
        {components
          .filter((c) => c.earned)
          .map((component) => (
            <span
              key={component.id}
              className={`prov-breakdown__segment prov-breakdown__segment--${component.id}`}
              style={{ flexGrow: component.points }}
              title={`${component.label}: +${component.points}`}
            />
          ))}
      </div>
      <div className="prov-breakdown__meta">
        <span className="prov-breakdown__total">{earnedTotal} pts</span>
        <span className="prov-breakdown__cap">max 99</span>
      </div>
    </div>
  );
}

function ComponentGrid({ components }: { components: ScoreComponent[] }) {
  return (
    <div className="prov-components">
      {components.map((component, index) => (
        <div key={component.id} className={`prov-component${component.earned ? " prov-component--earned" : ""}`}>
          <span
            className={`prov-component__dot prov-component__dot--${LAYER_KPI_TONES[index] ?? component.id}`}
            aria-hidden="true"
          />
          <span className="prov-component__label">{component.label}</span>
          <span className="prov-component__points">{component.earned ? `+${component.points}` : "—"}</span>
        </div>
      ))}
    </div>
  );
}

function LayerStackBar({ layers }: { layers: ProofLayer[] }) {
  const total = layers.length || 1;

  return (
    <div className="prov-stack">
      <div className="prov-stack__head">
        <span className="prov-stack__path">{layers[0]?.label ?? "Proof layers"}</span>
        <span className="prov-stack__count">{layers.length} layers</span>
      </div>
      <div className="prov-stack__track" role="img" aria-label="Layer status distribution bar">
        {layers.map((layer) => (
          <span
            key={layer.id}
            className={`prov-stack__segment prov-stack__segment--${layer.status}`}
            style={{ flexGrow: 1 / total }}
            title={`${layer.label}: ${layer.status}`}
          />
        ))}
      </div>
      <div className="prov-stack__legend" aria-hidden="true">
        <span><i className="prov-stack__dot prov-stack__dot--good" /> Good</span>
        <span><i className="prov-stack__dot prov-stack__dot--partial" /> Partial</span>
        <span><i className="prov-stack__dot prov-stack__dot--poor" /> Poor</span>
      </div>
    </div>
  );
}

function LayerKPIs({ layers, score }: { layers: ProofLayer[]; score: number }) {
  const kpis = [
    { label: "Score · P50", value: score, tone: "base" },
    { label: "Layers · P75", value: layers.filter((l) => l.status === "good").length, tone: "attested" },
    { label: "Attested · P90", value: layers.filter((l) => l.status !== "poor").length, tone: "seal" },
    { label: "Mint · P99", value: layers.find((l) => l.id === "mint")?.status === "good" ? score : score - 12, tone: "verdict" },
  ];

  return (
    <div className="prov-kpis">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="prov-kpi">
          <span className={`prov-kpi__dot prov-kpi__dot--${kpi.tone}`} aria-hidden="true" />
          <span className="prov-kpi__label">{kpi.label}</span>
          <span className="prov-kpi__value">{kpi.value}</span>
        </div>
      ))}
    </div>
  );
}

function ProvenanceTrendChart({ score, assetId }: { score: number; assetId: string }) {
  const points = useMemo(() => {
    const seed = assetId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: 12 }, (_, i) => {
      const wave = Math.sin((i + seed % 7) * 0.55) * 6;
      const drift = i * 1.2;
      return Math.max(52, Math.min(99, Math.round(score - 14 + drift + wave)));
    });
  }, [score, assetId]);

  const W = 640;
  const H = 140;
  const PAD = { top: 12, right: 12, bottom: 28, left: 36 };
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const min = Math.min(...points) - 4;
  const max = Math.max(...points) + 4;
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = PAD.left + (index / (points.length - 1)) * plotW;
    const y = PAD.top + plotH - ((value - min) / range) * plotH;
    return `${x},${y}`;
  });

  return (
    <div className="prov-trend">
      <p className="prov-trend__title">Provenance score trend (demo)</p>
      <svg className="prov-trend__svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Provenance score trend">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = PAD.top + plotH * (1 - ratio);
          const tick = Math.round(min + range * ratio);
          return (
            <g key={ratio}>
              <line className="prov-trend__grid" x1={PAD.left} y1={y} x2={PAD.left + plotW} y2={y} />
              <text className="prov-trend__tick" x={PAD.left - 6} y={y + 4} textAnchor="end">
                {tick}
              </text>
            </g>
          );
        })}
        <polyline className="prov-trend__line" points={coords.join(" ")} fill="none" />
        {points.map((value, index) => {
          const x = PAD.left + (index / (points.length - 1)) * plotW;
          const y = PAD.top + plotH - ((value - min) / range) * plotH;
          return <circle key={index} className="prov-trend__point" cx={x} cy={y} r={3} />;
        })}
      </svg>
    </div>
  );
}

function PanelToolbar() {
  return (
    <div className="prov-toolbar">
      <div className="prov-toolbar__left">
        <button type="button" className="prov-toolbar__btn" disabled>
          <Icon name="search" /> Add filter
        </button>
      </div>
      <div className="prov-toolbar__right">
        <button type="button" className="prov-toolbar__btn prov-toolbar__btn--ghost" disabled>
          <Icon name="download" /> Print report
        </button>
        <button type="button" className="prov-toolbar__range" disabled>
          Last 30 days (demo) <Icon name="chevron-down" />
        </button>
      </div>
    </div>
  );
}

function FieldsTab({ lot }: { lot: LotDetail }) {
  const a = lot.artifact;
  const isCarbon = a.category === "carbon_credit" || Boolean(a.creditType);

  const rows = [
    { label: "Asset ID", value: a.assetId },
    { label: "Category", value: isCarbon ? "Carbon credit" : "Mineral" },
    { label: "Operator", value: a.operator },
    { label: "Site", value: a.origin.site },
    {
      label: "Coordinates",
      value: `${a.origin.lat.toFixed(4)}, ${a.origin.lng.toFixed(4)}`,
    },
    isCarbon && a.tonnesCO2e != null
      ? { label: "Volume", value: `${a.tonnesCO2e.toLocaleString()} tCO₂e` }
      : a.massGrams != null
        ? { label: "Mass", value: `${a.massGrams.toLocaleString()} g` }
        : null,
    a.creditType ? { label: "Credit type", value: a.creditType } : null,
    a.vintage ? { label: "Vintage", value: a.vintage } : null,
    a.verifier ? { label: "Verifier", value: a.verifier } : null,
    { label: "Frame hash", value: shortHash(a.frameHash, 10, 8) },
    { label: "Computed seal", value: shortHash(lot.computedSeal, 10, 8) },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <table className="prov-fields">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TimelineTab({ lot }: { lot: LotDetail }) {
  const events = useMemo(() => buildTimeline(lot), [lot]);

  return (
    <ol className="prov-timeline">
      {events.map((event, index) => (
        <li key={event.id} className={`prov-timeline__item prov-timeline__item--${event.status}`}>
          <span className="prov-timeline__marker" aria-hidden="true" />
          <div className="prov-timeline__body">
            <div className="prov-timeline__row">
              <span className="prov-timeline__label">{event.label}</span>
              <span className="prov-timeline__date">{formatTimelineDate(event.timestamp)}</span>
            </div>
            {event.href ? (
              <a className="prov-timeline__link" href={event.href} target="_blank" rel="noopener noreferrer">
                View on explorer ↗
              </a>
            ) : null}
          </div>
          {index < events.length - 1 ? <span className="prov-timeline__line" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

function ChainTab({ lot }: { lot: LotDetail }) {
  const onChain = lot.auditRecord?.onChain;
  const verification = lot.auditRecord?.verification;
  const attestation = lot.testnetAttestation;

  return (
    <dl className="prov-chain">
      <div>
        <dt>Attested</dt>
        <dd>{lot.attested ? "Yes" : "No"}</dd>
      </div>
      <div>
        <dt>Latest verdict</dt>
        <dd>{lot.latestVerdict ?? "—"}</dd>
      </div>
      {verification ? (
        <>
          <div>
            <dt>Verification tx</dt>
            <dd>
              <code>{shortHash(verification.txHash, 10, 8)}</code>
            </dd>
          </div>
          <div>
            <dt>Reference seal</dt>
            <dd>
              <code>{shortHash(verification.referenceSeal, 10, 8)}</code>
            </dd>
          </div>
        </>
      ) : null}
      {onChain ? (
        <div>
          <dt>On-chain tx</dt>
          <dd>
            <code>{shortHash(onChain.txHash, 10, 8)}</code>
          </dd>
        </div>
      ) : null}
      {attestation ? (
        <>
          <div>
            <dt>Testnet attester</dt>
            <dd>{attestation.attester}</dd>
          </div>
          {resolveAttestationUrl(lot.artifact.assetId, attestation.explorerUrl) ? (
            <div>
              <dt>Explorer</dt>
              <dd>
                <a
                  href={
                    resolveAttestationUrl(lot.artifact.assetId, attestation.explorerUrl) as string
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open attestation ↗
                </a>
              </dd>
            </div>
          ) : null}
        </>
      ) : null}
      {lot.mintTx ? (
        <div>
          <dt>Mint tx</dt>
          <dd>
            {explorerUrlFromTx(lot.mintTx) ? (
              <a
                href={explorerUrlFromTx(lot.mintTx) as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortHash(lot.mintTx, 10, 8)} ↗
              </a>
            ) : (
              <span title={lot.mintTx}>
                {shortHash(lot.mintTx, 10, 8)} · demo/session receipt — not on Casper
              </span>
            )}
          </dd>
        </div>
      ) : null}
    </dl>
  );
}

export function ProvenanceScorePanel({ lot, layers, score, embedded = false }: ProvenanceScorePanelProps) {
  const [tab, setTab] = useState<DetailTab>("layers");
  const tier = scoreTier(score);
  const components = useMemo(() => buildScoreComponents(lot), [lot]);
  const counts = layerStatusCounts(layers);
  const layerTotal = layers.length;
  const goodPct = Math.round((counts.good / layerTotal) * 100);
  const partialPct = Math.round((counts.partial / layerTotal) * 100);
  const poorPct = Math.round((counts.poor / layerTotal) * 100);
  const isCarbon = lot.artifact.category === "carbon_credit" || Boolean(lot.artifact.creditType);
  const reportLabel = isCarbon ? "Carbon provenance" : "Mineral provenance";

  return (
    <section className={`prov-score-panel panel${embedded ? " prov-score-panel--embedded" : ""}`}>
      <header className="prov-score-panel__head">
        <div className="prov-score-panel__head-main">
          <p className="mono-label">{reportLabel}</p>
          <h2 className="prov-score-panel__title">
            Provenance analytics for {lot.artifact.assetId}
            <Link
              className="prov-score-panel__external"
              to={`/lots?lot=${encodeURIComponent(lot.artifact.assetId)}`}
              title="Open evidence room"
            >
              <Icon name="external" />
            </Link>
          </h2>
          <p className="prov-score-panel__lead">
            Layer health across capture, seal, verification, Casper, and mint. Symbolic demo — no real
            ownership or investment value.
          </p>
          <span className={`prov-score-panel__tier prov-score-panel__tier--${tier}`}>
            {score} · {scoreTierLabel(tier)} (demo)
          </span>
        </div>
      </header>

      <PanelToolbar />

      <div className="prov-section-head">
        <h3 className="prov-section-head__title">Proof layer vitals</h3>
        <a className="prov-section-head__link" href="#layers-about">
          About proof layers
        </a>
      </div>

      <p id="layers-about" className="prov-section-head__desc">
        Distribution of proof layers by status — good layers contribute fully to the provenance score.
      </p>

      <div className="prov-dist" role="group" aria-label="Layer status distribution">
        <DistributionColumn label="Good" percent={goodPct} tone="good" />
        <DistributionColumn label="Partial" percent={partialPct} tone="partial" />
        <DistributionColumn label="Poor" percent={poorPct} tone="poor" />
      </div>

      <LayerStackBar layers={layers} />
      <LayerKPIs layers={layers} score={score} />

      <ScoreBreakdownBar components={components} />
      <ComponentGrid components={components} />

      <Tabs tabs={TABS} active={tab} onChange={setTab} ariaLabel="Asset detail views">
        {tab === "layers" ? (
          <ul className="prov-layers-list">
            {layers.map((layer) => (
              <li key={layer.id} className={`prov-layers-list__item prov-layers-list__item--${layer.status}`}>
                <div className="prov-layers-list__row">
                  <span className="prov-layers-list__name">{layer.label}</span>
                  {layer.scoreContribution > 0 ? (
                    <span className="prov-layers-list__pts">+{layer.scoreContribution}</span>
                  ) : null}
                </div>
                <p className="prov-layers-list__detail">{layer.detail}</p>
              </li>
            ))}
          </ul>
        ) : null}
        {tab === "fields" ? <FieldsTab lot={lot} /> : null}
        {tab === "timeline" ? <TimelineTab lot={lot} /> : null}
        {tab === "chain" ? <ChainTab lot={lot} /> : null}
      </Tabs>

      <ProvenanceTrendChart score={score} assetId={lot.artifact.assetId} />

      <footer className="prov-score-panel__actions">
        <Link className="route-cta" to={`/lots?lot=${encodeURIComponent(lot.artifact.assetId)}`}>
          Open evidence room
        </Link>
        <Link className="route-cta route-cta--ghost" to="/marketplace">
          DeFi / Collateral
        </Link>
      </footer>
    </section>
  );
}
