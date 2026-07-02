import { useLocaleContext } from "../../context/LocaleContext";
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
  title,
  tokenizable,
  rejected,
  skipped,
  escalated,
}: OutcomeBreakdownProps) {
  const { t } = useLocaleContext();
  const heading = title ?? t("outcome.title");
  const total = tokenizable + rejected + skipped + escalated;

  const segments: RatioSegment[] = [
    { value: tokenizable, label: t("outcome.tokenizable"), tone: "valid" as const },
    { value: rejected, label: t("outcome.rejected"), tone: "invalid" as const },
    { value: skipped, label: t("outcome.skipped"), tone: "muted" as const },
    { value: escalated, label: t("outcome.escalated"), tone: "accent" as const },
  ].filter((s) => s.value > 0);

  return (
    <section className="outcome-breakdown" aria-label={heading}>
      <header className="outcome-breakdown__head">
        <p className="mono-label">{heading}</p>
        <span className="outcome-breakdown__total">{t("common.records", { count: total })}</span>
      </header>

      {total > 0 ? (
        <RatioBar segments={segments} ariaLabel={`${heading}: ${total}`} />
      ) : null}

      <div className="outcome-breakdown__grid">
        <div className="outcome-breakdown__cell outcome-breakdown__cell--valid">
          <span className="outcome-breakdown__cell-label">{t("outcome.tokenizable")}</span>
          <span className="outcome-breakdown__cell-value">{tokenizable}</span>
        </div>
        <div className="outcome-breakdown__cell outcome-breakdown__cell--invalid">
          <span className="outcome-breakdown__cell-label">{t("outcome.rejected")}</span>
          <span className="outcome-breakdown__cell-value">{rejected}</span>
        </div>
        <div className="outcome-breakdown__cell">
          <span className="outcome-breakdown__cell-label">{t("outcome.skipped")}</span>
          <span className="outcome-breakdown__cell-value">{skipped}</span>
        </div>
        <div className="outcome-breakdown__cell">
          <span className="outcome-breakdown__cell-label">{t("outcome.escalated")}</span>
          <span className="outcome-breakdown__cell-value">{escalated}</span>
        </div>
      </div>
    </section>
  );
}
