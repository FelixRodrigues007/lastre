import type { ReactNode } from "react";
import "./button.css";

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "ghost" | "inverse";
  /** trailing glyph, e.g. an arrow */
  trailing?: ReactNode;
  /** open in a new tab with safe rel attributes */
  external?: boolean;
  /** accessible name when label alone is insufficient */
  ariaLabel?: string;
};

export function Button({
  children,
  href,
  variant = "primary",
  trailing,
  external,
  ariaLabel,
}: ButtonProps) {
  return (
    <a
      className={`btn btn--${variant}`}
      href={href}
      {...(ariaLabel ? { "aria-label": ariaLabel } : {})}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="btn__label">{children}</span>
      {trailing ? <span className="btn__trailing">{trailing}</span> : null}
    </a>
  );
}
