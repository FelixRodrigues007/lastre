import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptureWizardTrigger } from "../components/capture/CaptureWizardTrigger";
import { AuditOnChainCell } from "../components/audit/AuditOnChainCell";
import { EvidenceKPIs } from "../components/audit/EvidenceKPIs";
import { EvidenceStatusBadge } from "../components/audit/EvidenceStatusBadge";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { AuditRecordCard } from "../components/proof/AuditRecordCard";
import { BtnIcon } from "../components/ui/BtnIcon";
import { DataToolbar } from "../components/ui/DataToolbar";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterPills } from "../components/ui/FilterPills";
import { SearchInput } from "../components/ui/SearchInput";
import { useLocaleContext } from "../context/LocaleContext";
import {
  countByEvidenceStatus,
  evidenceSubtitle,
  getEvidenceStatus,
  matchesEvidenceStatusFilter,
  type EvidenceStatusFilter,
} from "../lib/auditEvidence";
import { downloadAuditExport, getAudit } from "../lib/api";
import { matchesSearch } from "../lib/filters";
import { useAsyncData } from "../hooks/useAsyncData";
import "./audit.css";

export function Audit() {
  const { t } = useLocaleContext();
  const navigate = useNavigate();
  const audit = useAsyncData(getAudit);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EvidenceStatusFilter>("all");
  const [search, setSearch] = useState("");

  const loading = audit.loading;
  const error = audit.error;
  const records = audit.data?.records ?? [];

  const statusCounts = useMemo(() => countByEvidenceStatus(records), [records]);

  const filtered = useMemo(() => {
    return records.filter(
      (record) =>
        matchesEvidenceStatusFilter(record, statusFilter) &&
        matchesSearch(
          `${record.assetId} ${record.decision.decidedBy} ${record.decision.action} ${evidenceSubtitle(record)}`,
          search,
        ),
    );
  }, [records, statusFilter, search]);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadAuditExport();
    } catch {
      setExportError(t("audit.evidence.exportError"));
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="page audit-page">
      <PageHeader
        kicker={t("nav.audit")}
        title={t("audit.evidence.title")}
        actions={
          <>
            {records.length > 0 ? (
              <button
                type="button"
                className="route-cta route-cta--ghost"
                disabled={exporting}
                onClick={handleExport}
              >
                <BtnIcon icon="download">
                  {exporting ? t("audit.evidence.exporting") : t("audit.evidence.export")}
                </BtnIcon>
              </button>
            ) : null}
            <Link className="route-cta" to="/process">
              <BtnIcon icon="process">{t("common.runDemoBatch")}</BtnIcon>
            </Link>
          </>
        }
      />

      {exportError ? <p className="audit-export-error">{exportError}</p> : null}

      <StatePanel
        loading={loading}
        error={error}
        skeleton="table"
        onRetry={audit.reload}
      >
        {records.length === 0 ? (
          <EmptyState
            icon="audit"
            title={t("audit.evidence.emptyTitle")}
            hint={t("audit.evidence.emptyHint")}
            action={
              <div className="audit-empty__actions">
                <CaptureWizardTrigger className="route-cta">
                  {t("audit.evidence.emptyCapture")}
                </CaptureWizardTrigger>
                <Link className="route-cta route-cta--ghost" to="/process">
                  {t("audit.evidence.emptyProcess")}
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <EvidenceKPIs
              notReady={statusCounts.not_ready}
              flagged={statusCounts.flagged}
              ready={statusCounts.ready}
              accepted={statusCounts.accepted}
            />

            <DataToolbar
              search={
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder={t("audit.evidence.search")}
                  ariaLabel={t("audit.evidence.search")}
                />
              }
              filters={
                <FilterPills
                  ariaLabel={t("audit.evidence.filterStatus")}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "all", label: t("audit.evidence.filter.all"), count: statusCounts.all },
                    {
                      value: "not_ready",
                      label: t("audit.evidence.status.notReady"),
                      count: statusCounts.not_ready,
                    },
                    {
                      value: "ready",
                      label: t("audit.evidence.status.ready"),
                      count: statusCounts.ready,
                    },
                    {
                      value: "accepted",
                      label: t("audit.evidence.status.accepted"),
                      count: statusCounts.accepted,
                    },
                  ]}
                />
              }
            />

            {filtered.length === 0 ? (
              <p className="audit-no-match">{t("audit.evidence.noMatch")}</p>
            ) : (
              <>
                <div className="audit-table-wrap panel" role="region" aria-label={t("audit.evidence.title")}>
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th scope="col">{t("audit.evidence.col.evidence")}</th>
                        <th scope="col">{t("audit.evidence.col.assessment")}</th>
                        <th scope="col">{t("audit.evidence.col.onChain")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((record, index) => {
                        const lotPath = `/lots/${encodeURIComponent(record.assetId)}`;

                        return (
                          <tr
                            key={`${record.assetId}-${index}`}
                            className="audit-table__row"
                            tabIndex={0}
                            role="link"
                            aria-label={`${record.assetId} — ${evidenceSubtitle(record)}`}
                            onClick={() => navigate(lotPath)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate(lotPath);
                              }
                            }}
                          >
                            <td className="audit-table__evidence">
                              <span className="audit-table__evidence-id">{record.assetId}</span>
                              <p className="audit-table__evidence-sub">{evidenceSubtitle(record)}</p>
                            </td>
                            <td>
                              <EvidenceStatusBadge status={getEvidenceStatus(record)} />
                            </td>
                            <td>
                              <AuditOnChainCell record={record} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="audit-cards">
                  {filtered.map((record, index) => (
                    <Link
                      key={`${record.assetId}-${index}`}
                      className="audit-cards__link"
                      to={`/lots/${encodeURIComponent(record.assetId)}`}
                    >
                      <AuditRecordCard
                        record={record}
                        index={index + 1}
                        compact
                        disableTitleLink
                      />
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </StatePanel>
    </div>
  );
}
