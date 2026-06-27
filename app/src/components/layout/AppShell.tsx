import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SealMark } from "../ui/SealMark";
import { useLocaleContext } from "../../context/LocaleContext";
import { AppPreferencesMenu } from "./AppPreferencesMenu";
import { AppSidebar } from "./AppSidebar";
import { GuardrailBanner } from "./GuardrailBanner";
import { MobileTabBar } from "./MobileTabBar";
import "./app-shell.css";

const CSPR_PACKAGE_URL =
  "https://testnet.cspr.live/contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { t } = useLocaleContext();

  return (
    <div className="app-shell">
      <div className="app-layout">
        <AppSidebar />

        <div className="app-content">
          <header className="app-topbar">
            <NavLink className="app-topbar__brand" to="/" aria-label={`${t("brand.console")} — home`}>
              <SealMark size={24} />
              <span className="app-topbar__wordmark">{t("brand.console")}</span>
            </NavLink>
            <div className="app-topbar__end">
              <AppPreferencesMenu variant="topbar" />
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

          <GuardrailBanner />

          <main className="app-main">
            <div className="shell">{children}</div>
          </main>

          <MobileTabBar />
        </div>
      </div>
    </div>
  );
}
