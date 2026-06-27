import type { SVGProps } from "react";

export type IconName =
  | "overview"
  | "chain"
  | "lots"
  | "process"
  | "audit"
  | "escalations"
  | "settings"
  | "network"
  | "external"
  | "shield"
  | "chevron-right"
  | "download"
  | "refresh"
  | "globe"
  | "chevron-down";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const STROKE = 1.65;

export function Icon({ name, size = 18, className, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 20 20",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    "aria-hidden": true,
    ...props,
  } as const;

  switch (name) {
    case "overview":
      return (
        <svg {...common}>
          <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
          <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
          <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
          <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth={STROKE} />
        </svg>
      );
    case "chain":
      return (
        <svg {...common}>
          <circle cx="5.5" cy="10" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
          <circle cx="14.5" cy="5.5" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
          <circle cx="14.5" cy="14.5" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
          <path d="M7.4 9.1L12.1 6.6M7.4 10.9L12.1 13.4" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </svg>
      );
    case "lots":
      return (
        <svg {...common}>
          <path
            d="M3.5 6.5H16.5M3.5 10H16.5M3.5 13.5H11"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <rect x="3.5" y="4" width="13" height="12" rx="2" stroke="currentColor" strokeWidth={STROKE} />
        </svg>
      );
    case "process":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth={STROKE} />
          <path d="M8.5 7.2V12.8L12.8 10L8.5 7.2Z" fill="currentColor" />
        </svg>
      );
    case "audit":
      return (
        <svg {...common}>
          <path
            d="M6 3.5H12.2L16.5 7.8V16C16.5 16.2761 16.2761 16.5 16 16.5H6C5.72386 16.5 5.5 16.2761 5.5 16V4C5.5 3.72386 5.72386 3.5 6 3.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M12 3.5V8H16.2" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="round" />
          <path d="M8 11H13M8 13.5H11" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </svg>
      );
    case "escalations":
      return (
        <svg {...common}>
          <path
            d="M10 3.5L16.5 15.5H3.5L10 3.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M10 8.5V11.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          <circle cx="10" cy="13.75" r="0.75" fill="currentColor" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth={STROKE} />
          <path
            d="M10 3.2V4.8M10 15.2V16.8M16.8 10H15.2M4.8 10H3.2M14.95 5.05L13.83 6.17M6.17 13.83L5.05 14.95M14.95 14.95L13.83 13.83M6.17 6.17L5.05 5.05"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </svg>
      );
    case "network":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth={STROKE} />
          <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth={STROKE} />
          <path d="M10 3.75V5.5M10 14.5V16.25M16.25 10H14.5M5.5 10H3.75" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path d="M11.5 3.5H16.5V8.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 11L16.5 3.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          <path
            d="M13 3.5H7.5C5.84315 3.5 4.5 4.84315 4.5 6.5V13.5C4.5 15.1569 5.84315 16.5 7.5 16.5H14.5C16.1569 16.5 17.5 15.1569 17.5 13.5V8"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path
            d="M10 3.5L15.5 5.75V10.25C15.5 13.1 13.2 15.45 10 16.5C6.8 15.45 4.5 13.1 4.5 10.25V5.75L10 3.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path d="M7.5 10L9.25 11.75L12.75 8.25" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path d="M8 5L13 10L8 15" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M10 3.5V12.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
          <path d="M6.5 9.5L10 13L13.5 9.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 16.5H15.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...common}>
          <path
            d="M15.5 7.5C14.6 5.7 12.9 4.5 10 4.5C7.1 4.5 4.5 6.7 4.5 10C4.5 13.3 7.1 15.5 10 15.5C12.4 15.5 14.4 14 15.2 12"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path d="M15.5 4.5V7.5H12.5" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="6.75" stroke="currentColor" strokeWidth={STROKE} />
          <path
            d="M3.25 10H16.75M10 3.25C8.2 5.35 7.25 7.55 7.25 10C7.25 12.45 8.2 14.65 10 16.75C11.8 14.65 12.75 12.45 12.75 10C12.75 7.55 11.8 5.35 10 3.25Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return <svg {...common} />;
  }
}
