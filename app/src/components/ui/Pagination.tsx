import "./dropdown-menu.css";
import { Icon } from "./Icon";
import { Select } from "./Select";
import "./lastre-primitives.css";

const sizes = [10, 25, 50, 100];

/** Range, page size and previous/next. Numbers use tabular figures so the bar does not jump. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const fmt = (n: number) => n.toLocaleString("pt-BR");
  return (
    <nav className="lastre-pagination" aria-label="Paginação">
      <p className="lastre-pagination__range" aria-live="polite">
        <strong>
          {fmt(from)}–{fmt(to)}
        </strong>{" "}
        de {fmt(total)}
      </p>
      {onPageSizeChange && (
        <div className="lastre-pagination__size">
          <span id="lastre-pagination-size" aria-hidden="true">
            Por página
          </span>
          <Select
            size="sm"
            variant="toolbar"
            aria-label="Itens por página"
            value={String(pageSize)}
            options={[...new Set([...sizes, pageSize])]
              .sort((a, b) => a - b)
              .map((s) => ({ value: String(s), label: String(s) }))}
            onChange={(v) => onPageSizeChange(Number(v))}
          />
        </div>
      )}
      <div className="lastre-pagination__nav">
        <span className="lastre-pagination__page">
          Página {fmt(page)} de {fmt(pages)}
        </span>
        <button
          type="button"
          className="lastre-menu-trigger lastre-menu-trigger--sm"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <button
          type="button"
          className="lastre-menu-trigger lastre-menu-trigger--sm"
          aria-label="Próxima página"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
    </nav>
  );
}
