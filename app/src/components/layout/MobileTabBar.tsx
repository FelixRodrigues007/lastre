import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Home", end: true as const },
  { to: "/lots", label: "Lots", end: false as const },
  { to: "/process", label: "Run", end: false as const },
  { to: "/audit", label: "Audit", end: false as const },
  { to: "/escalations", label: "Queue", end: false as const },
] as const;

export function MobileTabBar() {
  return (
    <nav className="mobile-tab-bar" aria-label="Mobile">
      {TABS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `mobile-tab-bar__link${isActive ? " mobile-tab-bar__link--active" : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
