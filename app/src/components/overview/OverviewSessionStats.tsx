import { LiveValue } from "../motion/LiveValue";
import { useLocaleContext } from "../../context/LocaleContext";
import "./overview-session-stats.css";

type OverviewSessionStatsProps = {
  processed: number;
  tokenizable: number;
};

export function OverviewSessionStats({ processed, tokenizable }: OverviewSessionStatsProps) {
  const { t } = useLocaleContext();
  const conversionPct = processed > 0 ? Math.round((tokenizable / processed) * 100) : 0;

  return (
    <section className="overview-metrics" aria-label={t("overview.stats.aria")}>
      <div className="overview-metrics__cell">
        <LiveValue value={processed} className="overview-metrics__value" />
        <p className="overview-metrics__label">{t("overview.stats.processed")}</p>
      </div>

      <div className="overview-metrics__cell overview-metrics__cell--accent">
        <LiveValue value={tokenizable} className="overview-metrics__value overview-metrics__value--accent" />
        <p className="overview-metrics__label">{t("overview.stats.tokenizable")}</p>
        {processed > 0 ? (
          <p className="overview-metrics__hint">
            {t("overview.stats.tokenizableHint", { tokenizable, processed, pct: conversionPct })}
          </p>
        ) : null}
      </div>
    </section>
  );
}
