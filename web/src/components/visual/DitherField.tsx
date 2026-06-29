import "./dither-field.css";

type DitherVariant = "seal" | "valid" | "spectrum" | "overlay";

type DitherFieldProps = {
  /** Colour family for the gradient under the dot screen. */
  variant?: DitherVariant;
  className?: string;
};

/**
 * Caret-style dithered gradient panel: a brand-tinted colour gradient overlaid
 * with an ordered dot screen that thickens toward the shadow corner, faking a
 * halftone. Pure CSS — no WebGL context, so it composes freely behind any
 * number of panels without touching the GPU context budget.
 */
export function DitherField({ variant = "seal", className }: DitherFieldProps) {
  return (
    <div
      className={`dither-field dither-field--${variant}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
