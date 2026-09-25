import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "../../components/ui/Icon";

/**
 * Modal dialog on the native <dialog>: focus containment, Escape and inert
 * background come from the platform. Elevation 5, glass backdrop.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  tone = "default",
  size = "md",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  tone?: "default" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: IconName;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`assets-dialog assets-dialog--${size}`}
      data-tone={tone}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {open && (
        <div className="assets-dialog__panel">
          <header className="assets-dialog__head">
            {icon && (
              <span className="assets-dialog__icon" aria-hidden="true">
                <Icon name={icon} size={20} />
              </span>
            )}
            <div>
              <h2 id={`${id}-title`}>{title}</h2>
              {description && <p id={`${id}-desc`}>{description}</p>}
            </div>
            <button
              type="button"
              className="assets-icon-button"
              aria-label="Fechar"
              onClick={onClose}
            >
              <Icon name="close" size={16} />
            </button>
          </header>
          {children && <div className="assets-dialog__body">{children}</div>}
          {actions && <footer className="assets-dialog__foot">{actions}</footer>}
        </div>
      )}
    </dialog>
  );
}

/**
 * Disclosure popover (elevation 4). Closes on outside click, Escape and
 * item activation; focus returns to the trigger.
 */
export function Popover({
  label,
  trigger,
  children,
  align = "end",
  className = "",
  triggerClassName = "assets-icon-button",
  placement = "below",
}: {
  label: string;
  trigger: ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  className?: string;
  triggerClassName?: string;
  placement?: "below" | "above";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", down);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  const close = () => {
    setOpen(false);
    button.current?.focus();
  };
  return (
    <div className={`assets-popover ${className}`.trim()} ref={root}>
      <button
        ref={button}
        type="button"
        className={triggerClassName}
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        {trigger}
      </button>
      {open && (
        <div
          id={id}
          className="assets-popover__panel"
          data-align={align}
          data-placement={placement}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  icon,
  children,
  onClick,
  href,
  danger = false,
  hint,
}: {
  icon?: IconName;
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  hint?: ReactNode;
}) {
  const content = (
    <>
      {icon && <Icon name={icon} size={16} />}
      <span className="assets-menu__label">{children}</span>
      {hint && <span className="assets-menu__hint">{hint}</span>}
    </>
  );
  return href ? (
    <a className="assets-menu__item" href={href} data-danger={danger || undefined}>
      {content}
    </a>
  ) : (
    <button
      type="button"
      className="assets-menu__item"
      data-danger={danger || undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

type ToastTone = "success" | "info" | "warning" | "danger";
type ToastMessage = { id: number; message: string; tone: ToastTone };
const TOAST_EVENT = "lastre-assets-toast";

/** Short confirmation after an action. Content also lives on the page; the toast only echoes it. */
export function toast(message: string, tone: ToastTone = "success") {
  window.dispatchEvent(
    new CustomEvent<Omit<ToastMessage, "id">>(TOAST_EVENT, {
      detail: { message, tone },
    }),
  );
}

export function Toaster() {
  const [items, setItems] = useState<ToastMessage[]>([]);
  useEffect(() => {
    let seq = 0;
    const add = (event: Event) => {
      const detail = (event as CustomEvent<Omit<ToastMessage, "id">>).detail;
      const id = ++seq;
      setItems((list) => [...list.slice(-2), { ...detail, id }]);
      window.setTimeout(
        () => setItems((list) => list.filter((t) => t.id !== id)),
        4200,
      );
    };
    window.addEventListener(TOAST_EVENT, add);
    return () => window.removeEventListener(TOAST_EVENT, add);
  }, []);
  return (
    <div className="assets-toaster" aria-live="polite" aria-atomic="false">
      {items.map((t) => (
        <div key={t.id} className="assets-toast" data-tone={t.tone}>
          <Icon
            name={t.tone === "success" ? "check" : t.tone === "info" ? "info" : "escalations"}
            size={16}
          />
          <span>{t.message}</span>
          <button
            type="button"
            aria-label="Fechar aviso"
            onClick={() => setItems((list) => list.filter((x) => x.id !== t.id))}
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * File drop area around a real, labelled file input. Keyboard and screen
 * readers use the input; pointer users can also drop files on the area.
 */
export function Dropzone({
  label,
  accept,
  onFile,
  hint,
  fileName,
  disabled,
}: {
  label: string;
  accept?: string;
  onFile: (file: File | null) => void;
  hint?: ReactNode;
  fileName?: string;
  disabled?: boolean;
}) {
  const [over, setOver] = useState(false);
  const id = useId();
  return (
    <div
      className="assets-dropzone"
      data-over={over || undefined}
      data-filled={fileName ? true : undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFile(e.dataTransfer.files[0] ?? null);
      }}
    >
      <span className="assets-dropzone__icon" aria-hidden="true">
        <Icon name={fileName ? "file" : "upload"} size={20} />
      </span>
      <div className="assets-dropzone__copy">
        <label htmlFor={id}>{label}</label>
        <p>
          {fileName ? (
            <strong>{fileName}</strong>
          ) : (
            <>
              Arraste um arquivo ou <span className="assets-link">selecione</span>
            </>
          )}
        </p>
        {hint && <p className="assets-dropzone__hint">{hint}</p>}
      </div>
      <input
        id={id}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
