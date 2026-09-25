import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Tabs } from "../../components/ui/Tabs";
import { Icon } from "../../components/ui/Icon";
import { Button as DSButton } from "../../components/ui/Button";
import { Surface as DSSurface } from "../../components/ui/Surface";
import { SearchInput } from "../../components/ui/SearchInput";
import { Select } from "../../components/ui/Select";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  DataTable as KitTable,
  type Column,
} from "../../components/ui/DataTable";
import "../../components/ui/filter-bar.css";
import "../../components/ui/drawer.css";
import "../../components/ui/dropdown-menu.css";
import { useDialogFocus } from "../../hooks/useDialogFocus";
import { surfaceLab, notifyLab } from "./surface-lab-runtime";

export function Button({
  primary,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }) {
  return (
    <DSButton
      variant={primary ? "primary" : "secondary"}
      size="sm"
      className={`ad-button ${className}`}
      {...props}
    >
      {children}
    </DSButton>
  );
}
export function PageHeading({
  title,
  description,
  eyebrow,
  action,
  back,
}: {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
  back?: { to: string; label: string };
}) {
  return (
    <header className="ad-heading">
      {back && (
        <Link className="ad-back" to={back.to}>
          <Icon name="chevron-left" size={14} />
          {back.label}
        </Link>
      )}
      <div className="ad-heading-row">
        <div>
          {eyebrow && <p className="ad-eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          <p className="ad-description">{description}</p>
        </div>
        {action && <div className="ad-actions">{action}</div>}
      </div>
    </header>
  );
}
export function Badge({ children }: { children: ReactNode }) {
  const s = String(children);
  const tone = /Crítica|Falhou|Suspensa|Revogad|Divergente/.test(s)
    ? "danger"
    : /Alta|Degradado|Aguardando|Em espera|Expirad|desconhecido|Desconhecido|Em revisão/.test(
          s,
        )
      ? "warning"
      : /^(Ativ[ao]|Operacional|Concluída|Confirmado|Vigente|Publicado|Resolvida|Recebido)/.test(
            s,
          )
        ? "success"
        : "neutral";
  if (["Crítica", "Alta", "Normal", "Baixa"].includes(s)) {
    const level = { Crítica: 4, Alta: 3, Normal: 2, Baixa: 1 }[s]!;
    return (
      <span className={`ad-priority ad-priority-${tone}`}>
        <span className="ad-priority-bars" aria-hidden="true">
          {[1, 2, 3, 4].map((bar) => (
            <i key={bar} data-filled={bar <= level} />
          ))}
        </span>
        {children}
      </span>
    );
  }
  return (
    <StatusBadge
      label={s}
      tone={tone}
      size="sm"
      circle={
        tone === "success"
          ? "filled"
          : /Nova|Desconhecido/.test(s)
            ? "empty"
            : "ring"
      }
      className="ad-badge"
    />
  );
}
export function Notice({
  title,
  children,
  tone = "info",
}: {
  title: string;
  children?: ReactNode;
  tone?: "info" | "warning" | "danger";
}) {
  return (
    <div className={`ad-notice ad-notice-${tone}`}>
      <Icon name={tone === "info" ? "shield" : "escalations"} size={18} />
      <div>
        <strong>{title}</strong>
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}
export function Empty({
  title = "Nenhum resultado encontrado",
  description = "Revise a busca ou remova os filtros para consultar os registros.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ad-empty">
      <span className="ad-empty-icon" aria-hidden="true">
        <Icon name="search" size={22} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Missing({
  back = "/admin",
  title = "Registro não encontrado",
}: {
  back?: string;
  title?: string;
}) {
  return (
    <Empty
      title={title}
      description="O identificador não está disponível nesta prévia. Revise o endereço ou volte à lista."
      action={
        <Link className="ad-button" to={back}>
          Voltar à lista
        </Link>
      }
    />
  );
}
export function Panel({
  title,
  children,
  aside,
}: {
  title: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <DSSurface as="section" elevation={1} className="ad-panel">
      <div className="ad-panel-heading">
        <h2>{title}</h2>
        {aside}
      </div>
      {children}
    </DSSurface>
  );
}
export function Facts({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="ad-facts">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value === "" || value == null ? "—" : value}</dd>
        </div>
      ))}
    </dl>
  );
}
/** Deterministic hue so a person or organization keeps its color, as in Assets. */
const hueOf = (name: string) =>
  [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 6;

export function Entity({
  name,
  detail,
  to,
  initials,
}: {
  name: string;
  detail?: string;
  to?: string;
  initials?: string;
}) {
  const content = (
    <>
      {initials && (
        <span className="ad-avatar" aria-hidden="true" data-hue={hueOf(name)}>
          {initials}
        </span>
      )}
      <span>
        <strong>{name}</strong>
        {detail && <small>{detail}</small>}
      </span>
    </>
  );
  return to ? (
    <Link className="ad-entity" to={to}>
      {content}
    </Link>
  ) : (
    <span className="ad-entity">{content}</span>
  );
}
export function useQuery() {
  const [params, setParams] = useSearchParams();
  const { pathname } = useLocation();
  const update = (values: Record<string, string | null>, replace = false) =>
    setParams(
      (old) => {
        const next = new URLSearchParams(old);
        for (const [key, value] of Object.entries(values)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        if (!("pagina" in values)) next.delete("pagina");
        return next;
      },
      { replace },
    );
  return {
    params,
    update,
    clear: () =>
      update(
        Object.fromEntries(
          [...params.keys()]
            .filter(
              (k) =>
                !["tab", "versao"].includes(k) &&
                !(k === "tipo" && pathname === "/admin/registros"),
            )
            .map((k) => [k, null]),
        ),
      ),
  };
}
export const tabId = (label: string) =>
  label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(" ", "-");
export function useTab(labels: string[], key = "tab") {
  const { params, update } = useQuery();
  const tabs = labels.map((label) => ({ id: tabId(label), label }));
  return {
    tabs,
    active: tabs.find((t) => t.id === params.get(key))?.id ?? tabs[0].id,
    onChange: (value: string) => update({ [key]: value }),
  };
}
export function PageTabs({
  state,
  children,
}: {
  state: ReturnType<typeof useTab>;
  children: ReactNode;
}) {
  return (
    <Tabs {...state} variant="underline" ariaLabel="Seções da página">
      {children}
    </Tabs>
  );
}
export function SearchField({
  placeholder = "Buscar por nome ou ID",
}: {
  placeholder?: string;
}) {
  const { params, update } = useQuery();
  return (
    <div className="ad-search lastre-filterbar__search">
      <SearchInput
        ariaLabel={placeholder}
        placeholder={placeholder}
        value={params.get("q") ?? ""}
        onChange={(value) => update({ q: value }, true)}
      />
    </div>
  );
}
export function Filter({
  name,
  label,
  options,
  placeholder = "Todos",
}: {
  name: string;
  label: string;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
}) {
  const { params, update } = useQuery();
  const opts = options.map((v) =>
    typeof v === "string" ? { label: v, value: v } : v,
  );
  const value = opts.some((o) => o.value === params.get(name))
    ? params.get(name)!
    : "";
  return (
    <Select
      variant="toolbar"
      className="ad-filter"
      aria-label={label}
      prefix={label}
      value={value}
      onChange={(next) => update({ [name]: next })}
      options={[{ value: "", label: placeholder }, ...opts]}
    />
  );
}
export function ClearFilters() {
  const { clear, params } = useQuery();
  const { pathname } = useLocation();
  const active = [...params.entries()].some(
    ([key, value]) =>
      value &&
      !["tab", "versao", "pagina", "ocorrencia", "evento"].includes(key) &&
      !(key === "tipo" && pathname === "/admin/registros"),
  );
  if (!active) return null;
  return (
    <button type="button" className="lastre-filterbar__clear" onClick={clear}>
      <Icon name="close" size={13} />
      Limpar filtros
    </button>
  );
}
export function AdvancedFilters({
  fields,
}: {
  fields: { name: string; label: string; options: string[] }[];
}) {
  const { params, update } = useQuery();
  const [open, setOpen] = useState(surfaceLab?.id === "AD-S24");
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    surfaceLab?.id === "AD-S24"
      ? Object.fromEntries(
          fields.map((f) => [f.name, params.get(f.name) ?? ""]),
        )
      : {},
  );
  const count = fields.filter((f) => params.has(f.name)).length;
  return (
    <>
      <button
        type="button"
        className="ad-tool-button"
        data-active={count > 0 || undefined}
        aria-label={
          count
            ? `Filtros avançados, ${count} aplicado(s)`
            : "Filtros avançados"
        }
        onClick={() => {
          setDraft(
            Object.fromEntries(
              fields.map((f) => [f.name, params.get(f.name) ?? ""]),
            ),
          );
          setOpen(true);
        }}
      >
        <Icon name="filter" size={15} /> Filtros avançados
        {count > 0 && <span className="lastre-count">{count}</span>}
      </button>
      {open && (
        <Surface title="Filtros avançados" onClose={() => setOpen(false)}>
          <form
            className="ad-form"
            onSubmit={(e) => {
              e.preventDefault();
              update(draft);
              setOpen(false);
            }}
          >
            {fields.map((f) => (
              <div key={f.name} className="lastre-field">
                <label id={`ad-adv-${f.name}`}>{f.label}</label>
                <Select
                  aria-label={f.label}
                  value={draft[f.name] ?? ""}
                  onChange={(next) => setDraft({ ...draft, [f.name]: next })}
                  options={[
                    { value: "", label: "Todos" },
                    ...f.options.map((o) => ({ value: o, label: o })),
                  ]}
                />
              </div>
            ))}
            <div className="ad-actions">
              <Button primary type="submit">
                Aplicar filtros
              </Button>
              <Button
                onClick={() =>
                  setDraft(Object.fromEntries(fields.map((f) => [f.name, ""])))
                }
              >
                Limpar critérios
              </Button>
            </div>
          </form>
        </Surface>
      )}
    </>
  );
}
export function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div
      className="ad-toolbar lastre-filterbar"
      role="search"
      aria-label="Filtrar registros"
    >
      <SearchField />
      {children && <div className="lastre-filterbar__filters">{children}</div>}
      <ClearFilters />
    </div>
  );
}
export function matches(query: string | null, ...values: (string | number)[]) {
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  return !query || norm(values.join(" ")).includes(norm(query));
}
export function filterValue(
  value: string | null,
  actual: string,
  options: string[],
) {
  return !value || !options.includes(value) || actual === value;
}
export type AdminColumn<T> = {
  label: string;
  render: (row: T) => ReactNode;
  /** Makes the column sortable. */
  sort?: (row: T) => string | number | null | undefined;
  align?: "start" | "end";
};

