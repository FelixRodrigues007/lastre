import {
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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
}: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [indicator, setIndicator] = useState<TabIndicator>({ width: 0, x: 0 });

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const update = () => {
      const activeTab = list.querySelector<HTMLButtonElement>(".tab--active");
      if (!activeTab) return;
      setIndicator({
        x: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(list);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [active, tabs]);

  const indicatorStyle: CSSProperties = {
    width: indicator.width,
    transform: `translateX(${indicator.x}px)`,
  };

  return (
    <div className="tabs-root">
      <div className="tabs" ref={listRef} role="tablist" aria-label={ariaLabel}>
        <span
          className="tabs__indicator"
          aria-hidden="true"
          style={indicatorStyle}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${id}-${tab.id}`}
            aria-controls={`${id}-panel`}
            tabIndex={active === tab.id ? 0 : -1}
            aria-selected={active === tab.id}
            className={`tab${active === tab.id ? " tab--active" : ""}`}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => {
              if (
                !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              )
                return;
              event.preventDefault();
              const current = tabs.findIndex((item) => item.id === tab.id);
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? tabs.length - 1
                    : (current +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        tabs.length) %
                      tabs.length;
              onChange(tabs[next].id);
              listRef.current
                ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                [next]?.focus();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className="tabs-panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-${active}`}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
}
