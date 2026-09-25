import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { SearchInput } from "./SearchInput";
import "./filter-bar.css";

/**
 * Row above a data view: search, facet chips, a single "clear" affordance
 * when anything is filtered, and view controls pinned to the end.
 */
export function FilterBar({
  search,
  onSearch,
  searchLabel,
  placeholder = "Buscar…",
  filters,
  active = false,
  onClear,
  end,
}: {
  search?: string;
  onSearch?: (value: string) => void;
  searchLabel?: string;
  placeholder?: string;
  filters?: ReactNode;
  /** Whether any search or filter is applied; shows the clear button. */
  active?: boolean;
  onClear?: () => void;
  end?: ReactNode;
}) {
  return (
    <div className="lastre-filterbar" role="search" aria-label={searchLabel}>
      {onSearch && (
        <div className="lastre-filterbar__search">
          <SearchInput
            value={search ?? ""}
            onChange={onSearch}
            ariaLabel={searchLabel ?? placeholder}
            placeholder={placeholder}
          />
        </div>
      )}
      {filters && <div className="lastre-filterbar__filters">{filters}</div>}
      {active && onClear && (
        <button type="button" className="lastre-filterbar__clear" onClick={onClear}>
          <Icon name="close" size={13} />
          Limpar
        </button>
      )}
      {end && <div className="lastre-filterbar__end">{end}</div>}
    </div>
  );
}
