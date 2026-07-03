import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useTheme } from "../../hooks/useTheme";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getSettings, updateSettings } from "../../lib/api";
import type { Locale } from "../../lib/locale";
import { CSPR_PACKAGE_URL } from "../../lib/navigation";
import type { DeciderMode } from "../../lib/types";
import { CopyBlock } from "../ui/CopyBlock";
import { Icon } from "../ui/Icon";
import { StatePanel } from "../layout/StatePanel";
import "../../routes/settings.css";
import "./settings-modal.css";

type SettingsSection = "general" | "decider" | "limits" | "persistence";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

const SECTIONS: SettingsSection[] = [
  "general",
  "decider",
  "limits",
  "persistence",
];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { locale, setLocale, t } = useLocaleContext();
  const { theme, setTheme } = useTheme();
  const settings = useAsyncData(getSettings);

  const [section, setSection] = useState<SettingsSection>("general");
  const [decider, setDecider] = useState<DeciderMode>("rule");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const languageGroupId = useId();
  const themeGroupId = useId();
  const titleId = useId();

  useEffect(() => {
    if (settings.data) {
      setDecider(settings.data.decider);
    }
  }, [settings.data]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  async function saveDecider(next: DeciderMode) {
    setDecider(next);
    setSaving(true);
    setSaveMessage(null);
    try {
      await updateSettings(next);
      setSaveMessage(t("settings.decider.saved"));
      settings.reload();
    } catch {
      setSaveMessage(t("settings.decider.saveError"));
    } finally {
      setSaving(false);
    }
  }

  const limits = settings.data?.limits;

  return createPortal(
    <div
      className="settings-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="settings-modal__header">
          <div className="settings-modal__intro">
            <h2 className="settings-modal__title" id={titleId}>
              {t("nav.settings")}
            </h2>
            <p className="settings-modal__lead">{t("settings.lead")}</p>
          </div>
          <button
            type="button"
            className="settings-modal__close"
            onClick={onClose}
            aria-label={t("settings.close")}
          >
            ×
          </button>
        </header>

        <div className="settings-modal__shell">
          <nav
            className="settings-modal__nav"
            aria-label={t("settings.sections")}
          >
            {SECTIONS.map((id) => (
              <button
                key={id}
                type="button"
                className={`settings-modal__nav-item${section === id ? " settings-modal__nav-item--active" : ""}`}
                aria-current={section === id ? "page" : undefined}
                onClick={() => setSection(id)}
              >
                <Icon name={SECTION_ICONS[id]} size={15} />
                <span>{t(`settings.tab.${id}`)}</span>
              </button>
            ))}
          </nav>

          <div className="settings-modal__content">
            <StatePanel
              loading={settings.loading}
              error={settings.error}
              skeleton="detail"
              onRetry={settings.reload}
            >
              {settings.data ? (
                <>
                  <div className="settings-status-row">
                    <span
                      className={`settings-pill${settings.data.llmConfigured ? " settings-pill--valid" : ""}`}
                    >
                      {t("settings.status.llm")}{" "}
                      {settings.data.llmConfigured
                        ? t("settings.status.connected")
                        : t("settings.status.fallback")}
                    </span>
                    <span className="settings-pill">
                      {t("settings.status.decider")}:{" "}
                      {decider === "rule"
                        ? t("settings.decider.rule")
                        : t("settings.decider.llm")}
                    </span>
                    <span className="settings-pill">
                      {t("settings.status.persistence")}:{" "}
                      {settings.data.persistence}
                    </span>
                  </div>

                  {section === "general" ? (
                    <div className="settings-modal__sections">
                      <section className="settings-modal__card">
                        <h3 className="settings-modal__card-title">
                          {t("prefs.language")}
                        </h3>
                        <p className="settings-modal__card-hint">
                          {t("settings.language.hint")}
                        </p>
                        <div
                          className="settings-modal__segment"
                          role="radiogroup"
                          aria-labelledby={languageGroupId}
                        >
                          <span className="sr-only" id={languageGroupId}>
                            {t("prefs.language")}
                          </span>
                          {(["en", "pt"] as Locale[]).map((value) => (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={locale === value}
                              className={`settings-modal__segment-btn${locale === value ? " settings-modal__segment-btn--active" : ""}`}
                              onClick={() => setLocale(value)}
                            >
                              {value === "en"
                                ? t("prefs.lang.en")
                                : t("prefs.lang.pt")}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="settings-modal__card">
                        <h3 className="settings-modal__card-title">
                          {t("prefs.theme")}
                        </h3>
                        <p className="settings-modal__card-hint">
                          {t("settings.theme.hint")}
                        </p>
                        <div
                          className="settings-modal__segment"
                          role="radiogroup"
                          aria-labelledby={themeGroupId}
                        >
                          <span className="sr-only" id={themeGroupId}>
                            {t("prefs.theme")}
                          </span>
                          {(["dark", "light"] as const).map((value) => (
                            <button
                              key={value}
                              type="button"
                              role="radio"
                              aria-checked={theme === value}
                              className={`settings-modal__segment-btn${theme === value ? " settings-modal__segment-btn--active" : ""}`}
                              onClick={() => setTheme(value)}
                            >
                              {value === "dark"
                                ? t("prefs.theme.dark")
                                : t("prefs.theme.light")}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section
                        className="settings-modal__guardrail"
                        role="note"
                      >
                        <span
                          className="settings-modal__guardrail-icon"
                          aria-hidden="true"
                        >
                          <Icon name="shield" size={14} />
                        </span>
                        <div className="settings-modal__guardrail-copy">
                          <span className="settings-modal__guardrail-chip">
                            {t("guardrail.demo")}
                          </span>
                          <p>{t("guardrail.text")}</p>
                          <p className="settings-modal__guardrail-meta">
                            {t("guardrail.session")}
                          </p>
                        </div>
                      </section>
                    </div>
                  ) : null}

                  {section === "decider" ? (
                    <section className="settings-modal__card">
                      <h3 className="settings-modal__card-title">
                        {t("settings.tab.decider")}
                      </h3>
                      <p className="settings-modal__card-hint">
                        {settings.data.llmConfigured
                          ? t("settings.decider.hintConnected")
                          : t("settings.decider.hintFallback")}
                      </p>
                      <div className="settings-card__row">
                        <label className="settings-radio">
                          <input
                            type="radio"
                            name="decider"
                            checked={decider === "rule"}
                            disabled={saving}
                            onChange={() => saveDecider("rule")}
                          />
                          {t("settings.decider.rule")}
                        </label>
                        <label className="settings-radio">
                          <input
                            type="radio"
                            name="decider"
                            checked={decider === "llm"}
                            disabled={saving}
                            onChange={() => saveDecider("llm")}
                          />
                          {t("settings.decider.llm")}
                        </label>
                      </div>
                      {saveMessage ? (
                        <p className="settings-card__status">{saveMessage}</p>
                      ) : null}
                    </section>
                  ) : null}

                  {section === "limits" ? (
                    <section className="settings-modal__card">
                      <h3 className="settings-modal__card-title">
                        {t("settings.limits.title")}
                      </h3>
                      <p className="settings-modal__card-hint">
                        {t("settings.limits.hint")}
                      </p>
                      {limits ? (
                        <table className="settings-limits-table">
                          <thead>
                            <tr>
                              <th scope="col">
                                {t("settings.limits.parameter")}
                              </th>
                              <th scope="col">{t("settings.limits.range")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{t("settings.limits.mineLat")}</td>
                              <td>
                                {limits.minePerimeter.minLat} …{" "}
                                {limits.minePerimeter.maxLat}
                              </td>
                            </tr>
                            <tr>
                              <td>{t("settings.limits.mineLng")}</td>
                              <td>
                                {limits.minePerimeter.minLng} …{" "}
                                {limits.minePerimeter.maxLng}
                              </td>
                            </tr>
                            <tr>
                              <td>{t("settings.limits.mass")}</td>
                              <td>
                                &gt; {limits.massGrams.minExclusive} · ≤{" "}
                                {limits.massGrams.maxInclusive.toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      ) : null}
                    </section>
                  ) : null}

                  {section === "persistence" ? (
                    <section className="settings-modal__card">
                      <h3 className="settings-modal__card-title">
                        {t("settings.tab.persistence")}
                      </h3>
                      <p className="settings-modal__card-hint">
                        {t("settings.persistence.hint")}
                      </p>
                      <CopyBlock
                        label={t("settings.persistence.packageLabel")}
                        value={CSPR_PACKAGE_URL}
                      />
                    </section>
                  ) : null}
                </>
              ) : null}
            </StatePanel>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

const SECTION_ICONS = {
  general: "settings",
  decider: "process",
  limits: "shield",
  persistence: "chain",
} as const;
