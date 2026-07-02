import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { AuditRecordCard } from "../components/proof/AuditRecordCard";
import { ActionBadge, OutcomeBadge, VerdictBadge } from "../components/proof/Badges";
import { BtnIcon } from "../components/ui/BtnIcon";
import { DataToolbar } from "../components/ui/DataToolbar";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterPills } from "../components/ui/FilterPills";
import { OutcomeBreakdown } from "../components/ui/OutcomeBreakdown";
import { BarChart } from "../components/ui/BarChart";
import { SearchInput } from "../components/ui/SearchInput";
import { SectionHead } from "../components/ui/SectionHead";
import { downloadAuditExport, getAudit, getAuditSummary } from "../lib/api";
import type { AuditOutcomeFilter } from "../lib/filters";
import { matchesAuditFilter, matchesSearch } from "../lib/filters";
import { useAsyncData } from "../hooks/useAsyncData";
import "./audit.css";

export function Audit() {
  const audit = useAsyncData(getAudit);
  const summary = useAsyncData(getAuditSummary);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AuditOutcomeFilter>("all");
  const [search, setSearch] = useState("");

  const loading = audit.loading || summary.loading;
  const error = audit.error ?? summary.error;

  const filtered = useMemo(() => {
    const records = audit.data?.records ?? [];
    return records.filter(
      (record) =>
        matchesAuditFilter(record.outcome, filter) &&
        matchesSearch(
          `${record.assetId} ${record.decision.decidedBy} ${record.decision.action}`,
          search,
        ),
    );
  }, [audit.data, filter, search]);

  const filterCounts = useMemo(() => {
    const records = audit.data?.records ?? [];
    return {
      all: records.length,
      tokenizable: records.filter((r) => r.outcome === "tokenizable").length,
      rejected: records.filter((r) => r.outcome === "rejected").length,
      skipped: records.filter((r) => r.outcome === "skipped").length,
      escalated: records.filter((r) => r.outcome === "escalated").length,
    };
  }, [audit.data]);

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

      {summary.data && summary.data.tokenizable > 0 ? (
        <section className="audit-next panel" aria-label="Next step after valid proof">
          <p className="audit-next__text">
            <strong>{summary.data.tokenizable} tokenizable</strong> — proof recorded. Symbolic demo
            layers unlock only after valid attestation.
          </p>
          <Link className="route-cta" to="/marketplace">
            <BtnIcon icon="globe">Open Marketplace (demo)</BtnIcon>
          </Link>
        </section>
      ) : null}

      <StatePanel
        loading={loading}
        error={error}
        skeleton="table"
        onRetry={() => {
          audit.reload();
          summary.reload();
        }}
      >
        {audit.data?.records.length === 0 ? (
          <EmptyState
            icon="audit"
            title="No logs yet"
            hint="Capture a document or run a batch from Process to populate the audit log."
            action={
              <div className="audit-empty__actions">
                <Link className="route-cta" to="/capture">
                  Start with Capture
                </Link>
                <Link className="route-cta route-cta--ghost" to="/process">
                  Go to Process
                </Link>
              </div>
            }
          />
        ) : summary.data && audit.data ? (
          <>
            <div className="audit-dashboard">
              <OutcomeBreakdown
                title="Outcome distribution"
                tokenizable={summary.data.tokenizable}
                rejected={summary.data.rejected}
                skipped={summary.data.skipped}
                escalated={summary.data.escalated}
              />
              <BarChart
                title="Verdict vs action"
                subtitle="Seal verdicts and agent actions in this session"
                layout="vertical"
                items={[
                  {
                    label: "Valid",
                    value: audit.data.records.filter(
                      (r) => (r.verification?.verdict ?? r.onChain?.verdict) === "Valid",
                    ).length,
                    tone: "valid",
                  },
                  {
                    label: "Invalid",
                    value: audit.data.records.filter(
                      (r) => (r.verification?.verdict ?? r.onChain?.verdict) === "Invalid",
                    ).length,
                    tone: "invalid",
                  },
                  {
                    label: "Pay",
                    value: audit.data.records.filter((r) => r.decision.action === "pay").length,
                    tone: "seal",
                  },
                  {
                    label: "Skip",
                    value: audit.data.records.filter((r) => r.decision.action === "skip").length,
                    tone: "muted",
                  },
                  {
                    label: "Escalate",
                    value: audit.data.records.filter((r) => r.decision.action === "escalate").length,
                    tone: "accent",
                  },
                ]}
              />
            </div>

            <DataToolbar
              search={
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search asset or decider…"
                  ariaLabel="Search audit records"
                />
              }
              filters={
                <FilterPills
                  ariaLabel="Filter by outcome"
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: "all", label: "All", count: filterCounts.all },
                    { value: "tokenizable", label: "Tokenizable", count: filterCounts.tokenizable },
                    { value: "rejected", label: "Rejected", count: filterCounts.rejected },
                    { value: "skipped", label: "Skipped", count: filterCounts.skipped },
                    { value: "escalated", label: "Escalated", count: filterCounts.escalated },
                  ]}
                />
              }
            />

            <SectionHead label="Record log" aside={`${filtered.length} shown`} />

            {filtered.length === 0 ? (
              <p className="audit-no-match">No records match the current filter.</p>
            ) : (
              <>
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
                      {filtered.map((record, index) => (
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
                              verdict={
                                record.verification?.verdict ?? record.onChain?.verdict ?? null
                              }
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
                  {filtered.map((record, index) => (
                    <AuditRecordCard
                      key={`${record.assetId}-${index}`}
                      record={record}
                      index={index + 1}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : null}
      </StatePanel>
    </div>
  );
}
