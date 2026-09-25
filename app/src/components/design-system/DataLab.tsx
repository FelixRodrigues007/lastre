import { useState } from "react";
import { Checkbox } from "../ui/Checkbox";
import { DataTable, type Column } from "../ui/DataTable";
import { Drawer } from "../ui/Drawer";
import { DropdownMenu } from "../ui/DropdownMenu";
import { FacetFilter } from "../ui/FacetFilter";
import { FilterBar } from "../ui/FilterBar";
import { Icon } from "../ui/Icon";
import { Select } from "../ui/Select";
import { Tabs } from "../ui/Tabs";
import { Tooltip } from "../ui/Tooltip";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import "./ds-datalab.css";

type Row = {
  id: string;
  name: string;
  place: string;
  material: string;
  quantity: number;
  owner: string;
  status: "draft" | "ready" | "archived";
  updated: string;
};

// Fictitious sample rows for the showcase only.
const materials = ["Concentrado de cobre", "Minério de ferro", "Níquel", "Sucata de alumínio"];
const owners = ["Marina Costa", "Rafael Nunes", "Beatriz Lima", "Tiago Moreira"];
const places = ["Itabirito, MG", "Parauapebas, PA", "Catalão, GO", "Ouro Preto, MG"];
const sample: Row[] = Array.from({ length: 14 }, (_, i) => ({
  id: `demo-${i}`,
  name: `${materials[i % 4]} · EX-${String(101 + i)}`,
  place: places[(i * 3) % 4],
  material: materials[i % 4],
  quantity: Math.round(((i * 73.4) % 900) * 10) / 10 + 12,
  owner: owners[(i * 5) % 4],
  status: i % 5 === 0 ? "archived" : i % 3 === 0 ? "ready" : "draft",
  updated: new Date(Date.UTC(2026, 8, 24 - i, 14 - (i % 7))).toISOString(),
}));
const statusText = { draft: "Rascunho", ready: "Pronto", archived: "Arquivado" } as const;
const statusTone = { draft: "info", ready: "success", archived: "neutral" } as const;
const statusCircle = { draft: "ring", ready: "filled", archived: "empty" } as const;
type Tab = "all" | Row["status"];

const snippet = `<DataTable
  id="lotes"
  label="Lotes de produção"
  rows={rows}
  columns={columns}
  getRowId={(r) => r.id}
  rowHref={(r) => \`/lotes/\${r.id}\`}
  selectable
  bulkActions={(rows, clear) => …}
  rowActions={(r) => [{ id: "open", label: "Abrir", href: … }]}
  pageSize={25}
/>`;

