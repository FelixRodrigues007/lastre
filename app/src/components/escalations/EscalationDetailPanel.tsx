import { Link } from "react-router-dom";
import { useEffect, useId, useMemo, useState } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import { useNavCounts } from "../../context/NavCountsContext";
import {
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
import { StatusBadge } from "../ui/StatusBadge";
import { ArtifactPanel, escalationHighlights } from "../lots/ArtifactPanel";
import { EscalationGeoEvidence } from "./EscalationGeoEvidence";
import "../lots/evidence-room-tabs.css";
import "./escalation-detail.css";

type EscalationDetailPanelProps = {
  record: AuditRecord;
  index: number;
  artifact?: ProvenanceArtifact;
  settings?: AppSettings | null;
  onResolved: (result: EscalationActionResult) => void;
};

type PendingAction = "requeue" | "discard" | "override-pay" | "override-skip" | null;
type DetailTab = "summary" | "fields" | "geo";

const KIND_BADGE: Record<
  ReturnType<typeof getEscalationKind>,
  { tone: "warning" | "danger" | "info"; circle: "dashed" | "ring" }
> = {
  geo: { tone: "warning", circle: "dashed" },
  mass: { tone: "warning", circle: "dashed" },
  missing: { tone: "danger", circle: "dashed" },
  review: { tone: "info", circle: "ring" },
};

export function EscalationDetailPanel({
  record,
  index,
  artifact,
  settings,
  onResolved,
}: EscalationDetailPanelProps) {
  const { t } = useLocaleContext();
  const { reload: reloadNavCounts } = useNavCounts();
  const titleId = useId();
  const [activeTab, setActiveTab] = useState<DetailTab>("summary");
  const [pending, setPending] = useState<PendingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const kind = getEscalationKind(record.decision.reasoning);
  const kindStyle = KIND_BADGE[kind];
  const highlights = escalationHighlights(record.decision.reasoning);
  const showGeo = Boolean(artifact && settings && isGeoEscalation(record.decision.reasoning));
  const busy = pending != null;

  const tabs = useMemo(() => {
    const items: { id: DetailTab; label: string }[] = [
      { id: "summary", label: t("escalations.tabs.summary") },
    ];
    if (artifact) items.push({ id: "fields", label: t("escalations.tabs.fields") });
    if (showGeo) items.push({ id: "geo", label: t("escalations.tabs.geo") });
    return items;
  }, [artifact, showGeo, t]);

  useEffect(() => {
    setActiveTab("summary");
    setFeedback(null);
    setError(null);
  }, [record.assetId]);

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeTab)) {
      setActiveTab("summary");
    }
  }, [activeTab, tabs]);

  async function runAction(
    action: PendingAction,
    runner: () => Promise<EscalationActionResult>,
    successKey:
      | "escalations.feedback.requeued"
      | "escalations.feedback.discarded"
      | "escalations.feedback.overriddenPay"
      | "escalations.feedback.overriddenSkip",
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
    <aside className="escalation-detail" aria-labelledby={titleId} key={record.assetId}>
      <header className="escalation-detail__head">
        <div className="escalation-detail__head-top">
          <div className="escalation-detail__intro">
            <p className="escalation-detail__kicker">{t("escalations.item.label", { index })}</p>
            <h2 className="escalation-detail__title" id={titleId} title={record.assetId}>
              {record.assetId}
            </h2>
            {artifact ? (
              <p className="escalation-detail__subtitle">
                {artifact.operator} · {artifact.origin.site}
              </p>
            ) : null}
          </div>

          <Link
            className="escalation-detail__audit-link"
            to={`/audit/${encodeURIComponent(record.assetId)}`}
          >
            {t("escalations.detail.viewAudit")} →
          </Link>
        </div>

        <div className="escalation-detail__badges">
          <StatusBadge
            label={t(ESCALATION_KIND_LABEL_KEYS[kind])}
            tone={kindStyle.tone}
            circle={kindStyle.circle}
            size="sm"
          />
          <ActionBadge action={record.decision.action} size="sm" />
          <span className="escalation-detail__decider">
            {record.decision.decidedBy === "llm"
              ? t("audit.evidence.owner.llm")
              : t("audit.evidence.owner.rule")}
          </span>
        </div>

        <div className="escalation-detail__toolbar">
          <nav className="evidence-room-tabs" role="tablist" aria-label={t("escalations.detail.section")}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`escalation-tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls={`escalation-panel-${tab.id}`}
                className={`evidence-room-tabs__tab${activeTab === tab.id ? " evidence-room-tabs__tab--active" : ""}${tab.id === "geo" ? " evidence-room-tabs__tab--alert" : ""}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="escalation-detail__actions">
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
          </div>
        </div>

        {feedback ? (
          <p className="escalation-detail__feedback" role="status">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p className="escalation-detail__error" role="alert">
            {error}
          </p>
        ) : null}
      </header>

      <div className="escalation-detail__scroll">
        {activeTab === "summary" ? (
          <div
            key="summary"
            className="escalation-detail__panel"
            role="tabpanel"
            id="escalation-panel-summary"
            aria-labelledby="escalation-tab-summary"
          >
            <blockquote className="escalation-detail__reason">
              <p className="escalation-detail__section-label mono-label">{t("escalations.item.reason")}</p>
              <p>{record.decision.reasoning}</p>
            </blockquote>
            <p className="escalation-detail__agent-note">{t("escalations.item.agentNote")}</p>
          </div>
        ) : null}

        {activeTab === "fields" && artifact ? (
          <div
            key="fields"
            className="escalation-detail__panel"
            role="tabpanel"
            id="escalation-panel-fields"
            aria-labelledby="escalation-tab-fields"
          >
            <p className="escalation-detail__section-label mono-label">{t("escalations.item.triggerFields")}</p>
            <ArtifactPanel artifact={artifact} highlightFields={highlights} />
          </div>
        ) : null}

        {activeTab === "geo" && showGeo && artifact && settings ? (
          <div
            key="geo"
            className="escalation-detail__panel"
            role="tabpanel"
            id="escalation-panel-geo"
            aria-labelledby="escalation-tab-geo"
          >
            <EscalationGeoEvidence artifact={artifact} limits={settings.limits} />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

export function EscalationDetailEmpty() {
  const { t } = useLocaleContext();

  return (
    <div className="escalation-detail escalation-detail--empty">
      <div className="escalation-detail__empty-icon" aria-hidden="true">
        <span className="escalation-detail__empty-ring" />
      </div>
      <p className="escalation-detail__empty-title">{t("escalations.detail.empty")}</p>
      <p className="escalation-detail__empty-hint">{t("escalations.filters.emptyHint")}</p>
    </div>
  );
}
