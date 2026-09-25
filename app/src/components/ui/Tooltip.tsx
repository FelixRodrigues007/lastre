import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { FloatingPortal, useFloating, type Placement } from "./floating";
import "./floating.css";

type TriggerProps = {
  "aria-describedby"?: string;
  onPointerEnter?: (e: unknown) => void;
  onPointerLeave?: (e: unknown) => void;
  onFocus?: (e: unknown) => void;
  onBlur?: (e: unknown) => void;
};

/**
 * Short description for a control, shown on hover (after a delay) and on
 * keyboard focus. It describes, never names: icon-only buttons still need
 * their own aria-label. Escape hides it without moving focus.
 */
export function Tooltip({
  content,
  children,
  placement = "top",
  shortcut,
}: {
  content: ReactNode;
  children: ReactElement<TriggerProps>;
  placement?: Placement;
  shortcut?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const timer = useRef(0);
  const id = useId();
  useFloating(open, anchor, layer, { placement, offset: 8 });
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!isValidElement(children)) return children;
  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };
  const props = children.props;
  return (
    <span ref={anchor} className="lastre-tooltip-anchor">
      {cloneElement(children, {
        "aria-describedby": open
          ? [props["aria-describedby"], id].filter(Boolean).join(" ")
          : props["aria-describedby"],
        onPointerEnter: (e) => {
          props.onPointerEnter?.(e);
          show(450);
        },
        onPointerLeave: (e) => {
          props.onPointerLeave?.(e);
          hide();
        },
        onFocus: (e) => {
          props.onFocus?.(e);
          show(0);
        },
        onBlur: (e) => {
          props.onBlur?.(e);
          hide();
        },
      })}
      {open && (
        <FloatingPortal anchor={anchor}>
          <div ref={layer} id={id} role="tooltip" className="lastre-layer lastre-tooltip">
            {content}
            {shortcut && <kbd>{shortcut}</kbd>}
          </div>
        </FloatingPortal>
      )}
    </span>
  );
}
