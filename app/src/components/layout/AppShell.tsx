import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { CaptureWizardProvider } from "../../context/CaptureWizardContext";
import { SealMark } from "../ui/SealMark";
import { useLocaleContext } from "../../context/LocaleContext";
import { usePageReveal } from "../../hooks/usePageReveal";
import { resolveScreenId } from "../../lib/screenMotion";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { CaptureWizardTrigger } from "../capture/CaptureWizardTrigger";
import { OnboardingChecklist } from "../onboarding/OnboardingChecklist";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette, useCommandPalette } from "./CommandPalette";
import { MobileTabBar } from "./MobileTabBar";
import { CSPR_PACKAGE_URL } from "../../lib/navigation";
import "./app-shell.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { t } = useLocaleContext();
  const { open, setOpen, close } = useCommandPalette();
  const location = useLocation();
  const screen = resolveScreenId(location.pathname);
  const { collapsed: sidebarCollapsed } = useSidebarCollapsed();
  const revealed = usePageReveal();

  return (
    <CaptureWizardProvider>
      <div
        className="app-shell"
        data-sidebar-collapsed={sidebarCollapsed ? "true" : "false"}
      >
        <div className="app-layout">
          <AppSidebar onOpenSearch={() => setOpen(true)} />

          <div className="app-content">
            <header className="app-topbar">
              <NavLink className="app-topbar__brand" to="/" aria-label={`${t("brand.console")} — home`}>
                <SealMark size={24} live />
                <span className="app-topbar__wordmark">{t("brand.console")}</span>
              </NavLink>
              <div className="app-topbar__end">
                <CaptureWizardTrigger className="app-topbar__capture route-cta route-cta--ghost" icon>
                  {t("capture.wizard.trigger")}
                </CaptureWizardTrigger>
                <button
                  type="button"
                  className="app-topbar__cmd"
                  onClick={() => setOpen(true)}
                  aria-label="Open command palette"
                >
                  <kbd>⌘K</kbd>
                </button>
              <a
                className="app-topbar__status"
                href={CSPR_PACKAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="app-topbar__dot" aria-hidden="true" />
                {t("status.testnet")}
              </a>
            </div>
          </header>

          <main
            className={`app-main${revealed ? " app-main--revealed" : ""}`}
            data-screen={screen}
          >
            <div className="shell">{children}</div>
          </main>

          <MobileTabBar />
          </div>
        </div>

        <CommandPalette open={open} onClose={close} />
        <OnboardingChecklist asFloating />
      </div>
    </CaptureWizardProvider>
  );
}
