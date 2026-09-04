import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useTheme } from "../../hooks/useTheme";
import type { Locale } from "../../lib/locale";
import { SETTINGS_NAV } from "../../lib/navigation";
import { Icon } from "../ui/Icon";
import "./app-preferences-menu.css";

export function SidebarPreferencesMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { locale, setLocale, t } = useLocaleContext();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const languageGroupId = useId();
  const themeGroupId = useId();

  useEffect(() => {
    if (collapsed) setOpen(false);
  }, [collapsed]);

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
      className={`app-prefs app-prefs--sidebar${open ? " app-prefs--open" : ""}${collapsed ? " app-prefs--collapsed" : ""}`}
    >
      <button
        type="button"
        className="app-prefs__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("prefs.menu")}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="settings" size={16} />
        {collapsed ? null : <span className="app-prefs__trigger-label">{t("prefs.menu")}</span>}
        {collapsed ? null : <Icon name="chevron-down" size={12} className="app-prefs__chevron" />}
      </button>

      {open ? (
        <div className="app-prefs__menu" role="menu" aria-label={t("prefs.menu")}>
          <div className="app-prefs__section">
            <span className="app-prefs__field-label" id={languageGroupId}>
              {t("prefs.language")}
            </span>
            <div className="app-prefs__segment app-prefs__segment--langs" role="group" aria-labelledby={languageGroupId}>
              {(["en", "pt", "es"] as Locale[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={locale === value}
                  className={`app-prefs__segment-btn${locale === value ? " app-prefs__segment-btn--active" : ""}`}
                  aria-label={
                    value === "en"
                      ? t("prefs.lang.en")
                      : value === "pt"
                        ? t("prefs.lang.pt")
                        : t("prefs.lang.es")
                  }
                  onClick={() => setLocale(value)}
                >
                  {value.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="app-prefs__section">
            <span className="app-prefs__field-label" id={themeGroupId}>
              {t("prefs.theme")}
            </span>
            <div className="app-prefs__segment" role="group" aria-labelledby={themeGroupId}>
              {(["dark", "light"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  role="menuitemradio"
                  aria-checked={theme === value}
                  className={`app-prefs__segment-btn${theme === value ? " app-prefs__segment-btn--active" : ""}`}
                  onClick={() => setTheme(value)}
                >
                  {value === "dark" ? t("prefs.theme.dark") : t("prefs.theme.light")}
                </button>
              ))}
            </div>
          </div>

          <div className="app-prefs__divider" role="separator" />

          <Link
            className="app-prefs__settings"
            to={SETTINGS_NAV.to}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <Icon name={SETTINGS_NAV.icon} size={15} />
            <span>{t(SETTINGS_NAV.labelKey)}</span>
            <Icon name="chevron-right" size={13} className="app-prefs__settings-arrow" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
