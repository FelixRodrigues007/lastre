import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function Audit() {
  return (
    <div className="page">
      <PageHeader
        kicker="Audit"
        title="Audit log"
        lead="Session history of AuditRecords — action, verdict, outcome, and on-chain tx when paid."
      />

      <RoutePlaceholder
        phase="Audit table"
        blocks={[
          { label: "Records", hint: "Searchable table with filters by outcome" },
          { label: "Export", hint: "Download BatchResult JSON for evaluators" },
          { label: "Empty state", hint: "No lots processed yet — run from Process" },
        ]}
        cta={{ label: "Run demo batch →", to: "/process" }}
      />
    </div>
  );
}
