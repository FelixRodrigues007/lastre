import type { Action, Outcome, VerificationVerdict } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import { StatusBadge, type StatusBadgeTone, type StatusCircleVariant } from "../ui/StatusBadge";

type VerdictBadgeProps = {
  verdict: VerificationVerdict | null;
  size?: "sm" | "md";
};

export function VerdictBadge({ verdict, size = "md" }: VerdictBadgeProps) {
  const { t } = useLocaleContext();

  if (!verdict) {
    return (
      <StatusBadge
        label={t("badge.noVerdict")}
        tone="neutral"
        circle="dashed"
        size={size}
      />
    );
  }

  const isValid = verdict === "Valid";

  return (
    <StatusBadge
      label={isValid ? t("common.valid") : t("common.invalid")}
      tone={isValid ? "success" : "danger"}
      circle={isValid ? "ring" : "dashed"}
      size={size}
    />
  );
}

type AttestedBadgeProps = {
  attested: boolean;
  size?: "sm" | "md";
};

export function AttestedBadge({ attested, size = "md" }: AttestedBadgeProps) {
  const { t } = useLocaleContext();

  return (
    <StatusBadge
      label={attested ? t("badge.attested") : t("badge.pending")}
      tone={attested ? "success" : "neutral"}
      circle={attested ? "ring" : "empty"}
      size={size}
    />
  );
}

type ActionBadgeProps = {
  action: Action;
  size?: "sm" | "md";
};

const ACTION_STYLE: Record<Action, { tone: StatusBadgeTone; circle: StatusCircleVariant }> = {
  pay: { tone: "info", circle: "ring" },
  skip: { tone: "neutral", circle: "empty" },
  escalate: { tone: "warning", circle: "dashed" },
};

export function ActionBadge({ action, size = "md" }: ActionBadgeProps) {
  const { t } = useLocaleContext();
  const label =
    action === "pay" ? t("badge.pay") : action === "skip" ? t("badge.skip") : t("badge.escalate");
  const style = ACTION_STYLE[action];

  return (
    <StatusBadge label={label} tone={style.tone} circle={style.circle} size={size} />
  );
}

type OutcomeBadgeProps = {
  outcome: Outcome;
  size?: "sm" | "md";
};

const OUTCOME_STYLE: Record<Outcome, { tone: StatusBadgeTone; circle: StatusCircleVariant }> = {
  tokenizable: { tone: "success", circle: "ring" },
  rejected: { tone: "danger", circle: "dashed" },
  skipped: { tone: "neutral", circle: "empty" },
  escalated: { tone: "warning", circle: "dashed" },
};

export function OutcomeBadge({ outcome, size = "md" }: OutcomeBadgeProps) {
  const { t } = useLocaleContext();
  const label =
    outcome === "tokenizable"
      ? t("badge.tokenizable")
      : outcome === "rejected"
        ? t("badge.rejected")
        : outcome === "skipped"
          ? t("badge.skipped")
          : t("badge.escalated");
  const style = OUTCOME_STYLE[outcome];

  return (
    <StatusBadge label={label} tone={style.tone} circle={style.circle} size={size} />
  );
}

type MutedStatusBadgeProps = {
  label: string;
  size?: "sm" | "md";
};

export function MutedStatusBadge({ label, size = "md" }: MutedStatusBadgeProps) {
  return <StatusBadge label={label} tone="neutral" circle="empty" size={size} />;
}
