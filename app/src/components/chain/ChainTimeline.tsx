import { useMemo } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  countByVerdict,
  matchesVerdictFilter,
  type ChainTimelineEntry,
  type VerdictFilter,
} from "../../lib/chainTimeline";
import { FilterPills } from "../ui/FilterPills";
import { ChainTimelineItem } from "./ChainTimelineItem";
import "./chain-timeline.css";

type ChainTimelineProps = {
  sessionEntries: ChainTimelineEntry[];
  historyEntries: ChainTimelineEntry[];
  filter: VerdictFilter;
  onFilterChange: (filter: VerdictFilter) => void;
};

function TimelineGroup({
  label,
  hint,
  entries,
  emptyHint,
}: {
  label: string;
  hint?: string;
  entries: ChainTimelineEntry[];
  emptyHint?: string;
}) {
  return (
    <section className="chain-timeline-group" aria-label={label}>
      <header className="chain-timeline-group__head">
        <h3 className="chain-timeline-group__title">{label}</h3>
        {hint ? <p className="chain-timeline-group__hint">{hint}</p> : null}
      </header>

      {entries.length > 0 ? (
        <ul className="chain-list">
          {entries.map((entry) => (
            <ChainTimelineItem key={entry.key} entry={entry} />
          ))}
        </ul>
      ) : emptyHint ? (
        <p className="chain-timeline-group__empty">{emptyHint}</p>
      ) : null}
    </section>
  );
}

export function ChainTimeline({
  sessionEntries,
  historyEntries,
  filter,
  onFilterChange,
}: ChainTimelineProps) {
  const { t } = useLocaleContext();

  const allEntries = useMemo(
    () => [...sessionEntries, ...historyEntries],
    [sessionEntries, historyEntries],
  );
  const counts = useMemo(() => countByVerdict(allEntries), [allEntries]);

  const filteredSession = useMemo(
    () => sessionEntries.filter((entry) => matchesVerdictFilter(entry, filter)),
    [sessionEntries, filter],
  );
  const filteredHistory = useMemo(
    () => historyEntries.filter((entry) => matchesVerdictFilter(entry, filter)),
    [historyEntries, filter],
  );

  const filterOptions = [
    { value: "all" as const, label: t("chain.filter.all"), count: counts.all },
    { value: "valid" as const, label: t("common.valid"), count: counts.valid },
    { value: "invalid" as const, label: t("common.invalid"), count: counts.invalid },
  ];

  return (
    <div className="chain-timeline-panel">
      <div className="chain-timeline-panel__toolbar">
        <FilterPills
          options={filterOptions}
          value={filter}
          onChange={onFilterChange}
          ariaLabel={t("chain.filter.aria")}
        />
      </div>

      <TimelineGroup
        label={t("chain.group.session")}
        hint={t("chain.group.sessionHint")}
        entries={filteredSession}
        emptyHint={t("chain.group.sessionEmpty")}
      />

      <div className="chain-timeline-divider" role="separator" aria-hidden="true">
        <span className="chain-timeline-divider__line" />
      </div>

      <TimelineGroup
        label={t("chain.group.history")}
        hint={t("chain.group.historyHint")}
        entries={filteredHistory}
        emptyHint={filter !== "all" ? t("chain.group.noMatch") : undefined}
      />
    </div>
  );
}
