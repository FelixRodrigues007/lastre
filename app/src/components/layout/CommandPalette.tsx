import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../ui/Icon";
import { COMMAND_ITEMS } from "../../lib/commands";
import "./command-palette.css";

type CommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMAND_ITEMS;
    return COMMAND_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.includes(q)) ||
        item.path.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[activeIndex]) {
        e.preventDefault();
        navigate(filtered[activeIndex].path);
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, filtered, activeIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="command-palette__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="command-palette" role="dialog" aria-label="Command palette">
        <div className="command-palette__input-wrap">
          <Icon name="search" size={16} />
          <input
            className="command-palette__input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to page or action…"
            autoFocus
            aria-label="Command search"
          />
          <span className="command-palette__hint">esc</span>
        </div>
        <ul className="command-palette__list" role="listbox">
          {filtered.length === 0 ? (
            <li className="command-palette__empty">No matches</li>
          ) : (
            filtered.map((item, index) => (
              <li key={item.path}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`command-palette__item${index === activeIndex ? " command-palette__item--active" : ""}`}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                >
                  <span className="command-palette__item-label">{item.label}</span>
                  <span className="command-palette__item-meta">{item.path}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return { open, setOpen, close: () => setOpen(false) };
}
