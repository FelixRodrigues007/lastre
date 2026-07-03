import type { DeciderMode } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import "./process-batch-toolbar.css";
import "../ui/data-toolbar.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

type ProcessBatchToolbarLayout = "bar" | "sidebar";

type ProcessBatchToolbarProps = {
  layout?: ProcessBatchToolbarLayout;
  decider: DeciderMode;
  phase: BatchPhase;
  progress: number;
  fetchingBatch: boolean;
  runError: string | null;
  selectedCount: number;
  disabled: boolean;
  onDeciderChange: (mode: DeciderMode) => void;
  onRun: () => void;
  onRetry: () => void;
  onRepeat: () => void;
};

export function ProcessBatchToolbar({
  layout = "bar",
  decider,
  phase,
  progress,
  fetchingBatch,
  runError,
  selectedCount,
  disabled,
  onDeciderChange,
  onRun,
  onRetry,
  onRepeat,
}: ProcessBatchToolbarProps) {
  const { t } = useLocaleContext();
  const running = phase === "running";
  const isSidebar = layout === "sidebar";

  return (
    <section
      className={`process-toolbar${isSidebar ? " process-toolbar--sidebar" : " panel"}`}
      aria-label={t("process.toolbar.aria")}
    >
      <div className="process-toolbar__decider">
        <p className="process-toolbar__step mono-label">{t("process.step2")}</p>
        <p className="process-toolbar__label">{t("process.decider.label")}</p>
        <div className="process-decider-toggle view-toggle" role="radiogroup" aria-label={t("process.decider.label")}>
          <button
            type="button"
            role="radio"
            aria-checked={decider === "rule"}
            className={`view-toggle__btn${decider === "rule" ? " view-toggle__btn--active" : ""}`}
            disabled={disabled || running}
            onClick={() => onDeciderChange("rule")}
          >
            {t("process.decider.ruleLabel")}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={decider === "llm"}
            className={`view-toggle__btn${decider === "llm" ? " view-toggle__btn--active" : ""}`}
            disabled={disabled || running}
            onClick={() => onDeciderChange("llm")}
          >
            {t("process.decider.llmLabel")}
          </button>
        </div>
      </div>

      <div className="process-toolbar__actions">
        {phase === "error" ? (
          <div className="process-toolbar__error" role="alert">
            <p className="process-toolbar__error-msg">{runError}</p>
            <button type="button" className="route-cta route-cta--ghost" onClick={onRetry}>
              {t("process.retry")}
            </button>
          </div>
        ) : null}

        {running ? (
          <div
            className={`process-toolbar__progress${fetchingBatch ? " process-toolbar__progress--indeterminate" : ""}`}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="process-toolbar__progress-track">
              <span className="process-toolbar__progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="process-toolbar__progress-label">
              {fetchingBatch ? t("process.pipeline.fetching") : `${t("process.running")} · ${progress}%`}
            </p>
          </div>
        ) : null}

        {phase === "completed" ? (
          <button type="button" className="route-cta route-cta--ghost process-toolbar__repeat" onClick={onRepeat}>
            {t("process.repeat")}
          </button>
        ) : null}

        <button
          type="button"
          className="route-cta process-toolbar__run"
          disabled={running || selectedCount === 0}
          onClick={onRun}
        >
          {running
            ? t("process.running")
            : phase === "completed"
              ? t("process.runAgain")
              : t("process.runWithCount", { count: String(selectedCount) })}
        </button>
      </div>
    </section>
  );
}
