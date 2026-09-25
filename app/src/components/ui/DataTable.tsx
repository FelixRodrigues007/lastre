import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { KitLink, useKitNavigate } from "./routing";
import { Checkbox } from "./Checkbox";
import { DropdownMenu, type MenuEntry } from "./DropdownMenu";
import { Icon } from "./Icon";
import { Pagination } from "./Pagination";
import { SkeletonBlock } from "./Skeleton";
import "./data-table.css";

export type SortDirection = "asc" | "desc";
export type SortState = { id: string; dir: SortDirection };
export type Density = "comfortable" | "compact";

export type Column<T> = {
  id: string;
  /** Plain header text. Also labels the value on phones and in the column menu. */
  header: string;
  /** Visual header, when it differs from the text. */
  headerNode?: ReactNode;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable. Nulls sort last in both directions. */
  sortValue?: (row: T) => string | number | null | undefined;
  /** Direction applied on the first click. Dates and quantities read best descending. */
  firstDir?: SortDirection;
  align?: "start" | "end" | "center";
  width?: string;
  /** The identifying column: carries the row link, stays pinned when scrolling sideways and titles the card on phones. */
  primary?: boolean;
  /** Can be hidden from the view menu. Defaults to true, except the primary column. */
  hideable?: boolean;
  defaultHidden?: boolean;
  /** On phones: a labelled line (default), a caption under the title, or hidden. */
  mobile?: "row" | "meta" | "hide";
  /** Steps aside when the table is narrower than ~1040px (`lg`) or ~860px (`md`). Phones use `mobile`. */
  hideBelow?: "lg" | "md";
};

type Prefs = { hidden: string[]; density: Density };

function readPrefs(id: string, columns: Column<unknown>[]): Prefs {
  const fallback: Prefs = {
    hidden: columns.filter((c) => c.defaultHidden).map((c) => c.id),
    density: "comfortable",
  };
  try {
    const raw = window.localStorage.getItem(`lastre-dt:${id}`);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<Prefs>;
    return {
      hidden: Array.isArray(saved.hidden) ? saved.hidden : fallback.hidden,
      density: saved.density === "compact" ? "compact" : "comfortable",
    };
  } catch {
    return fallback;
  }
}

const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
function compare(a: unknown, b: unknown) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return collator.compare(String(a), String(b));
}

/**
 * Data table for lists of records. It owns sorting, selection with Shift
 * ranges, bulk actions, per-row menus, column visibility and density (both
 * remembered per table), client pagination, loading and empty states. Under
 * 640px of its own width, rows become cards. The primary column holds a real
 * link that covers the row, so the whole row opens the record while other
 * controls in the row stay reachable.
 */
