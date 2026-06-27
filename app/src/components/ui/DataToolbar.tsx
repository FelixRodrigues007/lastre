import type { ReactNode } from "react";
import "./data-toolbar.css";

type DataToolbarProps = {
  search?: ReactNode;
  filters?: ReactNode;
  actions?: ReactNode;
};

export function DataToolbar({ search, filters, actions }: DataToolbarProps) {
  return (
    <div className="data-toolbar">
      {search ? <div className="data-toolbar__search">{search}</div> : null}
      {filters ? <div className="data-toolbar__filters">{filters}</div> : null}
      {actions ? <div className="data-toolbar__actions">{actions}</div> : null}
    </div>
  );
}

type ViewToggleProps = {
  value: "table" | "cards";
  onChange: (value: "table" | "cards") => void;
};

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="view-toggle" role="group" aria-label="View mode">
      <button
        type="button"
        className={`view-toggle__btn${value === "table" ? " view-toggle__btn--active" : ""}`}
        onClick={() => onChange("table")}
      >
        Table
      </button>
      <button
        type="button"
        className={`view-toggle__btn${value === "cards" ? " view-toggle__btn--active" : ""}`}
        onClick={() => onChange("cards")}
      >
        Cards
      </button>
    </div>
  );
}
