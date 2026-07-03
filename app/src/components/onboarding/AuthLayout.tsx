import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { SealMark } from "../ui/SealMark";
import { useLocaleContext } from "../../context/LocaleContext";
import { resolveScreenId } from "../../lib/screenMotion";
import { AuthLangToggle } from "./AuthLangToggle";
import { EntryVisual } from "./EntryVisual";
import "./auth-layout.css";

type AuthLayoutProps = {
  children: ReactNode;
  /** When true, form column is wider (path selection). */
  wide?: boolean;
};

export function AuthLayout({ children, wide }: AuthLayoutProps) {
  const { t } = useLocaleContext();
  const { pathname } = useLocation();
  const screen = resolveScreenId(pathname);

  return (
    <div className="entry-shell" data-screen={screen}>
      <div className="entry-shell__form">
        <header className="entry-shell__bar">
          <div className="entry-shell__brand">
            <SealMark size={28} label={t("brand.name")} />
            <span className="entry-shell__wordmark">{t("brand.name")}</span>
          </div>
          <AuthLangToggle />
        </header>

        <main className={`entry-shell__main${wide ? " entry-shell__main--wide" : ""}`}>
          {children}
        </main>
      </div>

      <EntryVisual />
    </div>
  );
}
