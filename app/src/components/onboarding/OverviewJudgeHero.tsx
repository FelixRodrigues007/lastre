import { Link } from "react-router-dom";
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
      <Link className="route-cta judge-hero__cta" to="/process">
        <BtnIcon icon="process">{t("onboarding.judge.cta")}</BtnIcon>
      </Link>
    </section>
  );
}
