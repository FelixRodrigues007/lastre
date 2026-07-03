import type { DeciderMode, LotListItem } from "../../lib/types";
import { LotPreviewThumb } from "../lots/LotPreviewThumb";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  expectedKindLabelKey,
  inferExpectedKind,
  lotShortNameKey,
} from "../../lib/processLots";
import "./process-config-card.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

type ProcessConfigCardProps = {
  demoLots: LotListItem[];
  capturedLots: LotListItem[];
  selected: string[];
  decider: DeciderMode;
  phase: BatchPhase;
  progress: number;
  fetchingBatch: boolean;
  runError: string | null;
  disabled: boolean;
  onToggle: (assetId: string) => void;
  onDeciderChange: (mode: DeciderMode) => void;
  onRun: () => void;
  onRetry: () => void;
};

function ConfigLotRow({
  lot,
  checked,
  disabled,
  onToggle,
}: {
  lot: LotListItem;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocaleContext();
  const inputId = `process-config-lot-${lot.artifact.assetId}`;
  const expected = inferExpectedKind(lot);
  const expectedKey = expectedKindLabelKey(expected);

  return (
    <li>
      <input
        id={inputId}
        type="checkbox"
        className="process-config-lot-input"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <label
        htmlFor={inputId}
        className={`process-config-lot${checked ? " process-config-lot--selected" : ""}${disabled ? " process-config-lot--disabled" : ""}`}
      >
        <LotPreviewThumb artifact={lot.artifact} size="sm" className="process-config-lot__thumb" />
        <span className="process-config-lot__content">
          <span className="process-config-lot__name">{t(lotShortNameKey(lot))}</span>
          {expectedKey ? (
            <span className="process-config-lot__sub">{t(expectedKey)}</span>
          ) : null}
        </span>
        <span className="process-config-lot__switch" aria-hidden="true">
          <span className="process-config-lot__switch-track">
            <span className="process-config-lot__switch-thumb" />
          </span>
        </span>
      </label>
    </li>
  );
}

export function ProcessConfigCard({
  demoLots,
  capturedLots,
  selected,
  decider,
  phase,
  progress,
  fetchingBatch,
  runError,
  disabled,
  onToggle,
  onDeciderChange,
  onRun,
  onRetry,
}: ProcessConfigCardProps) {
  const { t } = useLocaleContext();
  const running = phase === "running";
  const allLots = [...demoLots, ...capturedLots];

  return (
    <article className="process-config" aria-label={t("process.config")}>
      <section className="process-config__section process-config__section--decider" aria-labelledby="process-config-decider">
        <div className="process-config__intro">
          <p className="process-config__kicker mono-label">{t("nav.process")}</p>
          <h1 className="process-config__title">{t("process.title")}</h1>
          <p className="process-config__lead">{t("process.leadShort")}</p>
        </div>
        <p id="process-config-decider" className="process-config__section-title">
          {t("process.decider.label")}
        </p>
        <div className="process-config-segment" role="radiogroup" aria-label={t("process.decider.label")}>
          <button
            type="button"
            role="radio"
            aria-checked={decider === "rule"}
            className={`process-config-segment__btn${decider === "rule" ? " process-config-segment__btn--active" : ""}`}
            disabled={disabled || running}
            onClick={() => onDeciderChange("rule")}
          >
            {t("process.decider.ruleShort")}
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={decider === "llm"}
            className={`process-config-segment__btn${decider === "llm" ? " process-config-segment__btn--active" : ""}`}
            disabled={disabled || running}
            onClick={() => onDeciderChange("llm")}
          >
            {t("process.decider.llmShort")}
          </button>
        </div>
      </section>

      <section className="process-config__section process-config__section--lots" aria-labelledby="process-config-lots">
        <p id="process-config-lots" className="process-config__section-title">
          {t("process.lotsInBatch")}
        </p>
        <ul className="process-config-group">
          {allLots.map((lot) => (
            <ConfigLotRow
              key={lot.artifact.assetId}
              lot={lot}
              checked={selected.includes(lot.artifact.assetId)}
              disabled={disabled}
              onToggle={() => onToggle(lot.artifact.assetId)}
            />
          ))}
        </ul>
      </section>

      {phase === "error" ? (
        <div className="process-config__error" role="alert">
          <p>{runError}</p>
          <button type="button" className="route-cta route-cta--ghost" onClick={onRetry}>
            {t("process.retry")}
          </button>
        </div>
      ) : null}

      <div className="process-config__action" aria-live="polite">
        {running ? (
          <div
            className={`process-config__progress${fetchingBatch ? " process-config__progress--indeterminate" : ""}`}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="process-config__progress-track">
              <span className="process-config__progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="process-config__progress-label">
              {fetchingBatch ? t("process.pipeline.fetching") : `${t("process.running")} · ${progress}%`}
            </p>
          </div>
        ) : (
          <div className="process-config__footer">
            <button
              type="button"
              className="route-cta process-config__run"
              disabled={running || selected.length === 0}
              onClick={onRun}
            >
              {t("process.run")}
            </button>
            <p className="process-config__footnote">{t("process.config.llmFootnote")}</p>
          </div>
        )}
      </div>
    </article>
  );
}
