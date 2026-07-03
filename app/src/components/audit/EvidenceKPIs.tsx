import { useLocaleContext } from "../../context/LocaleContext";
import type { TranslationKey } from "../../i18n/translations";
import type { EvidenceStatus } from "../../lib/auditEvidence";
import { LiveValue } from "../motion/LiveValue";
import "./evidence-kpis.css";

type EvidenceKPIsProps = {
  notReady: number;
  flagged: number;
  ready: number;
  accepted: number;
};

const CARDS: { key: EvidenceStatus; tone: string; labelKey: TranslationKey }[] = [
  { key: "not_ready", tone: "not-ready", labelKey: "audit.evidence.status.notReady" },
  { key: "flagged", tone: "flagged", labelKey: "audit.evidence.status.flagged" },
  { key: "ready", tone: "ready", labelKey: "audit.evidence.status.ready" },
  { key: "accepted", tone: "accepted", labelKey: "audit.evidence.status.accepted" },
];

export function EvidenceKPIs({ notReady, flagged, ready, accepted }: EvidenceKPIsProps) {
  const { t } = useLocaleContext();
  const values: Record<EvidenceStatus, number> = {
    not_ready: notReady,
    flagged,
    ready,
    accepted,
    na: 0,
  };

  return (
    <div className="evidence-kpis" role="group" aria-label={t("audit.evidence.progress")}>
      {CARDS.map((card) => (
        <div key={card.key} className={`evidence-kpi evidence-kpi--${card.tone}`}>
          <span className="evidence-kpi__label">{t(card.labelKey)}</span>
          <span className="evidence-kpi__value">
            <LiveValue value={values[card.key]} duration={640} />
          </span>
        </div>
      ))}
    </div>
  );
}
