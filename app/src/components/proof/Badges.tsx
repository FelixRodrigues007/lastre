import type { Action, Outcome, VerificationVerdict } from "../../lib/types";
import "./badges.css";

type VerdictBadgeProps = {
  verdict: VerificationVerdict | null;
};

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  if (!verdict) {
    return <span className="badge badge--muted">No verdict</span>;
  }

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
      {verdict}
    </span>
  );
}

type ActionBadgeProps = {
  action: Action;
};

export function ActionBadge({ action }: ActionBadgeProps) {
  return <span className={`badge badge--action badge--action-${action}`}>{action}</span>;
}

type OutcomeBadgeProps = {
  outcome: Outcome;
};

export function OutcomeBadge({ outcome }: OutcomeBadgeProps) {
  return <span className={`badge badge--outcome badge--outcome-${outcome}`}>{outcome}</span>;
}
