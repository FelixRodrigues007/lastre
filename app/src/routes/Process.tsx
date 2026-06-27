import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function Process() {
  return (
    <div className="page">
      <PageHeader
        kicker="Process"
        title="Run demo batch"
        lead="Interactive replacement for make demo — watch triage, mock payment, seal verification, and on-chain verdict per lot."
      />

      <RoutePlaceholder
        phase="Batch stepper"
        blocks={[
          { label: "Step 1 · Triage", hint: "Agent action + reasoning + decidedBy" },
          { label: "Step 2 · Payment", hint: "Mock x402 when action is pay" },
          { label: "Step 3 · Seal", hint: "Recomputed seal vs referenceSeal" },
          { label: "Step 4 · Verdict", hint: "Valid or Invalid — seal decides" },
        ]}
        cta={{ label: "View expected outcomes in audit →", to: "/audit" }}
      />
    </div>
  );
}
