import { RatioBar, type RatioSegment } from "./RatioBar";
import "./outcome-breakdown.css";

type OutcomeBreakdownProps = {
  title?: string;
  tokenizable: number;
  rejected: number;
  skipped: number;
  escalated: number;
};

export function OutcomeBreakdown({
  title = "Session outcomes",
  tokenizable,
  rejected,
  skipped,
  escalated,
}: OutcomeBreakdownProps) {
  const total = tokenizable + rejected + skipped + escalated;

  const segments: RatioSegment[] = [
    { value: tokenizable, label: "Tokenizable", tone: "valid" as const },
    { value: rejected, label: "Rejected", tone: "invalid" as const },
    { value: skipped, label: "Skipped", tone: "muted" as const },
    { value: escalated, label: "Escalated", tone: "accent" as const },
  ].filter((s) => s.value > 0);

  return (
    <section className="outcome-breakdown" aria-label={title}>
      <header className="outcome-breakdown__head">
        <p className="mono-label">{title}</p>
        <span className="outcome-breakdown__total">{total} records</span>
      </header>

      {total > 0 ? (
        <RatioBar segments={segments} ariaLabel={`${title}: ${total} total`} />
      ) : null}

      <div className="outcome-breakdown__grid">
        <div className="outcome-breakdown__cell outcome-breakdown__cell--valid">
          <span className="outcome-breakdown__cell-label">Tokenizable</span>
          <span className="outcome-breakdown__cell-value">{tokenizable}</span>
        </div>
        <div className="outcome-breakdown__cell outcome-breakdown__cell--invalid">
          <span className="outcome-breakdown__cell-label">Rejected</span>
          <span className="outcome-breakdown__cell-value">{rejected}</span>
        </div>
        <div className="outcome-breakdown__cell">
          <span className="outcome-breakdown__cell-label">Skipped</span>
          <span className="outcome-breakdown__cell-value">{skipped}</span>
        </div>
        <div className="outcome-breakdown__cell">
          <span className="outcome-breakdown__cell-label">Escalated</span>
          <span className="outcome-breakdown__cell-value">{escalated}</span>
        </div>
      </div>
    </section>
  );
}
