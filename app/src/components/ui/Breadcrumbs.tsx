import { Link } from "react-router-dom";
import "./breadcrumbs.css";

export type Crumb = {
  label: string;
  to?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span
            key={`${item.label}-${index}`}
            className={`breadcrumbs__item${isLast ? " breadcrumbs__item--current" : ""}`}
          >
            {index > 0 ? <span className="breadcrumbs__sep" aria-hidden="true">/</span> : null}
            {item.to && !isLast ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          </span>
        );
      })}
    </nav>
  );
}
