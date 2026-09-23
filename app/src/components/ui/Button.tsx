import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./lastre-primitives.css";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  static?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  startIcon,
  endIcon,
  static: staticMotion = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-static={staticMotion || undefined}
      data-start-icon={Boolean(startIcon) || undefined}
      data-end-icon={Boolean(endIcon) || undefined}
      className={`lastre-button lastre-button--${variant} lastre-button--${size} ${className}`}
    >
      <span className="lastre-button__content">
        {startIcon && (
          <span className="lastre-button__icon" aria-hidden="true">
            {startIcon}
          </span>
        )}
        <span>{children}</span>
        {endIcon && (
          <span className="lastre-button__icon" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </span>
      {loading && <span className="lastre-spinner" aria-hidden="true" />}
    </button>
  );
}
