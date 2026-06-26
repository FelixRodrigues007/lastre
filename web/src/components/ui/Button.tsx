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
};

export function Button({
  children,
  href,
  variant = "primary",
  trailing,
  external,
}: ButtonProps) {
  return (
    <a
      className={`btn btn--${variant}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span className="btn__label">{children}</span>
      {trailing ? <span className="btn__trailing">{trailing}</span> : null}
    </a>
  );
}
