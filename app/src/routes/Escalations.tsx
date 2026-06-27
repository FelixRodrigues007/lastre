import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function Escalations() {
  return (
    <div className="page">
      <PageHeader
        kicker="Escalations"
        title="Review queue"
        lead="Lots where the agent chose escalate — missing fields, geo outside perimeter, or mass out of range."
      />

      <RoutePlaceholder
        phase="Triage queue"
        blocks={[
          { label: "LOTE-OUTOFREGION", hint: "Geolocation outside known mine perimeter" },
          { label: "Review drawer", hint: "Full reasoning + triggering artifact fields" },
          { label: "Empty state", hint: "No escalations when all lots pass triage" },
        ]}
        cta={{ label: "Process lots →", to: "/process" }}
      />
    </div>
  );
}
