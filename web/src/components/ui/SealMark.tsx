type SealMarkProps = {
  size?: number;
  /** decorative by default; pass a label to expose it to assistive tech */
  label?: string;
};

/**
 * Lastro seal mark — a hexagonal proof seal anchored to a chain node,
 * recolored to the olive palette. Outer hex = the lot, inner hex = the
 * deterministic seal, center node = the on-chain anchor.
 */
export function SealMark({ size = 32, label }: SealMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      role={label ? "img" : "presentation"}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <path
        d="M80 24L128 52V108L80 136L32 108V52L80 24Z"
        stroke="var(--seal-mark-outer, var(--lastro-color-olive-300))"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M80 47L108 63.5V96.5L80 113L52 96.5V63.5L80 47Z"
        stroke="var(--seal-mark-accent, var(--lastro-brand-seal))"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M54 80H106"
        stroke="var(--seal-mark-lines, var(--lastro-text-primary))"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M80 54V106"
        stroke="var(--seal-mark-lines, var(--lastro-text-primary))"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle
        cx="80"
        cy="80"
        r="9"
        fill="var(--seal-mark-accent, var(--lastro-brand-seal))"
      />
    </svg>
  );
}
