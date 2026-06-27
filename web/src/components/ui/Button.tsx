import type { ReactNode } from "react";
import "./button.css";

type ButtonVariant = "primary" | "secondary" | "tertiary";
type LegacyVariant = "ghost" | "inverse";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: ButtonVariant | LegacyVariant;
  size?: "md" | "sm";
  /** Cream primary / light secondary on dark panels */
  onDark?: boolean;
  external?: boolean;
  ariaLabel?: string;
  className?: string;
  onClick?: () => void;
};

function resolveVariant(variant: ButtonVariant | LegacyVariant): ButtonVariant {
  if (variant === "ghost") return "secondary";
  if (variant === "inverse") return "primary";
  return variant;
}

/** Consistent CTA — primary, secondary, or tertiary text action. */
export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  onDark,
  external,
  ariaLabel,
  className = "",
  onClick,
}: ButtonProps) {
  const resolved = resolveVariant(variant);
  const useDarkSurface = onDark ?? variant === "inverse";

  const classes = [
    "btn",
    `btn--${resolved}`,
    size === "sm" ? "btn--sm" : "",
    useDarkSurface ? "btn--on-dark" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      className={classes}
      href={href}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
