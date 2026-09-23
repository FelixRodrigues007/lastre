import { ActionLink } from "../ui/ActionLink";
import { useLocaleContext } from "../../context/LocaleContext";
import { BtnIcon } from "../ui/BtnIcon";
import "./overview-judge-hero.css";

export function OverviewJudgeHero() {
  const { t } = useLocaleContext();

  return (
    <section className="judge-hero panel" aria-labelledby="judge-hero-title">
      <div className="judge-hero__copy">
        <h2 id="judge-hero-title" className="judge-hero__title">
          {t("onboarding.judge.title")}
        </h2>
        <p className="judge-hero__lead">{t("onboarding.judge.lead")}</p>
      </div>
      <ActionLink
        variant="primary"
        size="md"
        className="route-cta judge-hero__cta"
        to="/process"
      >
        <BtnIcon icon="process">{t("onboarding.judge.cta")}</BtnIcon>
      </ActionLink>
    </section>
  );
}
