import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function AuditDetail() {
  const { assetId } = useParams<{ assetId: string }>();

  return (
    <div className="page">
      <PageHeader
        kicker="Audit detail"
        title={assetId ?? "Unknown record"}
        lead="Full decision, verification, and on-chain panels for one audit record."
      />

      <RoutePlaceholder
        phase="Record drill-down"
        blocks={[
          { label: "Agent decision", hint: "action · decidedBy · reasoning" },
          { label: "Verification", hint: "seal · referenceSeal · verdict" },
          { label: "On-chain", hint: "verdict · txHash · explorer link" },
        ]}
      />

      <p style={{ marginTop: "1.5rem" }}>
        <Link className="route-cta route-cta--ghost" to="/audit">
          ← Audit log
        </Link>
      </p>
    </div>
  );
}
