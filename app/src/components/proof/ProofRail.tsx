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
};

export function ProofRail({
  steps = DEFAULT_STEPS,
  activeStep = 0,
  verdict = null,
  layout = "auto",
}: ProofRailProps) {
  return (
    <ol
      className={`proof-rail${layout === "vertical" ? " proof-rail--vertical" : ""}`}
      aria-label="Chain of proof"
    >
      {steps.map((label, index) => {
        const isActive = index === activeStep;
        const isDone = index < activeStep;
        const isVerdictStep = index === steps.length - 1 && verdict;

        return (
          <li
            key={label}
            className={[
              "proof-rail__step",
              isDone ? "proof-rail__step--done" : "",
              isActive ? "proof-rail__step--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="proof-rail__node" aria-hidden="true" />
            <span className="proof-rail__label">{label}</span>
            {isVerdictStep ? (
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
