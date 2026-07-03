import { useLocaleContext } from "../../context/LocaleContext";
import { Icon } from "../ui/Icon";
import "./guardrail-banner.css";

export function GuardrailBanner() {
  const { t } = useLocaleContext();

  return (
    <aside className="guardrail" aria-label="Demo guardrails">
      <div className="guardrail__inner">
        <span className="guardrail__icon" aria-hidden="true">
          <Icon name="shield" size={15} />
        </span>
        <p className="guardrail__text">
          <span className="guardrail__chip">{t("guardrail.demo")}</span>
          {t("guardrail.text")}
          <span className="guardrail__session">{t("guardrail.session")}</span>
        </p>
      </div>
    </aside>
  );
}
