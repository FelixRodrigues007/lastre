import { Link, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EscalationDetailEmpty,
  EscalationDetailPanel,
} from "../components/escalations/EscalationDetailPanel";
import {
  EscalationFilters,
  filterEscalationRecords,
  type EscalationDeciderFilter,
  type EscalationKindFilter,
} from "../components/escalations/EscalationFilters";
import { EscalationTable } from "../components/escalations/EscalationTable";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { EmptyState } from "../components/ui/EmptyState";
import { SectionHead } from "../components/ui/SectionHead";
import { useLocaleContext } from "../context/LocaleContext";
import { useNavCounts } from "../context/NavCountsContext";
import { getEscalations, getLots, getSettings } from "../lib/api";
import type { EscalationActionResult } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "./escalations.css";

export function Escalations() {
  const { t } = useLocaleContext();
  const { reload: reloadNavCounts } = useNavCounts();
  const [searchParams, setSearchParams] = useSearchParams();
  const escalations = useAsyncData(getEscalations);
  const lots = useAsyncData(getLots);
  const settings = useAsyncData(getSettings);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());
  const [kindFilter, setKindFilter] = useState<EscalationKindFilter>("all");
  const [deciderFilter, setDeciderFilter] = useState<EscalationDeciderFilter>("all");

  const selectedCaseId = searchParams.get("case");

  const selectCase = useCallback(
    (assetId: string | null) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          if (assetId) next.set("case", assetId);
          else next.delete("case");
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const artifactById = useMemo(() => {
    const map = new Map<string, import("../lib/types").ProvenanceArtifact>();
    lots.data?.lots.forEach((lot) => map.set(lot.artifact.assetId, lot.artifact));
    return map;
  }, [lots.data]);

  const loading = escalations.loading || lots.loading || settings.loading;
  const error = escalations.error ?? lots.error ?? settings.error;
  const allRecords = (escalations.data?.records ?? []).filter((r) => !resolvedIds.has(r.assetId));
  const records = useMemo(
    () => filterEscalationRecords(allRecords, kindFilter, deciderFilter),
    [allRecords, kindFilter, deciderFilter],
  );
  const count = allRecords.length;
  const visibleCount = records.length;

  const effectiveCaseId = useMemo(() => {
    if (selectedCaseId && records.some((r) => r.assetId === selectedCaseId)) {
      return selectedCaseId;
    }
    return records[0]?.assetId ?? null;
  }, [records, selectedCaseId]);

  useEffect(() => {
    if (effectiveCaseId && effectiveCaseId !== selectedCaseId) {
      selectCase(effectiveCaseId);
    }
  }, [effectiveCaseId, selectedCaseId, selectCase]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (records.length === 0) return;
      if (!["ArrowDown", "ArrowUp", "j", "k"].includes(event.key)) return;

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      const currentIndex = records.findIndex((record) => record.assetId === effectiveCaseId);
      const nextIndex =
        event.key === "ArrowDown" || event.key === "j"
          ? Math.min(currentIndex + 1, records.length - 1)
          : Math.max(currentIndex - 1, 0);
      const nextRecord = records[nextIndex];
      if (nextRecord && nextRecord.assetId !== effectiveCaseId) {
        selectCase(nextRecord.assetId);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [records, effectiveCaseId, selectCase]);

  const selectedRecord = useMemo(
    () => records.find((r) => r.assetId === effectiveCaseId) ?? null,
    [records, effectiveCaseId],
  );

  const queueIndexById = useMemo(() => {
    const map = new Map<string, number>();
    allRecords.forEach((record, index) => map.set(record.assetId, index + 1));
    return map;
  }, [allRecords]);

  const selectedIndex = selectedRecord ? (queueIndexById.get(selectedRecord.assetId) ?? 0) : 0;

  function handleResolved(result: EscalationActionResult) {
    if (!result.requeuedEscalated) {
      setResolvedIds((prev) => new Set(prev).add(result.assetId));
      if (effectiveCaseId === result.assetId) {
        const remaining = records.filter((r) => r.assetId !== result.assetId);
        selectCase(remaining[0]?.assetId ?? null);
      }
    }
    escalations.reload();
    reloadNavCounts();
  }

  function handleRetry() {
    escalations.reload();
    lots.reload();
    settings.reload();
    reloadNavCounts();
  }

  return (
    <div className="page escalations-page">
      <PageHeader
        kicker={t("nav.escalations")}
        title={t("escalations.title")}
        lead={t("escalations.lead")}
      />

      <StatePanel loading={loading} error={error} skeleton="split" onRetry={handleRetry}>
        {count === 0 ? (
          <EmptyState
            icon="escalations"
            title={t("escalations.empty.title")}
            hint={t("escalations.empty.hint")}
            action={
              <Link className="route-cta" to="/process">
                {t("escalations.empty.cta")}
              </Link>
            }
          />
        ) : escalations.data ? (
          <div className="escalations-split">
            <div className="escalations-split__list">
              <EscalationFilters
                variant="sidebar"
                records={allRecords}
                kind={kindFilter}
                decider={deciderFilter}
                onKindChange={setKindFilter}
                onDeciderChange={setDeciderFilter}
              />

              <SectionHead
                label={t("escalations.queueLabel")}
                aside={
                  visibleCount === count
                    ? `${count}`
                    : t("escalations.filters.shown", { visible: visibleCount, total: count })
                }
              />

              {visibleCount === 0 ? (
                <EmptyState
                  icon="escalations"
                  title={t("escalations.filters.emptyTitle")}
                  hint={t("escalations.filters.emptyHint")}
                />
              ) : (
                <EscalationTable
                  compact
                  records={records}
                  artifactById={artifactById}
                  queueIndexById={queueIndexById}
                  selectedAssetId={effectiveCaseId}
                  onSelect={selectCase}
                />
              )}
            </div>

            <div className="escalations-split__detail">
              {selectedRecord ? (
                <EscalationDetailPanel
                  record={selectedRecord}
                  index={selectedIndex}
                  artifact={artifactById.get(selectedRecord.assetId)}
                  settings={settings.data}
                  onResolved={handleResolved}
                />
              ) : (
                <EscalationDetailEmpty />
              )}
            </div>
          </div>
        ) : null}
      </StatePanel>
    </div>
  );
}
