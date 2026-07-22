import type { VerificationVerdict } from "../../lib/types";
import "./proof-rail.css";

const DEFAULT_STEPS = [
  "Physical origin",
  "SHA-256 seal",
  "Agent action",
  "Paid verify",
  "Casper verdict",
] as const;

type ProofRailProps = {
  steps?: readonly string[];
  /** 0-based index of the active step */
  activeStep?: number;
  verdict?: VerificationVerdict | null;
  layout?: "auto" | "vertical";
  /**
   * 0-based index of a step that failed (e.g. an Invalid origin seal). That
   * step renders in danger tone and every later step renders as blocked —
   * dimmed and non-interactive. Optional — omit for the normal done/active
   * progression used elsewhere (e.g. LotProofStatus).
   */
  failedStep?: number;
};

export function ProofRail({
  steps = DEFAULT_STEPS,
  activeStep = 0,
  verdict = null,
  layout = "auto",
  failedStep,
}: ProofRailProps) {
  return (
    <ol
      className={`proof-rail${layout === "vertical" ? " proof-rail--vertical" : ""}`}
      aria-label="Chain of proof"
    >
      {steps.map((label, index) => {
        const isFailed = failedStep !== undefined && index === failedStep;
        const isBlocked = failedStep !== undefined && index > failedStep;
        const isActive = !isFailed && !isBlocked && index === activeStep;
        const isDone = !isFailed && !isBlocked && index < activeStep;
        const isVerdictStep = index === steps.length - 1 && verdict;

        return (
          <li
            key={label}
            className={[
              "proof-rail__step",
              isDone ? "proof-rail__step--done" : "",
              isActive ? "proof-rail__step--active" : "",
              isFailed ? "proof-rail__step--failed" : "",
              isBlocked ? "proof-rail__step--blocked" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="proof-rail__node" aria-hidden="true" />
            <span className="proof-rail__label">{label}</span>
            {isFailed ? (
              <span className="proof-rail__verdict proof-rail__verdict--invalid">Invalid</span>
            ) : isBlocked ? (
              <span className="sr-only">Blocked</span>
            ) : isVerdictStep ? (
              <span
                className={`proof-rail__verdict proof-rail__verdict--${verdict.toLowerCase()}`}
              >
                {verdict}
              </span>
            ) : null}
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