/**
 * Admin lists on the shared DataTable: same frame, sorting, column and
 * density preferences, pagination and phone cards as Assets. The first
 * column identifies the row. `onSelect` opens the quick preview.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  label,
  onSelect,
}: {
  rows: T[];
  columns: AdminColumn<T>[];
  label: string;
  onSelect?: (row: T) => void;
}) {
  const { clear } = useQuery();
  const kitColumns: Column<T>[] = columns.map((c, i) => ({
    id: `${i}-${tabId(c.label) || "col"}`,
    header: c.label,
    cell: c.render,
    sortValue: c.sort,
    align: c.align,
    primary: i === 0,
  }));
  return (
    <KitTable<T>
      id={`admin-${tabId(label)}`}
      label={label}
      rows={rows}
      columns={kitColumns}
      getRowId={(row) => row.id}
      rowLabel={(row) => row.id}
      onRowOpen={onSelect}
      pageSize={10}
      summary={
        <>
          <strong>{rows.length}</strong>{" "}
          {rows.length === 1 ? "registro" : "registros"}
        </>
      }
      rowAccessory={
        onSelect
          ? (row) => (
              <button
                type="button"
                className="lastre-menu-trigger lastre-menu-trigger--sm"
                aria-label={`Abrir prévia ${row.id}`}
                title="Abrir prévia"
                onClick={() => onSelect(row)}
              >
                <Icon name="panel-right" size={15} />
              </button>
            )
          : undefined
      }
      empty={<Empty action={<Button onClick={clear}>Limpar filtros</Button>} />}
    />
  );
}
export function Timeline({
  entries,
}: {
  entries: { title: string; meta: string; detail?: string; to?: string }[];
}) {
  return (
    <ol className="ad-timeline">
      {entries.map((entry, i) => (
        <li key={`${entry.title}-${i}`}>
          <span className="ad-timeline-marker" aria-hidden="true" />
          <div>
            <small>{entry.meta}</small>
            <strong>
              {entry.to ? (
                <Link to={entry.to}>{entry.title}</Link>
              ) : (
                entry.title
              )}
            </strong>
            {entry.detail && <p>{entry.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
export function Surface({
  title,
  description,
  children,
  onClose,
  kind = "drawer",
  initialFocus,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  kind?: "drawer" | "modal";
  initialFocus?: string;
}) {
  const dialog = useDialogFocus<HTMLDialogElement>(true);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useLayoutEffect(() => {
    const element = dialog.current;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    if (initialFocus)
      element?.querySelector<HTMLElement>(initialFocus)?.focus();
    return () => {
      element?.close();
      document.body.style.overflow = old;
    };
  }, [dialog, initialFocus]);
  return (
    <dialog
      ref={dialog}
      className={`ad-surface lastre-drawer lastre-drawer--md ad-${kind}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeRef.current();
      }}
    >
      <div className="lastre-drawer__panel">
        <header className="lastre-drawer__head">
          <div className="lastre-drawer__titles">
            <p className="lastre-drawer__eyebrow">Lastre Admin</p>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <div className="lastre-drawer__head-actions">
            <button
              type="button"
              className="lastre-menu-trigger"
              aria-label="Fechar painel"
              onClick={onClose}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        </header>
        <div className="lastre-drawer__body ad-surface-body">{children}</div>
      </div>
    </dialog>
  );
}
export function useUnloadGuard(dirty: boolean) {
  useEffect(() => {
    if (surfaceLab) {
      notifyLab("dirty", dirty);
      return () => notifyLab("dirty", false);
    }
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
