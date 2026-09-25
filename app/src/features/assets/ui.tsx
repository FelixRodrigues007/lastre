import {
  useEffect,
  useState,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import { Link } from "react-router-dom";
import { Icon, type IconName } from "../../components/ui/Icon";
import { InlineNotice } from "../../components/ui/InlineNotice";
import { SkeletonBlock } from "../../components/ui/Skeleton";
import "../../components/ui/surface.css";
import {
  StatusCircle,
  type StatusCircleVariant,
} from "../../components/ui/StatusBadge";

/** Page header: eyebrow, display title, lead and one leading action group. */
export function PageHead({
  eyebrow,
  title,
  description,
  action,
  back,
  meta,
  icon,
}: {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  back?: string;
  meta?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <header className="assets-page-head">
      {back && (
        <Link className="assets-back" to={back}>
          <Icon name="chevron-left" size={16} /> Voltar
        </Link>
      )}
      <div className="assets-page-head__row">
        {icon && <div className="assets-page-head__icon">{icon}</div>}
        <div className="assets-page-head__copy">
          {eyebrow && <p className="assets-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="assets-lead">{description}</p>}
          {meta && <div className="assets-page-head__meta">{meta}</div>}
        </div>
        {action && <div className="assets-actions">{action}</div>}
      </div>
    </header>
  );
}

export type BadgeTone = "neutral" | "good" | "warning" | "info" | "danger";
const badgeCircle: Record<BadgeTone, StatusCircleVariant> = {
  neutral: "empty",
  good: "filled",
  warning: "dashed",
  info: "ring",
  danger: "filled",
};
const badgeClass: Record<BadgeTone, string> = {
  neutral: "neutral",
  good: "success",
  warning: "warning",
  info: "info",
  danger: "danger",
};
/** DS status marker: color + circle + label, readable without color. */
export function Badge({
  children,
  tone = "neutral",
  circle,
  pill = true,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  circle?: StatusCircleVariant;
  pill?: boolean;
}) {
  return (
    <span
      className={`status-badge status-badge--sm status-badge--${badgeClass[tone]} assets-badge${pill ? " assets-badge--pill" : ""}`}
      data-tone={badgeClass[tone]}
    >
      <span className="status-badge__circle">
        <StatusCircle variant={circle ?? badgeCircle[tone]} />
      </span>
      <span className="status-badge__label">{children}</span>
    </span>
  );
}

export function Empty({
  title,
  description,
  action,
  icon = "lots",
  compact = false,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: IconName;
  compact?: boolean;
}) {
  return (
    <div className={`assets-empty${compact ? " assets-empty--compact" : ""}`}>
      <span className="assets-empty__icon" aria-hidden="true">
        <span className="assets-empty__orbit" />
        <Icon name={icon} size={compact ? 20 : 24} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="assets-empty__action">{action}</div>}
    </div>
  );
}

/** Result feedback. Uses the DS InlineNotice so tone, icon and live region stay consistent. */
export function Notice({
  children,
  error = false,
  title,
  tone,
  action,
}: {
  children?: ReactNode;
  error?: boolean;
  title?: string;
  tone?: "info" | "success" | "warning" | "danger";
  action?: ReactNode;
}) {
  const resolved = tone ?? (error ? "danger" : "success");
  return (
    <div
      className="assets-notice"
      role={error ? "alert" : "status"}
      aria-live={error ? "assertive" : "polite"}
    >
      <InlineNotice
        tone={resolved}
        title={
          title ??
          (resolved === "danger"
            ? "Não foi possível concluir"
            : resolved === "warning"
              ? "Atenção"
              : resolved === "info"
                ? "Informação"
                : "Tudo certo")
        }
        action={action}
      >
        {children}
      </InlineNotice>
    </div>
  );
}

export function Loading({ label = "Carregando sua organização…" }) {
  return (
    <div
      className="assets-loading"
      role="status"
      aria-label="Carregando Lastre Assets"
    >
      <div className="assets-loading__head">
        <SkeletonBlock width="7rem" height="0.625rem" />
        <SkeletonBlock width="18rem" height="2rem" />
        <SkeletonBlock width="26rem" height="0.875rem" />
      </div>
      <div className="assets-loading__grid">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} height="6.5rem" />
        ))}
      </div>
      <SkeletonBlock height="14rem" />
      <p>{label}</p>
    </div>
  );
}