/** Live reference for data and navigation components. Sample data is fictitious. */
export function DataLab({ onCopy }: { onCopy: (value: string, label: string) => void }) {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [owner, setOwner] = useState<string[]>([]);
  const [peek, setPeek] = useState<Row | null>(null);
  const [rows, setRows] = useState(sample);
  const [unit, setUnit] = useState("t");
  const [version, setVersion] = useState("draft");
  const [segment, setSegment] = useState<"dia" | "semana" | "mes">("semana");
  const [menuState, setMenuState] = useState({ pinned: true, density: "comfortable" });

  const q = query.toLocaleLowerCase("pt-BR");
  const base = rows.filter(
    (r) =>
      (!q || `${r.name} ${r.owner} ${r.place}`.toLocaleLowerCase("pt-BR").includes(q)) &&
      (!picked.length || picked.includes(r.material)) &&
      (!owner.length || owner.includes(r.owner)),
  );
  const visible = base.filter((r) => tab === "all" || r.status === tab);
  const count = (t: Tab) => base.filter((r) => t === "all" || r.status === t).length;

  const columns: Column<Row>[] = [
    {
      id: "name",
      header: "Lote",
      primary: true,
      sortValue: (r) => r.name,
      cell: (r) => (
        <span className="ds-dt-name">
          <span className="ds-dt-glyph" aria-hidden="true">
            <Icon name="lots" size={15} />
          </span>
          <span>
            <strong>{r.name}</strong>
            <small>{r.place}</small>
          </span>
        </span>
      ),
    },
    {
      id: "quantity",
      header: "Produção",
      align: "end",
      firstDir: "desc",
      sortValue: (r) => r.quantity,
      cell: (r) => (
        <span className="ds-dt-mono">
          {r.quantity.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} t
        </span>
      ),
    },
    { id: "owner", header: "Responsável", sortValue: (r) => r.owner, cell: (r) => r.owner },
    {
      id: "status",
      header: "Situação",
      sortValue: (r) => r.status,
      cell: (r) => (
        <StatusBadge
          tone={statusTone[r.status]}
          circle={statusCircle[r.status]}
          size="sm"
          label={statusText[r.status]}
        />
      ),
    },
    {
      id: "updated",
      header: "Atualização",
      firstDir: "desc",
      hideBelow: "md",
      sortValue: (r) => r.updated,
      cell: (r) =>
        new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
          new Date(r.updated),
        ),
    },
  ];

  const facet = (key: "material" | "owner", values: string[]) =>
    values.map((v) => ({
      value: v,
      label: v,
      count: rows.filter(
        (r) =>
          r[key] === v &&
          (key === "material" ? !owner.length || owner.includes(r.owner) : !picked.length || picked.includes(r.material)),
      ).length,
    }));

  return (
    <div className="ds-datalab">
      <div className="ds-datalab__stage">
        <div className="ds-datalab__head">
          <div>
            <p className="ds-datalab__eyebrow">DataTable · Tabs · FacetFilter · Drawer</p>
            <h3>Uma lista de trabalho completa</h3>
            <p>
              Ordene pelas colunas, filtre por faceta, selecione com Shift para
              intervalos, use o menu da linha ou abra a visualização rápida.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            startIcon={<Icon name="copy" size={15} />}
            onClick={() => onCopy(snippet, "Uso do DataTable")}
          >
            Copiar uso
          </Button>
        </div>
        <Tabs<Tab>
          variant="underline"
          ariaLabel="Situação dos lotes de exemplo"
          panelId="ds-datalab-table"
          active={tab}
          onChange={setTab}
          tabs={[
            { id: "all", label: "Todos", count: count("all") },
            { id: "draft", label: "Rascunhos", count: count("draft") },
            { id: "ready", label: "Prontos", count: count("ready") },
            { id: "archived", label: "Arquivados", count: count("archived") },
          ]}
        />
        <FilterBar
          search={query}
          onSearch={setQuery}
          searchLabel="Buscar lotes de exemplo"
          placeholder="Buscar lote, pessoa ou local…"
          active={Boolean(query || picked.length || owner.length)}
          onClear={() => {
            setQuery("");
            setPicked([]);
            setOwner([]);
          }}
          filters={
            <>
              <FacetFilter label="Material" icon="lots" selected={picked} onChange={setPicked} options={facet("material", materials)} />
              <FacetFilter label="Responsável" icon="user" selected={owner} onChange={setOwner} options={facet("owner", owners)} />
            </>
          }
        />
        <div id="ds-datalab-table" role="tabpanel" aria-label="Lotes de exemplo filtrados">
          <DataTable<Row>
            id="ds-datalab"
            label="Lotes de exemplo"
            rows={visible}
            columns={columns}
            getRowId={(r) => r.id}
            rowLabel={(r) => r.name}
            defaultSort={{ id: "updated", dir: "desc" }}
            selectable
            pageSize={5}
            rowTone={(r) => (r.status === "draft" && r.quantity < 100 ? "warning" : undefined)}
            summary={
              <>
                <strong>{visible.length}</strong> lotes de exemplo
              </>
            }
            rowAccessory={(r) => (
              <Tooltip content="Visualizar rápido">
                <button
                  type="button"
                  data-reveal
                  className="lastre-menu-trigger lastre-menu-trigger--sm"
                  aria-label={`Visualizar ${r.name}`}
                  onClick={() => setPeek(r)}
                >
                  <Icon name="panel-right" size={15} />
                </button>
              </Tooltip>
            )}
            rowActions={(r) => [
              { id: "peek", label: "Visualizar rápido", icon: "panel-right", onSelect: () => setPeek(r) },
              { id: "copy", label: "Copiar identificação", icon: "copy", onSelect: () => onCopy(r.name, "Identificação") },
              { type: "separator", id: "s" },
              {
                id: "archive",
                label: r.status === "archived" ? "Restaurar" : "Arquivar",
                icon: r.status === "archived" ? "refresh" : "archive",
                danger: r.status !== "archived",
                onSelect: () =>
                  setRows((all) =>
                    all.map((x) =>
                      x.id === r.id ? { ...x, status: x.status === "archived" ? "draft" : "archived" } : x,
                    ),
                  ),
              },
            ]}
            bulkActions={(selection, clear) => (
              <>
                <button
                  type="button"
                  className="lastre-bulk-action"
                  onClick={() => {
                    const ids = new Set(selection.map((r) => r.id));
                    setRows((all) => all.map((x) => (ids.has(x.id) ? { ...x, status: "ready" } : x)));
                    clear();
                  }}
                >
                  <Icon name="check" size={15} /> Marcar prontos
                </button>
                <button
                  type="button"
                  className="lastre-bulk-action"
                  data-danger
                  onClick={() => {
                    const ids = new Set(selection.map((r) => r.id));
                    setRows((all) => all.map((x) => (ids.has(x.id) ? { ...x, status: "archived" } : x)));
                    clear();
                  }}
                >
                  <Icon name="archive" size={15} /> Arquivar
                </button>
              </>
            )}
          />
        </div>
      </div>

      <div className="ds-datalab__grid">
        <article className="ds-datalab__card">
          <p className="ds-datalab__eyebrow">Select</p>
          <h3>Escolha única, com contexto</h3>
          <div className="ds-datalab__stack">
            <label className="ds-datalab__label" id="ds-unit-label">
              Unidade
            </label>
            <Select
              aria-labelledby="ds-unit-label"
              value={unit}
              onChange={setUnit}
              options={[
                { value: "t", label: "Toneladas (t)", description: "Massa. Padrão para minerais." },
                { value: "kg", label: "Quilogramas (kg)", description: "Massa em pequena escala." },
                { value: "m3", label: "Metros cúbicos (m³)", description: "Volume." },
                { value: "mwh", label: "Megawatt-hora (MWh)", description: "Energia gerada.", group: "Energia" },
                { value: "kwh", label: "Quilowatt-hora (kWh)", description: "Energia em pequena escala.", group: "Energia" },
              ]}
            />
            <Select
              variant="toolbar"
              aria-label="Versão"
              prefix={
                <>
                  <Icon name="history" size={15} /> Consultar
                </>
              }
              value={version}
              onChange={setVersion}
              options={[
                { value: "draft", label: "Rascunho atual", icon: "capture", description: "rev. 4" },
                { value: "v2", label: "Versão 2", icon: "lock", description: "Enviada em 12/09/2026", group: "Enviadas" },
                { value: "v1", label: "Versão 1", icon: "lock", description: "Enviada em 02/08/2026", group: "Enviadas" },
              ]}
            />
          </div>
        </article>

        <article className="ds-datalab__card">
          <p className="ds-datalab__eyebrow">DropdownMenu · Tooltip</p>
          <h3>Ações onde o trabalho acontece</h3>
          <div className="ds-datalab__row">
            <DropdownMenu
              label="Ações do lote"
              showLabel
              trigger={<Icon name="more" size={16} />}
              triggerClassName="lastre-button lastre-button--secondary lastre-button--sm ds-datalab__menu-btn"
              placement="bottom-start"
              items={[
                { id: "open", label: "Abrir dossiê", icon: "arrow-right" },
                { id: "share", label: "Compartilhar", icon: "share", description: "Revisar e enviar uma versão." },
                { type: "separator", id: "s1" },
                { type: "label", id: "l1", label: "Exibição" },
                {
                  type: "checkbox",
                  id: "pin",
                  label: "Fixar no início",
                  checked: menuState.pinned,
                  onSelect: () => setMenuState((m) => ({ ...m, pinned: !m.pinned })),
                },
                {
                  type: "radio",
                  id: "comfortable",
                  label: "Confortável",
                  checked: menuState.density === "comfortable",
                  onSelect: () => setMenuState((m) => ({ ...m, density: "comfortable" })),
                },
                {
                  type: "radio",
                  id: "compact",
                  label: "Compacta",
                  checked: menuState.density === "compact",
                  onSelect: () => setMenuState((m) => ({ ...m, density: "compact" })),
                },
                { type: "separator", id: "s2" },
                { id: "disabled", label: "Marcar pronto", icon: "check", disabled: true, description: "Falta: Quantidade" },
                { id: "archive", label: "Arquivar", icon: "archive", danger: true },
              ]}
            />
            <Tooltip content="Exportar a lista em CSV">
              <button type="button" className="lastre-menu-trigger" aria-label="Exportar">
                <Icon name="download" size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Colunas e densidade">
              <button type="button" className="lastre-menu-trigger" aria-label="Opções de exibição">
                <Icon name="columns" size={16} />
              </button>
            </Tooltip>
          </div>
          <p className="ds-datalab__note">
            Setas, Home/End e digitação navegam no menu. Esc devolve o foco ao botão.
          </p>
        </article>

        <article className="ds-datalab__card">
          <p className="ds-datalab__eyebrow">Tabs segmentadas · Checkbox</p>
          <h3>Controles compactos</h3>
          <Tabs
            ariaLabel="Período"
            active={segment}
            onChange={setSegment}
            tabs={[
              { id: "dia", label: "Dia" },
              { id: "semana", label: "Semana", count: 12 },
              { id: "mes", label: "Mês" },
            ]}
          />
          <div className="ds-datalab__checks">
            <label>
              <Checkbox defaultChecked /> Selecionado
            </label>
            <label>
              <Checkbox indeterminate readOnly /> Parcial
            </label>
            <label>
              <Checkbox /> Livre
            </label>
            <label>
              <Checkbox disabled /> Indisponível
            </label>
          </div>
        </article>
      </div>

      <Drawer
        open={Boolean(peek)}
        onClose={() => setPeek(null)}
        eyebrow="Lote de exemplo"
        title={peek?.name ?? ""}
        leading={
          <span className="ds-dt-glyph ds-dt-glyph--lg" aria-hidden="true">
            <Icon name="lots" size={19} />
          </span>
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setPeek(null)}>
              Fechar
            </Button>
            <Button onClick={() => setPeek(null)}>Abrir dossiê</Button>
          </>
        }
      >
        {peek && (
          <>
            <section className="lastre-drawer-section">
              <h3>Propriedades</h3>
              <dl className="ds-datalab__props">
                <dt>Responsável</dt>
                <dd>{peek.owner}</dd>
                <dt>Local</dt>
                <dd>{peek.place}</dd>
                <dt>Produção</dt>
                <dd>{peek.quantity.toLocaleString("pt-BR")} t</dd>
                <dt>Situação</dt>
                <dd>{statusText[peek.status]}</dd>
              </dl>
            </section>
            <section className="lastre-drawer-section">
              <h3>Sobre este painel</h3>
              <p className="ds-datalab__note">
                Drawer sobre o &lt;dialog&gt; nativo: foco contido, Esc fecha e o foco
                volta a quem abriu. No celular, sobe como folha inferior.
              </p>
            </section>
          </>
        )}
      </Drawer>
    </div>
  );
}
