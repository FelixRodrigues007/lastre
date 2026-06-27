import { NavLink } from "react-router-dom";
import { useLocaleContext } from "../../context/LocaleContext";
import { useNavCounts } from "../../context/NavCountsContext";
import { CSPR_PACKAGE_URL, WORKSPACE_NAV } from "../../lib/navigation";
import { Icon } from "../ui/Icon";
import { SealMark } from "../ui/SealMark";
import { SidebarPreferencesMenu } from "./AppPreferencesMenu";
import { NavItem } from "./NavItem";
import "./app-sidebar.css";

export { WORKSPACE_NAV as SIDEBAR_NAV } from "../../lib/navigation";

export function AppSidebar() {
  const { t } = useLocaleContext();
  const { auditTotal, escalations } = useNavCounts();

  return (
    <aside className="app-sidebar" aria-label="Console navigation">
      <div className="app-sidebar__inner">
        <NavLink className="app-sidebar__brand" to="/" aria-label={`${t("brand.console")} — home`}>
          <span className="app-sidebar__mark">
            <SealMark size={26} />
          </span>
          <span className="app-sidebar__wordmark">
            <span className="app-sidebar__name">{t("brand.name")}</span>
            <span className="app-sidebar__suffix">{t("nav.suffix")}</span>
          </span>
        </NavLink>

        <nav className="app-sidebar__nav" aria-label="Primary">
          <p className="app-sidebar__section">{t("nav.workspace")}</p>
          <ul className="app-sidebar__list">
            {WORKSPACE_NAV.map((item) => (
              <li key={item.to}>
                <NavItem
                  to={item.to}
                  label={t(item.labelKey)}
                  icon={item.icon}
                  end={item.end}
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

        <footer className="app-sidebar__foot">
          <SidebarPreferencesMenu />
          <a
            className="app-sidebar__status"
            href={CSPR_PACKAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="app-sidebar__status-icon" aria-hidden="true">
              <Icon name="network" size={15} />
            </span>
            <span className="app-sidebar__status-copy">
              <span className="app-sidebar__status-label">{t("status.casper")}</span>
              <span className="app-sidebar__status-meta">{t("status.livePackage")}</span>
            </span>
            <Icon name="external" size={13} className="app-sidebar__status-external" />
          </a>
        </footer>
      </div>
    </aside>
  );
}
