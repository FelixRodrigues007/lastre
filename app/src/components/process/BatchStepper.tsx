import type { AuditRecord } from "../../lib/types";
import { ProcessRecordPanel } from "./ProcessRecordPanel";
import "./batch-stepper.css";

type BatchStepperProps = {
  records: AuditRecord[];
  currentIndex: number | null;
  running: boolean;
};

export function BatchStepper({ records, currentIndex, running }: BatchStepperProps) {
  if (records.length === 0 && !running) {
    return (
      <div className="panel batch-stepper__empty">
        <p className="batch-stepper__empty-title">No batch run yet</p>
        <p className="batch-stepper__empty-hint">
          Select lots and run the demo batch to watch agent action, seal verification, verdict, and
          Casper recording — one layer at a time.
        </p>
      </div>
    );
  }

  return (
    <ol className="batch-stepper" aria-live="polite">
      {records.map((record, index) => {
        const state =
          currentIndex === index && running
            ? "running"
            : index < (currentIndex ?? records.length)
              ? "done"
              : "pending";

        return (
          <li key={`${record.assetId}-${index}`} className={`batch-stepper__item batch-stepper__item--${state}`}>
            <span className="batch-stepper__marker" aria-hidden="true" />
            <ProcessRecordPanel record={record} index={index + 1} />
          </li>
        );
      })}

      {running && currentIndex !== null && currentIndex >= records.length ? (
        <li className="batch-stepper__item batch-stepper__item--running">
          <span className="batch-stepper__marker" aria-hidden="true" />
          <div className="panel batch-stepper__loading">Finalizing batch…</div>
        </li>
      ) : null}
    </ol>
  );
}
