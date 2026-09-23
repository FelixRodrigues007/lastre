import { useId, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import "./lastre-primitives.css";

export type NoticeTone = "info" | "success" | "warning" | "danger";
type InlineNoticeProps = {
  title: string;
  children: ReactNode;
  tone?: NoticeTone;
  action?: ReactNode;
  /** Enable only for a newly delivered result, not static page instructions. */
  live?: boolean;
};
const icons: Record<NoticeTone, IconName> = {
  info: "network",
  success: "check",
  warning: "escalations",
  danger: "escalations",
};

export function InlineNotice({
  title,
  children,
  tone = "info",
  action,
  live = false,
}: InlineNoticeProps) {
  const id = useId();
  return (
    <section
      className={`lastre-notice lastre-notice--${tone}`}
      aria-labelledby={id}
      role={live ? (tone === "danger" ? "alert" : "status") : undefined}
    >
      <Icon name={icons[tone]} size={18} />
      <div className="lastre-notice__body">
        <h4 id={id}>{title}</h4>
        <div>{children}</div>
        {action && <div className="lastre-notice__action">{action}</div>}
      </div>
    </section>
  );
}
