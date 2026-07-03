import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../ui/Icon";
import "./overview-dashboard-card.css";

type OverviewDashboardCardProps = {
  title: string;
  subtitle?: string;
  linkTo?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
};

export function OverviewDashboardCard({
  title,
  subtitle,
  linkTo,
  linkLabel,
  children,
  className = "",
}: OverviewDashboardCardProps) {
  return (
    <section className={`overview-card ${className}`.trim()} aria-label={title}>
      <header className="overview-card__head">
        <div className="overview-card__titles">
          <h2 className="overview-card__title">{title}</h2>
          {subtitle ? <p className="overview-card__subtitle">{subtitle}</p> : null}
        </div>
        {linkTo ? (
          <Link
            className="overview-card__link"
            to={linkTo}
            aria-label={linkLabel ?? title}
          >
            <Icon name="external" size={16} />
          </Link>
        ) : null}
      </header>
      <div className="overview-card__body">{children}</div>
    </section>
  );
}
