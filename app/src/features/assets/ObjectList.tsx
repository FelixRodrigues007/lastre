import { useState } from "react";
import { ImportLots } from "./ImportLots";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Button, buttonClassName } from "../../components/ui/Button";
import { DataTable, type Column, type SortState } from "../../components/ui/DataTable";
import { FacetFilter } from "../../components/ui/FacetFilter";
import { FilterBar } from "../../components/ui/FilterBar";
import { Tabs } from "../../components/ui/Tabs";
import { Tooltip } from "../../components/ui/Tooltip";
import type { MenuEntry } from "../../components/ui/DropdownMenu";
import { api, type DossierObject } from "./api";
import { useWorkspace } from "./context";
import { downloadCsv } from "./csv";
import {
  canCreate,
  canEdit,
  canSend,
  categoryLabels,
  dateLabel,
  missingFields,
  objectPath,
  quantityLabel,
  sectorLabels,
  statusLabels,
} from "./model";
import { Dialog, toast } from "./overlay";
import { ObjectPeek } from "./ObjectPeek";
import {
  listParam,
  objectTone,
  sortParam,
  statusOrder,
  statusTone,
} from "./listing";
import {
  Avatar,
  Badge,
  Empty,
  Feedback,
  Glyph,
  PageHead,
  Segmented,
  relativeTime,
  useAction,
} from "./ui";

type StatusFilter = "active" | "all" | "draft" | "ready" | "archived";
const DEFAULT_SORT: SortState = { id: "updated", dir: "desc" };

