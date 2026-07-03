import { Link } from "react-router-dom";
import { useState } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import { useNavCounts } from "../../context/NavCountsContext";
import {
  discardEscalation,
  overrideEscalation,
  requeueEscalation,
} from "../../lib/api";
import {
  ESCALATION_KIND_LABEL_KEYS,
  getEscalationKind,
  isGeoEscalation,
} from "../../lib/escalations";
import type { AppSettings, AuditRecord, EscalationActionResult, ProvenanceArtifact } from "../../lib/types";
import { ActionBadge } from "../proof/Badges";
import { BtnIcon } from "../ui/BtnIcon";
import { ArtifactPanel, escalationHighlights } from "../lots/ArtifactPanel";
import { EscalationGeoEvidence } from "./EscalationGeoEvidence";
import "./escalation-queue-item.css";

type EscalationQueueItemProps = {
  record: AuditRecord;
  index: number;
  artifact?: ProvenanceArtifact;
  settings?: AppSettings | null;
  onResolved: (result: EscalationActionResult) => void;
};

type PendingAction = "requeue" | "discard" | "override-pay" | "override-skip" | null;

export function EscalationQueueItem({
  record,
  index,
  artifact,
  settings,
  onResolved,
}: EscalationQueueItemProps) {
  const { t } = useLocaleContext();
  const { reload: reloadNavCounts } = useNavCounts();
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const kind = getEscalationKind(record.decision.reasoning);
  const highlights = escalationHighlights(record.decision.reasoning);
  const showGeo = artifact && settings && isGeoEscalation(record.decision.reasoning);
  const busy = pending != null;

  async function runAction(
    action: PendingAction,
    runner: () => Promise<EscalationActionResult>,
    successKey: "escalations.feedback.requeued" | "escalations.feedback.discarded" | "escalations.feedback.overriddenPay" | "escalations.feedback.overriddenSkip",
  ) {
    if (busy) return;
    setPending(action);
    setError(null);
    setFeedback(null);

    try {
      const result = await runner();
      reloadNavCounts();
      onResolved(result);

      if (result.requeuedEscalated) {
        setFeedback(t("escalations.feedback.requeuedStillEscalated", { assetId: record.assetId }));
      } else {
        setFeedback(t(successKey, { assetId: record.assetId, outcome: result.record.outcome }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("escalations.feedback.error"));
    } finally {
      setPending(null);
    }
  }

  return (
    <article className="panel escalation-queue-item" aria-labelledby={`escalation-${record.assetId}`}>
      <header className="escalation-queue-item__head">
        <div className="escalation-queue-item__title-block">
          <p className="mono-label">
            {t("escalations.item.label", { index })}
          </p>
          <h2 className="escalation-queue-item__title" id={`escalation-${record.assetId}`}>
            <Link to={`/lots/${encodeURIComponent(record.assetId)}`}>{record.assetId}</Link>
          </h2>
        </div>
        <span className="escalation-queue-item__kind">{t(ESCALATION_KIND_LABEL_KEYS[kind])}</span>
      </header>

      <div className="escalation-queue-item__agent-note">
        <ActionBadge action={record.decision.action} />
        <p className="escalation-queue-item__agent-copy">
          {t("escalations.item.agentNote")}
        </p>
        <span className="escalation-queue-item__decider">
          {record.decision.decidedBy === "llm"
            ? t("audit.evidence.owner.llm")
            : t("audit.evidence.owner.rule")}
        </span>
      </div>

      <blockquote className="escalation-queue-item__reason">
        <p className="mono-label">{t("escalations.item.reason")}</p>
        <p>{record.decision.reasoning}</p>
      </blockquote>

      {artifact ? (
        <section className="escalation-queue-item__fields">
          <p className="mono-label">{t("escalations.item.triggerFields")}</p>
          <ArtifactPanel artifact={artifact} highlightFields={highlights} />
        </section>
      ) : null}

      {showGeo && artifact && settings ? (
        <EscalationGeoEvidence artifact={artifact} limits={settings.limits} />
      ) : null}

      <footer className="escalation-queue-item__foot">
        <p className="escalation-queue-item__actions-label mono-label">{t("escalations.item.actions")}</p>
        <div className="escalation-queue-item__actions">
          <button
            type="button"
            className="route-cta"
            disabled={busy}
            aria-busy={pending === "requeue"}
            onClick={() =>
              runAction("requeue", () => requeueEscalation(record.assetId), "escalations.feedback.requeued")
            }
          >
            <BtnIcon icon="process">
              {pending === "requeue" ? t("escalations.action.requeuing") : t("escalations.action.ackRequeue")}
            </BtnIcon>
          </button>
          <button
            type="button"
            className="route-cta route-cta--ghost"
            disabled={busy}
            aria-busy={pending === "override-pay"}
            onClick={() =>
              runAction(
                "override-pay",
                () => overrideEscalation(record.assetId, "pay"),
                "escalations.feedback.overriddenPay",
              )
            }
          >
            {pending === "override-pay"
              ? t("escalations.action.overriding")
              : t("escalations.action.overridePay")}
          </button>
          <button
            type="button"
            className="route-cta route-cta--ghost"
            disabled={busy}
            aria-busy={pending === "override-skip"}
            onClick={() =>
              runAction(
                "override-skip",
                () => overrideEscalation(record.assetId, "skip"),
                "escalations.feedback.overriddenSkip",
              )
            }
          >
            {pending === "override-skip"
              ? t("escalations.action.overriding")
              : t("escalations.action.overrideSkip")}
          </button>
          <button
            type="button"
            className="escalation-queue-item__discard"
            disabled={busy}
            aria-busy={pending === "discard"}
            onClick={() =>
              runAction("discard", () => discardEscalation(record.assetId), "escalations.feedback.discarded")
            }
          >
            {pending === "discard" ? t("escalations.action.discarding") : t("escalations.action.discard")}
          </button>
        </div>

        <div className="escalation-queue-item__links">
          <Link className="escalation-queue-item__link" to={`/audit/${encodeURIComponent(record.assetId)}`}>
            {t("escalations.item.viewAudit")}
          </Link>
        </div>

        {feedback ? (
          <p className="escalation-queue-item__feedback" role="status">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p className="escalation-queue-item__error" role="alert">
            {error}
          </p>
        ) : null}
      </footer>
    </article>
  );
}
