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
import { Icon, type IconName } from "./Icon";
import { FloatingPortal, focusAfter, useDismiss, useFloating } from "./floating";
import "./floating.css";
import "./facet-filter.css";

export type FacetOption = {
  value: string;
  label: string;
  count?: number;
  icon?: IconName;
  leading?: ReactNode;
};

const fold = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/**
 * Faceted filter chip. Empty, it reads as an invitation ("+ Setor"); with a
 * selection it names the values and offers a separate clear button. The list
 * is a multi-select listbox with counts computed by the caller from the rows
 * that match the other active filters.
 */
export function FacetFilter({
  label,
  icon = "filter",
  options,
  selected,
  onChange,
  searchable,
}: {
  label: string;
  icon?: IconName;
  options: FacetOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  searchable?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Local copy so quick successive toggles compose even while the caller's
  // update (often a router transition) is still pending.
  const [picked, setPicked] = useState(selected);
  const key = selected.join("\u0000");
  useEffect(() => setPicked(selected), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const canSearch = searchable ?? options.length > 7;
  const visible = useMemo(
    () =>
      query
        ? options.filter((o) => fold(o.label).includes(fold(query)))
        : options,
    [options, query],
  );
  const close = useCallback((focus = false) => {
    setOpen(false);
    setQuery("");
    if (focus) trigger.current?.focus();
  }, []);
  const dismiss = useCallback(() => close(), [close]);
  const refs = useMemo(() => [trigger, layer], []);
  useDismiss(open, dismiss, refs);
  useFloating(open, trigger, layer, { placement: "bottom-start" });
  useEffect(() => {
    if (open) (canSearch ? search.current : list.current)?.focus();
  }, [open, canSearch]);
  useEffect(() => {
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const update = (next: string[]) => {
    setPicked(next);
    onChange(next);
  };
  const toggle = (value: string) =>
    update(
      picked.includes(value)
        ? picked.filter((v) => v !== value)
        : [...picked, value],
    );
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(visible.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || (e.key === " " && !canSearch)) {
      e.preventDefault();
      const option = visible[active];
      if (option) toggle(option.value);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      close();
      focusAfter(trigger.current, e.shiftKey);
    }
  };

  const names = options
    .filter((o) => picked.includes(o.value))
    .map((o) => o.label);
  const summary =
    names.length === 0
      ? null
      : names.length <= 2
        ? names.join(", ")
        : `${names.length} selecionados`;
  const activeId = visible[active] ? `${id}-opt-${active}` : undefined;

  return (
    <div className="lastre-facet" data-active={summary ? true : undefined}>
      <button
        ref={trigger}
        type="button"
        className="lastre-facet__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${id}-list` : undefined}
        aria-label={summary ? `${label}: ${summary}. Alterar filtro` : `Filtrar por ${label}`}
        onClick={() => (open ? close() : (setActive(0), setOpen(true)))}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive(0);
            setOpen(true);
          }
        }}
      >
        <Icon name={summary ? icon : "plus"} size={14} />
        <span className="lastre-facet__label">{label}</span>
        {summary && (
          <>
            <span className="lastre-facet__sep" aria-hidden="true" />
            <span className="lastre-facet__value">{summary}</span>
          </>
        )}
      </button>
      {summary && (
        <button
          type="button"
          className="lastre-facet__clear"
          aria-label={`Remover filtro ${label}`}
          onClick={() => {
            update([]);
            trigger.current?.focus();
          }}
        >
          <Icon name="close" size={13} />
        </button>
      )}
      {open && (
        <FloatingPortal anchor={trigger}>
          <div ref={layer} className="lastre-layer lastre-facet__layer" onKeyDown={onKey}>
            {canSearch && (
              <label className="lastre-layer-search">
                <Icon name="search" size={15} />
                <input
                  ref={search}
                  value={query}
                  placeholder={`Buscar ${label.toLocaleLowerCase("pt-BR")}…`}
                  aria-label={`Buscar opções de ${label}`}
                  role="combobox"
                  aria-expanded
                  aria-controls={`${id}-list`}
                  aria-activedescendant={activeId}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                />
              </label>
            )}
            <div
              ref={list}
              id={`${id}-list`}
              role="listbox"
              aria-multiselectable="true"
              aria-label={label}
              tabIndex={canSearch ? -1 : 0}
              aria-activedescendant={canSearch ? undefined : activeId}
              className="lastre-listbox"
            >
              {visible.length === 0 && (
                <p className="lastre-layer-empty">Nada encontrado.</p>
              )}
              {visible.map((option, index) => {
                const checked = picked.includes(option.value);
                return (
                  <div
                    key={option.value}
                    id={`${id}-opt-${index}`}
                    data-index={index}
                    role="option"
                    aria-selected={checked}
                    className="lastre-option lastre-facet__option"
                    data-active={active === index || undefined}
                    data-empty={option.count === 0 || undefined}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => toggle(option.value)}
                  >
                    <span className="lastre-checkmark" data-checked={checked || undefined} aria-hidden="true">
                      <Icon name="check" size={12} />
                    </span>
                    {option.leading ??
                      (option.icon && (
                        <Icon name={option.icon} size={15} className="lastre-facet__opt-icon" />
                      ))}
                    <span className="lastre-facet__opt-label">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="lastre-count">{option.count}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {picked.length > 0 && (
              <>
                <hr />
                <button
                  type="button"
                  className="lastre-option lastre-facet__reset"
                  onClick={() => {
                    update([]);
                    close(true);
                  }}
                >
                  Limpar {label.toLocaleLowerCase("pt-BR")}
                </button>
              </>
            )}
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
