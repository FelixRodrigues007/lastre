type SealMarkProps = {
  size?: number;
  label?: string;
};

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
        stroke="var(--lastro-color-olive-300)"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path
        d="M80 47L108 63.5V96.5L80 113L52 96.5V63.5L80 47Z"
        stroke="var(--lastro-brand-seal)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M54 80H106"
        stroke="var(--lastro-text-primary)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M80 54V106"
        stroke="var(--lastro-text-primary)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="80" cy="80" r="9" fill="var(--lastro-brand-seal)" />
    </svg>
  );
}