export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const run = async (action: () => Promise<unknown>, message = "") => {
    if (busy) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(message);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir. Tente novamente.",
      );
    } finally {
      setBusy(false);
    }
  };
  const reset = () => {
    setError("");
    setSuccess("");
  };
  return { busy, error, success, setError, reset, run };
}

export function Feedback({
  error,
  success,
}: {
  error: string;
  success?: string;
}) {
  return (
    <>
      {error && <Notice error>{error}</Notice>}
      {success && <Notice>{success}</Notice>}
    </>
  );
}

export function useUnsaved(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const navigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>(
        "a[href]",
      );
      if (!link || link.target === "_blank" || link.hasAttribute("download"))
        return;
      const url = new URL(link.href);
      if (
        url.origin !== location.origin ||
        (url.pathname === location.pathname && url.search === location.search)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      window.dispatchEvent(
        new CustomEvent("lastre-assets-unsaved-navigation", {
          detail: url.pathname + url.search + url.hash,
        }),
      );
    };
    window.addEventListener("beforeunload", handler);
    document.addEventListener("click", navigation, true);
    return () => {
      window.removeEventListener("beforeunload", handler);
      document.removeEventListener("click", navigation, true);
    };
  }, [dirty]);
}

/**
 * Labelled control using the DS field anatomy. The child keeps its own
 * props; Field only wires id, label, hint and error, and applies the DS
 * input class to native inputs, selects and textareas.
 */
