import type { EvidenceStatus } from "../../lib/auditEvidence";
import type { TranslationKey } from "../../i18n/translations";
import { useLocaleContext } from "../../context/LocaleContext";
import { StatusBadge, type StatusBadgeTone, type StatusCircleVariant } from "../ui/StatusBadge";

type EvidenceStatusBadgeProps = {
  status: EvidenceStatus;
  size?: "sm" | "md";
};

const STATUS_KEYS: Record<EvidenceStatus, TranslationKey> = {
  not_ready: "audit.evidence.status.notReady",
  flagged: "audit.evidence.status.flagged",
  ready: "audit.evidence.status.ready",
  accepted: "audit.evidence.status.accepted",
  na: "audit.evidence.status.na",
};

const STATUS_STYLE: Record<EvidenceStatus, { tone: StatusBadgeTone; circle: StatusCircleVariant }> =
  {
    not_ready: { tone: "danger", circle: "dashed" },
    flagged: { tone: "warning", circle: "dashed" },
    ready: { tone: "info", circle: "ring" },
    accepted: { tone: "success", circle: "ring" },
    na: { tone: "neutral", circle: "empty" },
  };

export function EvidenceStatusBadge({ status, size = "md" }: EvidenceStatusBadgeProps) {
  const { t } = useLocaleContext();
  const style = STATUS_STYLE[status];

  return (
    <StatusBadge
      label={t(STATUS_KEYS[status])}
      tone={style.tone}
      circle={style.circle}
      size={size}
    />
  );
}
