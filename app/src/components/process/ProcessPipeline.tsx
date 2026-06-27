import { Link } from "react-router-dom";
import type { BatchSummary } from "../../lib/types";
import "./process-pipeline.css";

const STEPS = ["Triage", "Pay", "Verify", "On-chain", "Done"] as const;

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
      <p className="process-sticky-summary__text">
        <strong>{total} processed</strong> · {summary.tokenizable} tokenizable ·{" "}
        {summary.rejected} rejected · {summary.escalated} escalated
      </p>
      <Link className="route-cta" to="/audit">
        Open audit log
      </Link>
    </div>
  );
}
