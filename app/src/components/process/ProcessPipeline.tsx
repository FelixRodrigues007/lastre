import { Link } from "react-router-dom";
import type { BatchSummary } from "../../lib/types";
import "./process-pipeline.css";

const STEPS = ["Triage", "Agent", "Seal", "Casper", "Done"] as const;

type ProcessPipelineStripProps = {
  activeStep: number;
};

export function ProcessPipelineStrip({ activeStep }: ProcessPipelineStripProps) {
  return (
    <ol className="process-pipeline" aria-label="Batch pipeline">
      {STEPS.map((label, index) => {
        const state =
          index < activeStep ? "done" : index === activeStep ? "active" : "pending";
        return (
          <li
            key={label}
            className={`process-pipeline__step process-pipeline__step--${state}`}
          >
            <span className="process-pipeline__dot" aria-hidden="true" />
            {label}
          </li>
        );
      })}
    </ol>
  );
}

type ProcessStickySummaryProps = {
  summary: BatchSummary;
  total: number;
};

export function ProcessStickySummary({ summary, total }: ProcessStickySummaryProps) {
  return (
    <div className="process-sticky-summary" role="status">
      <div className="process-sticky-summary__copy">
        <p className="process-sticky-summary__text">
          <strong>{total} processed</strong> · {summary.tokenizable} tokenizable ·{" "}
          {summary.rejected} rejected · {summary.escalated} escalated
        </p>
        <p className="process-sticky-summary__note">
          The agent chose each action. The seal decided each verdict. Invalid rows are permanent
          proof — not errors.
        </p>
      </div>
      <div className="process-sticky-summary__actions">
        <Link className="route-cta route-cta--ghost" to="/audit">
          Open audit log
        </Link>
        {summary.tokenizable > 0 ? (
          <Link className="route-cta" to="/marketplace">
            Claim demo representation
          </Link>
        ) : null}
      </div>
    </div>
  );
}
