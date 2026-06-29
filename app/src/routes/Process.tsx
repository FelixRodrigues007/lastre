import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { StatePanel } from "../components/layout/StatePanel";
import { BatchStepper } from "../components/process/BatchStepper";
import { ProcessPipelineStrip, ProcessStickySummary } from "../components/process/ProcessPipeline";
import { OutcomeBreakdown } from "../components/ui/OutcomeBreakdown";
import { SectionHead } from "../components/ui/SectionHead";
import { useNavCounts } from "../context/NavCountsContext";
import { getProcessDefaults, processBatch } from "../lib/api";
import type { AuditRecord, BatchSummary, DeciderMode } from "../lib/types";
import { useAsyncData } from "../hooks/useAsyncData";
import "./process.css";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summaryFromRecords(records: AuditRecord[]): BatchSummary {
  return records.reduce(
    (acc, record) => {
      if (record.outcome === "tokenizable") acc.tokenizable += 1;
      if (record.outcome === "rejected") acc.rejected += 1;
      if (record.outcome === "skipped") acc.skipped += 1;
      if (record.outcome === "escalated") acc.escalated += 1;
      if (record.onChain?.verdict === "Valid") acc.onChainAccepted += 1;
      if (record.onChain?.verdict === "Invalid") acc.onChainRejected += 1;
      return acc;
    },
    {
      tokenizable: 0,
      rejected: 0,
      skipped: 0,
      escalated: 0,
      onChainAccepted: 0,
      onChainRejected: 0,
    },
  );
}

export function Process() {
  const defaults = useAsyncData(getProcessDefaults);
  const { reload: reloadNavCounts } = useNavCounts();
  const [selected, setSelected] = useState<string[]>([]);
  const [decider, setDecider] = useState<DeciderMode>("rule");
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [displayed, setDisplayed] = useState<AuditRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const assetIds = defaults.data?.assetIds ?? [];

  useEffect(() => {
    if (defaults.data) {
      setSelected(defaults.data.assetIds);
      setDecider(defaults.data.decider);
    }
  }, [defaults.data]);

  const lotMeta = useMemo(
    () =>
      new Map([
        [assetIds[0] ?? "", "Genuine · expected Valid"],
        [assetIds[1] ?? "", "Tampered · expected Invalid"],
        [assetIds[2] ?? "", "Duplicate · expected skip"],
        [assetIds[3] ?? "", "Out of region · expected escalate"],
      ]),
    [assetIds],
  );

  const progress =
    running && currentIndex !== null && selected.length > 0
      ? Math.min(100, Math.round((currentIndex / selected.length) * 100))
      : displayed.length > 0 && !running
        ? 100
        : 0;

  const pipelineStep =
    running && currentIndex !== null
      ? Math.min(4, Math.floor((currentIndex / Math.max(selected.length, 1)) * 4))
      : displayed.length > 0 && !running
        ? 4
        : 0;

  const batchSummary = useMemo(() => summaryFromRecords(displayed), [displayed]);

  function toggleAsset(assetId: string) {
    setSelected((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId],
    );
  }

  async function runBatch() {
    if (!selected.length || running) return;

    setRunning(true);
    setRunError(null);
    setDisplayed([]);
    setCurrentIndex(0);

    try {
      const result = await processBatch(selected, decider);

      for (let i = 0; i < result.records.length; i += 1) {
        setCurrentIndex(i);
        setDisplayed((prev) => [...prev, result.records[i]]);
        await sleep(450);
      }

      setCurrentIndex(result.records.length);
      reloadNavCounts();
    } catch (err) {
      setRunError(err instanceof Error ? err.message : "Batch failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        kicker="Process"
        title="Run demo batch"
        lead="Triage, mock payment, seal verification, and on-chain verdict — one lot at a time."
      />

      <ProcessPipelineStrip activeStep={pipelineStep} />

      <StatePanel loading={defaults.loading} error={defaults.error} skeleton="split" onRetry={defaults.reload}>
        <div className="process-layout">
          <aside className="panel process-picker">
            <header className="process-picker__head">
              <div>
                <p className="mono-label">Configuration</p>
                <p className="process-picker__count">
                  {selected.length} of {assetIds.length} selected
                </p>
              </div>
            </header>

            <fieldset className="process-picker__decider">
              <legend className="mono-label">Decider</legend>
              <div className="process-picker__decider-row">
                <label className="process-picker__radio">
                  <input
                    type="radio"
                    name="decider"
                    value="rule"
                    checked={decider === "rule"}
                    disabled={running}
                    onChange={() => setDecider("rule")}
                  />
                  Rule
                </label>
                <label className="process-picker__radio">
                  <input
                    type="radio"
                    name="decider"
                    value="llm"
                    checked={decider === "llm"}
                    disabled={running}
                    onChange={() => setDecider("llm")}
                  />
                  LLM
                </label>
              </div>
            </fieldset>

            <SectionHead label="Lots in batch" />

            <ul className="process-picker__list">
              {assetIds.map((assetId, index) => (
                <li key={`${assetId}-${index}`}>
                  <label className="process-picker__item">
                    <input
                      type="checkbox"
                      checked={selected.includes(assetId)}
                      disabled={running}
                      onChange={() => toggleAsset(assetId)}
                    />
                    <span>
                      <span className="process-picker__id">{assetId}</span>
                      <span className="process-picker__meta">{lotMeta.get(assetId)}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            {running || displayed.length > 0 ? (
              <div className="process-progress">
                <div className="process-progress__head">
                  <span className="mono-label">Progress</span>
                  <span className="process-progress__pct">{progress}%</span>
                </div>
                <div className="process-progress__track" role="progressbar" aria-valuenow={progress}>
                  <span className="process-progress__fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            ) : null}

            <button
              type="button"
              className="route-cta process-picker__run"
              disabled={running || selected.length === 0}
              onClick={runBatch}
            >
              {running ? "Processing…" : "Run batch"}
            </button>

            {runError ? <p className="process-picker__error">{runError}</p> : null}

            <p className="process-picker__note">
              LLM mode uses OpenRouter when <code>OPENROUTER_API_KEY</code> is set; otherwise rule
              fallback applies.
            </p>
          </aside>

          <section className="process-results">
            <header className="process-results__head">
              <SectionHead
                label="Live pipeline"
                aside={displayed.length > 0 ? `${displayed.length} processed` : undefined}
              />
              {displayed.length > 0 ? (
                <Link className="process-results__link" to="/audit">
                  Open audit log
                </Link>
              ) : null}
            </header>

            <BatchStepper records={displayed} currentIndex={currentIndex} running={running} />
          </section>
        </div>
      </StatePanel>

      {displayed.length > 0 && !running ? (
        <>
          <ProcessStickySummary summary={batchSummary} total={displayed.length} />
          <OutcomeBreakdown
            title="Batch result"
            tokenizable={batchSummary.tokenizable}
            rejected={batchSummary.rejected}
            skipped={batchSummary.skipped}
            escalated={batchSummary.escalated}
          />
        </>
      ) : null}
    </div>
  );
}
