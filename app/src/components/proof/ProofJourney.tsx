import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useCaptureWizard } from "../../context/CaptureWizardContext";
import { useLocaleContext } from "../../context/LocaleContext";
import type { TranslationKey } from "../../i18n/translations";
import { Icon, type IconName } from "../ui/Icon";
import "./proof-journey.css";

type ProofJourneyStepDef = {
  labelKey: TranslationKey;
  hintKey: TranslationKey;
  to: string;
  icon: IconName;
};

const STEP_DEFS: ProofJourneyStepDef[] = [
  { labelKey: "journey.capture.label", hintKey: "journey.capture.hint", to: "/capture", icon: "capture" },
  { labelKey: "journey.seal.label", hintKey: "journey.seal.hint", to: "/lots", icon: "shield" },
  { labelKey: "journey.process.label", hintKey: "journey.process.hint", to: "/process", icon: "process" },
  { labelKey: "journey.audit.label", hintKey: "journey.audit.hint", to: "/audit", icon: "audit" },
  {
    labelKey: "journey.marketplace.label",
    hintKey: "journey.marketplace.hint",
    to: "/marketplace",
    icon: "globe",
  },
  {
    labelKey: "journey.myAssets.label",
    hintKey: "journey.myAssets.hint",
    to: "/my-assets",
    icon: "shield",
  },
];

type ProofJourneyProps = {
  activePath?: string;
  compact?: boolean;
};

export function ProofJourney({ activePath, compact = false }: ProofJourneyProps) {
  const { t } = useLocaleContext();
  const { openCaptureWizard } = useCaptureWizard();
  const steps = useMemo(
    () =>
      STEP_DEFS.map((step) => ({
        ...step,
        label: t(step.labelKey),
        hint: t(step.hintKey),
      })),
    [t],
  );

  return (
    <nav
      className={`proof-journey${compact ? " proof-journey--compact" : ""}`}
      aria-label={t("journey.aria")}
    >
      <header className="proof-journey__head">
        <p className="proof-journey__kicker">{t("journey.kicker")}</p>
        {!compact ? <p className="proof-journey__lead">{t("journey.lead")}</p> : null}
      </header>

      <ol className="proof-journey__steps">
        {steps.map((step, index) => {
          const active =
            activePath === step.to ||
            (activePath?.startsWith(step.to) && step.to !== "/") ||
            (step.to === "/lots" && activePath?.startsWith("/lots/"));

          return (
            <li key={step.to} className="proof-journey__item">
              {step.to === "/capture" ? (
                <button
                  type="button"
                  className={`proof-journey__step${active ? " proof-journey__step--active" : ""}`}
                  aria-current={active ? "step" : undefined}
                  onClick={openCaptureWizard}
                >
                  <span className="proof-journey__icon" aria-hidden="true">
                    <Icon name={step.icon} size={16} />
                  </span>
                  <span className="proof-journey__copy">
                    <span className="proof-journey__label">{step.label}</span>
                    {!compact ? <span className="proof-journey__hint">{step.hint}</span> : null}
                  </span>
                </button>
              ) : (
                <Link
                  to={step.to}
                  className={`proof-journey__step${active ? " proof-journey__step--active" : ""}`}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="proof-journey__icon" aria-hidden="true">
                    <Icon name={step.icon} size={16} />
                  </span>
                  <span className="proof-journey__copy">
                    <span className="proof-journey__label">{step.label}</span>
                    {!compact ? <span className="proof-journey__hint">{step.hint}</span> : null}
                  </span>
                </Link>
              )}
              {index < steps.length - 1 ? (
                <Icon name="chevron-right" size={14} className="proof-journey__chevron" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Derives proof-rail progress from lot / audit state. */
export function proofStepFromLot(input: {
  attested: boolean;
  latestVerdict: "Valid" | "Invalid" | null;
  auditRecord: { decision: { action: string } } | null;
}): number {
  if (input.latestVerdict) return 4;
  if (input.auditRecord?.decision.action === "pay") return 3;
  if (input.auditRecord) return 2;
  if (input.attested) return 3;
  return 1;
}
