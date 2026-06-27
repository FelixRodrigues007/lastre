import "./donut-stat.css";

type DonutStatProps = {
  /** 0–100 */
  percent: number;
  label: string;
  sublabel?: string;
  tone?: "valid" | "accent" | "neutral";
};

const R = 30;
const C = 2 * Math.PI * R;

export function DonutStat({ percent, label, sublabel, tone = "valid" }: DonutStatProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = C - (clamped / 100) * C;

  return (
    <div className="donut-stat">
      <div className="donut-stat__ring" aria-hidden="true">
        <svg viewBox="0 0 72 72">
          <circle className="donut-stat__ring-track" cx="36" cy="36" r={R} />
          <circle
            className={`donut-stat__ring-fill donut-stat__ring-fill--${tone}`}
            cx="36"
            cy="36"
            r={R}
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="donut-stat__center">{Math.round(clamped)}%</span>
      </div>
      <div className="donut-stat__copy">
        <p className="donut-stat__label">{label}</p>
        {sublabel ? <p className="donut-stat__sublabel">{sublabel}</p> : null}
      </div>
    </div>
  );
}
