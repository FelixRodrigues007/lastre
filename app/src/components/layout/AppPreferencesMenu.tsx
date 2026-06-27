import { useEffect, useId, useRef, useState } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import { useTheme } from "../../hooks/useTheme";
import type { Locale } from "../../lib/locale";
import { Icon } from "../ui/Icon";
import "./app-preferences-menu.css";

type AppPreferencesMenuProps = {
  variant?: "topbar" | "sidebar";
};

export function AppPreferencesMenu({ variant = "topbar" }: AppPreferencesMenuProps) {
  const { locale, setLocale, t } = useLocaleContext();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const languageId = useId();
  const themeId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`app-prefs app-prefs--${variant}${open ? " app-prefs--open" : ""}`}
    >
      <button
        type="button"
        className="app-prefs__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("prefs.menu")}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="globe" size={15} />
        <span className="app-prefs__trigger-label">{locale.toUpperCase()}</span>
        <Icon name="chevron-down" size={12} className="app-prefs__chevron" />
      </button>

      {open ? (
        <div className="app-prefs__menu" role="menu" aria-label={t("prefs.menu")}>
          <label className="app-prefs__field" htmlFor={languageId}>
            <span className="app-prefs__field-label">{t("prefs.language")}</span>
            <select
              id={languageId}
              className="app-prefs__select"
              value={locale}
              onChange={(event) => {
                setLocale(event.target.value as Locale);
              }}
            >
              <option value="en">{t("prefs.lang.en")}</option>
              <option value="pt">{t("prefs.lang.pt")}</option>
            </select>
          </label>

          <label className="app-prefs__field" htmlFor={themeId}>
            <span className="app-prefs__field-label">{t("prefs.theme")}</span>
            <select
              id={themeId}
              className="app-prefs__select"
              value={theme}
              onChange={(event) => {
                setTheme(event.target.value as "dark" | "light");
              }}
            >
              <option value="dark">{t("prefs.theme.dark")}</option>
              <option value="light">{t("prefs.theme.light")}</option>
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
