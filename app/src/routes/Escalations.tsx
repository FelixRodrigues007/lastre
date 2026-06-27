import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { EscalationCard } from "../components/escalations/EscalationCard";
import { MetricCard } from "../components/ui/MetricCard";
import { SectionHead } from "../components/ui/SectionHead";
import { getEscalations, getLots } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./escalations.css";

export function Escalations() {
  const escalations = useAsyncData(getEscalations);
  const lots = useAsyncData(getLots);

  const artifactById = useMemo(() => {
    const map = new Map<string, import("../lib/types").ProvenanceArtifact>();
    lots.data?.lots.forEach((lot) => map.set(lot.artifact.assetId, lot.artifact));
    return map;
  }, [lots.data]);

  const loading = escalations.loading || lots.loading;
  const error = escalations.error ?? lots.error;
  const count = escalations.data?.records.length ?? 0;

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
        onRetry={() => {
          escalations.reload();
          lots.reload();
        }}
      >
        {escalations.data?.records.length === 0 ? (
          <div className="panel audit-empty">
            <p className="audit-empty__title">No escalations in this session</p>
            <p className="audit-empty__hint">
              Run the demo batch with LOTE-OUTOFREGION to populate the queue.
            </p>
            <Link className="route-cta" to="/process">
              Go to Process
            </Link>
          </div>
        ) : escalations.data ? (
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
                value={
                  escalations.data.records.filter((r) => r.decision.decidedBy === "rule").length
                }
                hint="Decided by RuleDecider"
              />
              <MetricCard
                label="LLM decisions"
                value={
                  escalations.data.records.filter((r) => r.decision.decidedBy === "llm").length
                }
                hint="Decided by LlmDecider"
              />
            </div>

            <SectionHead label="Escalated lots" aside={`${count} in queue`} />

            <div className="escalations-list">
              {escalations.data.records.map((record, index) => (
                <EscalationCard
                  key={`${record.assetId}-${index}`}
                  record={record}
                  index={index + 1}
                  artifact={artifactById.get(record.assetId)}
                />
              ))}
            </div>
          </>
        ) : null}
      </StatePanel>
    </div>
  );
}
