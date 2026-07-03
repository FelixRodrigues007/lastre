import { NavLink } from "react-router-dom";
import type { IconName } from "../ui/Icon";
import { Icon } from "../ui/Icon";
import "./nav-item.css";

type NavItemProps = {
  to: string;
  label: string;
  icon: IconName;
  end?: boolean;
  variant?: "sidebar" | "mobile";
  badge?: number;
  collapsed?: boolean;
};

export function NavItem({
  to,
  label,
  icon,
  end,
  variant = "sidebar",
  badge,
  collapsed = false,
}: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `nav-item nav-item--${variant}${isActive ? " nav-item--active" : ""}${collapsed ? " nav-item--collapsed" : ""}`
      }
    >
      <span className="nav-item__icon-wrap" aria-hidden="true">
        <Icon name={icon} size={variant === "mobile" ? 20 : 16} />
      </span>
      <span className="nav-item__label">{label}</span>
      {badge && badge > 0 ? (
        <span className="nav-item__badge" aria-label={`${badge} pending`}>
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </NavLink>
  );
}
