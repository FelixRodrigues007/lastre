import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { LiveValue } from "../motion/LiveValue";
import type { EnrichedAsset } from "../../lib/marketplaceTypes";
import type { SiteCamera } from "../../lib/siteCameras";
import "./market-site-dashboard.css";

type MarketSiteDashboardProps = {
  asset: EnrichedAsset;
  cameras: SiteCamera[];
  siteName: string;
};

function formatClock(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function seedFromId(id: string): number {
  return id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function buildTrendPoints(assetId: string, base: number): number[] {
  const seed = seedFromId(assetId);
  return Array.from({ length: 12 }, (_, i) => {
    const wave = Math.sin((i + seed % 7) * 0.65) * 0.18;
    const drift = i * 0.04;
    return Math.round(base * (0.72 + wave + drift));
  });
}

export function MarketSiteDashboard({ asset, cameras, siteName }: MarketSiteDashboardProps) {
  const [now, setNow] = useState(() => new Date());
  const [activeId, setActiveId] = useState<string | null>(null);
  const primaryCamera = cameras[0];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const closeModal = useCallback(() => setActiveId(null), []);

  if (!primaryCamera) return null;

  return (
    <div className="market-site">
      <SiteActivityChart asset={asset} siteName={siteName} />

      <div className="market-site__top-row">
        <button
          type="button"
          className="market-site__cell market-site__cell--cam"
          onClick={() => setActiveId(primaryCamera.id)}
          aria-label={`Open camera: ${primaryCamera.label}`}
        >
          <div className="market-site__cam-inner">
            <header className="market-site__cam-head">
              <span className="market-site__cam-label">Live feed</span>
              <span className="market-site__live">
                <span className="market-site__live-dot" aria-hidden="true" />
                Demo
              </span>
              <span className="market-site__clock mono-label">{formatClock(now)}</span>
            </header>
            <CameraFeed camera={primaryCamera} siteName={siteName} embedded />
          </div>
        </button>

        <OutputTrendPanel asset={asset} />
        <ProofVitalsPanel asset={asset} />
      </div>

      {activeId ? (
        <CameraModal
          cameras={cameras}
          siteName={siteName}
          activeId={activeId}
          clock={formatClock(now)}
          onSelect={setActiveId}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}

function OutputTrendPanel({ asset }: { asset: EnrichedAsset }) {
  const base = asset.quantity ?? (asset.isCarbon ? 4200 : 180);
  const points = useMemo(() => buildTrendPoints(String(asset.asset.assetId), base), [asset]);
  const max = Math.max(...points, 1);
  const unit = asset.isCarbon ? "tCO₂e" : asset.unit || "g";
  const label = asset.isCarbon ? "Carbon yield" : "Extraction rate";
  const latest = points[points.length - 1];
  const gradientId = useId().replace(/:/g, "");

  const W = 280;
  const H = 168;
  const pad = { top: 8, right: 4, bottom: 8, left: 4 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const coords = points.map((value, i) => {
    const x = pad.left + (i / (points.length - 1)) * plotW;
    const y = pad.top + plotH - (value / max) * plotH;
    return { x, y };
  });

  const linePath = coords.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pad.left + plotW},${pad.top + plotH} L${pad.left},${pad.top + plotH} Z`;

  return (
    <div className="market-site__cell market-site__panel market-site__panel--trend">
      <header className="market-site__panel-head">
        <span className="market-site__panel-eyebrow">{label}</span>
        <span className="market-site__delta market-site__delta--up">+4.2%</span>
      </header>

      <div className="market-site__trend-body">
        <p className="market-site__trend-kpi">
          <LiveValue value={latest} />
          <small>{unit}</small>
        </p>
        <svg className="market-site__trend-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label} 7 day trend`}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line className="market-site__trend-grid" x1={pad.left} y1={pad.top + plotH * 0.5} x2={pad.left + plotW} y2={pad.top + plotH * 0.5} />
          <path className="market-site__trend-area" d={areaPath} fill={`url(#${gradientId})`} />
          <path className="market-site__trend-line" d={linePath} pathLength={1} />
          <circle className="market-site__trend-dot" cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3.5" />
        </svg>
      </div>

      <footer className="market-site__panel-foot">
        <span>7d rolling</span>
        <span className="market-site__panel-foot-muted">vs prior week</span>
      </footer>
    </div>
  );
}

function ProofVitalsPanel({ asset }: { asset: EnrichedAsset }) {
  const seed = seedFromId(String(asset.asset.assetId));
  const bars = useMemo(
    () => [
      { label: "Seal", value: Math.min(100, asset.provScore + (seed % 5)), tone: "seal" as const },
      { label: "Chain", value: Math.min(100, asset.provScore - 4 + (seed % 3)), tone: "chain" as const },
      { label: "Geo", value: Math.min(100, asset.provScore - 8 + (seed % 6)), tone: "geo" as const },
    ],
    [asset, seed],
  );
  const score = asset.provScore;
  const ringRadius = 36;
  const circumference = 2 * Math.PI * ringRadius;
  const dash = (score / 100) * circumference;

  return (
    <div className="market-site__cell market-site__panel market-site__panel--vitals">
      <header className="market-site__panel-head">
        <span className="market-site__panel-eyebrow">Proof vitals</span>
        <span className={`market-site__status-pill market-site__status-pill--${asset.status}`}>{asset.status}</span>
      </header>

      <div className="market-site__vitals-body">
        <div className="market-site__score-ring" aria-hidden="true">
          <svg viewBox="0 0 72 72">
            <circle className="market-site__score-ring-track" cx="36" cy="36" r={ringRadius} />
            <circle
              className="market-site__score-ring-fill"
              cx="36"
              cy="36"
              r={ringRadius}
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 36 36)"
            />
          </svg>
          <span className="market-site__score-value">
            <LiveValue value={score} duration={900} />
          </span>
        </div>

        <ul className="market-site__bars" aria-label="Proof layer scores">
          {bars.map((bar) => (
            <li key={bar.label}>
              <span className="market-site__bar-label">{bar.label}</span>
              <div className="market-site__bar-track" aria-hidden="true">
                <span className={`market-site__bar-fill market-site__bar-fill--${bar.tone}`} style={{ width: `${bar.value}%` }} />
              </div>
              <span className="market-site__bar-value">{bar.value}%</span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="market-site__panel-foot">
        <span>Composite score</span>
        <span className="market-site__panel-foot-muted">demo layers</span>
      </footer>
    </div>
  );
}

type ActivityPoint = {
  label: string;
  value: number;
};

function formatActivityTick(value: number): string {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(value);
}

function buildActivitySeries(assetId: string): ActivityPoint[] {
  const seed = seedFromId(assetId);
  const now = new Date();
  return Array.from({ length: 16 }, (_, i) => {
    const hour = 6 + i;
    const stamp = new Date(now);
    stamp.setHours(hour, 0, 0, 0);
    const label = stamp.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const idle = i < 4 ? 0 : 0;
    const wave = Math.sin((i + seed % 6) * 0.85) * 1200;
    const ramp = i < 4 ? idle : 800 + (i - 4) * 620 + wave;
    const spike = i === 10 ? 1800 + (seed % 900) : 0;
    return {
      label,
      value: Math.max(0, Math.round(ramp + spike + (seed % 11) * 40)),
    };
  });
}

function SiteActivityChart({ asset, siteName }: { asset: EnrichedAsset; siteName: string }) {
  const series = useMemo(() => buildActivitySeries(String(asset.asset.assetId)), [asset]);
  const total = series.reduce((sum, point) => sum + point.value, 0);
  const max = Math.max(...series.map((p) => p.value), 1);
  const gradientId = useId().replace(/:/g, "");

  const W = 720;
  const H = 240;
  const pad = { top: 18, right: 16, bottom: 44, left: 44 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const ySteps = 4;
  const yMax = Math.ceil(max / 1000) * 1000 || 1000;
  const yTicks = Array.from({ length: ySteps + 1 }, (_, i) => Math.round((yMax / ySteps) * i));

  const points = series.map((point, i) => {
    const x = pad.left + (i / (series.length - 1)) * plotW;
    const y = pad.top + plotH - (point.value / yMax) * plotH;
    return { ...point, x, y };
  });

  const linePath = points
    .map((point, i) => `${i === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L${pad.left + plotW},${pad.top + plotH} L${pad.left},${pad.top + plotH} Z`;

  const xLabelIndexes = [0, 4, 8, 12, 15];

  return (
    <section className="market-site__activity" aria-labelledby="market-site-activity-title">
      <header className="market-site__activity-head">
        <div>
          <h4 id="market-site-activity-title">Site activity</h4>
          <p className="market-site__activity-sub">Last 24 hours · demo telemetry</p>
        </div>
        <span className="market-site__activity-total">
          <LiveValue value={total} duration={1100} /> events
        </span>
      </header>

      <svg
        className="market-site__activity-chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Site activity over 24 hours for ${siteName}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = pad.top + plotH - (tick / yMax) * plotH;
          return (
            <g key={tick}>
              <line
                className="market-site__activity-grid"
                x1={pad.left}
                y1={y}
                x2={pad.left + plotW}
                y2={y}
              />
              <text className="market-site__activity-tick market-site__activity-tick--y" x={pad.left - 8} y={y + 4} textAnchor="end">
                {formatActivityTick(tick)}
              </text>
            </g>
          );
        })}

        <path className="market-site__activity-area" d={areaPath} fill={`url(#${gradientId})`} />
        <path className="market-site__activity-line" d={linePath} />

        {xLabelIndexes.map((index) => {
          const point = points[index];
          if (!point) return null;
          return (
            <text
              key={point.label}
              className="market-site__activity-tick market-site__activity-tick--x"
              x={point.x}
              y={H - 18}
              textAnchor="middle"
            >
              {point.label}
            </text>
          );
        })}

        <text
          className="market-site__activity-axis-label"
          x={pad.left + plotW / 2}
          y={H - 4}
          textAnchor="middle"
        >
          Time (local)
        </text>
      </svg>

      <p className="market-site__activity-note">Demo telemetry — not live operations data</p>
    </section>
  );
}

type CameraModalProps = {
  cameras: SiteCamera[];
  siteName: string;
  activeId: string;
  clock: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

function CameraModal({ cameras, siteName, activeId, clock, onSelect, onClose }: CameraModalProps) {
  const titleId = useId();
  const active = cameras.find((cam) => cam.id === activeId) ?? cameras[0];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="market-cam-modal-overlay" onClick={onClose}>
      <div
        className="market-cam-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="market-cam-modal__head">
          <div className="market-cam-modal__titles">
            <h3 id={titleId} className="market-cam-modal__title">
              {active.label}
            </h3>
            <p className="market-cam-modal__zone">{active.zone} · {siteName}</p>
          </div>
          <div className="market-cam-modal__meta">
            <span className="market-site__live">
              <span className="market-site__live-dot" aria-hidden="true" />
              Live
            </span>
            <span className="market-cam-modal__clock mono-label">{clock} UTC-3</span>
          </div>
          <button
            type="button"
            className="market-cam-modal__close"
            onClick={onClose}
            aria-label="Close camera"
          >
            ×
          </button>
        </header>

        <div className="market-cam-modal__main">
          <CameraFeed camera={active} siteName={siteName} large />
        </div>

        <div className="market-cam-modal__strip" role="listbox" aria-label="Other cameras">
          {cameras.map((camera) => {
            const selected = camera.id === active.id;
            return (
              <button
                key={camera.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={`market-cam-modal__thumb${selected ? " market-cam-modal__thumb--active" : ""}`}
                onClick={() => onSelect(camera.id)}
                aria-label={`Switch to ${camera.label}`}
              >
                <CameraFeed camera={camera} siteName={siteName} compact />
              </button>
            );
          })}
        </div>

        <p className="market-cam-modal__disclaimer small">
          Fictional site monitoring for demo only — not a real CCTV stream.
        </p>
      </div>
    </div>,
    document.body,
  );
}

function CameraFeed({
  camera,
  siteName,
  large = false,
  compact = false,
  embedded = false,
}: {
  camera: SiteCamera;
  siteName: string;
  large?: boolean;
  compact?: boolean;
  embedded?: boolean;
}) {
  const className = [
    "market-cam-feed",
    large ? "market-cam-feed--large" : "",
    compact ? "market-cam-feed--compact" : "",
    embedded ? "market-cam-feed--embedded" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const viewport = (
    <div className="market-cam-feed__viewport">
      <div
        className="market-cam-feed__video"
        style={{ backgroundPosition: `${camera.posX}% ${camera.posY}%` }}
        role="img"
        aria-label={`${camera.label} at ${siteName}`}
      />
      <div className="market-cam-feed__scan" aria-hidden="true" />
      <span className="market-cam-feed__badge">LIVE</span>
      {compact ? <span className="market-cam-feed__compact-label">{camera.zone}</span> : null}
    </div>
  );

  if (embedded) {
    return (
      <div className={className}>
        {viewport}
        <footer className="market-cam-feed__footer">
          <strong>{camera.label}</strong>
          <span>{camera.zone}</span>
        </footer>
      </div>
    );
  }

  return (
    <div className={className}>
      {viewport}
      {!compact ? (
        <div className="market-cam-feed__meta">
          <strong>{camera.label}</strong>
          <span>{camera.zone}</span>
        </div>
      ) : null}
    </div>
  );
}
