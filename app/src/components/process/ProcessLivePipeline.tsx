import { Link } from "react-router-dom";
import { useMemo } from "react";
import { ProcessLotRow, type LotRowPhase } from "./ProcessLotRow";
import { Icon } from "../ui/Icon";
import { useLocaleContext } from "../../context/LocaleContext";
import { lotShortNameKey } from "../../lib/processLots";
import type { AuditRecord, BatchSummary, LotListItem } from "../../lib/types";
import "./process-live-pipeline.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

type ProcessLivePipelineProps = {
  embedded?: boolean;
  hideHeader?: boolean;
  selectedLots: LotListItem[];
  records: AuditRecord[];
  activeIndex: number | null;
  sealRevealedThrough: number;
  phase: BatchPhase;
  fetchingBatch: boolean;
  summary: BatchSummary | null;
  onRepeat: () => void;
};

function rowPhase(
  index: number,
  activeIndex: number | null,
  recordsLength: number,
  phase: BatchPhase,
  fetchingBatch: boolean,
): LotRowPhase {
  if (phase === "idle") return "queued";
  if (phase === "error") return index < recordsLength ? "completed" : "queued";
  if (index < recordsLength) return "completed";
  if (activeIndex === index && (fetchingBatch || phase === "running")) return "running";
  return "queued";
}

export function ProcessLivePipeline({
  embedded = false,
  hideHeader = false,
  selectedLots,
  records,
  activeIndex,
  sealRevealedThrough,
  phase,
  fetchingBatch,
  summary,
  onRepeat,
}: ProcessLivePipelineProps) {
  const { t } = useLocaleContext();

  const recordByAssetId = useMemo(
    () => new Map(records.map((record) => [record.assetId, record])),
    [records],
  );

  const showSummary = phase === "completed" && summary !== null;
  const hasSelection = selectedLots.length > 0;
  const showLiveTable = phase !== "idle" || records.length > 0;
  const showPrinciple = !embedded;
  const showHeader = !embedded && !hideHeader;

  return (
    <section
      className={`process-pipeline${embedded ? " process-pipeline--embedded" : " panel panel--elevated"}`}
      aria-label={t("process.livePipeline")}
    >
      {showHeader ? (
        <header className="process-pipeline__head">
          <div>
            <p className="process-pipeline__step mono-label">{t("process.step3")}</p>
            <p className="process-pipeline__kicker mono-label">{t("process.pipeline.kicker")}</p>
            <h2 className="process-pipeline__title">{t("process.livePipeline")}</h2>
            {!showLiveTable && hasSelection ? (
              <p className="process-pipeline__lead">{t("process.pipeline.idleLead")}</p>
            ) : null}
          </div>
          {phase === "running" ? (
            <p className="process-pipeline__status" role="status">
              {fetchingBatch ? t("process.pipeline.fetching") : t("process.pipeline.revealing")}
            </p>
          ) : null}
        </header>
      ) : null}

      {!hasSelection ? (
        <p className="process-pipeline__empty">{t("process.pipeline.emptySelection")}</p>
      ) : !showLiveTable ? (
        <div className="process-queue">
          <p className="process-queue__title">
            {t("process.queue.title", { count: String(selectedLots.length) })}
          </p>
          <ol className="process-queue__list">
            {selectedLots.map((lot, index) => (
              <li key={lot.artifact.assetId} className="process-queue__item">
                <span className="process-queue__index mono-label">{String(index + 1).padStart(2, "0")}</span>
                <span className="process-queue__name">{t(lotShortNameKey(lot))}</span>
                <span className="process-queue__status mono-label">{t("process.queue.waiting")}</span>
              </li>
            ))}
          </ol>
          {showPrinciple ? (
            <div className="process-pipeline__principle">
              <div className="process-pipeline__principle-col process-pipeline__principle-col--agent">
                <Icon name="process" size={14} />
                <strong>{t("process.pipeline.principleAgent")}</strong>
              </div>
              <span className="process-pipeline__principle-arrow" aria-hidden="true">
                →
              </span>
              <div className="process-pipeline__principle-col process-pipeline__principle-col--seal">
                <Icon name="shield" size={14} />
                <strong>{t("process.pipeline.principleSeal")}</strong>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="process-ledger-wrap">
          {showPrinciple ? (
          <div className="process-pipeline__principle">
            <div className="process-pipeline__principle-col process-pipeline__principle-col--agent">
              <Icon name="process" size={14} />
              <strong>{t("process.pipeline.principleAgent")}</strong>
            </div>
            <span className="process-pipeline__principle-arrow" aria-hidden="true">
              →
            </span>
            <div className="process-pipeline__principle-col process-pipeline__principle-col--seal">
              <Icon name="shield" size={14} />
              <strong>{t("process.pipeline.principleSeal")}</strong>
            </div>
          </div>
          ) : null}

          <table className="process-ledger">
            <thead>
              <tr>
                <th scope="col" className="mono-label">
                  {t("process.pipeline.colLot")}
                </th>
                <th scope="col" className="mono-label">
                  {t("process.pipeline.agentColumn")}
                </th>
                <th scope="col" className="mono-label">
                  {t("process.pipeline.sealColumn")}
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedLots.map((lot, index) => {
                const phaseValue = rowPhase(index, activeIndex, records.length, phase, fetchingBatch);
                const record = recordByAssetId.get(lot.artifact.assetId) ?? null;
                const showSeal = index <= sealRevealedThrough;

                return (
                  <ProcessLotRow
                    key={lot.artifact.assetId}
                    lot={lot}
                    index={index}
                    phase={phaseValue}
                    record={record}
                    showSeal={showSeal}
                    fetching={fetchingBatch && activeIndex === index && !record}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showSummary && summary ? (
        <footer className="process-pipeline__summary" aria-label={t("process.summary.aria")}>
          <p className="process-pipeline__summary-kicker mono-label">{t("process.summary.title")}</p>
          <dl className="process-pipeline__scoreboard">
            <div className="process-pipeline__score process-pipeline__score--tokenizable">
              <dt>{t("process.summary.tokenizable")}</dt>
              <dd>{summary.tokenizable}</dd>
            </div>
            <div className="process-pipeline__score process-pipeline__score--rejected">
              <dt>{t("process.summary.rejected")}</dt>
              <dd>{summary.rejected}</dd>
            </div>
            <div className="process-pipeline__score process-pipeline__score--skipped">
              <dt>{t("process.summary.skipped")}</dt>
              <dd>{summary.skipped}</dd>
            </div>
            <div className="process-pipeline__score process-pipeline__score--escalated">
              <dt>{t("process.summary.escalated")}</dt>
              <dd>{summary.escalated}</dd>
            </div>
          </dl>
          <div className="process-pipeline__summary-actions">
            <Link
              to="/audit"
              state={{ fromProcess: true, count: records.length }}
              className="route-cta process-pipeline__audit-link"
            >
              {t("process.openAudit")}
              <Icon name="chevron-right" size={16} />
            </Link>
            <button type="button" className="route-cta route-cta--ghost process-pipeline__repeat" onClick={onRepeat}>
              <Icon name="refresh" size={16} />
              {t("process.repeat")}
            </button>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
