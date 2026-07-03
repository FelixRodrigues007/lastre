import { Link } from "react-router-dom";
import { ProcessLotFlow } from "./ProcessLotFlow";
import { LiveValue } from "../motion/LiveValue";
import { Icon } from "../ui/Icon";
import { useLocaleContext } from "../../context/LocaleContext";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { expectedKindClass, inferExpectedKind } from "../../lib/processLots";
import { getMarketplaceCoverFromAsset, MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import type { AuditRecord, BatchSummary, DeciderMode, LotListItem } from "../../lib/types";
import { useMemo, type CSSProperties } from "react";
import "./process-seal-arena.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

type ProcessSealArenaProps = {
  selectedLots: LotListItem[];
  phase?: BatchPhase;
  activeIndex?: number | null;
  records?: AuditRecord[];
  streamingRecord?: AuditRecord | null;
  sealRevealedThrough?: number;
  fetchingBatch?: boolean;
  decider?: DeciderMode;
  summary?: BatchSummary | null;
  onRepeat?: () => void;
};

const ORBIT_RADIUS = 132;

function orbitAngles(count: number): number[] {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, index) => -90 + (360 / count) * index);
}

export function ProcessSealArena({
  selectedLots,
  phase = "idle",
  activeIndex = null,
  records = [],
  streamingRecord = null,
  sealRevealedThrough = -1,
  fetchingBatch = false,
  decider = "rule",
  summary = null,
  onRepeat,
}: ProcessSealArenaProps) {
  const { t } = useLocaleContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const hasSelection = selectedLots.length > 0;
  const inspecting = phase === "running" || phase === "completed" || phase === "error" || records.length > 0;
  const showSummary = phase === "completed" && summary !== null;

  const nodes = useMemo(
    () =>
      selectedLots.map((lot, index) => ({
        lot,
        index,
        kind: inferExpectedKind(lot),
        angle: orbitAngles(selectedLots.length)[index],
        cover: getMarketplaceCoverFromAsset(lot.artifact as Record<string, unknown>),
      })),
    [selectedLots],
  );

  return (
    <aside
      className={`process-chamber${prefersReducedMotion ? " process-chamber--static" : ""}${
        hasSelection ? " process-chamber--live" : ""
      }${inspecting ? " process-chamber--inspecting" : ""}`}
      aria-label={t("process.stage.previewAria")}
    >
      <header className="process-chamber__head">
        <p className="process-chamber__kicker mono-label">{t("process.stage.previewTitle")}</p>
        <p className="process-chamber__lead">
          {inspecting ? t("process.stage.inspectLead") : t("process.stage.previewLead")}
        </p>
      </header>

      <div className="process-chamber__stage">
        {inspecting ? (
          <ProcessLotFlow
            selectedLots={selectedLots}
            phase={phase}
            activeIndex={activeIndex}
            records={records}
            streamingRecord={streamingRecord}
            sealRevealedThrough={sealRevealedThrough}
            fetchingBatch={fetchingBatch}
            decider={decider}
          />
        ) : (
          <div className="process-chamber__disc-area">
            <div className="process-chamber__aura" aria-hidden="true" />

            <div className="process-chamber__disc-wrap">
              <svg
                className="process-chamber__disc-svg"
                viewBox="0 0 360 360"
                role="presentation"
                aria-hidden="true"
              >
                <circle className="process-chamber__ring process-chamber__ring--outer" cx="180" cy="180" r="162" />
                <circle className="process-chamber__ring process-chamber__ring--ticks" cx="180" cy="180" r="148" />
                <circle className="process-chamber__ring process-chamber__ring--orbit" cx="180" cy="180" r="148" />
                <circle className="process-chamber__ring process-chamber__ring--inner" cx="180" cy="180" r="98" />
              </svg>

              <div
                className="process-chamber__orbit"
                style={{ "--orbit-radius": `${ORBIT_RADIUS}px` } as CSSProperties}
              >
                {nodes.map(({ lot, index, kind, angle, cover }) => (
                  <div
                    key={lot.artifact.assetId}
                    className={`process-chamber__orbit-node process-chamber__orbit-node--${expectedKindClass(kind)}`}
                    style={
                      {
                        "--orbit-angle": `${angle}deg`,
                        animationDelay: `${index * 70}ms`,
                      } as CSSProperties
                    }
                  >
                    <span className="process-chamber__orbit-thumb">
                      <img
                        src={cover}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          const img = event.currentTarget;
                          if (img.dataset.fallback === "1") return;
                          img.dataset.fallback = "1";
                          img.src = MARKETPLACE_COVER_FALLBACK;
                        }}
                      />
                    </span>
                    <span className="process-chamber__orbit-index mono-label">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                ))}
              </div>

              <div className="process-chamber__hub" aria-live="polite">
                <span className="process-chamber__hub-icon" aria-hidden="true">
                  <Icon name="shield" size={26} />
                </span>
                <p className="process-chamber__count">{selectedLots.length}</p>
                <p className="process-chamber__count-label">
                  {hasSelection ? t("process.stage.lotCount") : t("process.stage.previewEmpty")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSummary && summary ? (
        <footer className="process-chamber__summary process-chamber__summary--revealed" aria-label={t("process.summary.aria")}>
          <p className="process-chamber__summary-kicker mono-label">{t("process.summary.title")}</p>
          <dl className="process-chamber__scoreboard">
            <div className="process-chamber__score process-chamber__score--tokenizable">
              <dt>{t("process.summary.tokenizable")}</dt>
              <dd><LiveValue value={summary.tokenizable} duration={720} /></dd>
            </div>
            <div className="process-chamber__score process-chamber__score--rejected">
              <dt>{t("process.summary.rejected")}</dt>
              <dd><LiveValue value={summary.rejected} duration={720} /></dd>
            </div>
            <div className="process-chamber__score process-chamber__score--skipped">
              <dt>{t("process.summary.skipped")}</dt>
              <dd><LiveValue value={summary.skipped} duration={720} /></dd>
            </div>
            <div className="process-chamber__score process-chamber__score--escalated">
              <dt>{t("process.summary.escalated")}</dt>
              <dd><LiveValue value={summary.escalated} duration={720} /></dd>
            </div>
          </dl>
          <div className="process-chamber__summary-actions">
            <Link
              to="/audit"
              state={{ fromProcess: true, count: records.length }}
              className="route-cta process-chamber__audit-link"
            >
              {t("process.openAudit")}
              <Icon name="chevron-right" size={16} />
            </Link>
            {onRepeat ? (
              <button type="button" className="route-cta route-cta--ghost process-chamber__repeat" onClick={onRepeat}>
                <Icon name="refresh" size={16} />
                {t("process.repeat")}
              </button>
            ) : null}
          </div>
        </footer>
      ) : null}
    </aside>
  );
}
