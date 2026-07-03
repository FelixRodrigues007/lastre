import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { AuditRecord } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import { OutcomeBadge, VerdictBadge } from "../proof/Badges";
import { Icon } from "../ui/Icon";
import "./overview-activity-panel.css";

type ActivityTab = "all" | "valid" | "invalid" | "escalated";

type OverviewActivityPanelProps = {
  records: AuditRecord[];
};

function recordVerdict(record: AuditRecord) {
  return record.verification?.verdict ?? record.onChain?.verdict ?? null;
}

function matchesTab(record: AuditRecord, tab: ActivityTab) {
  if (tab === "all") return true;
  if (tab === "escalated") return record.outcome === "escalated";
  const verdict = recordVerdict(record);
  if (tab === "valid") return verdict === "Valid";
  if (tab === "invalid") return verdict === "Invalid";
  return true;
}

export function OverviewActivityPanel({ records }: OverviewActivityPanelProps) {
  const { t } = useLocaleContext();
  const [active, setActive] = useState<ActivityTab>("all");

  const tabs: { id: ActivityTab; label: string }[] = [
    { id: "all", label: t("overview.activity.tabAll") },
    { id: "valid", label: t("common.valid") },
    { id: "invalid", label: t("common.invalid") },
    { id: "escalated", label: t("outcome.escalated") },
  ];

  const filtered = useMemo(
    () => records.filter((record) => matchesTab(record, active)),
    [active, records],
  );

  return (
    <div className="overview-activity-panel">
      <div className="overview-activity-panel__tabs" role="tablist" aria-label={t("overview.recentActivity")}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`overview-activity-panel__tab${active === tab.id ? " overview-activity-panel__tab--active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overview-activity-panel__scroll">
        <div className="overview-activity-panel__list" role="tabpanel">
          {filtered.length > 0 ? (
            <ul className="overview-activity-panel__items">
              {filtered.map((record, index) => (
                <li key={`${record.assetId}-${index}`}>
                  <Link
                    className="overview-activity-panel__row"
                    to={`/audit/${encodeURIComponent(record.assetId)}`}
                  >
                    <div className="overview-activity-panel__copy">
                      <span className="overview-activity-panel__title">{record.assetId}</span>
                      <span className="overview-activity-panel__meta">
                        {record.decision.action}
                        {record.onChain ? ` · ${t("overview.activity.onChain")}` : ""}
                      </span>
                    </div>
                    <div className="overview-activity-panel__badges">
                      <VerdictBadge verdict={recordVerdict(record)} size="sm" />
                      <OutcomeBadge outcome={record.outcome} size="sm" />
                    </div>
                    <Icon name="chevron-right" size={16} className="overview-activity-panel__chevron" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="overview-activity-panel__empty">
              {records.length === 0 ? t("overview.noActivity") : t("overview.activity.emptyTab")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
