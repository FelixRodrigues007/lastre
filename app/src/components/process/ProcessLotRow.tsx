import { Fragment, useMemo } from "react";
import { ActionBadge, VerdictBadge } from "../proof/Badges";
import { StatusBadge } from "../ui/StatusBadge";
import { useLocaleContext } from "../../context/LocaleContext";
import { buildFieldDiffRows } from "../../lib/artifactDiff";
import { isTamperedDemoLot, lotShortNameKey } from "../../lib/processLots";
import { shortHash } from "../../lib/format";
import type { AuditRecord, LotListItem } from "../../lib/types";
import { ProcessTamperDiff } from "./ProcessTamperDiff";
import "./process-lot-row.css";

export type LotRowPhase = "queued" | "running" | "completed";

type ProcessLotRowProps = {
  lot: LotListItem;
  index: number;
  phase: LotRowPhase;
  record: AuditRecord | null;
  showSeal: boolean;
  fetching?: boolean;
};

export function ProcessLotRow({
  lot,
  index,
  phase,
  record,
  showSeal,
  fetching = false,
}: ProcessLotRowProps) {
  const { t } = useLocaleContext();

  const tamperRows = useMemo(() => {
    if (!isTamperedDemoLot(lot) || !record?.verification || !showSeal) return null;
    const reference = lot.referenceArtifact ?? lot.artifact;
    return buildFieldDiffRows(lot.artifact, reference);
  }, [lot, record, showSeal]);

  const showTamperDiff =
    tamperRows &&
    record?.verification?.verdict === "Invalid" &&
    tamperRows.some((row) => row.diverges);

  const sealSkipped = record && (record.decision.action === "skip" || record.decision.action === "escalate");
  const agentReady = Boolean(record);
  const sealReady = Boolean(record) && showSeal;

  return (
    <Fragment>
      <tr
        className={`process-ledger__row process-ledger__row--${phase}${
          record?.outcome === "rejected" ? " process-ledger__row--proof-invalid" : ""
        }`}
        aria-busy={phase === "running"}
      >
        <th scope="row" className="process-ledger__lot">
          <span className="process-ledger__index mono-label">{String(index + 1).padStart(2, "0")}</span>
          <span className="process-ledger__lot-name">{t(lotShortNameKey(lot))}</span>
        </th>

        <td className="process-ledger__agent">
          {fetching ? (
            <span className="process-ledger__shimmer" aria-hidden="true" />
          ) : agentReady && record ? (
            <div className="process-ledger__cell">
              <ActionBadge action={record.decision.action} size="sm" />
              <p className="process-ledger__reasoning">{record.decision.reasoning}</p>
            </div>
          ) : (
            <span className="process-ledger__waiting">{t("process.pipeline.awaitingAgent")}</span>
          )}
        </td>

        <td className="process-ledger__seal">
          {fetching ? (
            <span className="process-ledger__waiting">{t("process.pipeline.awaitingSeal")}</span>
          ) : sealReady && record ? (
            sealSkipped ? (
              <div className="process-ledger__cell">
                <StatusBadge label={t("process.seal.notInvoked")} tone="neutral" circle="dashed" size="sm" />
              </div>
            ) : (
              <div className="process-ledger__cell">
                <VerdictBadge verdict={record.verification?.verdict ?? null} size="sm" />
                {record.verification ? (
                  <code className="process-ledger__hash">{shortHash(record.verification.seal)}</code>
                ) : null}
              </div>
            )
          ) : agentReady && record && !showSeal ? (
            <span className="process-ledger__computing">{t("process.pipeline.sealComputing")}</span>
          ) : (
            <span className="process-ledger__waiting">{t("process.pipeline.awaitingSeal")}</span>
          )}
        </td>
      </tr>

      {showTamperDiff && tamperRows ? (
        <tr className="process-ledger__row process-ledger__row--diff">
          <td colSpan={3}>
            <ProcessTamperDiff rows={tamperRows} />
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}
