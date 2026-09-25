import {
  useEffect,
  useLayoutEffect,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

export type Placement =
  | "bottom-start"
  | "bottom-end"
  | "top-start"
  | "top-end"
  | "top"
  | "bottom";

const MARGIN = 8;

function containingOrigin(el: HTMLElement) {
  for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
    const cs = getComputedStyle(node);
    if (
      cs.transform !== "none" ||
      cs.perspective !== "none" ||
      cs.filter !== "none" ||
      (cs.backdropFilter && cs.backdropFilter !== "none") ||
      cs.containerType !== "normal" ||
      /paint|layout|strict|content/.test(cs.contain)
    ) {
      const r = node.getBoundingClientRect();
      return { x: r.left + node.clientLeft, y: r.top + node.clientTop };
    }
  }
  return { x: 0, y: 0 };
}

/**
 * Positions a fixed layer next to its anchor. It flips to the side with room,
 * stays inside the viewport and follows scroll and resize. The layer exposes
 * `data-side` so enter motion can grow from the anchor.
 */
export function useFloating(
  open: boolean,
  anchor: RefObject<HTMLElement | null>,
  layer: RefObject<HTMLElement | null>,
  {
    placement = "bottom-start",
    offset = 6,
    matchWidth = false,
  }: { placement?: Placement; offset?: number; matchWidth?: boolean } = {},
) {
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const a = anchor.current;
      const el = layer.current;
      if (!a || !el) return;
      const r = a.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      if (matchWidth) el.style.minWidth = `${r.width}px`;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const wantsTop = placement.startsWith("top");
      const below = vh - r.bottom - offset - MARGIN;
      const above = r.top - offset - MARGIN;
      const top = wantsTop ? above >= h || above > below : below < h && above > below;
      const y = top ? r.top - offset - Math.min(h, above) : r.bottom + offset;
      const align = placement.split("-")[1];
      let x =
        align === "end"
          ? r.right - w
          : align === "start"
            ? r.left
            : r.left + r.width / 2 - w / 2;
      x = Math.max(MARGIN, Math.min(x, vw - w - MARGIN));
      // A transformed or contained ancestor becomes the containing block of
      // fixed elements; convert viewport coordinates into its space.
      const origin = containingOrigin(el);
      el.style.maxHeight = `${Math.max(160, top ? above : below)}px`;
      el.style.left = `${Math.round(x - origin.x)}px`;
      el.style.top = `${Math.round(Math.max(MARGIN, y) - origin.y)}px`;
      el.dataset.side = top ? "top" : "bottom";
      el.dataset.align = align ?? "center";
    };
    place();
    const observer = new ResizeObserver(place);
    if (layer.current) observer.observe(layer.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, anchor, layer, placement, offset, matchWidth]);
}

/**
 * Renders a layer at the top of the stacking context the anchor lives in:
 * inside an open modal <dialog> (the top layer) or on the body. Rendering in
 * place would be clipped by scrolling tables and flush panels.
 */
export function FloatingPortal({
  anchor,
  children,
}: {
  anchor: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  // Layers mount only after their anchor is on screen, so the ref is set here.
  // Resolving the host during render lets positioning run in the same commit.
  const host =
    anchor.current?.closest<HTMLElement>("dialog[open]") ??
    (typeof document === "undefined" ? null : document.body);
  return host ? createPortal(children, host) : null;
}

/** Closes a layer on outside pointer down. Both the anchor and the layer count as inside. */
export function useDismiss(
  open: boolean,
  close: () => void,
  refs: RefObject<HTMLElement | null>[],
) {
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const target = e.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      close();
    };
    document.addEventListener("pointerdown", down, true);
    return () => document.removeEventListener("pointerdown", down, true);
  }, [open, close, refs]);
}

/** Letter typeahead shared by menus and listboxes. */
export function createTypeahead() {
  let buffer = "";
  let timer = 0;
  return (key: string, labels: string[], from: number) => {
    window.clearTimeout(timer);
    buffer += key.toLocaleLowerCase("pt-BR");
    timer = window.setTimeout(() => (buffer = ""), 600);
    const order = [
      ...labels.slice(from + 1).map((l, i) => [l, from + 1 + i] as const),
      ...labels.slice(0, from + 1).map((l, i) => [l, i] as const),
    ];
    return (
      order.find(([l]) =>
        l
          .toLocaleLowerCase("pt-BR")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .startsWith(buffer.normalize("NFD").replace(/\p{Diacritic}/gu, "")),
      )?.[1] ?? -1
    );
  };
}

const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tab from a portaled layer: continue the page's tab order from the trigger,
 * forward or backward, as if the layer had been inline after it.
 */
export function focusAfter(trigger: HTMLElement | null, backwards: boolean) {
  if (!trigger) return;
  const scope = trigger.closest<HTMLElement>("dialog[open]") ?? document.body;
  const items = [...scope.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) =>
      !el.closest(".lastre-layer") &&
      !el.closest("[inert]") &&
      el.getClientRects().length > 0 &&
      el.tabIndex >= 0,
  );
  const index = items.indexOf(trigger);
  const target = items[index + (backwards ? -1 : 1)] ?? trigger;
  target.focus();
}
