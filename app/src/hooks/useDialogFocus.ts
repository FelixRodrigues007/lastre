import { useEffect, useRef } from "react";

/** Keep keyboard focus in the open dialog and restore its trigger on close. */
export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (el) =>
          el.tabIndex >= 0 &&
          el.getClientRects().length > 0 &&
          getComputedStyle(el).visibility !== "hidden",
      );
    if (!dialog.contains(document.activeElement))
      (focusable()[0] ?? dialog).focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0] ?? dialog;
      const last = items[items.length - 1] ?? dialog;
      if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener("keydown", onKeyDown);
    return () => {
      dialog.removeEventListener("keydown", onKeyDown);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);
  return ref;
}
