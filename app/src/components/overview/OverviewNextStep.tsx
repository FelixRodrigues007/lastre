import { Link } from "react-router-dom";
import type { AuditSummary } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import { BtnIcon } from "../ui/BtnIcon";
import "./overview-next-step.css";

type OverviewNextStepProps = {
  audit: AuditSummary;
  lotCount: number;
};

export function OverviewNextStep({ audit, lotCount }: OverviewNextStepProps) {
  const { t } = useLocaleContext();

  let title = t("overview.next.start.title");
  let lead = t("overview.next.start.lead");
  let ctaTo = "/capture";
  let ctaLabel = t("overview.next.start.cta");
  let ctaIcon: "capture" | "process" | "audit" | "globe" = "capture";
  let secondary: { to: string; label: string } | null = null;

  if (audit.total === 0 && lotCount > 0) {
    title = t("overview.next.lots.title");
    lead = t("overview.next.lots.lead", { count: lotCount });
    ctaTo = "/process";
    ctaLabel = t("overview.next.lots.cta");
    ctaIcon = "process";
    secondary = { to: "/lots", label: t("overview.next.lots.secondary") };
  } else if (audit.total > 0 && audit.tokenizable === 0) {
    title = t("overview.next.review.title");
    lead = t("overview.next.review.lead", { count: audit.total });
    ctaTo = "/audit";
    ctaLabel = t("overview.next.review.cta");
    ctaIcon = "audit";
    secondary = { to: "/process", label: t("overview.next.review.secondary") };
  } else if (audit.tokenizable > 0) {
    title = t("overview.next.tokenizable.title");
    lead = t("overview.next.tokenizable.lead", { count: audit.tokenizable });
    ctaTo = "/marketplace";
    ctaLabel = t("overview.next.tokenizable.cta");
    ctaIcon = "globe";
    secondary = { to: "/my-assets", label: t("overview.next.tokenizable.secondary") };
  }

  return (
    <section className="overview-next panel" aria-label={t("overview.next.aria")}>
      <div className="overview-next__copy">
        <p className="overview-next__kicker">{t("overview.next.kicker")}</p>
        <h2 className="overview-next__title">{title}</h2>
        <p className="overview-next__lead">{lead}</p>
      </div>
      <div className="overview-next__actions">
        <Link className="route-cta" to={ctaTo}>
          <BtnIcon icon={ctaIcon}>{ctaLabel}</BtnIcon>
        </Link>
        {secondary ? (
          <Link className="route-cta route-cta--ghost" to={secondary.to}>
            {secondary.label}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
