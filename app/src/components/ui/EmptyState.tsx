import type { ReactNode } from "react";
import type { IconName } from "./Icon";
import { Icon } from "./Icon";
import "./empty-state.css";

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  hint: string;
  action?: ReactNode;
};

export function EmptyState({ icon = "audit", title, hint, action }: EmptyStateProps) {
  return (
    <div className="panel empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={18} />
      </span>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__hint">{hint}</p>
      {action}
    </div>
  );
}