export function Field({
  label,
  children,
  hint,
  error,
  wide = false,
  required = false,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  wide?: boolean;
  required?: boolean;
}) {
  const id = useId();
  const description = error || hint;
  const control = isValidElement<{
    id?: string;
    className?: string;
    type?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>(children)
    ? cloneElement(children, {
        id,
        "aria-labelledby": `${id}-label`,
        "aria-describedby": description ? `${id}-hint` : undefined,
        "aria-invalid": error ? true : undefined,
        className:
          children.props.className ??
          (typeof children.type === "string" &&
          ["input", "select", "textarea"].includes(children.type) &&
          !["checkbox", "radio", "file"].includes(children.props.type ?? "")
            ? "lastre-field__input"
            : undefined),
      })
    : children;
  return (
    <div className={`lastre-field assets-field${wide ? " assets-field--wide" : ""}`}>
      <label htmlFor={id} id={`${id}-label`}>
        {label}
        {required && (
          <span className="assets-required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {control}
      {description && (
        <p
          id={`${id}-hint`}
          className={error ? "lastre-field__error" : "lastre-field__hint"}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Matte surface with optional header. Elevation expresses hierarchy only. */
export function Panel({
  title,
  eyebrow,
  description,
  action,
  children,
  className = "",
  elevation = 1,
  as: Element = "section",
  flush = false,
}: {
  title?: ReactNode;
  eyebrow?: string;
  description?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  elevation?: 0 | 1 | 2 | 3;
  as?: "section" | "div" | "article" | "aside";
  flush?: boolean;
}) {
  return (
    <Element
      className={`lastre-surface assets-panel${flush ? " assets-panel--flush" : ""} ${className}`.trim()}
      data-elevation={elevation}
      data-material="matte"
    >
      {(title || action || eyebrow) && (
        <header className="assets-panel__head">
          <div>
            {eyebrow && <p className="assets-eyebrow">{eyebrow}</p>}
            {title && <h2>{title}</h2>}
            {description && <p className="assets-panel__desc">{description}</p>}
          </div>
          {action && <div className="assets-panel__action">{action}</div>}
        </header>
      )}
      {children}
    </Element>
  );
}

/** Label/value pairs, Attio-style. Values may be any node. */
export function Properties({
  items,
  columns = 1,
}: {
  items: { label: string; value: ReactNode; icon?: IconName; mono?: boolean }[];
  columns?: 1 | 2;
}) {
  return (
    <dl className={`assets-props assets-props--${columns}`}>
      {items.map((item) => (
        <div key={item.label} className="assets-props__row">
          <dt>
            {item.icon && <Icon name={item.icon} size={15} />}
            {item.label}
          </dt>
          <dd className={item.mono ? "assets-mono" : undefined}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((s) => s[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  );
}

/** Deterministic hue from the chart palette so people keep their color. */
export function Avatar({
  name,
  size = "md",
  square = false,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  square?: boolean;
}) {
  const hue =
    [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 6;
  return (
    <span
      className={`assets-avatar assets-avatar--${size}${square ? " assets-avatar--square" : ""}`}
      data-hue={hue}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Progress({
  value,
  max,
  label,
  tone = "info",
  showValue = true,
}: {
  value: number;
  max: number;
  label: string;
  tone?: "info" | "success" | "warning";
  showValue?: boolean;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const done = max > 0 && value >= max;
  return (
    <div className="assets-progress" data-tone={done ? "success" : tone}>
      <div className="assets-progress__label">
        <span>{label}</span>
        {showValue && (
          <span className="assets-mono">
            {value}/{max}
          </span>
        )}
      </div>
      <div
        className="assets-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export type TimelineItem = {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  icon?: IconName;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  body?: ReactNode;
};
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="assets-timeline">
      {items.map((item) => (
        <li key={item.id} data-tone={item.tone ?? "neutral"}>
          <span className="assets-timeline__dot" aria-hidden="true">
            {item.icon ? <Icon name={item.icon} size={13} /> : null}
          </span>
          <div className="assets-timeline__body">
            <p className="assets-timeline__title">{item.title}</p>
            {item.meta && <p className="assets-timeline__meta">{item.meta}</p>}
            {item.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

export type Step = {
  label: string;
  description?: ReactNode;
  state: "done" | "current" | "todo";
};
/** Vertical checklist stepper (Mercury-style). */
export function Stepper({ steps, label }: { steps: Step[]; label: string }) {
  return (
    <ol className="assets-stepper" aria-label={label}>
      {steps.map((step, i) => (
        <li
          key={step.label}
          data-state={step.state}
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <span className="assets-stepper__mark" aria-hidden="true">
            {step.state === "done" ? <Icon name="check" size={14} /> : i + 1}
          </span>
          <div>
            <p className="assets-stepper__label">
              {step.label}
              <span className="assets-sr-only">
                {step.state === "done"
                  ? " — concluído"
                  : step.state === "current"
                    ? " — em andamento"
                    : " — pendente"}
              </span>
            </p>
            {step.description && (
              <div className="assets-stepper__desc">{step.description}</div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Accessible switch built on a native checkbox so labels and forms keep working. */
export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="assets-switch">
      <div className="assets-switch__copy">
        <label htmlFor={id}>{label}</label>
        {description && <p id={`${id}-desc`}>{description}</p>}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        aria-describedby={description ? `${id}-desc` : undefined}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

/** Segmented control (radio semantics) — for small, exclusive choices. */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  hideLabel = true,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; icon?: IconName; iconOnly?: boolean }[];
  hideLabel?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className="assets-segmented">
      <legend className={hideLabel ? "assets-sr-only" : undefined}>
        {label}
      </legend>
      <div className="assets-segmented__track">
        {options.map((option) => (
          <label
            key={option.value}
            className={value === option.value ? "is-active" : undefined}
            title={option.iconOnly ? option.label : undefined}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.icon && <Icon name={option.icon} size={16} />}
            <span className={option.iconOnly ? "assets-sr-only" : undefined}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Icon tile that identifies an entity type. The gold tile is reserved for shared versions. */
export function Glyph({
  icon,
  tone = "info",
  size = "md",
}: {
  icon: IconName;
  tone?: "info" | "success" | "warning" | "neutral" | "gold";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      className={`assets-glyph assets-glyph--${size}`}
      data-tone={tone}
      aria-hidden="true"
    >
      <Icon name={icon} size={size === "lg" ? 24 : size === "sm" ? 15 : 19} />
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="assets-kbd">{children}</kbd>;
}

export const formatBytes = (size: number) =>
  size < 1024
    ? `${size} B`
    : size < 1024 * 1024
      ? `${(size / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} KB`
      : `${(size / 1024 / 1024).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(
    new Date(value),
  );
}
