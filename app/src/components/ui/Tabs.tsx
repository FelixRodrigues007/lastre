import type { ReactNode } from "react";
import "./tabs.css";

export type TabItem<T extends string> = {
  id: T;
  label: string;
};

type TabsProps<T extends string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  children: ReactNode;
  ariaLabel?: string;
};

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  children,
  ariaLabel = "Sections",
}: TabsProps<T>) {
  return (
    <div className="tabs-root">
      <div className="tabs" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={`tab${active === tab.id ? " tab--active" : ""}`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tabs-panel" role="tabpanel">
        {children}
      </div>
    </div>
  );
}
