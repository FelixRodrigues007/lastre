import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { EscalationCard } from "../components/escalations/EscalationCard";
import { ActionBadge, OutcomeBadge } from "../components/proof/Badges";
import { EmptyState } from "../components/ui/EmptyState";
import { MetricCard } from "../components/ui/MetricCard";
import { getEscalations, getLots } from "../lib/api";
import { escalationReasonLabel } from "../lib/filters";
import type { AuditRecord } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "./escalations.css";

function EscalationListItem({
  record,
  index,
  selected,
  onSelect,
}: {
  record: AuditRecord;
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`escalations-queue__item${selected ? " escalations-queue__item--active" : ""}`}
      onClick={onSelect}
    >
      <span className="escalations-queue__index">{index}</span>
      <span className="escalations-queue__body">
        <span className="escalations-queue__id">{record.assetId}</span>
        <span className="escalations-queue__reason">{escalationReasonLabel(record.decision.reasoning)}</span>
      </span>
      <OutcomeBadge outcome={record.outcome} />
    </button>
  );
}

export function Escalations() {
  const escalations = useAsyncData(getEscalations);
  const lots = useAsyncData(getLots);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const artifactById = useMemo(() => {
    const map = new Map<string, import("../lib/types").ProvenanceArtifact>();
    lots.data?.lots.forEach((lot) => map.set(lot.artifact.assetId, lot.artifact));
    return map;
  }, [lots.data]);

  const loading = escalations.loading || lots.loading;
  const error = escalations.error ?? lots.error;
  const records = escalations.data?.records ?? [];
  const count = records.length;
  const selected = records[selectedIndex] ?? records[0];

  return (
    <div className="page">
      <PageHeader
        kicker="Escalations"
        title="Review queue"
        lead="Lots where the agent chose escalate — missing fields, geo outside perimeter, or mass out of range."
      />

      <StatePanel
        loading={loading}
        error={error}
        skeleton="split"
        onRetry={() => {
          escalations.reload();
          lots.reload();
        }}
      >
        {count === 0 ? (
          <EmptyState
            icon="escalations"
            title="No escalations in this session"
            hint="Run the demo batch with LOTE-OUTOFREGION to populate the review queue."
            action={
              <Link className="route-cta" to="/process">
                Go to Process
              </Link>
            }
          />
        ) : escalations.data && selected ? (
          <>
            <div className="escalations-summary">
              <MetricCard
                label="Pending review"
                value={count}
                size="lg"
                hint="Requires human decision before payment"
                tone="accent"
              />
              <MetricCard
                label="Rule decisions"
                value={records.filter((r) => r.decision.decidedBy === "rule").length}
                hint="Decided by RuleDecider"
              />
              <MetricCard
                label="LLM decisions"
                value={records.filter((r) => r.decision.decidedBy === "llm").length}
                hint="Decided by LlmDecider"
              />
            </div>

            <div className="escalations-master-detail">
              <aside className="panel escalations-queue" aria-label="Escalation queue">
                <p className="mono-label">Queue</p>
                <div className="escalations-queue__list">
                  {records.map((record, index) => (
                    <EscalationListItem
                      key={`${record.assetId}-${index}`}
                      record={record}
                      index={index + 1}
                      selected={index === selectedIndex}
                      onSelect={() => setSelectedIndex(index)}
                    />
                  ))}
                </div>
              </aside>

              <div className="escalations-detail">
                <EscalationCard
                  record={selected}
                  index={selectedIndex + 1}
                  artifact={artifactById.get(selected.assetId)}
                />
                <div className="escalations-detail__actions panel">
                  <ActionBadge action={selected.decision.action} />
                  <Link
                    className="route-cta route-cta--ghost"
                    to={`/lots/${encodeURIComponent(selected.assetId)}`}
                  >
                    View lot
                  </Link>
                  <Link
                    className="route-cta route-cta--ghost"
                    to={`/audit/${encodeURIComponent(selected.assetId)}`}
                  >
                    View audit
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </StatePanel>
    </div>
  );
}
