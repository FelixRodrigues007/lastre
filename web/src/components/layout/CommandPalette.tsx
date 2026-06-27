import { useCallback, useEffect, useRef, useState } from "react";
import {
  APP_URL,
  CSPR_PACKAGE_URL,
  DOCS_URL,
  GITHUB_URL,
  DEMO_TERMINAL_CMD,
} from "../../site-links";
import { useSite } from "../../context/SiteContext";
import { trackEvent } from "../../lib/analytics";
import "./command-palette.css";

type Action = { id: string; label: string; href: string; external?: boolean };

const ACTIONS: Action[] = [
  { id: "demo", label: "Try tamper demo", href: "#proof" },
  { id: "app", label: "Open app console", href: APP_URL },
  { id: "how-seal", label: "Jump to Seal step", href: "#how/seal" },
  { id: "docs", label: "Read documentation", href: DOCS_URL, external: true },
  { id: "github", label: "GitHub repository", href: GITHUB_URL, external: true },
  { id: "explorer", label: "Casper Testnet explorer", href: CSPR_PACKAGE_URL, external: true },
  { id: "terminal", label: `Run ${DEMO_TERMINAL_CMD}`, href: "#terminal" },
];

/** Keyboard-only palette — no visible chrome (⌘K). */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useSite();

  const filtered = ACTIONS.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase()),
  );

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

  const run = (action: Action) => {
    close();
    if (action.id === "terminal") {
      navigator.clipboard.writeText(DEMO_TERMINAL_CMD);
      toast(DEMO_TERMINAL_CMD);
      return;
    }
    trackEvent("cta_click", { target: action.id });
    if (action.external) {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      document.querySelector(action.href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="cmd-overlay" role="dialog" aria-modal="true" aria-label="Quick actions">
      <button type="button" className="cmd-overlay__backdrop" onClick={close} aria-label="Close" />
      <div className="cmd-panel">
        <input
          ref={inputRef}
          className="cmd-panel__input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search actions"
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
