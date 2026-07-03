import { useLocaleContext } from "../../context/LocaleContext";
import {
  ESCALATION_KIND_LABEL_KEYS,
  type EscalationKind,
  getEscalationKind,
} from "../../lib/escalations";
import type { AuditRecord } from "../../lib/types";
import "./escalation-filters.css";

export type EscalationKindFilter = "all" | EscalationKind;
export type EscalationDeciderFilter = "all" | "rule" | "llm";

const KIND_OPTIONS: EscalationKind[] = ["geo", "mass", "missing", "review"];

type EscalationFiltersProps = {
  records: AuditRecord[];
  kind: EscalationKindFilter;
  decider: EscalationDeciderFilter;
  onKindChange: (value: EscalationKindFilter) => void;
  onDeciderChange: (value: EscalationDeciderFilter) => void;
  variant?: "toolbar" | "sidebar";
};

export function filterEscalationRecords(
  records: AuditRecord[],
  kind: EscalationKindFilter,
  decider: EscalationDeciderFilter,
): AuditRecord[] {
  return records.filter((record) => {
    if (kind !== "all" && getEscalationKind(record.decision.reasoning) !== kind) return false;
    if (decider !== "all" && record.decision.decidedBy !== decider) return false;
    return true;
  });
}

export function EscalationFilters({
  records,
  kind,
  decider,
  onKindChange,
  onDeciderChange,
  variant = "toolbar",
}: EscalationFiltersProps) {
  const { t } = useLocaleContext();

  const kindCounts = KIND_OPTIONS.reduce(
    (acc, option) => {
      acc[option] = records.filter((r) => getEscalationKind(r.decision.reasoning) === option).length;
      return acc;
    },
    {} as Record<EscalationKind, number>,
  );

  return (
    <div
      className={`escalation-filters${variant === "sidebar" ? " escalation-filters--sidebar" : ""}`}
      role="group"
      aria-label={t("escalations.filters.label")}
    >
      <div className="escalation-filters__chips" role="toolbar" aria-label={t("escalations.filters.kind")}>
        <button
          type="button"
          className={`escalation-filters__chip${kind === "all" ? " escalation-filters__chip--active" : ""}`}
          aria-pressed={kind === "all"}
          onClick={() => onKindChange("all")}
        >
          {t("escalations.filters.all")}
          <span className="escalation-filters__count">{records.length}</span>
        </button>
        {KIND_OPTIONS.map((option) => {
          const count = kindCounts[option];
          if (count === 0) return null;
          return (
            <button
              key={option}
              type="button"
              className={`escalation-filters__chip escalation-filters__chip--${option}${kind === option ? " escalation-filters__chip--active" : ""}`}
              aria-pressed={kind === option}
              onClick={() => onKindChange(option)}
            >
              {t(ESCALATION_KIND_LABEL_KEYS[option])}
              <span className="escalation-filters__count">{count}</span>
            </button>
          );
        })}
      </div>

      <label className="escalation-filters__field">
        <span className="escalation-filters__field-label">{t("escalations.filters.decider")}</span>
        <select
          className="escalation-filters__select"
          value={decider}
          onChange={(event) => onDeciderChange(event.target.value as EscalationDeciderFilter)}
          aria-label={t("escalations.filters.decider")}
        >
          <option value="all">{t("escalations.filters.deciderAll")}</option>
          <option value="rule">
            {t("audit.evidence.owner.rule")} (
            {records.filter((r) => r.decision.decidedBy === "rule").length})
          </option>
          <option value="llm">
            {t("audit.evidence.owner.llm")} ({records.filter((r) => r.decision.decidedBy === "llm").length})
          </option>
        </select>
      </label>
    </div>
  );
}
