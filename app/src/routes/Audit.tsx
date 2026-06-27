import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { AuditRecordCard } from "../components/proof/AuditRecordCard";
import { ActionBadge, OutcomeBadge, VerdictBadge } from "../components/proof/Badges";
import { BtnIcon } from "../components/ui/BtnIcon";
import { OutcomeBreakdown } from "../components/ui/OutcomeBreakdown";
import { SectionHead } from "../components/ui/SectionHead";
import { downloadAuditExport, getAudit, getAuditSummary } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import "./audit.css";

export function Audit() {
  const audit = useAsyncData(getAudit);
  const summary = useAsyncData(getAuditSummary);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const loading = audit.loading || summary.loading;
  const error = audit.error ?? summary.error;

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadAuditExport();
    } catch {
      setExportError("Export failed — run a batch first.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        kicker="Audit"
        title="Audit log"
        lead="Session history — agent action, seal verdict, outcome, and on-chain tx when paid."
        actions={
          <>
            {audit.data && audit.data.records.length > 0 ? (
              <button
                type="button"
                className="route-cta route-cta--ghost"
                disabled={exporting}
                onClick={handleExport}
              >
                <BtnIcon icon="download">{exporting ? "Exporting…" : "Export JSON"}</BtnIcon>
              </button>
            ) : null}
            <Link className="route-cta" to="/process">
              <BtnIcon icon="process">Run demo batch</BtnIcon>
            </Link>
          </>
        }
      />

      {exportError ? <p className="audit-export-error">{exportError}</p> : null}

      <StatePanel
        loading={loading}
        error={error}
        onRetry={() => {
          audit.reload();
          summary.reload();
        }}
      >
        {audit.data?.records.length === 0 ? (
          <div className="panel audit-empty">
            <p className="audit-empty__title">No lots processed yet</p>
            <p className="audit-empty__hint">Run a batch from Process to populate the audit log.</p>
            <Link className="route-cta" to="/process">
              Go to Process
            </Link>
          </div>
        ) : summary.data && audit.data ? (
          <>
            <OutcomeBreakdown
              title="Batch outcomes"
              tokenizable={summary.data.tokenizable}
              rejected={summary.data.rejected}
              skipped={summary.data.skipped}
              escalated={summary.data.escalated}
            />

            <SectionHead
              label="Record log"
              aside={`${audit.data.records.length} entries`}
            />

            <div className="audit-table-wrap panel" role="region" aria-label="Audit table">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Asset</th>
                    <th scope="col">Action</th>
                    <th scope="col">Verdict</th>
                    <th scope="col">Outcome</th>
                    <th scope="col">By</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.data.records.map((record, index) => (
                    <tr key={`${record.assetId}-${index}`}>
                      <td className="audit-table__index">{index + 1}</td>
                      <td>
                        <Link to={`/audit/${encodeURIComponent(record.assetId)}`}>
                          {record.assetId}
                        </Link>
                      </td>
                      <td>
                        <ActionBadge action={record.decision.action} />
                      </td>
                      <td>
                        <VerdictBadge
                          verdict={record.verification?.verdict ?? record.onChain?.verdict ?? null}
                        />
                      </td>
                      <td>
                        <OutcomeBadge outcome={record.outcome} />
                      </td>
                      <td className="audit-table__mono">{record.decision.decidedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="audit-cards">
              {audit.data.records.map((record, index) => (
                <AuditRecordCard key={`${record.assetId}-${index}`} record={record} index={index + 1} />
              ))}
            </div>
          </>
        ) : null}
      </StatePanel>
    </div>
  );
}
