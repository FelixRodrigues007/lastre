import { useLocaleContext } from "../../context/LocaleContext";
import type { Locale } from "../../lib/locale";
import "./auth-lang.css";

export function AuthLangToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleContext();

  return (
    <div
      className={className ? `auth-lang ${className}` : "auth-lang"}
      role="group"
      aria-label="Language"
    >
      {(["en", "pt", "es"] as Locale[]).map((value, index) => (
        <span key={value} style={{ display: "contents" }}>
          {index > 0 ? <span className="auth-lang__sep" aria-hidden="true">·</span> : null}
          <button
            type="button"
            className={`auth-lang__btn${locale === value ? " auth-lang__btn--active" : ""}`}
            aria-pressed={locale === value}
            onClick={() => setLocale(value)}
          >
            {value === "en" ? "EN" : value === "pt" ? "PT" : "ES"}
          </button>
        </span>
      ))}
    </div>
  );
}
