import "./bar-chart.css";

export type BarChartItem = {
  label: string;
  value: number;
  tone?: "valid" | "invalid" | "accent" | "muted" | "seal";
  hint?: string;
};

type BarChartProps = {
  title: string;
  subtitle?: string;
  items: BarChartItem[];
  layout?: "vertical" | "horizontal";
  emptyLabel?: string;
};

export function BarChart({
  title,
  subtitle,
  items,
  layout = "vertical",
  emptyLabel = "No data yet",
}: BarChartProps) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className={`bar-chart bar-chart--${layout}`} aria-label={title}>
      <header className="bar-chart__head">
        <div>
          <p className="mono-label">{title}</p>
          {subtitle ? <p className="bar-chart__subtitle">{subtitle}</p> : null}
        </div>
        {total > 0 ? <span className="bar-chart__total">{total}</span> : null}
      </header>

      {total === 0 ? (
        <p className="bar-chart__empty">{emptyLabel}</p>
      ) : (
        <ul className="bar-chart__list">
          {items.map((item) => {
            const pct = Math.round((item.value / max) * 100);
            return (
              <li key={item.label} className="bar-chart__row">
                <div className="bar-chart__meta">
                  <span className="bar-chart__label">{item.label}</span>
                  <span className="bar-chart__value">{item.value}</span>
                </div>
                <div className="bar-chart__track" role="presentation">
                  <span
                    className={`bar-chart__fill bar-chart__fill--${item.tone ?? "muted"}`}
                    style={{ width: layout === "horizontal" ? `${pct}%` : undefined, height: layout === "vertical" ? `${pct}%` : undefined }}
                    title={item.hint ?? `${item.label}: ${item.value}`}
                  />
                </div>
                {item.hint ? <p className="bar-chart__hint">{item.hint}</p> : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
