import { Navigate, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/onboarding/AuthLayout";
import { Icon } from "../components/ui/Icon";
import { useLocaleContext } from "../context/LocaleContext";
import { useOnboarding } from "../context/OnboardingContext";
import type { OnboardingPersona } from "../lib/onboarding";
import "./welcome.css";

type PathOptionProps = {
  icon: "process" | "capture";
  title: string;
  lead: string;
  onSelect: () => void;
};

function PathOption({ icon, title, lead, onSelect }: PathOptionProps) {
  return (
    <button type="button" className="path-option" onClick={onSelect}>
      <span className="path-option__icon" aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <span className="path-option__copy">
        <span className="path-option__title">{title}</span>
        <span className="path-option__lead">{lead}</span>
      </span>
      <Icon name="chevron-right" size={14} className="path-option__chev" />
    </button>
  );
}

export function Welcome() {
  const { t } = useLocaleContext();
  const { isAuthenticated, persona, setPersona } = useOnboarding();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (persona) {
    return <Navigate to="/" replace />;
  }

  function choose(next: OnboardingPersona, to: string) {
    setPersona(next);
    navigate(to, { replace: true });
  }

  return (
    <AuthLayout wide>
      <section className="path-select" aria-labelledby="path-select-title">
        <header className="path-select__head">
          <h1 id="path-select-title" className="path-select__title">
            {t("onboarding.welcome.title")}
          </h1>
          <p className="path-select__sub">{t("onboarding.welcome.subtitle")}</p>
        </header>

        <div className="path-select__list entry-card" role="group" aria-label={t("onboarding.welcome.aria")}>
          <PathOption
            icon="process"
            title={t("onboarding.welcome.judge.title")}
            lead={t("onboarding.welcome.judge.lead")}
            onSelect={() => choose("judge", "/")}
          />
          <div className="path-select__rule" role="separator" />
          <PathOption
            icon="capture"
            title={t("onboarding.welcome.operator.title")}
            lead={t("onboarding.welcome.operator.lead")}
            onSelect={() => choose("operator", "/capture")}
          />
        </div>

        <button type="button" className="path-select__skip" onClick={() => choose("explorer", "/")}>
          {t("onboarding.welcome.explore")}
        </button>
      </section>
    </AuthLayout>
  );
}
