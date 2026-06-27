import { useParams } from "react-router-dom";
import { useCallback } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { AuditRecordCard } from "../components/proof/AuditRecordCard";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { getAuditRecord } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";

export function AuditDetail() {
  const { assetId = "" } = useParams();
  const loader = useCallback(() => getAuditRecord(assetId), [assetId]);
  const audit = useAsyncData(loader, [assetId]);

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: "Audit", to: "/audit" },
          { label: assetId || "Unknown record" },
        ]}
      />

      <PageHeader
        kicker="Audit detail"
        title={assetId || "Unknown record"}
        lead="Full decision, verification, and on-chain panels for one audit record."
      />

      <StatePanel loading={audit.loading} error={audit.error} skeleton="detail" onRetry={audit.reload}>
        {audit.data ? <AuditRecordCard record={audit.data} /> : null}
      </StatePanel>
    </div>
  );
}
