import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { SealMark } from "../ui/SealMark";
import { GuardrailBanner } from "./GuardrailBanner";
import { MobileTabBar } from "./MobileTabBar";
import "./app-shell.css";

const NAV = [
  { to: "/", label: "Overview", end: true as const },
  { to: "/lots", label: "Lots", end: false as const },
  { to: "/process", label: "Process", end: false as const },
  { to: "/audit", label: "Audit", end: false as const },
  { to: "/escalations", label: "Escalations", end: false as const },
] as const;

const CSPR_PACKAGE_URL =
  "https://testnet.cspr.live/contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-nav">
        <div className="shell app-nav__inner">
          <NavLink className="app-nav__brand" to="/" aria-label="Lastro Console — home">
            <SealMark size={26} />
            <span className="app-nav__wordmark">
              Lastro <span className="app-nav__suffix">Console</span>
            </span>
          </NavLink>

          <nav className="app-nav__links" aria-label="Primary">
            {NAV.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `app-nav__link${isActive ? " app-nav__link--active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="app-nav__end">
            <NavLink
              className={({ isActive }) =>
                `app-nav__settings${isActive ? " app-nav__link--active" : ""}`
              }
              to="/settings"
            >
              Settings
            </NavLink>
            <a
              className="app-nav__status"
              href={CSPR_PACKAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="app-nav__dot" aria-hidden="true" />
              Casper Testnet
            </a>
          </div>
        </div>
      </header>

      <GuardrailBanner />

      <main className="app-main">
        <div className="shell">{children}</div>
      </main>

      <MobileTabBar />
    </div>
  );
}
