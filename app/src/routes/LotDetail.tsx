import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { RoutePlaceholder } from "../components/layout/RoutePlaceholder";

export function LotDetail() {
  const { assetId } = useParams<{ assetId: string }>();

  return (
    <div className="page">
      <PageHeader
        kicker="Lot detail"
        title={assetId ?? "Unknown lot"}
        lead="Artifact fields, computed seal, reference seal, and latest attestation."
      />

      <RoutePlaceholder
        phase="Forensic view"
        blocks={[
          { label: "Artifact", hint: "Full ProvenanceArtifact JSON" },
          { label: "Computed seal", hint: "SHA-256 from canonical artifact" },
          { label: "Reference seal", hint: "Registered baseline for comparison" },
          { label: "Attestation", hint: "Latest on-chain verdict if any" },
        ]}
      />

      <p style={{ marginTop: "1.5rem" }}>
        <Link className="route-cta route-cta--ghost" to="/lots">
          ← All lots
        </Link>
      </p>
    </div>
  );
}
