import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useOnboarding } from "../../context/OnboardingContext";
import { CSPR_PACKAGE_URL, SETTINGS_NAV } from "../../lib/navigation";
import type { OnboardingPersona } from "../../lib/onboarding";
import { Icon } from "../ui/Icon";
import { SettingsModal } from "./SettingsModal";
import "./session-menu.css";

const PERSONAS: OnboardingPersona[] = ["judge", "operator", "explorer"];

type SessionMenuProps = {
  collapsed?: boolean;
};

export function SessionMenu({ collapsed = false }: SessionMenuProps) {
  const { t } = useLocaleContext();
  const { user, persona, setPersona, checklistDismissed, restoreChecklist } = useOnboarding();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const personaGroupId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !settingsOpen) setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, settingsOpen]);

  useEffect(() => {
    if (collapsed) setOpen(false);
  }, [collapsed]);

  if (!persona || !user) return null;

  function handlePersonaChange(next: OnboardingPersona) {
    setPersona(next);
    if (next === "operator") navigate("/capture");
    else navigate("/");
  }

  return (
    <div
      ref={rootRef}
      className={`session-menu${open ? " session-menu--open" : ""}${collapsed ? " session-menu--collapsed" : ""}`}
    >
      <button
        type="button"
        className="session-menu__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={collapsed ? user.name : t("session.menu")}
        title={collapsed ? user.name : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <img
          className="session-menu__avatar"
          src={user.avatarUrl}
          alt=""
          width={32}
          height={32}
        />
        <span className="session-menu__trigger-copy">
          <span className="session-menu__trigger-title">{user.name}</span>
          <span className="session-menu__trigger-meta">{user.email}</span>
        </span>
        <Icon
          name="chevron-down"
          size={13}
          className="session-menu__chevron"
        />
      </button>

      {open ? (
        <div
          className="session-menu__panel"
          role="menu"
          aria-label={t("session.menu")}
        >
          <div className="session-menu__section">
            <span className="session-menu__field-label" id={personaGroupId}>
              {t("onboarding.persona.label")}
            </span>
            <div
              className="session-menu__persona-list"
              role="radiogroup"
              aria-labelledby={personaGroupId}
            >
              {PERSONAS.map((value) => {
                const active = persona === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={`session-menu__persona${active ? " session-menu__persona--active" : ""}`}
                    onClick={() => handlePersonaChange(value)}
                  >
                    <span
                      className="session-menu__persona-radio"
                      aria-hidden="true"
                    >
                      {active ? <Icon name="check" size={11} /> : null}
                    </span>
                    <span className="session-menu__persona-label">
                      {t(`onboarding.persona.${value}` as const)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="session-menu__divider" role="separator" />

          {checklistDismissed ? (
            <>
              <button
                type="button"
                className="session-menu__link"
                role="menuitem"
                onClick={() => {
                  restoreChecklist();
                  setOpen(false);
                }}
              >
                <span className="session-menu__link-icon" aria-hidden="true">
                  <Icon name="overview" size={13} />
                </span>
                <span className="session-menu__link-copy">
                  <span className="session-menu__link-title">
                    {t("onboarding.checklist.reopen")}
                  </span>
                </span>
              </button>
              <div className="session-menu__divider" role="separator" />
            </>
          ) : null}

          <div className="session-menu__links">
            <a
              className="session-menu__link"
              href={CSPR_PACKAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <span
                className="session-menu__link-icon session-menu__link-icon--live"
                aria-hidden="true"
              >
                <Icon name="network" size={13} />
              </span>
              <span className="session-menu__link-copy">
                <span className="session-menu__link-title">
                  {t("status.casper")}
                </span>
                <span className="session-menu__link-meta">
                  {t("status.livePackage")}
                </span>
              </span>
              <Icon
                name="external"
                size={12}
                className="session-menu__link-arrow"
              />
            </a>

            <button
              type="button"
              className="session-menu__link"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setSettingsOpen(true);
              }}
            >
              <span className="session-menu__link-icon" aria-hidden="true">
                <Icon name={SETTINGS_NAV.icon} size={13} />
              </span>
              <span className="session-menu__link-copy">
                <span className="session-menu__link-title">
                  {t(SETTINGS_NAV.labelKey)}
                </span>
              </span>
              <Icon
                name="chevron-right"
                size={12}
                className="session-menu__link-arrow"
              />
            </button>
          </div>
        </div>
      ) : null}

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
