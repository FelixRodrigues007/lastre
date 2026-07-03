import { ProofTrustReportPreview } from "./ProofTrustReportPreview";
import { SealMark } from "../ui/SealMark";
import { Icon, type IconName } from "../ui/Icon";
import { useLocaleContext } from "../../context/LocaleContext";
import "./overview-next-step-hero.css";

export type NextStepHeroVariant = "start" | "lots" | "review" | "tokenizable";

type OverviewNextStepHeroProps = {
  variant: NextStepHeroVariant;
  count?: number;
  banner?: boolean;
};

const STEP_ICONS: Record<Exclude<NextStepHeroVariant, "tokenizable">, IconName> = {
  start: "capture",
  lots: "process",
  review: "audit",
};

export function OverviewNextStepHero({ variant, count = 0, banner = false }: OverviewNextStepHeroProps) {
  const { t } = useLocaleContext();

  if (variant === "tokenizable") {
    return <ProofTrustReportPreview tokenizableCount={count} banner={banner} />;
  }

  const icon = STEP_ICONS[variant];
  const titleKey = `overview.next.hero.${variant}.title` as const;
  const leadKey = `overview.next.hero.${variant}.lead` as const;
  const rootClass = banner ? "overview-step-hero overview-step-hero--banner" : "overview-step-hero";

  return (
    <div className={rootClass} aria-hidden="true">
      <div className="overview-step-hero__ghost" />
      <article className="overview-step-hero__card">
        <header className="overview-step-hero__head">
          <span className="overview-step-hero__icon">
            <Icon name={icon} size={banner ? 16 : 20} />
          </span>
          <div>
            <p className="overview-step-hero__brand">
              <SealMark size={banner ? 14 : 16} />
              {t("brand.name")}
            </p>
            <h3 className="overview-step-hero__title">{t(titleKey)}</h3>
          </div>
        </header>
        {!banner ? <p className="overview-step-hero__lead">{t(leadKey, { count })}</p> : null}
        <ul className="overview-step-hero__trail">
          <li
            className={
              variant === "lots" || variant === "start"
                ? "is-active"
                : variant === "review"
                  ? "is-done"
                  : ""
            }
          >
            {t("overview.pipeline.short.lots")}
          </li>
          <li className={variant === "review" ? "is-active" : ""}>
            {t("overview.pipeline.short.processed")}
          </li>
          <li>{t("overview.pipeline.short.token")}</li>
        </ul>
      </article>
    </div>
  );
}
