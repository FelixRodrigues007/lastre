import "./ratio-bar.css";

export type RatioSegment = {
  value: number;
  label: string;
  tone: "valid" | "invalid" | "accent" | "muted";
};

type RatioBarProps = {
  segments: RatioSegment[];
  ariaLabel: string;
};

export function RatioBar({ segments, ariaLabel }: RatioBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const normalized = total > 0 ? segments : segments.map((s) => ({ ...s, value: 1 }));

  return (
    <div className="ratio-bar" role="img" aria-label={ariaLabel}>
      <div className="ratio-bar__track">
        {normalized.map((segment) => (
          <span
            key={segment.label}
            className={`ratio-bar__segment ratio-bar__segment--${segment.tone}`}
            style={{ flexGrow: Math.max(segment.value, 0) }}
            title={`${segment.label}: ${segment.value}`}
          />
        ))}
      </div>
      <div className="ratio-bar__legend">
        {segments.map((segment) => (
          <span key={segment.label} className="ratio-bar__legend-item">
            <span className={`ratio-bar__dot ratio-bar__dot--${segment.tone}`} aria-hidden="true" />
            {segment.label}
            <span className="ratio-bar__legend-value">{segment.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
