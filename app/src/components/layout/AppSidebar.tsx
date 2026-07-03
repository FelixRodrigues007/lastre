import { NavLink } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useNavCounts } from "../../context/NavCountsContext";
import { useSidebarCollapsed } from "../../hooks/useSidebarCollapsed";
import { WORKSPACE_NAV } from "../../lib/navigation";
import { Icon } from "../ui/Icon";
import { SealMark } from "../ui/SealMark";
import { OnboardingChecklist } from "../onboarding/OnboardingChecklist";
import { NavItem } from "./NavItem";
import { SessionMenu } from "./SessionMenu";
import "./app-sidebar.css";

export { WORKSPACE_NAV as SIDEBAR_NAV } from "../../lib/navigation";

type AppSidebarProps = {
  onOpenSearch?: () => void;
};

export function AppSidebar({ onOpenSearch }: AppSidebarProps) {
  const { t } = useLocaleContext();
  const { auditTotal, escalations } = useNavCounts();
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <aside
      className={`app-sidebar${collapsed ? " app-sidebar--collapsed" : ""}`}
      aria-label="Console navigation"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className="app-sidebar__inner">
        <div className="app-sidebar__head">
          <div className="app-sidebar__brand-row">
            <NavLink
              className="app-sidebar__brand"
              to="/"
              aria-label={`${t("brand.name")} — home`}
            >
              <SealMark size={collapsed ? 24 : 28} live={!collapsed} />
              <span className="app-sidebar__name">{t("brand.name")}</span>
            </NavLink>
            <button
              type="button"
              className="app-sidebar__collapse"
              onClick={toggle}
              aria-expanded={!collapsed}
              aria-label={
                collapsed ? t("sidebar.expand") : t("sidebar.collapse")
              }
            >
              <Icon
                name={collapsed ? "chevron-right" : "panel-left"}
                size={16}
              />
            </button>
          </div>

          <div className="app-sidebar__divider" role="separator" />

          <button
            type="button"
            className="app-sidebar__search"
            onClick={onOpenSearch}
            aria-label={t("sidebar.search.label")}
          >
            <Icon name="search" size={15} className="app-sidebar__search-icon" />
            <span className="app-sidebar__search-placeholder">
              {t("sidebar.search.placeholder")}
            </span>
            <kbd className="app-sidebar__search-kbd">⌘K</kbd>
          </button>
        </div>

        <nav className="app-sidebar__nav" aria-label="Primary">
          <ul className="app-sidebar__list">
            {WORKSPACE_NAV.map((item) => (
              <li key={item.to}>
                <NavItem
                  to={item.to}
                  label={t(item.labelKey)}
                  icon={item.icon}
                  end={item.end}
                  collapsed={collapsed}
                  badge={
                    item.to === "/audit"
                      ? auditTotal
                      : item.to === "/escalations"
                        ? escalations
                        : undefined
                  }
                />
              </li>
            ))}
          </ul>
        </nav>

        <div className="app-sidebar__bottom">
          <OnboardingChecklist inSidebar />

          <footer className="app-sidebar__foot">
            <SessionMenu collapsed={collapsed} />
          </footer>
        </div>
      </div>
    </aside>
  );
}
