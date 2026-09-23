import type { ReactNode } from "react";
import { Surface } from "./Surface";
import "./metric-card.css";

type MetricCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "valid" | "invalid" | "accent";
  size?: "md" | "lg";
  accent?: boolean;
};

export function MetricCard({
  label,
  value,
  hint,
  tone = "default",
  size = "md",
  accent = false,
}: MetricCardProps) {
  const valueClass =
    tone === "valid"
      ? "metric-card__value--valid"
      : tone === "invalid"
        ? "metric-card__value--invalid"
        : tone === "accent"
          ? "metric-card__value--accent"
          : "";

  return (
    <Surface
      as="article"
      elevation={1}
      className={[
        "metric-card",
        size === "lg" ? "metric-card--lg" : "",
        accent ? "metric-card--accent" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="metric-card__label">{label}</p>
      <p
        className={["metric-card__value", valueClass].filter(Boolean).join(" ")}
      >
        {value}
      </p>
      {hint ? <p className="metric-card__hint">{hint}</p> : null}
    </Surface>
  );
}
