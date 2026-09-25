import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
import "./dropdown-menu.css";
import "./drawer.css";

/**
 * Side sheet on the native modal <dialog>: focus containment, inert page and
 * Escape come from the platform; focus returns to the element that opened it.
 * Header and footer stay put while the body scrolls. On phones it rises from
 * the bottom. Closing plays the exit motion before the dialog leaves the top layer.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  eyebrow,
  leading,
  headerActions,
  footer,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  /** Icon or avatar before the title. */
  leading?: ReactNode;
  /** Controls next to the close button, e.g. "open full page". */
  headerActions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const id = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!dialog?.open) {
      setMounted(false);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      dialog.close();
      setMounted(false);
      return;
    }
    setClosing(true);
    const timer = window.setTimeout(() => {
      dialog.close();
      setClosing(false);
      setMounted(false);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (mounted && open && dialog && !dialog.open) {
      opener.current = document.activeElement;
      dialog.showModal();
    }
  }, [mounted, open]);

  useEffect(() => {
    if (mounted) return;
    const target = opener.current;
    if (target instanceof HTMLElement && target.isConnected) target.focus();
    opener.current = null;
  }, [mounted]);

  if (!mounted) return null;
  return (
    <dialog
      ref={ref}
      className={`lastre-drawer lastre-drawer--${size}`}
      data-closing={closing || undefined}
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
      <div className="lastre-drawer__panel">
        <header className="lastre-drawer__head">
          {leading && <div className="lastre-drawer__leading">{leading}</div>}
          <div className="lastre-drawer__titles">
            {eyebrow && <p className="lastre-drawer__eyebrow">{eyebrow}</p>}
            <h2 id={`${id}-title`}>{title}</h2>
            {description && <p id={`${id}-desc`}>{description}</p>}
          </div>
          <div className="lastre-drawer__head-actions">
            {headerActions}
            <button
              type="button"
              className="lastre-menu-trigger"
              aria-label="Fechar painel"
              onClick={onClose}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </header>
        <div className="lastre-drawer__body">{children}</div>
        {footer && <footer className="lastre-drawer__foot">{footer}</footer>}
      </div>
    </dialog>
  );
}
