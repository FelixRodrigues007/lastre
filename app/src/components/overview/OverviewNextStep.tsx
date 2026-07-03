import { Link } from "react-router-dom";
import type { AuditSummary } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import { BtnIcon } from "../ui/BtnIcon";
import { OverviewNextStepHero, type NextStepHeroVariant } from "./OverviewNextStepHero";
import "./overview-next-step.css";

type OverviewNextStepProps = {
  audit: AuditSummary;
  lotCount: number;
};

type NextStepCopy = {
  title: string;
  leadStat?: string;
  leadHint: string;
  ctaTo: string;
  ctaLabel: string;
  ctaIcon: "capture" | "process" | "audit" | "globe";
  secondary: { to: string; label: string } | null;
  heroVariant: NextStepHeroVariant;
  heroCount: number;
};

export function OverviewNextStep({ audit, lotCount }: OverviewNextStepProps) {
  const { t } = useLocaleContext();

  let copy: NextStepCopy = {
    title: t("overview.next.start.title"),
    leadHint: t("overview.next.start.lead"),
    ctaTo: "/capture",
    ctaLabel: t("overview.next.start.cta"),
    ctaIcon: "capture",
    secondary: null,
    heroVariant: "start",
    heroCount: 0,
  };

  if (audit.total === 0 && lotCount > 0) {
    copy = {
      title: t("overview.next.lots.title"),
      leadStat: t("overview.next.lots.leadStat", { count: lotCount }),
      leadHint: t("overview.next.lots.leadHint"),
      ctaTo: "/process",
      ctaLabel: t("overview.next.lots.cta"),
      ctaIcon: "process",
      secondary: { to: "/lots", label: t("overview.next.lots.secondary") },
      heroVariant: "lots",
      heroCount: lotCount,
    };
  } else if (audit.total > 0 && audit.tokenizable === 0) {
    copy = {
      title: t("overview.next.review.title"),
      leadStat: t("overview.next.review.leadStat", { count: audit.total }),
      leadHint: t("overview.next.review.leadHint"),
      ctaTo: "/audit",
      ctaLabel: t("overview.next.review.cta"),
      ctaIcon: "audit",
      secondary: { to: "/process", label: t("overview.next.review.secondary") },
      heroVariant: "review",
      heroCount: audit.total,
    };
  } else if (audit.tokenizable > 0) {
    copy = {
      title: t("overview.next.tokenizable.title"),
      leadStat: t("overview.next.tokenizable.leadStat", { count: audit.tokenizable }),
      leadHint: t("overview.next.tokenizable.leadHint"),
      ctaTo: "/marketplace",
      ctaLabel: t("overview.next.tokenizable.cta"),
      ctaIcon: "globe",
      secondary: { to: "/my-assets", label: t("overview.next.tokenizable.secondary") },
      heroVariant: "tokenizable",
      heroCount: audit.tokenizable,
    };
  }

  return (
    <section
      className={`overview-next overview-next--banner overview-next--${copy.heroVariant} panel`}
      aria-label={t("overview.next.aria")}
    >
      <div className="overview-next__copy">
        <div className="overview-next__content">
          <p className="overview-next__kicker">{t("overview.next.kicker")}</p>
          <h2 className="overview-next__title">{copy.title}</h2>
          {copy.leadStat ? <p className="overview-next__lead-stat">{copy.leadStat}</p> : null}
          <p className="overview-next__lead-hint">{copy.leadHint}</p>
        </div>
        <div className="overview-next__actions">
          <Link className="route-cta" to={copy.ctaTo}>
            <BtnIcon icon={copy.ctaIcon}>{copy.ctaLabel}</BtnIcon>
          </Link>
          {copy.secondary ? (
            <Link className="route-cta route-cta--ghost" to={copy.secondary.to}>
              {copy.secondary.label}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="overview-next__visual">
        <div className="overview-next__mesh" aria-hidden="true">
          <div className="overview-next__mesh-base" />
          <span className="overview-next__orb overview-next__orb--a" />
          <span className="overview-next__orb overview-next__orb--b" />
          <span className="overview-next__orb overview-next__orb--c" />
          <span className="overview-next__orb overview-next__orb--d" />
        </div>
        <div className="overview-next__visual-content" aria-hidden="true">
          <OverviewNextStepHero variant={copy.heroVariant} count={copy.heroCount} banner />
        </div>
      </div>
    </section>
  );
}
