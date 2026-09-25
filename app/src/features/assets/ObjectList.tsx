import { useState } from "react";
import { ImportLots } from "./ImportLots";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { useWorkspace } from "./context";
import {
  canCreate,
  categoryLabels,
  dateLabel,
  objectPath,
  quantityLabel,
  sectorLabels,
  statusLabels,
} from "./model";
import { Badge, Empty, PageHead } from "./ui";
export function AssetsObjectList({ kind }: { kind: "asset" | "lot" }) {
  const { data } = useWorkspace();
  const [importing, setImporting] = useState(false);
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = params.get("status") ?? "active";
  const sector = params.get("sector") ?? "";
  const view = params.get("view") === "grid" ? "grid" : "list";
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const objects = data.objects.filter((o) => o.kind === kind);
  const filtered = objects
    .filter(
      (o) =>
        `${o.fields.name} ${o.fields.location} ${o.fields.material} ${o.fields.responsible}`
          .toLocaleLowerCase("pt-BR")
          .includes(search.toLocaleLowerCase("pt-BR")) &&
        (status === "all" ||
          (status === "active"
            ? o.status !== "archived"
            : o.status === status)) &&
        (!sector || o.fields.sector === sector),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const prefix = `/assets/${kind === "asset" ? "ativos" : "lotes"}`;
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
          canCreate(data.membership.role) && (
            <>
              {kind === "lot" && (
                <button
                  className="assets-button"
                  onClick={() => setImporting((v) => !v)}
                >
                  Importar CSV
                </button>
              )}
              <Link
                className="assets-button assets-button--primary"
                to={`${prefix}/novo`}
              >
                ＋ Cadastrar {kind === "asset" ? "ativo" : "lote"}
              </Link>
            </>
          )
        }
      />
      {importing && kind === "lot" && (
        <ImportLots onClose={() => setImporting(false)} />
      )}
      <div className="assets-toolbar">
        <label className="assets-search">
          <Icon name="search" />
          <input
            aria-label={`Buscar ${kind === "asset" ? "ativos" : "lotes"}`}
            placeholder="Buscar por nome, local ou responsável…"
            value={search}
            onChange={(e) => set("q", e.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar situação"
          value={status}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="active">Cadastros ativos</option>
          <option value="all">Todas as situações</option>
          <option value="draft">Rascunhos</option>
          <option value="ready">Prontos para revisão</option>
          <option value="archived">Arquivados</option>
        </select>
        <select
          aria-label="Filtrar setor"
          value={sector}
          onChange={(e) => set("sector", e.target.value)}
        >
          <option value="">Todos os setores</option>
          {Object.entries(sectorLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <div className="assets-segments assets-view-switch">
          <button
            aria-label="Exibir lista"
            aria-pressed={view === "list"}
            onClick={() => set("view", "list")}
          >
            <Icon name="lots" />
          </button>
          <button
            aria-label="Exibir cartões"
            aria-pressed={view === "grid"}
            onClick={() => set("view", "grid")}
          >
            <Icon name="overview" />
          </button>
        </div>
      </div>
      <p className="assets-result-count">
        {filtered.length} {kind === "asset" ? "ativo(s)" : "lote(s)"} ·
        ordenados pela última atualização
      </p>
      {!filtered.length ? (
        <Empty
          title={
            objects.length
              ? "Nenhum cadastro com esses filtros"
              : kind === "asset"
                ? "Vamos organizar seu primeiro ativo?"
                : "Sua produção começa com um lote"
          }
          description={
            objects.length
              ? "Tente outro nome, setor ou situação."
              : "Comece com as informações que você já tem. O rascunho pode ser completado depois."
          }
          action={
            objects.length ? (
              <button className="assets-button" onClick={() => setParams({})}>
                Limpar filtros
              </button>
            ) : (
              canCreate(data.membership.role) && (
                <Link
                  className="assets-button assets-button--primary"
                  to={`${prefix}/novo`}
                >
                  Cadastrar {kind === "asset" ? "ativo" : "lote"}
                </Link>
              )
            )
          }
        />
      ) : view === "grid" ? (
        <div className="assets-object-grid">
          {filtered.map((o) => (
            <Link key={o.id} to={objectPath(o)} className="assets-object-card">
              <div className="assets-object-cover">
                <Icon name={kind === "lot" ? "lots" : "globe"} size={36} />
                <span>{sectorLabels[o.fields.sector]}</span>
              </div>
              <div>
                <div className="assets-row">
                  <span className="assets-eyebrow">
                    {categoryLabels[o.fields.category]}
                  </span>
                  <Badge tone={o.status === "ready" ? "good" : "neutral"}>
                    {statusLabels[o.status]}
                  </Badge>
                </div>
                <h2>{o.fields.name || "Sem identificação"}</h2>
                <p>{o.fields.location || "Localização a informar"}</p>
                <footer>
                  <span>
                    {kind === "lot"
                      ? quantityLabel(o)
                      : sectorLabels[o.fields.sector]}
                  </span>
                  <Icon name="chevron-right" />
                </footer>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="assets-table-wrap">
          <table className="assets-table">
            <thead>
              <tr>
                <th>{kind === "asset" ? "Ativo" : "Lote"}</th>
                <th>{kind === "asset" ? "Tipo / setor" : "Produção"}</th>
                <th>Responsável</th>
                <th>Situação</th>
                <th>Atualização</th>
                <th>
                  <span className="assets-sr-only">Abrir</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={objectPath(o)} className="assets-object-name">
                      <span className="assets-object-icon">
                        <Icon
                          name={kind === "asset" ? "globe" : "lots"}
                          size={22}
                        />
                      </span>
                      <span>
                        <strong>{o.fields.name || "Sem identificação"}</strong>
                        <small>
                          {o.fields.location || "Localização a informar"}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    {kind === "lot"
                      ? quantityLabel(o)
                      : categoryLabels[o.fields.category]}
                    <small>
                      {kind === "lot"
                        ? o.fields.material || "Material a informar"
                        : sectorLabels[o.fields.sector]}
                    </small>
                  </td>
                  <td>{o.fields.responsible || "A definir"}</td>
                  <td>
                    <Badge tone={o.status === "ready" ? "good" : "neutral"}>
                      {statusLabels[o.status]}
                    </Badge>
                  </td>
                  <td>{dateLabel(o.updatedAt)}</td>
                  <td>
                    <Link
                      className="assets-icon-button"
                      to={objectPath(o)}
                      aria-label={`Abrir ${o.fields.name || "cadastro"}`}
                    >
                      <Icon name="chevron-right" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
