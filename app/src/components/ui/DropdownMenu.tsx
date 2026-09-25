import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { KitLink } from "./routing";
import { Icon, type IconName } from "./Icon";
import {
  FloatingPortal,
  createTypeahead,
  focusAfter,
  useDismiss,
  useFloating,
  type Placement,
} from "./floating";
import "./floating.css";
import "./dropdown-menu.css";

export type MenuEntry =
  | {
      type?: "item";
      id: string;
      label: string;
      icon?: IconName;
      description?: string;
      shortcut?: string;
      danger?: boolean;
      disabled?: boolean;
      /** Internal route. Rendered as a link so it opens in a new tab too. */
      href?: string;
      onSelect?: () => void;
    }
  | {
      type: "checkbox" | "radio";
      id: string;
      label: string;
      icon?: IconName;
      description?: string;
      checked: boolean;
      disabled?: boolean;
      onSelect: () => void;
      href?: never;
      shortcut?: never;
      danger?: never;
    }
  | { type: "separator"; id: string }
  | { type: "label"; id: string; label: string };

type Actionable = Exclude<MenuEntry, { type: "separator" } | { type: "label" }>;
const actionable = (e: MenuEntry): e is Actionable =>
  e.type !== "separator" && e.type !== "label";

/**
 * Menu button following the WAI-ARIA menu pattern: arrow keys, Home/End and
 * typeahead move focus; Enter or Space activates; Escape returns focus to the
 * trigger. Checkbox and radio entries keep the menu open.
 */
export function DropdownMenu({
  label,
  items,
  trigger,
  triggerClassName = "lastre-menu-trigger",
  showLabel = false,
  placement = "bottom-end",
  title,
  onOpenChange,
  minWidth,
}: {
  /** Accessible name of the trigger and the menu. */
  label: string;
  items: MenuEntry[];
  /** Trigger content. Defaults to the "more" glyph. */
  trigger?: ReactNode;
  triggerClassName?: string;
  /** Show `label` next to the trigger content. */
  showLabel?: boolean;
  placement?: Placement;
  /** Optional heading shown at the top of the menu. */
  title?: string;
  onOpenChange?: (open: boolean) => void;
  minWidth?: number;
}) {
  const [open, setOpenState] = useState(false);
  const [active, setActive] = useState(-1);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const typeahead = useMemo(createTypeahead, []);
  const enabled = items
    .map((e, i) => (actionable(e) && !e.disabled ? i : -1))
    .filter((i) => i >= 0);

  const setOpen = useCallback(
    (next: boolean, focusTrigger = false) => {
      setOpenState(next);
      onOpenChange?.(next);
      if (!next) {
        setActive(-1);
        if (focusTrigger) button.current?.focus();
      }
    },
    [onOpenChange],
  );
  const close = useCallback(() => setOpen(false), [setOpen]);
  const refs = useMemo(() => [button, menu], []);
  useDismiss(open, close, refs);
  useFloating(open, button, menu, { placement });

  useEffect(() => {
    if (!open || active < 0) return;
    menu.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.focus({ preventScroll: false });
  }, [open, active]);

  const openAt = (where: "first" | "last") => {
    setOpen(true);
    setActive(where === "first" ? enabled[0] ?? -1 : enabled.at(-1) ?? -1);
  };

  const move = (delta: number) => {
    const pos = enabled.indexOf(active);
    const next =
      enabled[(pos + delta + enabled.length) % enabled.length] ?? -1;
    setActive(next);
  };

  const activate = (entry: Actionable) => {
    if (entry.disabled) return;
    entry.onSelect?.();
    if (entry.type === "checkbox" || entry.type === "radio") return;
    setOpen(false, !entry.href);
  };

  const onMenuKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        move(-1);
        break;
      case "Home":
        e.preventDefault();
        setActive(enabled[0] ?? -1);
        break;
      case "End":
        e.preventDefault();
        setActive(enabled.at(-1) ?? -1);
        break;
      case "Escape":
        e.preventDefault();
        e.stopPropagation();
        setOpen(false, true);
        break;
      case "Tab":
        e.preventDefault();
        setOpen(false);
        focusAfter(button.current, e.shiftKey);
        break;
      default:
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && e.key !== " ") {
          const labels = items.map((it) =>
            actionable(it) && !it.disabled ? it.label : "",
          );
          const hit = typeahead(e.key, labels, active);
          if (hit >= 0) setActive(hit);
        }
    }
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${id}-menu` : undefined}
        aria-label={showLabel ? undefined : label}
        data-open={open || undefined}
        onClick={() => (open ? setOpen(false) : openAt("first"))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openAt("first");
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            openAt("last");
          }
        }}
      >
        {trigger ?? <Icon name="more" size={18} />}
        {showLabel && <span>{label}</span>}
      </button>
      {open && (
        <FloatingPortal anchor={button}>
          <div
            ref={menu}
            id={`${id}-menu`}
            role="menu"
            aria-label={label}
            className="lastre-layer lastre-menu"
            style={minWidth ? { minWidth } : undefined}
            onKeyDown={onMenuKey}
          >
            {title && <p className="lastre-layer-label">{title}</p>}
            {items.map((entry, index) => {
              if (entry.type === "separator")
                return <hr key={entry.id} role="separator" />;
              if (entry.type === "label")
                return (
                  <p key={entry.id} className="lastre-layer-label" role="presentation">
                    {entry.label}
                  </p>
                );
              const checkable = entry.type === "checkbox" || entry.type === "radio";
              const content = (
                <>
                  <span className="lastre-menu__icon" aria-hidden="true">
                    {checkable ? (
                      entry.checked ? (
                        <Icon name="check" size={16} />
                      ) : null
                    ) : entry.icon ? (
                      <Icon name={entry.icon} size={16} />
                    ) : null}
                  </span>
                  <span className="lastre-menu__text">
                    <span className="lastre-menu__name">{entry.label}</span>
                    {entry.description && (
                      <span className="lastre-menu__desc">{entry.description}</span>
                    )}
                  </span>
                  {checkable && entry.icon && (
                    <Icon name={entry.icon} size={15} className="lastre-menu__trail" />
                  )}
                  {!checkable && entry.shortcut && (
                    <kbd className="lastre-menu__kbd">{entry.shortcut}</kbd>
                  )}
                </>
              );
              const common = {
                "data-index": index,
                tabIndex: -1,
                className: "lastre-option lastre-menu__item",
                "data-active": active === index || undefined,
                "data-danger": (!checkable && entry.danger) || undefined,
                "aria-disabled": entry.disabled || undefined,
                onMouseEnter: () => !entry.disabled && setActive(index),
              };
              if (!checkable && entry.href && !entry.disabled)
                return (
                  <KitLink
                    key={entry.id}
                    to={entry.href}
                    role="menuitem"
                    {...common}
                    onClick={() => activate(entry)}
                  >
                    {content}
                  </KitLink>
                );
              return (
                <div
                  key={entry.id}
                  role={
                    entry.type === "checkbox"
                      ? "menuitemcheckbox"
                      : entry.type === "radio"
                        ? "menuitemradio"
                        : "menuitem"
                  }
                  aria-checked={checkable ? entry.checked : undefined}
                  {...common}
                  onClick={() => activate(entry)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activate(entry);
                    }
                  }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
