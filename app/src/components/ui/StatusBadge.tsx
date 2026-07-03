import "./status-badge.css";

export type StatusBadgeTone = "success" | "warning" | "info" | "danger" | "neutral";

/** ClickUp-style circle variants — all indicators are circles only. */
export type StatusCircleVariant = "empty" | "dashed" | "ring" | "filled";

type StatusBadgeProps = {
  label: string;
  tone: StatusBadgeTone;
  circle?: StatusCircleVariant;
  size?: "sm" | "md";
  className?: string;
};

export function StatusCircle({ variant }: { variant: StatusCircleVariant }) {
  const size = 14;
  const r = 5.25;
  const stroke = 1.65;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 14 14",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
  } as const;

  switch (variant) {
    case "empty":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r={r} stroke="currentColor" strokeWidth={stroke} opacity="0.55" />
        </svg>
      );
    case "dashed":
      return (
        <svg {...common}>
          <circle
            cx="7"
            cy="7"
            r={r}
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray="2.4 2.1"
            strokeLinecap="round"
          />
        </svg>
      );
    case "ring":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r={r} stroke="currentColor" strokeWidth={stroke} />
        </svg>
      );
    case "filled":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r={r} fill="currentColor" />
        </svg>
      );
    default:
      return null;
  }
}

type StatusIndicatorProps = {
  tone: StatusBadgeTone;
  circle: StatusCircleVariant;
  size?: "sm" | "md";
  className?: string;
};

/** Circle-only status marker — same visuals as StatusBadge without a label. */
export function StatusIndicator({
  tone,
  circle,
  size = "sm",
  className = "",
}: StatusIndicatorProps) {
  const classes = [
    "status-badge",
    "status-indicator",
    `status-badge--${tone}`,
    `status-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-tone={tone} aria-hidden="true">
      <span className="status-badge__circle">
        <StatusCircle variant={circle} />
      </span>
    </span>
  );
}

export function StatusBadge({
  label,
  tone,
  circle = "ring",
  size = "md",
  className = "",
}: StatusBadgeProps) {
  const classes = ["status-badge", `status-badge--${tone}`, `status-badge--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-tone={tone}>
      <span className="status-badge__circle">
        <StatusCircle variant={circle} />
      </span>
      <span className="status-badge__label">{label}</span>
    </span>
  );
}
