import { useLocaleContext } from "../../context/LocaleContext";
import type { Locale } from "../../lib/locale";

export function AuthLangToggle() {
  const { locale, setLocale } = useLocaleContext();

  return (
    <div className="auth-lang" role="group" aria-label="Language">
      {(["pt", "en"] as Locale[]).map((value, index) => (
        <span key={value} style={{ display: "contents" }}>
          {index > 0 ? <span className="auth-lang__sep" aria-hidden="true">·</span> : null}
          <button
            type="button"
            className={`auth-lang__btn${locale === value ? " auth-lang__btn--active" : ""}`}
            aria-pressed={locale === value}
            onClick={() => setLocale(value)}
          >
            {value === "pt" ? "PT" : "EN"}
          </button>
        </span>
      ))}
    </div>
  );
}
