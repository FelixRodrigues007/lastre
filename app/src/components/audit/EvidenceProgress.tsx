import { useLocaleContext } from "../../context/LocaleContext";
import type { TranslationKey } from "../../i18n/translations";
import type { EvidenceStatus } from "../../lib/auditEvidence";
import "./evidence-progress.css";

type EvidenceProgressProps = {
  notReady: number;
  flagged: number;
  ready: number;
  accepted: number;
  na: number;
};

const SEGMENTS: { key: EvidenceStatus; tone: string; labelKey: TranslationKey }[] = [
  { key: "not_ready", tone: "not-ready", labelKey: "audit.evidence.status.notReady" },
  { key: "flagged", tone: "flagged", labelKey: "audit.evidence.status.flagged" },
  { key: "ready", tone: "ready", labelKey: "audit.evidence.status.ready" },
  { key: "accepted", tone: "accepted", labelKey: "audit.evidence.status.accepted" },
  { key: "na", tone: "na", labelKey: "audit.evidence.status.na" },
];

export function EvidenceProgress({
  notReady,
  flagged,
  ready,
  accepted,
  na,
}: EvidenceProgressProps) {
  const { t } = useLocaleContext();
  const counts: Record<EvidenceStatus, number> = {
    not_ready: notReady,
    flagged,
    ready,
    accepted,
    na,
  };
  const total = notReady + flagged + ready + accepted + na;

  return (
    <section className="evidence-progress panel" aria-label={t("audit.evidence.progress")}>
      <header className="evidence-progress__head">
        <p className="mono-label">{t("audit.evidence.progress")}</p>
        <span className="evidence-progress__total">{t("common.records", { count: total })}</span>
      </header>

      {total > 0 ? (
        <div className="evidence-progress__track" role="img" aria-label={t("audit.evidence.progress")}>
          {SEGMENTS.filter((s) => counts[s.key] > 0).map((segment) => (
            <span
              key={segment.key}
              className={`evidence-progress__segment evidence-progress__segment--${segment.tone}`}
              style={{ flexGrow: counts[segment.key] }}
              title={`${t(segment.labelKey)}: ${counts[segment.key]}`}
            />
          ))}
        </div>
      ) : null}

      <div className="evidence-progress__legend">
        {SEGMENTS.map((segment) => (
          <span key={segment.key} className="evidence-progress__legend-item">
            <span
              className={`evidence-progress__dot evidence-progress__dot--${segment.tone}`}
              aria-hidden="true"
            />
            {t(segment.labelKey)}
            <span className="evidence-progress__count">{counts[segment.key]}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
