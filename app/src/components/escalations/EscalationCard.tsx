import type { ProvenanceArtifact } from "../../lib/types";
import { Link } from "react-router-dom";
import { ActionBadge, OutcomeBadge } from "../proof/Badges";
import { ArtifactPanel, escalationHighlights } from "../lots/ArtifactPanel";
import type { AuditRecord } from "../../lib/types";
import "./escalation-card.css";

type EscalationCardProps = {
  record: AuditRecord;
  index: number;
  artifact?: ProvenanceArtifact;
};

export function EscalationCard({ record, index, artifact }: EscalationCardProps) {
  const highlights = escalationHighlights(record.decision.reasoning);

  return (
    <article className="panel escalation-card">
      <header className="escalation-card__head">
        <div>
          <p className="mono-label">Escalation {index}</p>
          <h3 className="escalation-card__title">
            <Link to={`/lots/${encodeURIComponent(record.assetId)}`}>{record.assetId}</Link>
          </h3>
        </div>
        <OutcomeBadge outcome={record.outcome} />
      </header>

      <div className="escalation-card__badges">
        <ActionBadge action={record.decision.action} />
        <span className="escalation-card__meta">by {record.decision.decidedBy}</span>
      </div>

      <p className="escalation-card__reason">{record.decision.reasoning}</p>

      {artifact ? (
        <section className="escalation-card__artifact">
          <p className="mono-label">Triggering fields</p>
          <ArtifactPanel artifact={artifact} highlightFields={highlights} />
        </section>
      ) : null}

      <footer className="escalation-card__foot">
        <Link className="escalation-card__link" to={`/audit/${encodeURIComponent(record.assetId)}`}>
          View audit record →
        </Link>
      </footer>
    </article>
  );
}
