import "@design-system/assets/brand.css";

/** Exact Figma vector used as a mask so its geometry survives both themes. */
export function LastreWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="Lastre"
      className={`lastre-wordmark ${className}`}
    />
  );
}
