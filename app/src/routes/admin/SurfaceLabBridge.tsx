import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { surfaceLab, notifyLab } from "./surface-lab-runtime";
import { applyTheme } from "../../lib/theme";

export function SurfaceLabBridge() {
  const location = useLocation();
  useEffect(() => {
    if (!surfaceLab) return;
    document.documentElement.dataset.surfaceLab = "true";
    notifyLab("ready");
    let hadDialog = !!document.querySelector("dialog[open]");
    const observer = new MutationObserver(() => {
      const hasDialog = !!document.querySelector("dialog[open]");
      if (hadDialog && !hasDialog) notifyLab("closed");
      hadDialog = hasDialog;
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.channel !== "lastre-surface-lab"
      )
        return;
      if (
        event.data.type === "theme" &&
        ["dark", "light"].includes(event.data.detail)
      ) {
        applyTheme(event.data.detail);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") notifyLab("escape");
    };
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    if (surfaceLab) notifyLab("navigate", location.pathname + location.search);
  }, [location]);
  return null;
}
