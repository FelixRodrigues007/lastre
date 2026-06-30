import { useCallback, useEffect, useRef, useState } from "react";
import {
  APP_URL,
  APP_URL_IS_EXTERNAL,
  CSPR_PACKAGE_URL,
  DOCS_URL,
  GITHUB_URL,
  DEMO_TERMINAL_CMD,
} from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { trackEvent } from "../../lib/analytics";
import "./command-palette.css";

const ACTION_HREFS: Record<string, { href: string; external?: boolean }> = {
  demo: { href: "#proof" },
  app: { href: APP_URL, external: APP_URL_IS_EXTERNAL },
  "how-seal": { href: "#how/seal" },
  docs: { href: DOCS_URL, external: true },
  github: { href: GITHUB_URL, external: true },
  explorer: { href: CSPR_PACKAGE_URL, external: true },
  terminal: { href: "#terminal" },
};

/** Keyboard-only palette — no visible chrome (⌘K). */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast, content } = useSite();
  const c = content.cmd;

  const actions = c.actions.map((action) => ({
    ...action,
    ...ACTION_HREFS[action.id],
  }));

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        trackEvent("cmd_palette");
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const run = (action: (typeof actions)[number]) => {
    close();
    if (action.id === "terminal") {
      navigator.clipboard.writeText(DEMO_TERMINAL_CMD);
      toast(DEMO_TERMINAL_CMD);
      return;
    }
    trackEvent("cta_click", { target: action.id });
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else if (action.href.startsWith("#")) {
      document.querySelector(action.href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Non-anchor, same-origin route (e.g. "/app" dev fallback). Navigating via
      // querySelector would throw on "/..." selectors, so go to the URL instead.
      window.location.assign(action.href);
    }
  };

  return (
    <div className="cmd-overlay" role="dialog" aria-modal="true" aria-label={c.ariaLabel}>
      <button type="button" className="cmd-overlay__backdrop" onClick={close} aria-label={c.close} />
      <div className="cmd-panel">
        <input
          ref={inputRef}
          className="cmd-panel__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={c.search}
          aria-label={c.searchAria}
        />
        <ul className="cmd-panel__list">
          {filtered.map((action) => (
            <li key={action.id}>
              <button type="button" className="cmd-panel__item" onClick={() => run(action)}>
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