export function AssetsObjectList({ kind }: { kind: "asset" | "lot" }) {
  const { data, reload } = useWorkspace();
  const action = useAction();
  const [importing, setImporting] = useState(false);
  const [peekId, setPeekId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmArchive, setConfirmArchive] = useState<DossierObject[] | null>(null);
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = (params.get("status") ?? "active") as StatusFilter;
  const sectors = listParam(params, "setor");
  const people = listParam(params, "responsavel");
  const types = listParam(params, "tipo");
  const view = params.get("view") === "grid" ? "grid" : "list";
  const sort = sortParam(params.get("sort")) ?? DEFAULT_SORT;
  const set = (key: string, value: string | string[]) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const v = Array.isArray(value) ? value.join(",") : value;
        if (v) next.set(key, v);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const role = data.membership.role;
  const editor = canEdit(role) && role !== "contributor";
  const noun = kind === "asset" ? "ativo" : "lote";
  const plural = kind === "asset" ? "ativos" : "lotes";
  const prefix = `/assets/${kind === "asset" ? "ativos" : "lotes"}`;
  const creator = canCreate(role);
  const typeOf = (o: DossierObject) =>
    kind === "lot" ? o.fields.material.trim() || "Sem material" : o.fields.category;

  const objects = data.objects.filter((o) => o.kind === kind);
  const text = search.toLocaleLowerCase("pt-BR");
  const matchesText = (o: DossierObject) =>
    !text ||
    `${o.fields.name} ${o.fields.location} ${o.fields.material} ${o.fields.responsible} ${o.fields.registration}`
      .toLocaleLowerCase("pt-BR")
      .includes(text);
  const matchesStatus = (o: DossierObject, s: StatusFilter) =>
    s === "all" || (s === "active" ? o.status !== "archived" : o.status === s);
  // Each facet counts against every other active filter, never itself.
  const passes = (
    o: DossierObject,
    skip?: "status" | "setor" | "responsavel" | "tipo",
  ) =>
    matchesText(o) &&
    (skip === "status" || matchesStatus(o, status)) &&
    (skip === "setor" || !sectors.length || sectors.includes(o.fields.sector)) &&
    (skip === "responsavel" ||
      !people.length ||
      people.includes(o.fields.responsible.trim() || "—")) &&
    (skip === "tipo" || !types.length || types.includes(typeOf(o)));
  const filtered = objects.filter((o) => passes(o));
  const count = (s: StatusFilter) =>
    objects.filter((o) => passes(o, "status") && matchesStatus(o, s)).length;
  const facet = (
    skip: "setor" | "responsavel" | "tipo",
    value: (o: DossierObject) => string,
  ) => {
    const counts = new Map<string, number>();
    objects.forEach((o) => {
      const v = value(o);
      if (!counts.has(v)) counts.set(v, 0);
      if (passes(o, skip)) counts.set(v, (counts.get(v) ?? 0) + 1);
    });
    return counts;
  };
  const sectorCounts = facet("setor", (o) => o.fields.sector);
  const peopleCounts = facet("responsavel", (o) => o.fields.responsible.trim() || "—");
  const typeCounts = facet("tipo", typeOf);
  const filtersActive = Boolean(
    search || sectors.length || people.length || types.length || status !== "active",
  );
  const peek = data.objects.find((o) => o.id === peekId) ?? null;

  const setStatuses = (targets: DossierObject[], next: DossierObject["status"], message: string) =>
    void action.run(async () => {
      for (const o of targets) await api.status(o.id, o.revision, next);
      await reload();
      setSelected([]);
      setConfirmArchive(null);
      toast(message);
    });

  const exportRows = (rows: DossierObject[]) =>
    downloadCsv(
      [
        kind === "lot"
          ? ["Nome", "Material", "Quantidade", "Unidade", "Setor", "Local", "Responsável", "Situação", "Documentos", "Atualizado em"]
          : ["Nome", "Tipo", "Setor", "Local", "Responsável", "Referência", "Situação", "Documentos", "Atualizado em"],
        ...rows.map((o) =>
          kind === "lot"
            ? [o.fields.name, o.fields.material, o.fields.quantity, o.fields.unit, sectorLabels[o.fields.sector], o.fields.location, o.fields.responsible, statusLabels[o.status], String(o.evidenceIds.length), dateLabel(o.updatedAt, true)]
            : [o.fields.name, categoryLabels[o.fields.category], sectorLabels[o.fields.sector], o.fields.location, o.fields.responsible, o.fields.registration, statusLabels[o.status], String(o.evidenceIds.length), dateLabel(o.updatedAt, true)],
        ),
      ],
      `lastre-${plural}-${new Date().toISOString().slice(0, 10)}.csv`,
    );

  const columns: Column<DossierObject>[] = [
    {
      id: "name",
      header: kind === "asset" ? "Ativo" : "Lote",
      primary: true,
      sortValue: (o) => o.fields.name,
      cell: (o) => (
        <span className="assets-object-name">
          <Glyph icon={kind === "asset" ? "globe" : "lots"} tone={objectTone(o)} size="sm" />
          <span>
            <strong title={o.fields.name || undefined}>{o.fields.name || "Sem identificação"}</strong>
            <small>{o.fields.location || "Localização a informar"}</small>
          </span>
        </span>
      ),
    },
    ...(kind === "lot"
      ? [
          {
            id: "quantity",
            header: "Produção",
            align: "end" as const,
            firstDir: "desc" as const,
            sortValue: (o: DossierObject) => (o.fields.quantity ? Number(o.fields.quantity) : null),
            cell: (o: DossierObject) =>
              o.fields.quantity ? (
                <span className="assets-mono assets-cell-strong">{quantityLabel(o)}</span>
              ) : (
                <span className="assets-cell-empty">A informar</span>
              ),
          },
          {
            id: "material",
            header: "Material",
            hideBelow: "lg" as const,
            sortValue: (o: DossierObject) => o.fields.material,
            cell: (o: DossierObject) =>
              o.fields.material ? (
                <span className="lastre-dt__clip" title={o.fields.material}>
                  {o.fields.material}
                </span>
              ) : (
                <span className="assets-cell-empty">A informar</span>
              ),
          },
          {
            id: "period",
            header: "Período",
            defaultHidden: true,
            sortValue: (o: DossierObject) => o.fields.periodStart,
            cell: (o: DossierObject) =>
              o.fields.periodStart && o.fields.periodEnd ? (
                <span className="assets-nowrap">
                  {dateLabel(o.fields.periodStart)} – {dateLabel(o.fields.periodEnd)}
                </span>
              ) : (
                <span className="assets-cell-empty">A informar</span>
              ),
          },
        ]
      : [
          {
            id: "category",
            header: "Tipo",
            sortValue: (o: DossierObject) => categoryLabels[o.fields.category],
            cell: (o: DossierObject) => categoryLabels[o.fields.category],
          },
        ]),
    {
      id: "sector",
      header: "Setor",
      defaultHidden: kind === "lot",
      sortValue: (o) => sectorLabels[o.fields.sector],
      cell: (o) => (
        <span className="assets-sector" data-sector={o.fields.sector}>
          {sectorLabels[o.fields.sector]}
        </span>
      ),
    },
    {
      id: "responsible",
      header: "Responsável",
      sortValue: (o) => o.fields.responsible,
      cell: (o) =>
        o.fields.responsible ? (
          <span className="assets-person">
            <Avatar name={o.fields.responsible} size="sm" />
            {o.fields.responsible}
          </span>
        ) : (
          <span className="assets-cell-empty">A definir</span>
        ),
    },
    {
      id: "documents",
      header: "Docs.",
      hideBelow: "md",
      align: "end",
      firstDir: "desc",
      sortValue: (o) => o.evidenceIds.length,
      cell: (o) => (
        <span className="assets-count-cell" data-zero={o.evidenceIds.length === 0 || undefined}>
          <Icon name="file" size={13} />
          {o.evidenceIds.length}
        </span>
      ),
    },
    {
      id: "status",
      header: "Situação",
      sortValue: (o) => statusOrder[o.status],
      cell: (o) => <Badge tone={statusTone(o.status)}>{statusLabels[o.status]}</Badge>,
    },
    {
      id: "updated",
      header: "Atualização",
      firstDir: "desc",
      sortValue: (o) => o.updatedAt,
      mobile: "hide",
      cell: (o) => (
        <time dateTime={o.updatedAt} title={dateLabel(o.updatedAt, true)} className="assets-nowrap">
          {relativeTime(o.updatedAt)}
        </time>
      ),
    },
    {
      id: "created",
      header: "Criação",
      defaultHidden: true,
      firstDir: "desc",
      sortValue: (o) => o.createdAt,
      cell: (o) => <span className="assets-nowrap">{dateLabel(o.createdAt)}</span>,
    },
  ];

  const rowActions = (o: DossierObject): MenuEntry[] => {
    const missing = missingFields(o);
    return [
      { id: "open", label: "Abrir dossiê", icon: "arrow-right", href: objectPath(o) },
      { id: "peek", label: "Visualizar rápido", icon: "panel-right", onSelect: () => setPeekId(o.id) },
      ...(o.status !== "archived" && canSend(role)
        ? [{ id: "share", label: "Revisar compartilhamento", icon: "share" as const, href: `${objectPath(o)}/compartilhar` }]
        : []),
      ...(editor
        ? [
            { type: "separator" as const, id: "sep" },
            ...(o.status === "draft"
              ? [
                  {
                    id: "ready",
                    label: "Marcar pronto para revisão",
                    icon: "check" as const,
                    disabled: missing.length > 0,
                    description: missing.length ? `Falta: ${missing.join(", ")}` : undefined,
                    onSelect: () =>
                      setStatuses([o], "ready", "Cadastro pronto para revisão. Nenhum dado foi compartilhado."),
                  },
                ]
              : []),
            o.status === "archived"
              ? {
                  id: "restore",
                  label: "Restaurar cadastro",
                  icon: "refresh" as const,
                  onSelect: () => setStatuses([o], "draft", "Cadastro restaurado."),
                }
              : {
                  id: "archive",
                  label: "Arquivar",
                  icon: "archive" as const,
                  danger: true,
                  onSelect: () => setConfirmArchive([o]),
                },
          ]
        : []),
    ];
  };

  const emptyState = (
    <Empty
      compact={objects.length > 0}
      icon={objects.length ? "search" : kind === "asset" ? "globe" : "lots"}
      title={
        objects.length
          ? "Nenhum cadastro com esses filtros"
          : kind === "asset"
            ? "Vamos organizar seu primeiro ativo?"
            : "Sua produção começa com um lote"
      }
      description={
        objects.length
          ? "Tente outro nome, setor, responsável ou situação."
          : "Comece com as informações que você já tem. O rascunho pode ser completado depois."
      }
      action={
        objects.length ? (
          <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
            Limpar filtros
          </Button>
        ) : (
          creator && (
            <Link className={buttonClassName({})} to={`${prefix}/novo`}>
              <Icon name="plus" size={16} /> Cadastrar {noun}
            </Link>
          )
        )
      }
    />
  );

  return (
    <>
      <PageHead
        eyebrow="Cadastros da organização"
        title={kind === "asset" ? "Meus ativos" : "Lotes de produção"}
        description={
          kind === "asset"
            ? "Áreas, direitos e projetos. Cada ativo com seu contexto e sua documentação."
            : "Acompanhe a produção, reúna documentos e prepare cada lote para apresentação."
        }
        action={
          creator && (
            <>
              {kind === "lot" && (
                <Button
                  variant="secondary"
                  startIcon={<Icon name="upload" size={16} />}
                  onClick={() => setImporting(true)}
                >
                  Importar CSV
                </Button>
              )}
              <Link className={buttonClassName({})} to={`${prefix}/novo`}>
                <Icon name="plus" size={16} /> Cadastrar {noun}
              </Link>
            </>
          )
        }
      />
      {importing && kind === "lot" && <ImportLots onClose={() => setImporting(false)} />}

      <div className="assets-listview">
        <Tabs<StatusFilter>
          variant="underline"
          ariaLabel={`Situação dos ${plural}`}
          panelId={`assets-${kind}-results`}
          active={status}
          onChange={(v) => set("status", v === "active" ? "" : v)}
          tabs={[
            { id: "active", label: "Em uso", count: count("active") },
            { id: "draft", label: "Rascunhos", count: count("draft") },
            { id: "ready", label: "Prontos para revisão", count: count("ready") },
            { id: "archived", label: "Arquivados", count: count("archived") },
            { id: "all", label: "Todos", count: count("all") },
          ]}
        />

        <FilterBar
          search={search}
          onSearch={(v) => set("q", v)}
          searchLabel={`Buscar ${plural}`}
          placeholder="Buscar por nome, local ou responsável…"
          active={Boolean(search || sectors.length || people.length || types.length)}
          onClear={() => {
            const next = new URLSearchParams(params);
            ["q", "setor", "responsavel", "tipo"].forEach((k) => next.delete(k));
            setParams(next, { replace: true });
          }}
          filters={
            <>
              <FacetFilter
                label="Setor"
                icon="globe"
                selected={sectors}
                onChange={(v) => set("setor", v)}
                options={Object.entries(sectorLabels).map(([value, label]) => ({
                  value,
                  label,
                  count: sectorCounts.get(value) ?? 0,
                }))}
              />
              <FacetFilter
                label={kind === "lot" ? "Material" : "Tipo"}
                icon={kind === "lot" ? "lots" : "grid"}
                selected={types}
                onChange={(v) => set("tipo", v)}
                options={[...typeCounts.entries()]
                  .map(([value, n]) => ({
                    value,
                    label: kind === "lot" ? value : categoryLabels[value as keyof typeof categoryLabels] ?? value,
                    count: n,
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))}
              />
              <FacetFilter
                label="Responsável"
                icon="user"
                selected={people}
                onChange={(v) => set("responsavel", v)}
                options={[...peopleCounts.entries()]
                  .map(([value, n]) => ({
                    value,
                    label: value === "—" ? "Sem responsável" : value,
                    count: n,
                    leading: value === "—" ? undefined : <Avatar name={value} size="sm" />,
                  }))
                  .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"))}
              />
            </>
          }
          end={
            <Segmented
              label="Modo de exibição"
              value={view}
              onChange={(v) => set("view", v === "list" ? "" : v)}
              options={[
                { value: "list", label: "Exibir tabela", icon: "list", iconOnly: true },
                { value: "grid", label: "Exibir cartões", icon: "grid", iconOnly: true },
              ]}
            />
          }
        />

        <Feedback error={action.error} />

        <div id={`assets-${kind}-results`} role="tabpanel" aria-label={`${plural} filtrados`}>
          {view === "grid" ? (
            filtered.length ? (
              <div className="assets-object-grid assets-stagger">
                {[...filtered]
                  .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
                  .map((o) => (
                    <Link
                      key={o.id}
                      to={objectPath(o)}
                      className="lastre-surface assets-object-card assets-lift"
                      data-elevation={1}
                    >
                      <div className="assets-object-card__cover" data-sector={o.fields.sector}>
                        <Glyph icon={kind === "lot" ? "lots" : "globe"} tone={objectTone(o)} size="lg" />
                        <Badge tone={statusTone(o.status)}>{statusLabels[o.status]}</Badge>
                      </div>
                      <div className="assets-object-card__body">
                        <p className="assets-object-card__kind">
                          {sectorLabels[o.fields.sector]} · {categoryLabels[o.fields.category]}
                        </p>
                        <h2>{o.fields.name || "Sem identificação"}</h2>
                        <p className="assets-object-card__meta">
                          <Icon name="pin" size={14} />
                          {o.fields.location || "Localização a informar"}
                        </p>
                        {kind === "lot" && (
                          <p className="assets-object-card__meta">
                            <Icon name="lots" size={14} />
                            <span className={o.fields.quantity ? "assets-mono" : "assets-muted"}>
                              {quantityLabel(o)}
                            </span>
                          </p>
                        )}
                      </div>
                      <footer className="assets-object-card__foot">
                        <span>
                          <Icon name="file" size={13} /> {o.evidenceIds.length} doc.
                        </span>
                        <span>{relativeTime(o.updatedAt)}</span>
                        <Icon name="arrow-right" size={14} />
                      </footer>
                    </Link>
                  ))}
              </div>
            ) : (
              emptyState
            )
          ) : (
            <DataTable<DossierObject>
              id={`assets-${kind}`}
              label={kind === "asset" ? "Ativos da organização" : "Lotes de produção"}
              rows={filtered}
              columns={columns}
              getRowId={(o) => o.id}
              rowHref={objectPath}
              rowLabel={(o) => o.fields.name || "cadastro sem identificação"}
              sort={sort}
              onSortChange={(next) =>
                set(
                  "sort",
                  next && !(next.id === DEFAULT_SORT.id && next.dir === DEFAULT_SORT.dir)
                    ? `${next.id}:${next.dir}`
                    : "",
                )
              }
              selectable={editor}
              selected={selected}
              onSelectedChange={setSelected}
              pageSize={25}
              rowTone={(o) => (o.status === "draft" && missingFields(o).length ? "warning" : undefined)}
              rowActions={rowActions}
              rowAccessory={(o) => (
                <Tooltip content="Visualizar rápido">
                  <button
                    type="button"
                    data-reveal
                    className="lastre-menu-trigger lastre-menu-trigger--sm"
                    aria-label={`Visualizar ${o.fields.name || "cadastro"}`}
                    onClick={() => setPeekId(o.id)}
                  >
                    <Icon name="panel-right" size={15} />
                  </button>
                </Tooltip>
              )}
              summary={
                <>
                  <strong>{filtered.length}</strong> {filtered.length === 1 ? noun : plural}
                  {filtersActive && filtered.length !== objects.length && (
                    <> de {objects.length}</>
                  )}
                </>
              }
              toolbar={
                <button
                  type="button"
                  className="lastre-dt__view"
                  disabled={!filtered.length}
                  onClick={() => exportRows(filtered)}
                >
                  <Icon name="download" size={15} />
                  <span>Exportar</span>
                </button>
              }
              empty={emptyState}
              bulkActions={(rows) => {
                const ready = rows.filter((o) => o.status === "draft" && !missingFields(o).length);
                const archivable = rows.filter((o) => o.status !== "archived");
                const restorable = rows.filter((o) => o.status === "archived");
                return (
                  <>
                    {ready.length > 0 && (
                      <button
                        type="button"
                        className="lastre-bulk-action"
                        disabled={action.busy}
                        onClick={() =>
                          setStatuses(
                            ready,
                            "ready",
                            `${ready.length} cadastro(s) prontos para revisão. Nenhum dado foi compartilhado.`,
                          )
                        }
                      >
                        <Icon name="check" size={15} /> Marcar prontos ({ready.length})
                      </button>
                    )}
                    {restorable.length > 0 && (
                      <button
                        type="button"
                        className="lastre-bulk-action"
                        disabled={action.busy}
                        onClick={() => setStatuses(restorable, "draft", `${restorable.length} cadastro(s) restaurado(s).`)}
                      >
                        <Icon name="refresh" size={15} /> Restaurar
                      </button>
                    )}
                    <button type="button" className="lastre-bulk-action" onClick={() => exportRows(rows)}>
                      <Icon name="download" size={15} /> Exportar
                    </button>
                    {archivable.length > 0 && (
                      <button
                        type="button"
                        className="lastre-bulk-action"
                        data-danger
                        disabled={action.busy}
                        onClick={() => setConfirmArchive(archivable)}
                      >
                        <Icon name="archive" size={15} /> Arquivar
                      </button>
                    )}
                  </>
                );
              }}
            />
          )}
        </div>
      </div>

      <ObjectPeek object={peek} onClose={() => setPeekId(null)} />

      <Dialog
        open={Boolean(confirmArchive)}
        onClose={() => setConfirmArchive(null)}
        tone="danger"
        size="sm"
        icon="archive"
        title={
          confirmArchive?.length === 1
            ? `Arquivar ${confirmArchive[0].fields.name || "cadastro"}?`
            : `Arquivar ${confirmArchive?.length ?? 0} cadastros?`
        }
        description="Cadastros arquivados saem das listas em uso e não podem ser compartilhados. Versões já enviadas continuam válidas, e você pode restaurar depois."
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmArchive(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={action.busy}
              onClick={() =>
                confirmArchive &&
                setStatuses(
                  confirmArchive,
                  "archived",
                  confirmArchive.length === 1 ? "Cadastro arquivado." : `${confirmArchive.length} cadastros arquivados.`,
                )
              }
            >
              Arquivar
            </Button>
          </>
        }
      />
    </>
  );
}
