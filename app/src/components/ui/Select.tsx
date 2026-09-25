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
import {
  FloatingPortal,
  createTypeahead,
  focusAfter,
  useDismiss,
  useFloating,
} from "./floating";
import "./floating.css";
import "./select.css";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  description?: string;
  icon?: IconName;
  /** Leading node, e.g. an avatar. Takes precedence over `icon`. */
  leading?: ReactNode;
  count?: number;
  disabled?: boolean;
  group?: string;
};

const fold = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/**
 * Single-choice select on the listbox pattern. The trigger keeps the look of
 * a field; the list supports icons, descriptions, counts, groups and search.
 * With `name` it submits through a hidden input, and `required` takes part in
 * native form validation. Accepts `id`, `aria-labelledby` and
 * `aria-describedby` so `Field` and `SelectField` wiring keeps working.
 */
export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  name,
  required,
  disabled,
  searchable,
  size = "md",
  variant = "field",
  prefix,
  id,
  className = "",
  "aria-label": ariaLabel,
  "aria-labelledby": labelledBy,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: {
  value: T | "";
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /** Defaults to on when there are more than eight options. */
  searchable?: boolean;
  size?: "sm" | "md";
  /** `field` for forms; `toolbar` for compact filters above data. */
  variant?: "field" | "toolbar";
  /** Short text shown before the value in toolbar variant, e.g. "Versão". */
  prefix?: ReactNode;
  id?: string;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const autoId = useId();
  const baseId = id ?? autoId;
  const trigger = useRef<HTMLButtonElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const typeahead = useMemo(createTypeahead, []);
  const canSearch = searchable ?? options.length > 8;
  const selected = options.find((o) => o.value === value);

  const visible = useMemo(
    () =>
      canSearch && query
        ? options.filter((o) =>
            fold(`${o.label} ${o.description ?? ""}`).includes(fold(query)),
          )
        : options,
    [options, query, canSearch],
  );

  const close = useCallback((focus = false) => {
    setOpen(false);
    setQuery("");
    setActive(-1);
    if (focus) trigger.current?.focus();
  }, []);
  const dismiss = useCallback(() => close(), [close]);
  const refs = useMemo(() => [trigger, layer], []);
  useDismiss(open, dismiss, refs);
  useFloating(open, trigger, layer, { placement: "bottom-start", matchWidth: true });

  useEffect(() => {
    if (!open) return;
    (canSearch ? search.current : list.current)?.focus();
  }, [open, canSearch]);
  useEffect(() => {
    if (!open || active < 0) return;
    list.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const enabled = visible
    .map((o, i) => (o.disabled ? -1 : i))
    .filter((i) => i >= 0);
  const show = () => {
    if (disabled) return;
    setOpen(true);
    const current = options.findIndex((o) => o.value === value);
    setActive(current >= 0 ? current : enabled[0] ?? -1);
  };
  const pick = (option: SelectOption<T>) => {
    if (option.disabled) return;
    if (option.value !== value) onChange(option.value);
    close(true);
  };
  const step = (delta: number) => {
    const pos = enabled.indexOf(active);
    setActive(
      pos < 0
        ? enabled[delta > 0 ? 0 : enabled.length - 1] ?? -1
        : enabled[Math.min(enabled.length - 1, Math.max(0, pos + delta))],
    );
  };

  const onLayerKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Home" && !canSearch) {
      e.preventDefault();
      setActive(enabled[0] ?? -1);
    } else if (e.key === "End" && !canSearch) {
      e.preventDefault();
      setActive(enabled.at(-1) ?? -1);
    } else if (e.key === "Enter" || (e.key === " " && !canSearch)) {
      e.preventDefault();
      const option = visible[active];
      if (option) pick(option);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      e.preventDefault();
      close();
      focusAfter(trigger.current, e.shiftKey);
    } else if (!canSearch && e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
      const hit = typeahead(
        e.key,
        visible.map((o) => (o.disabled ? "" : o.label)),
        active,
      );
      if (hit >= 0) setActive(hit);
    }
  };

  const activeId = active >= 0 ? `${baseId}-opt-${active}` : undefined;
  let lastGroup: string | undefined;

  return (
    <div
      className={`lastre-select lastre-select--${size} lastre-select--${variant} ${className}`.trim()}
      data-open={open || undefined}
      data-disabled={disabled || undefined}
    >
      <button
        ref={trigger}
        id={baseId}
        type="button"
        className="lastre-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${baseId}-list` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={
          labelledBy ? `${labelledBy} ${baseId}` : undefined
        }
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        disabled={disabled}
        onClick={() => (open ? close() : show())}
        onKeyDown={(e) => {
          if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
            e.preventDefault();
            show();
          } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
            // Typeahead on the closed trigger changes the value directly.
            const index = typeahead(
              e.key,
              options.map((o) => (o.disabled ? "" : o.label)),
              options.findIndex((o) => o.value === value),
            );
            if (index >= 0) onChange(options[index].value);
          }
        }}
      >
        {prefix && <span className="lastre-select__prefix">{prefix}</span>}
        {selected?.leading ??
          (selected?.icon && (
            <Icon name={selected.icon} size={16} className="lastre-select__lead" />
          ))}
        <span
          className="lastre-select__value"
          data-placeholder={!selected || undefined}
        >
          {selected?.label ?? placeholder}
        </span>
        <Icon name="chevron-down" size={16} className="lastre-select__chevron" />
      </button>
      {name && (
        <input
          className="lastre-select__native"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          value={value}
          required={required}
          onChange={() => {}}
          onFocus={() => trigger.current?.focus()}
        />
      )}
      {open && (
        <FloatingPortal anchor={trigger}>
          <div
            ref={layer}
            className="lastre-layer lastre-listbox-layer"
            onKeyDown={onLayerKey}
          >
            {canSearch && (
              <label className="lastre-layer-search">
                <Icon name="search" size={15} />
                <input
                  ref={search}
                  value={query}
                  placeholder="Filtrar opções…"
                  aria-label="Filtrar opções"
                  aria-controls={`${baseId}-list`}
                  aria-activedescendant={activeId}
                  aria-autocomplete="list"
                  role="combobox"
                  aria-expanded
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                />
              </label>
            )}
            <div
              ref={list}
              id={`${baseId}-list`}
              role="listbox"
              tabIndex={canSearch ? -1 : 0}
              aria-labelledby={labelledBy}
              aria-label={labelledBy ? undefined : ariaLabel ?? placeholder}
              aria-activedescendant={canSearch ? undefined : activeId}
              className="lastre-listbox"
            >
              {visible.length === 0 && (
                <p className="lastre-layer-empty">Nenhuma opção encontrada.</p>
              )}
              {visible.map((option, index) => {
                const heading =
                  option.group && option.group !== lastGroup ? option.group : null;
                lastGroup = option.group;
                return (
                  <div key={option.value} role="presentation">
                    {heading && (
                      <p className="lastre-layer-label" role="presentation">
                        {heading}
                      </p>
                    )}
                    <div
                      id={`${baseId}-opt-${index}`}
                      data-index={index}
                      role="option"
                      aria-selected={option.value === value}
                      aria-disabled={option.disabled || undefined}
                      className="lastre-option lastre-select__option"
                      data-active={active === index || undefined}
                      onMouseEnter={() => !option.disabled && setActive(index)}
                      onClick={() => pick(option)}
                    >
                      {option.leading ??
                        (option.icon && (
                          <Icon name={option.icon} size={16} className="lastre-select__opt-icon" />
                        ))}
                      <span className="lastre-select__opt-text">
                        <span>{option.label}</span>
                        {option.description && <small>{option.description}</small>}
                      </span>
                      {option.count !== undefined && (
                        <span className="lastre-count">{option.count}</span>
                      )}
                      <Icon
                        name="check"
                        size={16}
                        className="lastre-select__check"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
