import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { AuditRecordCard } from "../components/proof/AuditRecordCard";
import { useCallback } from "react";
import { getAuditRecord } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";

export function AuditDetail() {
  const { assetId = "" } = useParams();
  const loader = useCallback(() => getAuditRecord(assetId), [assetId]);
  const audit = useAsyncData(loader, [assetId]);

  return (
    <div className="page">
      <PageHeader
        kicker="Audit detail"
        title={assetId || "Unknown record"}
        lead="Full decision, verification, and on-chain panels for one audit record."
      />

      <StatePanel loading={audit.loading} error={audit.error} onRetry={audit.reload}>
        {audit.data ? <AuditRecordCard record={audit.data} /> : null}
      </StatePanel>

      <p style={{ marginTop: "1.5rem" }}>
        <Link className="route-cta route-cta--ghost" to="/audit">
          ← Audit log
        </Link>
      </p>
    </div>
  );
}
