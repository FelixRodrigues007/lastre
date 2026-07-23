import type { VerificationVerdict } from "../../lib/types";
import "./proof-rail.css";

const DEFAULT_STEPS = [
  "Physical origin",
  "SHA-256 seal",
  "Agent action",
  "Paid verify",
  "Casper verdict",
] as const;

/** Splits a "Main (Meta)" step label into its parts, so the parenthetical
 * (e.g. "Mock x402", "Demo") can render as a quiet meta line under the badge —
 * matching the landing Sealed Rail. Labels without parens keep meta null. */
function splitStepMeta(label: string): { main: string; meta: string | null } {
  const m = label.match(/^(.*?)\s*\(([^)]+)\)\s*$/u);
  return m ? { main: m[1], meta: m[2] } : { main: label, meta: null };
}

type ProofRailProps = {
  steps?: readonly string[];
  /** 0-based index of the active step */
  activeStep?: number;
  verdict?: VerificationVerdict | null;
  layout?: "auto" | "vertical";
  /**
   * "plain" (default) is the compact node+label rail used everywhere. "track"
   * is the reference-style progress rail — numbered split badges on a continuous
   * line — used by the marketplace Sealed Market Rail to mirror the landing.
   */
  variant?: "plain" | "track";
  /**
   * 0-based index of a step that failed (e.g. an Invalid origin seal). That
   * step renders in danger tone and every later step renders as blocked —
   * dimmed and non-interactive. Optional — omit for the normal done/active
   * progression used elsewhere (e.g. LotProofStatus).
   */
  failedStep?: number;
  /**
   * Localized sr-only label announced for steps blocked by `failedStep`.
   * Callers with `t()` in scope (e.g. SealedMarketRail) should pass the
   * translated string; only used when `failedStep` makes a step blocked.
   */
  blockedLabel?: string;
};

export function ProofRail({
  steps = DEFAULT_STEPS,
  activeStep = 0,
  verdict = null,
  layout = "auto",
  variant = "plain",
  failedStep,
  blockedLabel = "Blocked",
}: ProofRailProps) {
  const railClass = [
    "proof-rail",
    layout === "vertical" ? "proof-rail--vertical" : "",
    variant === "track" ? "proof-rail--track" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ol className={railClass} aria-label="Chain of proof">
      {steps.map((label, index) => {
        const isFailed = failedStep !== undefined && index === failedStep;
        const isBlocked = failedStep !== undefined && index > failedStep;
        const isActive = !isFailed && !isBlocked && index === activeStep;
        const isDone = !isFailed && !isBlocked && index < activeStep;
        const isVerdictStep = index === steps.length - 1 && verdict;

        const stepClass = [
          "proof-rail__step",
          isDone ? "proof-rail__step--done" : "",
          isActive ? "proof-rail__step--active" : "",
          isFailed ? "proof-rail__step--failed" : "",
          isBlocked ? "proof-rail__step--blocked" : "",
        ]
          .filter(Boolean)
          .join(" ");

        const trailing = isFailed ? (
          <span className="proof-rail__verdict proof-rail__verdict--invalid">Invalid</span>
        ) : isBlocked ? (
          <span className="sr-only">{blockedLabel}</span>
        ) : isVerdictStep ? (
          <span className={`proof-rail__verdict proof-rail__verdict--${verdict.toLowerCase()}`}>
            {verdict}
          </span>
        ) : null;

        if (variant === "track") {
          const { main, meta } = splitStepMeta(label);
          return (
            <li key={label} className={stepClass}>
              <span className="proof-rail__node" aria-hidden="true" />
              <span className="proof-rail__badge">
                <span className="proof-rail__badge-n">{String(index + 1).padStart(2, "0")}</span>
                <span className="proof-rail__badge-label">{main}</span>
              </span>
              {trailing ?? (meta ? <span className="proof-rail__meta">{meta}</span> : null)}
            </li>
          );
        }

        return (
          <li key={label} className={stepClass}>
            <span className="proof-rail__node" aria-hidden="true" />
            <span className="proof-rail__label">{label}</span>
            {trailing}
          </li>
        );
      })}
    </ol>
  );
}

/** Derives proof-rail progress from lot / audit state. */
export function proofStepFromLot(input: {
  attested: boolean;
  latestVerdict: VerificationVerdict | null;
  auditRecord: { decision: { action: string } } | null;
}): number {
  if (input.latestVerdict) return 4;
  if (input.auditRecord?.decision.action === "pay") return 3;
  if (input.auditRecord) return 2;
  if (input.attested) return 4;
  return 1;
}
