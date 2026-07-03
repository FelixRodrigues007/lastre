import { useCallback, useEffect, useMemo, useState } from "react";
import { StatePanel } from "../components/layout/StatePanel";
import { ProcessConfigCard } from "../components/process/ProcessConfigCard";
import { ProcessConfigShell } from "../components/process/ProcessConfigShell";
import { ProcessSealArena } from "../components/process/ProcessSealArena";
import { useLocaleContext } from "../context/LocaleContext";
import { useNavCounts } from "../context/NavCountsContext";
import { useOnboarding } from "../context/OnboardingContext";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useAsyncData } from "../hooks/useAsyncData";
import { getLots, getProcessDefaults, getSettings, processBatch, updateSettings } from "../lib/api";
import { partitionProcessLots } from "../lib/processLots";
import type { AuditRecord, BatchSummary, DeciderMode } from "../lib/types";
import "./process.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function Process() {
  const { t } = useLocaleContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const defaults = useAsyncData(getProcessDefaults);
  const lots = useAsyncData(getLots);
  const settings = useAsyncData(getSettings);
  const { reload: reloadNavCounts } = useNavCounts();
  const { completeStep } = useOnboarding();

  const [selected, setSelected] = useState<string[]>([]);
  const [decider, setDecider] = useState<DeciderMode>("rule");
  const [phase, setPhase] = useState<BatchPhase>("idle");
  const [fetchingBatch, setFetchingBatch] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [sealRevealedThrough, setSealRevealedThrough] = useState(-1);
  const [streamingRecord, setStreamingRecord] = useState<AuditRecord | null>(null);

  const loading = defaults.loading || lots.loading;
  const error = defaults.error ?? lots.error;
  const selectionLocked = phase === "running";

  const defaultAssetIds = defaults.data?.assetIds ?? [];

  const { demoLots, capturedLots } = useMemo(() => {
    const items = lots.data?.lots ?? [];
    return partitionProcessLots(items, defaultAssetIds);
  }, [lots.data, defaultAssetIds]);

  const selectedLots = useMemo(() => {
    const byId = new Map(
      [...demoLots, ...capturedLots].map((lot) => [lot.artifact.assetId, lot]),
    );
    return selected.map((id) => byId.get(id)).filter((lot): lot is NonNullable<typeof lot> => Boolean(lot));
  }, [selected, demoLots, capturedLots]);

  useEffect(() => {
    if (defaults.data) {
      setSelected(defaults.data.assetIds);
    }
  }, [defaults.data]);

  useEffect(() => {
    const next = settings.data?.decider ?? defaults.data?.decider;
    if (next) setDecider(next);
  }, [settings.data?.decider, defaults.data?.decider]);

  const progress =
    phase === "running" && selected.length > 0
      ? fetchingBatch
        ? 8
        : activeIndex !== null
          ? Math.min(100, Math.round(((activeIndex + 1) / selected.length) * 100))
          : 0
      : phase === "completed"
        ? 100
        : 0;

  const toggleAsset = useCallback((assetId: string) => {
    if (selectionLocked) return;
    setSelected((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId],
    );
  }, [selectionLocked]);

  const handleDeciderChange = useCallback(async (mode: DeciderMode) => {
    if (selectionLocked) return;
    setDecider(mode);
    try {
      await updateSettings(mode);
      settings.reload();
    } catch {
      // Best-effort sync during demo.
    }
  }, [selectionLocked, settings]);

  const resetPipeline = useCallback(() => {
    setPhase("idle");
    setFetchingBatch(false);
    setRunError(null);
    setRecords([]);
    setSummary(null);
    setActiveIndex(null);
    setSealRevealedThrough(-1);
    setStreamingRecord(null);
  }, []);

  const runBatch = useCallback(async () => {
    if (!selected.length || phase === "running") return;

    setPhase("running");
    setFetchingBatch(true);
    setRunError(null);
    setRecords([]);
    setSummary(null);
    setActiveIndex(0);
    setSealRevealedThrough(-1);
    setStreamingRecord(null);

    const cardPause = prefersReducedMotion ? 0 : 480;
    const agentPause = prefersReducedMotion ? 0 : 1800;
    const sealPause = prefersReducedMotion ? 0 : 720;

    try {
      const result = await processBatch(selected, decider);
      setFetchingBatch(false);

      for (let i = 0; i < result.records.length; i += 1) {
        setActiveIndex(i);
        setStreamingRecord(result.records[i]);
        await sleep(agentPause);
        setRecords((prev) => [...prev, result.records[i]]);
        setStreamingRecord(null);
        await sleep(sealPause);
        setSealRevealedThrough(i);
        await sleep(cardPause);
      }

      setActiveIndex(null);
      setSummary(result.summary);
      setPhase("completed");
      reloadNavCounts();
      completeStep("batch");
    } catch (err) {
      setFetchingBatch(false);
      setRunError(err instanceof Error ? err.message : t("process.error.generic"));
      setPhase("error");
      setActiveIndex(null);
      setStreamingRecord(null);
    }
  }, [selected, decider, phase, prefersReducedMotion, reloadNavCounts, completeStep, t]);

  const reloadAll = useCallback(() => {
    defaults.reload();
    lots.reload();
    settings.reload();
  }, [defaults, lots, settings]);

  return (
    <div
      className={`page process-page${
        phase === "running" ? " process-page--running" : ""
      }${phase === "completed" ? " process-page--completed" : ""}`}
    >
      <div className="process-page__ambient" aria-hidden="true">
        <div className="process-page__mesh">
          <div className="process-page__mesh-base" />
          <span className="process-page__blob process-page__blob--1" />
          <span className="process-page__blob process-page__blob--2" />
          <span className="process-page__blob process-page__blob--3" />
          <span className="process-page__blob process-page__blob--4" />
          <span className="process-page__blob process-page__blob--5" />
        </div>
        <div className="process-page__mesh-grain" />
      </div>

      <StatePanel loading={loading} error={error} skeleton="dashboard" onRetry={reloadAll}>
        <div className="process-layout process-layout--split">
          <div className="process-layout__config">
            <ProcessConfigShell running={phase === "running"}>
              <ProcessConfigCard
                demoLots={demoLots}
                capturedLots={capturedLots}
                selected={selected}
                decider={decider}
                phase={phase}
                progress={progress}
                fetchingBatch={fetchingBatch}
                runError={runError}
                disabled={selectionLocked}
                onToggle={toggleAsset}
                onDeciderChange={handleDeciderChange}
                onRun={runBatch}
                onRetry={runBatch}
              />
            </ProcessConfigShell>
          </div>

          <div className="process-layout__stage">
            <ProcessSealArena
              selectedLots={selectedLots}
              phase={phase}
              activeIndex={activeIndex}
              records={records}
              streamingRecord={streamingRecord}
              sealRevealedThrough={sealRevealedThrough}
              fetchingBatch={fetchingBatch}
              decider={decider}
              summary={summary}
              onRepeat={resetPipeline}
            />
          </div>
        </div>
      </StatePanel>
    </div>
  );
}
