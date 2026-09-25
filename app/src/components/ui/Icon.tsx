import type { SVGProps } from "react";

export type IconName =
  | "overview"
  | "capture"
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
  | "chevron-down"
  | "search"
  | "check"
  | "chevron-left"
  | "panel-left"
  | "lock"
  | "plus"
  | "close"
  | "bell"
  | "share"
  | "upload"
  | "users"
  | "user"
  | "clock"
  | "calendar"
  | "trash"
  | "eye"
  | "copy"
  | "archive"
  | "history"
  | "more"
  | "file"
  | "sun"
  | "moon"
  | "logout"
  | "filter"
  | "grid"
  | "list"
  | "arrow-right"
  | "send"
  | "pin"
  | "link"
  | "info"
  | "compare"
  | "inbox"
  | "sort"
  | "arrow-up"
  | "arrow-down"
  | "columns"
  | "minus"
  | "panel-right"
  | "rows";

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
          <rect
            x="2.5"
            y="2.5"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <rect
            x="11.5"
            y="2.5"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <rect
            x="2.5"
            y="11.5"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <rect
            x="11.5"
            y="11.5"
            width="6"
            height="6"
            rx="1.5"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
        </svg>
      );
    case "capture":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="5.5"
            width="13"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <circle
            cx="10"
            cy="10.5"
            r="2.75"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M7.5 5.5L8.75 3.5H11.25L12.5 5.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chain":
      return (
        <svg {...common}>
          <circle
            cx="5.5"
            cy="10"
            r="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <circle
            cx="14.5"
            cy="5.5"
            r="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <circle
            cx="14.5"
            cy="14.5"
            r="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M7.4 9.1L12.1 6.6M7.4 10.9L12.1 13.4"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
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
          <rect
            x="3.5"
            y="4"
            width="13"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
        </svg>
      );
    case "process":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="10"
            r="7"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
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
          <path
            d="M12 3.5V8H16.2"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinejoin="round"
          />
          <path
            d="M8 11H13M8 13.5H11"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
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
          <path
            d="M10 8.5V11.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <circle cx="10" cy="13.75" r="0.75" fill="currentColor" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="10"
            r="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
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
          <circle
            cx="10"
            cy="10"
            r="2"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <circle
            cx="10"
            cy="10"
            r="6.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M10 3.75V5.5M10 14.5V16.25M16.25 10H14.5M5.5 10H3.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </svg>
      );
    case "external":
      return (
        <svg {...common}>
          <path
            d="M11.5 3.5H16.5V8.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11L16.5 3.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
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
          <path
            d="M7.5 10L9.25 11.75L12.75 8.25"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <path
            d="M8 5L13 10L8 15"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "chevron-left":
      return (
        <svg {...common}>
          <path
            d="M12 5L7 10L12 15"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "panel-left":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="3.5"
            width="13"
            height="13"
            rx="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M8 3.5V16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d="M5.75 10L3.5 10"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d="M5.75 7.25L3.5 10L5.75 12.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path
            d="M10 3.5V12.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d="M6.5 9.5L10 13L13.5 9.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 16.5H15.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
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
          <path
            d="M15.5 4.5V7.5H12.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="10"
            r="6.75"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
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
          <path
            d="M5 8L10 13L15 8"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle
            cx="9"
            cy="9"
            r="4.75"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M12.75 12.75L16 16"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path
            d="M5.5 10.25L8.25 13L14.75 6.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect
            x="5.5"
            y="9"
            width="9"
            height="7"
            rx="1.5"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M7 9V6.75C7 5.23122 8.23122 4 9.75 4H10.25C11.7688 4 13 5.23122 13 6.75V9"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path
            d="M10 4.5V15.5M4.5 10H15.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path
            d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path
            d="M5.5 13.5V9C5.5 6.5 7.5 4.5 10 4.5C12.5 4.5 14.5 6.5 14.5 9V13.5L15.5 14.5H4.5L5.5 13.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 16.5H11.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <path
            d="M10 12V3.5M6.75 6.5L10 3.25L13.25 6.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 9H6C5.17 9 4.5 9.67 4.5 10.5V15C4.5 15.83 5.17 16.5 6 16.5H14C14.83 16.5 15.5 15.83 15.5 15V10.5C15.5 9.67 14.83 9 14 9H13"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "upload":
      return (
        <svg {...common}>
          <path
            d="M10 13V4M6.5 7.5L10 4L13.5 7.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 12.5V15C4.5 15.83 5.17 16.5 6 16.5H14C14.83 16.5 15.5 15.83 15.5 15V12.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle
            cx="8"
            cy="7.25"
            r="2.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 16C3.5 13.2 5.5 11.75 8 11.75C10.5 11.75 12.5 13.2 13 16"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 4.75C13.9 5 14.75 6 14.75 7.25C14.75 8.5 13.9 9.5 12.5 9.75M14.75 12C16 12.5 16.8 13.75 17 16"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="7"
            r="3"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 16.5C5.1 13.6 7.3 12 10 12C12.7 12 14.9 13.6 15.5 16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="10"
            r="6.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 6.5V10L12.5 11.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="4.5"
            width="13"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 8.5H16.5M7 3V6M13 3V6"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "trash":
      return (
        <svg {...common}>
          <path
            d="M4 6H16M8 6V4.5H12V6M5.5 6L6.25 15.5C6.3 16.05 6.75 16.5 7.3 16.5H12.7C13.25 16.5 13.7 16.05 13.75 15.5L14.5 6"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 9V13.5M11.5 9V13.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path
            d="M2.75 10C4.25 6.75 6.9 5 10 5C13.1 5 15.75 6.75 17.25 10C15.75 13.25 13.1 15 10 15C6.9 15 4.25 13.25 2.75 10Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="10"
            cy="10"
            r="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect
            x="7"
            y="7"
            width="9.5"
            height="9.5"
            rx="2"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 7V5.5C13 4.4 12.1 3.5 11 3.5H5.5C4.4 3.5 3.5 4.4 3.5 5.5V11C3.5 12.1 4.4 13 5.5 13H7"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "archive":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="4"
            width="14"
            height="3.5"
            rx="1"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.5 7.5V15C4.5 15.83 5.17 16.5 6 16.5H14C14.83 16.5 15.5 15.83 15.5 15V7.5M8.25 10.5H11.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "history":
      return (
        <svg {...common}>
          <path
            d="M3.75 10C3.75 13.45 6.55 16.25 10 16.25C13.45 16.25 16.25 13.45 16.25 10C16.25 6.55 13.45 3.75 10 3.75C7.6 3.75 5.55 5.1 4.5 7.1"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.25 3.75V7.25H7.75M10 7V10.25L12.25 11.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="5" cy="10" r="1.2" fill="currentColor" />
          <circle cx="10" cy="10" r="1.2" fill="currentColor" />
          <circle cx="15" cy="10" r="1.2" fill="currentColor" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path
            d="M6 3.5H11.5L15 7V16C15 16.28 14.78 16.5 14.5 16.5H6C5.72 16.5 5.5 16.28 5.5 16V4C5.5 3.72 5.72 3.5 6 3.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 3.5V7H15"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "sun":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="10"
            r="3"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 2.75V4.25M10 15.75V17.25M17.25 10H15.75M4.25 10H2.75M15.1 4.9L14.05 5.95M5.95 14.05L4.9 15.1M15.1 15.1L14.05 14.05M5.95 5.95L4.9 4.9"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "moon":
      return (
        <svg {...common}>
          <path
            d="M15.75 12.25C14.9 12.65 13.95 12.85 12.95 12.85C9.35 12.85 6.45 9.95 6.45 6.35C6.45 5.4 6.65 4.45 7.05 3.6C4.75 4.6 3.25 6.85 3.25 9.45C3.25 13.15 6.25 16.15 9.95 16.15C12.55 16.15 14.8 14.6 15.75 12.25Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "logout":
      return (
        <svg {...common}>
          <path
            d="M8 4.5H5.5C4.95 4.5 4.5 4.95 4.5 5.5V14.5C4.5 15.05 4.95 15.5 5.5 15.5H8M12 6.5L15.5 10L12 13.5M15.5 10H8.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path
            d="M3.5 5.5H16.5M6 10H14M8.5 14.5H11.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "grid":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="3.5"
            width="5.5"
            height="5.5"
            rx="1.25"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="11"
            y="3.5"
            width="5.5"
            height="5.5"
            rx="1.25"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="3.5"
            y="11"
            width="5.5"
            height="5.5"
            rx="1.25"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect
            x="11"
            y="11"
            width="5.5"
            height="5.5"
            rx="1.25"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path
            d="M7.5 5.5H16.5M7.5 10H16.5M7.5 14.5H16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="4" cy="5.5" r="0.9" fill="currentColor" />
          <circle cx="4" cy="10" r="0.9" fill="currentColor" />
          <circle cx="4" cy="14.5" r="0.9" fill="currentColor" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg {...common}>
          <path
            d="M4 10H16M11.5 5.5L16 10L11.5 14.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path
            d="M16.5 3.5L8.75 11.25M16.5 3.5L11.75 16.5L8.75 11.25L3.5 8.25L16.5 3.5Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path
            d="M10 16.75C10 16.75 15.25 12.25 15.25 8.25C15.25 5.35 12.9 3.25 10 3.25C7.1 3.25 4.75 5.35 4.75 8.25C4.75 12.25 10 16.75 10 16.75Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="10"
            cy="8.25"
            r="2"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "link":
      return (
        <svg {...common}>
          <path
            d="M8.5 11.5L11.5 8.5M9 6L10.25 4.75C11.6 3.4 13.85 3.4 15.25 4.75C16.6 6.15 16.6 8.4 15.25 9.75L14 11M11 14L9.75 15.25C8.4 16.6 6.15 16.6 4.75 15.25C3.4 13.85 3.4 11.6 4.75 10.25L6 9"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <circle
            cx="10"
            cy="10"
            r="6.75"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 9V13.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="6.6" r="0.9" fill="currentColor" />
        </svg>
      );
    case "compare":
      return (
        <svg {...common}>
          <path
            d="M7 3.5V16.5M13 3.5V16.5M3.5 7H7M13 13H16.5M3.5 13H7M13 7H16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "inbox":
      return (
        <svg {...common}>
          <path
            d="M3.5 11L5.25 4.5H14.75L16.5 11V15C16.5 15.83 15.83 16.5 15 16.5H5C4.17 16.5 3.5 15.83 3.5 15V11Z"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.5 11H7.25L8.25 12.75H11.75L12.75 11H16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "sort":
      return (
        <svg {...common}>
          <path
            d="M6.5 7.5L10 4L13.5 7.5M6.5 12.5L10 16L13.5 12.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "arrow-up":
      return (
        <svg {...common}>
          <path
            d="M10 15.5V4.5M5.5 9L10 4.5L14.5 9"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "arrow-down":
      return (
        <svg {...common}>
          <path
            d="M10 4.5V15.5M5.5 11L10 15.5L14.5 11"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "columns":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="3.5"
            width="13"
            height="13"
            rx="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M8 3.5V16.5M12 3.5V16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "minus":
      return (
        <svg {...common}>
          <path
            d="M5 10H15"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "panel-right":
      return (
        <svg {...common}>
          <rect
            x="3.5"
            y="3.5"
            width="13"
            height="13"
            rx="2.25"
            stroke="currentColor"
            strokeWidth={STROKE}
          />
          <path
            d="M12 3.5V16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "rows":
      return (
        <svg {...common}>
          <path
            d="M3.5 5.5H16.5M3.5 10H16.5M3.5 14.5H16.5"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return <svg {...common} />;
  }
}
