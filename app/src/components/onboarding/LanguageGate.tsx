import { useEffect, useState } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import { hasExplicitLocaleChoice, type Locale } from "../../lib/locale";
import "./language-gate.css";

const OPTIONS: { value: Locale; label: string; native: string }[] = [
  { value: "en", label: "English", native: "English" },
  { value: "pt", label: "Português", native: "Português" },
  { value: "es", label: "Español", native: "Español" },
];

/**
 * First-open language picker when the user lands on the console without a
 * language from the landing (?lang= or shared cookie).
 */
export function LanguageGate() {
  const { locale, setLocale } = useLocaleContext();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // URL lang / cookie from landing already marks an explicit choice in initLocale.
    if (hasExplicitLocaleChoice()) return;
    // Brief delay so the shell paints first.
    const id = window.setTimeout(() => setOpen(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  if (!open) return null;

  const pick = (value: Locale) => {
    setLocale(value);
    setOpen(false);
  };

  return (
    <div className="lang-gate" role="dialog" aria-modal="true" aria-labelledby="lang-gate-title">
      <div className="lang-gate__card">
        <p className="lang-gate__eyebrow">Lastre Console</p>
        <h2 id="lang-gate-title" className="lang-gate__title">
          Choose your language
        </h2>
        <p className="lang-gate__lead">
          Seleccione el idioma · Escolha o idioma · Choose language
        </p>
        <div className="lang-gate__options">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`lang-gate__btn${locale === opt.value ? " lang-gate__btn--active" : ""}`}
              onClick={() => pick(opt.value)}
            >
              {opt.native}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
