import type { DeciderMode, LotListItem } from "../../lib/types";
import { ProcessBatchToolbar } from "./ProcessBatchToolbar";
import { ProcessLotSelector } from "./ProcessLotSelector";
import "./process-filters-panel.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

type ProcessFiltersPanelProps = {
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
  onSelectAll: () => void;
  onSelectNone: () => void;
  onDeciderChange: (mode: DeciderMode) => void;
  onRun: () => void;
  onRetry: () => void;
  onRepeat: () => void;
};

export function ProcessFiltersPanel({
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
  onSelectAll,
  onSelectNone,
  onDeciderChange,
  onRun,
  onRetry,
  onRepeat,
}: ProcessFiltersPanelProps) {
  return (
    <aside className="process-filters panel" aria-label="Batch filters">
      <div className="process-filters__scroll">
        <ProcessLotSelector
          layout="sidebar"
          demoLots={demoLots}
          capturedLots={capturedLots}
          selected={selected}
          disabled={disabled}
          onToggle={onToggle}
          onSelectAll={onSelectAll}
          onSelectNone={onSelectNone}
        />
      </div>

      <ProcessBatchToolbar
        layout="sidebar"
        decider={decider}
        phase={phase}
        progress={progress}
        fetchingBatch={fetchingBatch}
        runError={runError}
        selectedCount={selected.length}
        disabled={disabled}
        onDeciderChange={onDeciderChange}
        onRun={onRun}
        onRetry={onRetry}
        onRepeat={onRepeat}
      />
    </aside>
  );
}
