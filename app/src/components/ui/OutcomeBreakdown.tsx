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

  const kpis = [
    { label: t("outcome.tokenizable"), value: tokenizable, tone: "valid" as const },
    { label: t("outcome.rejected"), value: rejected, tone: "invalid" as const },
    { label: t("outcome.skipped"), value: skipped, tone: null },
    { label: t("outcome.escalated"), value: escalated, tone: null },
  ];

  return (
    <section className="outcome-breakdown" aria-label={heading}>
      <div className="outcome-breakdown__card">
        <header className="outcome-breakdown__head">
          <p className="mono-label">{heading}</p>
          <span className="outcome-breakdown__total">{t("common.records", { count: total })}</span>
        </header>

        {total > 0 ? (
          <RatioBar segments={segments} ariaLabel={`${heading}: ${total}`} />
        ) : null}
      </div>

      <div className="outcome-breakdown__kpis">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`outcome-breakdown__kpi${kpi.tone ? ` outcome-breakdown__kpi--${kpi.tone}` : ""}`}
          >
            <span className="outcome-breakdown__kpi-label">{kpi.label}</span>
            <span className="outcome-breakdown__kpi-value">{kpi.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
