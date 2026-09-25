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
export function PageHead({
  eyebrow,
  title,
  description,
  action,
  back,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  back?: string;
}) {
  return (
    <header className="assets-page-head">
      {back && (
        <Link className="assets-back" to={back}>
          <Icon name="chevron-left" size={16} /> Voltar
        </Link>
      )}
      <div className="assets-page-head__row">
        <div>
          {eyebrow && <p className="assets-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          {description && <p className="assets-lead">{description}</p>}
        </div>
        {action && <div className="assets-actions">{action}</div>}
      </div>
    </header>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warning" | "info";
}) {
  return (
    <span className={`assets-badge assets-badge--${tone}`}>{children}</span>
  );
}
export function Empty({
  title,
  description,
  action,
  icon = "lots",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="assets-empty">
      <span className="assets-empty__icon">
        <Icon name={icon} size={25} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`assets-notice${error ? " assets-notice--error" : ""}`}
      role={error ? "alert" : "status"}
    >
      <Icon name={error ? "escalations" : "audit"} size={18} />
      <div>{children}</div>
    </div>
  );
}
export function Loading() {
  return (
    <div
      className="assets-loading"
      role="status"
      aria-label="Carregando Lastre Assets"
    >
      <span />
      <span />
      <span />
      <p>Carregando sua organização…</p>
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
  return { busy, error, success, setError, run };
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
export function Field({
  label,
  children,
  hint,
  wide = false,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  wide?: boolean;
}) {
  const id = useId();
  const control = isValidElement<{
    id?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  }>(children)
    ? cloneElement(children, {
        id,
        "aria-labelledby": `${id}-label`,
        "aria-describedby": hint ? `${id}-hint` : undefined,
      })
    : children;
  return (
    <label
      htmlFor={id}
      className={`assets-field${wide ? " assets-field--wide" : ""}`}
    >
      <span id={`${id}-label`}>{label}</span>
      {control}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  );
}