export function DataTable<T>({
  id,
  label,
  rows,
  columns,
  getRowId,
  rowHref,
  onRowOpen,
  rowLabel,
  defaultSort,
  sort: sortProp,
  onSortChange,
  selectable = false,
  selected: selectedProp,
  onSelectedChange,
  bulkActions,
  rowActions,
  rowAccessory,
  rowTone,
  pageSize,
  loading = false,
  empty,
  summary,
  toolbar,
  settings = true,
}: {
  /** Stable id: remembers hidden columns and density. */
  id: string;
  /** Accessible name of the table. */
  label: string;
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  rowHref?: (row: T) => string;
  /** Opens the row in place (e.g. a preview drawer) when there is no route. */
  onRowOpen?: (row: T) => void;
  rowLabel?: (row: T) => string;
  defaultSort?: SortState;
  /** Controlled sort, e.g. kept in the URL. `null` means the incoming order. */
  sort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  bulkActions?: (rows: T[], clear: () => void) => ReactNode;
  rowActions?: (row: T) => MenuEntry[];
  /** Extra control revealed on row hover, before the menu (e.g. quick look). */
  rowAccessory?: (row: T) => ReactNode;
  rowTone?: (row: T) => "warning" | "danger" | "success" | undefined;
  pageSize?: number;
  loading?: boolean;
  empty?: ReactNode;
  /** Left side of the table bar, e.g. result count. */
  summary?: ReactNode;
  /** Extra controls on the right side of the table bar. */
  toolbar?: ReactNode;
  settings?: boolean;
}) {
  const [prefs, setPrefs] = useState<Prefs>(() =>
    readPrefs(id, columns as Column<unknown>[]),
  );
  useEffect(() => {
    try {
      window.localStorage.setItem(`lastre-dt:${id}`, JSON.stringify(prefs));
    } catch {
      /* Preferences are a convenience; the table works without storage. */
    }
  }, [id, prefs]);

  const [innerSort, setInnerSort] = useState<SortState | null>(defaultSort ?? null);
  const sort = sortProp !== undefined ? sortProp : innerSort;
  const setSort = (next: SortState | null) => {
    if (sortProp === undefined) setInnerSort(next);
    onSortChange?.(next);
  };

  const [innerSelected, setInnerSelected] = useState<string[]>([]);
  const selected = selectedProp ?? innerSelected;
  const setSelected = useCallback(
    (ids: string[]) => {
      if (!selectedProp) setInnerSelected(ids);
      onSelectedChange?.(ids);
    },
    [selectedProp, onSelectedChange],
  );

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize ?? 0);
  const anchor = useRef<number | null>(null);
  const navigate = useKitNavigate();

  const visibleColumns = columns.filter(
    (c) => c.primary || c.hideable === false || !prefs.hidden.includes(c.id),
  );
  const hasActions = Boolean(rowActions || rowAccessory);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return rows;
    const value = column.sortValue;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const xe = x === null || x === undefined || x === "";
      const ye = y === null || y === undefined || y === "";
      if (xe || ye) return xe === ye ? 0 : xe ? 1 : -1;
      return compare(x, y) * factor;
    });
  }, [rows, columns, sort]);

  const pages = size ? Math.max(1, Math.ceil(sorted.length / size)) : 1;
  const current = Math.min(page, pages);
  const pageRows = size ? sorted.slice((current - 1) * size, current * size) : sorted;

  useEffect(() => setPage(1), [rows.length, sort?.id, sort?.dir]);

  // Drop selections that left the result set (filters, deletions).
  const rowIds = useMemo(() => new Set(rows.map(getRowId)), [rows, getRowId]);
  useEffect(() => {
    if (selected.some((sid) => !rowIds.has(sid)))
      setSelected(selected.filter((sid) => rowIds.has(sid)));
  }, [rowIds, selected, setSelected]);

  const selectedSet = new Set(selected);
  const pageIds = pageRows.map(getRowId);
  const pageSelected = pageIds.filter((pid) => selectedSet.has(pid)).length;
  const allSelected = selected.length === rows.length && rows.length > 0;
  const clear = () => {
    setSelected([]);
    anchor.current = null;
  };

  const toggleRow = (index: number, shift: boolean) => {
    const rowId = pageIds[index];
    const on = !selectedSet.has(rowId);
    const next = new Set(selected);
    if (shift && anchor.current !== null) {
      const [from, to] = [anchor.current, index].sort((a, b) => a - b);
      pageIds.slice(from, to + 1).forEach((pid) => (on ? next.add(pid) : next.delete(pid)));
    } else if (on) next.add(rowId);
    else next.delete(rowId);
    anchor.current = index;
    setSelected([...next]);
  };
  const togglePage = () => {
    const next = new Set(selected);
    const on = pageSelected < pageIds.length;
    pageIds.forEach((pid) => (on ? next.add(pid) : next.delete(pid)));
    setSelected([...next]);
  };

  const cycleSort = (column: Column<T>) => {
    const first = column.firstDir ?? "asc";
    const second = first === "asc" ? "desc" : "asc";
    if (sort?.id !== column.id) setSort({ id: column.id, dir: first });
    else if (sort.dir === first) setSort({ id: column.id, dir: second });
    else setSort(defaultSort ?? null);
  };

  const viewMenu: MenuEntry[] = [
    { type: "label", id: "density-label", label: "Densidade" },
    {
      type: "radio",
      id: "comfortable",
      label: "Confortável",
      checked: prefs.density === "comfortable",
      onSelect: () => setPrefs((p) => ({ ...p, density: "comfortable" })),
    },
    {
      type: "radio",
      id: "compact",
      label: "Compacta",
      checked: prefs.density === "compact",
      onSelect: () => setPrefs((p) => ({ ...p, density: "compact" })),
    },
    { type: "separator", id: "sep" },
    { type: "label", id: "columns-label", label: "Colunas" },
    ...columns
      .filter((c) => !c.primary && c.hideable !== false)
      .map(
        (c): MenuEntry => ({
          type: "checkbox",
          id: `col-${c.id}`,
          label: c.header,
          checked: !prefs.hidden.includes(c.id),
          onSelect: () =>
            setPrefs((p) => ({
              ...p,
              hidden: p.hidden.includes(c.id)
                ? p.hidden.filter((h) => h !== c.id)
                : [...p.hidden, c.id],
            })),
        }),
      ),
  ];

  const selectionRows = selected.length
    ? sorted.filter((r) => selectedSet.has(getRowId(r)))
    : [];
  const showBar = Boolean(summary || toolbar || settings);
  const isEmpty = !loading && rows.length === 0;

  return (
    <div
      className="lastre-dt"
      data-density={prefs.density}
      data-selecting={selected.length > 0 || undefined}
      onKeyDown={(e) => {
        if (e.key === "Escape" && selected.length && !e.defaultPrevented) clear();
      }}
    >
      {showBar && (
        <div className="lastre-dt__bar">
          <div className="lastre-dt__summary" aria-live="polite">
            {summary}
          </div>
          <div className="lastre-dt__tools">
            {toolbar}
            {settings && (
              <DropdownMenu
                label="Opções de exibição"
                trigger={
                  <>
                    <Icon name="columns" size={15} />
                    <span>Exibição</span>
                  </>
                }
                triggerClassName="lastre-dt__view"
                items={viewMenu}
                minWidth={220}
              />
            )}
          </div>
        </div>
      )}

      {isEmpty ? (
        <div className="lastre-dt__empty">{empty}</div>
      ) : (
        <div
          className="lastre-dt__scroll"
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollLeft > 0) el.dataset.scrolled = "";
            else delete el.dataset.scrolled;
          }}
        >
          <table className="lastre-dt__table" aria-label={label} aria-busy={loading || undefined}>
            <thead>
              <tr>
                {selectable && (
                  <th scope="col" className="lastre-dt__check">
                    <Checkbox
                      aria-label={
                        pageSelected === pageIds.length
                          ? "Desmarcar os itens desta página"
                          : "Selecionar os itens desta página"
                      }
                      checked={pageIds.length > 0 && pageSelected === pageIds.length}
                      indeterminate={pageSelected > 0 && pageSelected < pageIds.length}
                      disabled={loading || pageIds.length === 0}
                      onChange={togglePage}
                    />
                  </th>
                )}
                {visibleColumns.map((column) => {
                  const dir = sort?.id === column.id ? sort.dir : null;
                  return (
                    <th
                      key={column.id}
                      scope="col"
                      data-align={column.align}
                      data-primary={column.primary || undefined}
                      data-hide={column.hideBelow}
                      style={column.width ? { width: column.width } : undefined}
                      aria-sort={
                        dir === "asc" ? "ascending" : dir === "desc" ? "descending" : undefined
                      }
                    >
                      {column.sortValue ? (
                        <button
                          type="button"
                          className="lastre-dt__sort"
                          data-sorted={dir || undefined}
                          onClick={() => cycleSort(column)}
                        >
                          <span>{column.headerNode ?? column.header}</span>
                          <Icon
                            name={dir === "asc" ? "arrow-up" : dir === "desc" ? "arrow-down" : "sort"}
                            size={13}
                          />
                          <span className="lastre-sr-only">
                            {dir
                              ? `, ordenado ${dir === "asc" ? "crescente" : "decrescente"}`
                              : ", ordenar"}
                          </span>
                        </button>
                      ) : (
                        column.headerNode ?? column.header
                      )}
                    </th>
                  );
                })}
                {hasActions && (
                  <th scope="col" className="lastre-dt__actions">
                    <span className="lastre-sr-only">Ações</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: Math.min(size || 5, 6) }, (_, i) => (
                    <tr key={`sk-${i}`} className="lastre-dt__skeleton">
                      {selectable && <td className="lastre-dt__check" />}
                      {visibleColumns.map((c) => (
                        <td key={c.id} data-primary={c.primary || undefined} data-hide={c.hideBelow}>
                          <SkeletonBlock
                            width={c.primary ? "70%" : `${40 + ((i * 17 + c.id.length * 7) % 40)}%`}
                            height="0.75rem"
                          />
                        </td>
                      ))}
                      {hasActions && <td className="lastre-dt__actions" />}
                    </tr>
                  ))
                : pageRows.map((row, index) => {
                    const rowId = getRowId(row);
                    const isSelected = selectedSet.has(rowId);
                    const name = rowLabel?.(row) ?? "registro";
                    const href = rowHref?.(row);
                    const actions = rowActions?.(row);
                    return (
                      <tr
                        key={rowId}
                        data-selected={isSelected || undefined}
                        data-tone={rowTone?.(row)}
                        data-linked={href || onRowOpen ? true : undefined}
                        onClick={
                          href || onRowOpen
                            ? (e) => {
                                const target = e.target as HTMLElement;
                                if (
                                  target.closest("a, button, input, label, select, textarea, [role='menu']") ||
                                  window.getSelection()?.toString()
                                )
                                  return;
                                if (!href) onRowOpen?.(row);
                                else if (e.metaKey || e.ctrlKey) window.open(href, "_blank", "noopener");
                                else navigate(href);
                              }
                            : undefined
                        }
                      >
                        {selectable && (
                          <td className="lastre-dt__check">
                            <Checkbox
                              aria-label={`Selecionar ${name}`}
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => toggleRow(index, e.shiftKey)}
                            />
                          </td>
                        )}
                        {visibleColumns.map((column) => (
                          <td
                            key={column.id}
                            data-label={column.header}
                            data-align={column.align}
                            data-primary={column.primary || undefined}
                            data-mobile={column.mobile}
                            data-hide={column.hideBelow}
                          >
                            {column.primary && href ? (
                              <KitLink to={href} className="lastre-dt__link">
                                {column.cell(row)}
                              </KitLink>
                            ) : (
                              column.cell(row)
                            )}
                          </td>
                        ))}
                        {hasActions && (
                          <td className="lastre-dt__actions">
                            <div className="lastre-dt__actions-row">
                              {rowAccessory?.(row)}
                              {actions && actions.length > 0 && (
                                <DropdownMenu
                                  label={`Ações para ${name}`}
                                  items={actions}
                                  triggerClassName="lastre-menu-trigger lastre-menu-trigger--sm"
                                />
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      )}

      {pageSize && !isEmpty && !loading && sorted.length > pageSize && (
        <Pagination
          page={current}
          pageSize={size}
          total={sorted.length}
          onPageChange={setPage}
          onPageSizeChange={(next) => {
            setSize(next);
            setPage(1);
          }}
        />
      )}

      {selectable && selected.length > 0 && (
        <div className="lastre-dt__bulk" role="region" aria-label="Ações para a seleção">
          <div className="lastre-dt__bulk-count">
            <strong>{selected.length}</strong>{" "}
            {selected.length === 1 ? "selecionado" : "selecionados"}
            {!allSelected && rows.length > pageIds.length && (
              <button
                type="button"
                className="lastre-dt__bulk-all"
                onClick={() => setSelected(rows.map(getRowId))}
              >
                Selecionar todos os {rows.length}
              </button>
            )}
          </div>
          <div className="lastre-dt__bulk-actions">{bulkActions?.(selectionRows, clear)}</div>
          <button
            type="button"
            className="lastre-dt__bulk-close"
            aria-label="Limpar seleção"
            title="Limpar seleção (Esc)"
            onClick={clear}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
