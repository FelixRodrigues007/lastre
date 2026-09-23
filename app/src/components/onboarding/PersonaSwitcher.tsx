import { SelectField } from "../ui/SelectField";
import { useNavigate } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useOnboarding } from "../../context/OnboardingContext";
import type { OnboardingPersona } from "../../lib/onboarding";
import "./persona-switcher.css";

const PERSONAS: OnboardingPersona[] = ["judge", "operator", "explorer"];

export function PersonaSwitcher() {
  const { t } = useLocaleContext();
  const { persona, setPersona } = useOnboarding();
  const navigate = useNavigate();

  if (!persona) return null;

  function handleChange(next: OnboardingPersona) {
    setPersona(next);
    if (next === "operator") navigate("/capture");
    else navigate("/");
  }

  return (
    <SelectField
      label={t("onboarding.persona.label")}
      className="persona-switcher"
      value={persona}
      onChange={(e) => handleChange(e.target.value as OnboardingPersona)}
      title={t("onboarding.persona.label")}
    >
      {PERSONAS.map((value) => (
        <option key={value} value={value}>
          {t(`onboarding.persona.${value}` as const)}
        </option>
      ))}
    </SelectField>
  );
}
