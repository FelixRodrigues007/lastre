import type { Action, Outcome, VerificationVerdict } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import "./badges.css";

type VerdictBadgeProps = {
  verdict: VerificationVerdict | null;
};

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const { t } = useLocaleContext();

  if (!verdict) {
    return <span className="badge badge--muted">{t("badge.noVerdict")}</span>;
  }

  const label = verdict === "Valid" ? t("common.valid") : t("common.invalid");

  return (
    <span className={`badge badge--verdict badge--verdict-${verdict.toLowerCase()}`}>
      {verdict === "Valid" ? (
        <svg width="11" height="11" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M2.5 7.5L5.5 10.5L11.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true">
          <path
            d="M4 4L10 10M10 4L4 10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

type ActionBadgeProps = {
  action: Action;
};

export function ActionBadge({ action }: ActionBadgeProps) {
  const { t } = useLocaleContext();
  const label =
    action === "pay" ? t("badge.pay") : action === "skip" ? t("badge.skip") : t("badge.escalate");

  return <span className={`badge badge--action badge--action-${action}`}>{label}</span>;
}

type OutcomeBadgeProps = {
  outcome: Outcome;
};

export function OutcomeBadge({ outcome }: OutcomeBadgeProps) {
  const { t } = useLocaleContext();
  const label =
    outcome === "tokenizable"
      ? t("badge.tokenizable")
      : outcome === "rejected"
        ? t("badge.rejected")
        : outcome === "skipped"
          ? t("badge.skipped")
          : t("badge.escalated");

  return <span className={`badge badge--outcome badge--outcome-${outcome}`}>{label}</span>;
}
