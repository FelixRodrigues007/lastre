import {
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Icon, type IconName } from "./Icon";
import "./tabs.css";

export type TabItem<T extends string> = {
  id: T;
  label: string;
  /** Number shown after the label, e.g. items in that view. */
  count?: number;
  icon?: IconName;
  disabled?: boolean;
  /** Draws attention to the count (pending work). */
  attention?: boolean;
};

type TabsProps<T extends string> = {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** Panel content. Omit it when the tabs filter content rendered elsewhere. */
  children?: ReactNode;
  ariaLabel?: string;
  /**
   * `segmented` is the compact control; `underline` is page and section
   * navigation with a sliding indicator.
   */
  variant?: "segmented" | "underline";
  /** Id of an external panel when `children` is omitted. */
  panelId?: string;
  className?: string;
};

type TabIndicator = {
  width: number;
  x: number;
};

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  children,
  ariaLabel = "Sections",
  variant = "segmented",
  panelId,
  className = "",
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [indicator, setIndicator] = useState<TabIndicator>({ width: 0, x: 0 });
  const hasPanel = children !== undefined;
  // Callers often pass a fresh array; re-measure only when the tabs really change.
  const tabsKey = tabs.map((t) => `${t.id}:${t.label}:${t.count ?? ""}`).join("|");
  const controls = hasPanel ? `${id}-panel` : panelId;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const edges = () => {
      const more = list.scrollWidth - list.clientWidth;
      list.toggleAttribute("data-more-start", more > 1 && list.scrollLeft > 1);
      list.toggleAttribute("data-more-end", more > 1 && list.scrollLeft < more - 1);
    };
    const update = () => {
      edges();
      const activeTab = list.querySelector<HTMLButtonElement>(".tab--active");
      if (!activeTab) return;
      setIndicator({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    };

    update();
    const activeTab = list.querySelector<HTMLButtonElement>(".tab--active");
    if (activeTab && list.scrollWidth > list.clientWidth) {
      const left = activeTab.offsetLeft - 24;
      const right = activeTab.offsetLeft + activeTab.offsetWidth + 24;
      if (left < list.scrollLeft) list.scrollTo({ left, behavior: "smooth" });
      else if (right > list.scrollLeft + list.clientWidth)
        list.scrollTo({ left: right - list.clientWidth, behavior: "smooth" });
    }

    const observer = new ResizeObserver(update);
    observer.observe(list);
    window.addEventListener("resize", update);
    list.addEventListener("scroll", edges, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      list.removeEventListener("scroll", edges);
    };
  }, [active, tabsKey]);

  const indicatorStyle: CSSProperties = {
    width: indicator.width,
    transform: `translateX(${indicator.x}px)`,
  };
  const enabled = tabs.filter((tab) => !tab.disabled);

  return (
    <div className={`tabs-root tabs-root--${variant} ${className}`.trim()}>
      <div
        className={`tabs tabs--${variant}`}
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
      >
        <span
          className="tabs__indicator"
          aria-hidden="true"
          style={indicatorStyle}
          data-ready={indicator.width > 0 || undefined}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${id}-${tab.id}`}
            aria-controls={controls}
            tabIndex={active === tab.id ? 0 : -1}
            aria-selected={active === tab.id}
            disabled={tab.disabled}
            className={`tab${active === tab.id ? " tab--active" : ""}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const current = enabled.findIndex((item) => item.id === tab.id);
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? enabled.length - 1
                    : (current +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        enabled.length) %
                      enabled.length;
              const target = enabled[next];
              onChange(target.id);
              listRef.current
                ?.querySelector<HTMLButtonElement>(`[id="${id}-${target.id}"]`)
                ?.focus();
            }}
          >
            {tab.icon && <Icon name={tab.icon} size={15} className="tab__icon" />}
            <span className="tab__label" data-text={tab.label}>
              {tab.label}
            </span>
            {tab.count !== undefined && (
              <span className="tab__count" data-attention={tab.attention || undefined}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {hasPanel && (
        <div
          className="tabs-panel"
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-${active}`}
          tabIndex={0}
        >
          {children}
        </div>
      )}
    </div>
  );
}
