import { MOBILE_NAV } from "../../lib/navigation";
import { useLocaleContext } from "../../context/LocaleContext";
import { NavItem } from "./NavItem";

export function MobileTabBar() {
  const { t } = useLocaleContext();

  return (
    <nav className="mobile-tab-bar" aria-label="Mobile">
      {MOBILE_NAV.map((item) => (
        <NavItem
          key={item.to}
          to={item.to}
          label={t(item.mobileLabelKey ?? item.labelKey)}
          icon={item.icon}
          end={item.end}
          variant="mobile"
        />
      ))}
    </nav>
  );
}
