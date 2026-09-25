import { Select } from "../../components/ui/Select";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs } from "../../components/ui/Tabs";
import { apps } from "../../lib/inventory/apps";
import { screens } from "../../lib/inventory/screens";
import { operations } from "../../lib/inventory/operations";
import { flows } from "../../lib/inventory/flows";
import { specifications } from "../../lib/inventory/specifications";
import { governance } from "../../lib/inventory/governance";
import { InventoryScreenDrawer } from "./InventoryScreenDrawer";
import { InventoryGovernance } from "./InventoryGovernance";
import { InventorySurfaces } from "./InventorySurfaces";
import { adminSurfaceDefinitions } from "../../lib/inventory/admin";
import report from "../../lib/inventory/generated/report.json";
import type { Screen } from "../../lib/inventory/types";
import "./inventory.css";

const views = [
  ["mapa", "Visão geral"],
  ["catalogo", "Catálogo de telas"],
  ["superficies", "Modais e drawers"],
  ["fluxos", "Fluxos"],
  ["operacoes", "Operações"],
  ["qualidade", "Verificações"],
  ["regras", "Regra de alteração"],
] as const;
const pageTabs = views.map(([id, label]) => ({ id, label }));
const byId = new Map(screens.map((screen) => [screen.id, screen]));
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const statusLabel = (screen: Screen) =>
  screen.lifecycle === "planned"
    ? "Planejada"
    : screen.route.origin === "web"
      ? "Leitura manual"
      : "Rota encontrada";

function exportInventory() {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          apps,
          screens,
          surfaces: adminSurfaceDefinitions,
          specifications,
          operations,
          flows,
          governance,
          report,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "lastre-inventario.json";
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Inventory() {
  const [params, setParams] = useSearchParams();
  const view = views.find(([id]) => id === params.get("view"))?.[0] ?? "mapa";
  const query = params.get("q") ?? "";
  const appFilter = apps.some((app) => app.id === params.get("app"))
    ? params.get("app")!
    : "all";
  const stateFilter = ["existing", "planned"].includes(
    params.get("status") ?? "",
  )
    ? params.get("status")!
    : "all";
  const selected = byId.get(params.get("screen") ?? "");
  const update = (values: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values))
      value && value !== "all" ? next.set(key, value) : next.delete(key);
    setParams(next, { replace });
  };
  useEffect(() => {
    const title = document.title;
    const lang = document.documentElement.lang;
    document.title = "Inventário vivo · Lastre Admin";
    document.documentElement.lang = "pt-BR";
    return () => {
      document.title = title;
      document.documentElement.lang = lang;
    };
  }, []);
  const filtered = screens.filter(
    (screen) =>
      (appFilter === "all" || screen.app === appFilter) &&
      (stateFilter === "all" || screen.lifecycle === stateFilter) &&
      normalize(
        `${screen.id} ${screen.name} ${screen.route.path} ${screen.objective}`,
      ).includes(normalize(query)),
  );
  const choose = (screen: Screen) => update({ screen: screen.id, tab: null });

  return (
    <div className="iv-page">
      <div className="iv-page-heading">
        <div>
          <p className="iv-eyebrow">O PRODUTO, COM EVIDÊNCIA</p>
          <h1>
            {view === "superficies" ? "Modais e drawers" : "Inventário vivo"}
            <span>.</span>
          </h1>
          <p className="iv-lead">
            {view === "superficies"
              ? "Interfaces reais, estados e contexto. Uma biblioteca para explorar o Admin."
              : "O que existe, o que está planejado e o que ainda precisa ser provado."}
          </p>
        </div>
        <button type="button" className="iv-button" onClick={exportInventory}>
          Exportar JSON <span aria-hidden="true">↓</span>
        </button>
      </div>
      {view !== "superficies" && (
        <div className="iv-notice">
          <span className="iv-notice-dot" aria-hidden="true" />
          <p>
            <strong>Primeira leitura do produto.</strong> Rotas do app
            conferidas no código. Contratos, risco e acesso ainda em avaliação.
            Esta prévia não é publicada em produção.
          </p>
        </div>
      )}

      <div className="iv-page-views">
        <Tabs
          tabs={pageTabs}
          active={view}
          onChange={(id) =>
            update({ view: id, screen: null, tab: null, preview: null })
          }
          ariaLabel="Seções do inventário"
        >
          {view === "mapa" && (
            <>
              <div className="iv-metrics">
                <div>
                  <span>Rotas do app cobertas</span>
                  <strong>
                    {report.totals.covered}
                    <small> / {report.totals.appRoutes}</small>
                  </strong>
                  <p>Inclui atalhos e prévia local</p>
                </div>
                <div>
                  <span>Telas existentes</span>
                  <strong>{report.totals.existingScreens}</strong>
                  <p>App + site · sem redirecionamentos</p>
                </div>
                <div>
                  <span>Telas planejadas</span>
                  <strong>{report.totals.planned}</strong>
                  <p>Assets + Investors</p>
                </div>
                <div>
                  <span>Operações mapeadas</span>
                  <strong>{operations.length}</strong>
                  <p>
                    {report.totals.observedOperations} observadas ·{" "}
                    {report.totals.proposedOperations} propostas
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="iv-surfaces-entry"
                onClick={() => update({ view: "superficies" })}
              >
                <span className="iv-surfaces-entry-art" aria-hidden="true">
                  <i />
                  <b />
                </span>
                <span>
                  <strong>O que abre sobre as telas</strong>
                  <span>
                    {adminSurfaceDefinitions.length} interfaces do Admin:
                    modais, drawers e revisão na página. Veja o formato e
                    experimente.
                  </span>
                </span>
                <span className="iv-surfaces-entry-link">
                  Explorar galeria <span aria-hidden="true">→</span>
                </span>
              </button>
              <div className="iv-section-heading">
                <div>
                  <h2>Um produto, experiências distintas</h2>
                  <p>
                    Cada área mantém seu propósito, suas rotas e seus critérios
                    de acesso.
                  </p>
                </div>
                <span className="iv-count">{apps.length} áreas</span>
              </div>
              <div className="iv-app-grid">
                {apps.map((app) => {
                  const items = screens.filter(
                    (screen) => screen.app === app.id,
                  );
                  const planned = items.filter(
                    (screen) => screen.lifecycle === "planned",
                  ).length;
                  return (
                    <button
                      type="button"
                      className="iv-app-card"
                      key={app.id}
                      onClick={() =>
                        update({
                          view: "catalogo",
                          app: app.id,
                          status: null,
                          q: null,
                        })
                      }
                    >
                      <div>
                        <span className="iv-app-prefix">{app.prefix}</span>
                        <span className="iv-card-arrow" aria-hidden="true">
                          ↗
                        </span>
                      </div>
                      <h3>{app.name}</h3>
                      <p>{app.description}</p>
                      <footer>
                        <span>
                          {items.length}{" "}
                          {items.length === 1 ? "ficha" : "fichas"}
                        </span>
                        <span
                          className={`iv-badge ${planned ? "iv-badge--planned" : ""}`}
                        >
                          {planned
                            ? "Planejado"
                            : app.id === "admin"
                              ? "Prévia local"
                              : "Existente"}
                        </span>
                      </footer>
                    </button>
                  );
                })}
              </div>
              <div className="iv-next">
                <span className="iv-eyebrow">PRÓXIMO MARCO</span>
                <h3>Da rota ao contrato compartilhado.</h3>
                <p>
                  Vincular chamadas reais, estados de erro e permissões às
                  operações. Só então medir integração e prontidão para o
                  backend.
                </p>
                <button
                  type="button"
                  className="iv-text-button"
                  onClick={() => update({ view: "qualidade" })}
                >
                  Ver o que falta verificar <span aria-hidden="true">→</span>
                </button>
              </div>
            </>
          )}

          {view === "superficies" && (
            <InventorySurfaces
              params={params}
              update={update}
              onChoose={(id) => choose(byId.get(id)!)}
            />
          )}

          {view === "catalogo" && (
            <>
              <div className="iv-section-heading">
                <div>
                  <h2>Catálogo de telas</h2>
                  <p>
                    Clique em uma linha para abrir a ficha com a tarefa, a
                    origem e as lacunas.
                  </p>
                </div>
              </div>
              <div className="iv-filters">
                <label className="iv-search">
                  Buscar tela
                  <input
                    type="search"
                    value={query}
                    placeholder="Nome, ID ou rota…"
                    onChange={(event) =>
                      update({ q: event.target.value }, true)
                    }
                  />
                </label>
                <label>
                  Área
                  <Select
                    variant="toolbar"
                    aria-label="Área"
                    value={appFilter}
                    onChange={(next) => update({ app: next })}
                    options={[
                      { value: "all", label: "Todas as áreas" },
                      ...apps.map((app) => ({
                        value: app.id,
                        label: app.name,
                      })),
                    ]}
                  />
                </label>
                <label>
                  Existência
                  <Select
                    variant="toolbar"
                    aria-label="Existência"
                    value={stateFilter}
                    onChange={(next) => update({ status: next })}
                    options={[
                      { value: "all", label: "Existentes e planejadas" },
                      { value: "existing", label: "Existentes" },
                      { value: "planned", label: "Planejadas" },
                    ]}
                  />
                </label>
              </div>
              <p className="iv-result-count" role="status">
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "ficha encontrada"
                  : "fichas encontradas"}
              </p>
              {filtered.length ? (
                <div className="iv-table-wrap">
                  <table className="iv-table">
                    <caption className="iv-sr-only">
                      Telas da Lastre e sua situação no inventário
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Tela / propósito</th>
                        <th scope="col">Área</th>
                        <th scope="col">Rota</th>
                        <th scope="col">Evidência atual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((screen) => (
                        <tr
                          key={screen.id}
                          className="iv-screen-row"
                          onClick={(event) => {
                            // Native controls handle their own clicks; avoid duplicate navigation.
                            if (
                              event.target instanceof Element &&
                              event.target.closest(
                                "button, a, input, select, textarea",
                              )
                            )
                              return;
                            event.currentTarget
                              .querySelector<HTMLButtonElement>(
                                ".iv-screen-link",
                              )
                              ?.focus({ preventScroll: true });
                            choose(screen);
                          }}
                        >
                          <td>
                            <button
                              type="button"
                              className="iv-screen-link"
                              aria-haspopup="dialog"
                              onClick={() => choose(screen)}
                            >
                              <small>{screen.id}</small>
                              <strong>{screen.name}</strong>
                            </button>
                            <p>{screen.objective}</p>
                          </td>
                          <td>
                            {apps.find((app) => app.id === screen.app)?.name}
                          </td>
                          <td>
                            <code>{screen.route.path}</code>
                            {screen.kind === "redirect" && (
                              <small className="iv-muted">
                                Redirecionamento
                              </small>
                            )}
                            {screen.kind === "hosted" && (
                              <small className="iv-muted">
                                {adminSurfaceDefinitions.find(
                                  (surface) => surface.id === screen.id,
                                )?.format ?? "Interface na tela"}
                              </small>
                            )}
                          </td>
                          <td>
                            <span
                              className={`iv-badge ${screen.lifecycle === "planned" ? "iv-badge--planned" : ""}`}
                            >
                              {statusLabel(screen)}
                            </span>
                            <span className="iv-row-action" aria-hidden="true">
                              Abrir ficha →
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="iv-empty">
                  <h3>Nenhuma tela com esses filtros</h3>
                  <p>Tente outro nome ou volte ao catálogo completo.</p>
                  <button
                    className="iv-button"
                    type="button"
                    onClick={() => update({ q: null, app: null, status: null })}
                  >
                    Limpar filtros
                  </button>
                </div>
              )}
            </>
          )}

          {view === "fluxos" && (
            <>
              <div className="iv-section-heading">
                <div>
                  <h2>Jornadas entre os produtos</h2>
                  <p>
                    Jornadas implementadas em Assets e propostas para Investors.
                    Trocas de organização representam mudanças de responsável.
                  </p>
                </div>
              </div>
              <div className="iv-flow-list">
                {flows.map((flow) => (
                  <article className="iv-flow" key={flow.id}>
                    <header>
                      <span className="iv-eyebrow">{flow.id}</span>
                      <span className="iv-badge iv-badge--planned">
                        {flow.status === "implemented"
                          ? "Implementado"
                          : "Proposto"}
                      </span>
                    </header>
                    <h3>{flow.name}</h3>
                    <p>{flow.precondition}</p>
                    <ol>
                      {flow.steps.map((step, index) => (
                        <li key={`${step.screen}-${index}`}>
                          <span className="iv-step-index">{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => choose(byId.get(step.screen)!)}
                          >
                            <small>
                              {step.screen} · {byId.get(step.screen)?.name}
                            </small>
                            <strong>{step.action}</strong>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <p className="iv-flow-result">
                      <strong>Resultado esperado</strong>
                      {flow.result}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}

          {view === "operacoes" && (
            <>
              <div className="iv-section-heading">
                <div>
                  <h2>Operações e contratos</h2>
                  <p>
                    Funções observadas na API e propostas de produto. Nenhuma é
                    marcada como contrato validado.
                  </p>
                </div>
              </div>
              <div className="iv-operation-list">
                {operations.map((op) => (
                  <article className="iv-operation" key={op.id}>
                    <header>
                      <code>{op.id}</code>
                      <span
                        className={`iv-badge ${op.status === "proposed" ? "iv-badge--planned" : ""}`}
                      >
                        {op.status === "proposed"
                          ? "Proposta"
                          : "Função observada"}
                      </span>
                    </header>
                    <h3>{op.name}</h3>
                    <code className="iv-transport">
                      {op.transport ?? "Transporte a definir com backend"}
                    </code>
                    <p>{op.notes}</p>
                    {op.source && (
                      <small className="iv-muted">
                        {op.source} · {op.symbol}
                      </small>
                    )}
                    {op.errors.length > 0 && (
                      <p className="iv-muted">
                        Erros propostos: {op.errors.join(" · ")}
                      </p>
                    )}
                    <div className="iv-operation-screens">
                      {screens
                        .filter((screen) => screen.operations.includes(op.id))
                        .map((screen) => (
                          <button
                            type="button"
                            key={screen.id}
                            onClick={() => choose(screen)}
                          >
                            {screen.id} ↗
                          </button>
                        ))}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {view === "qualidade" && (
            <>
              <div className="iv-section-heading">
                <div>
                  <h2>O alcance das verificações</h2>
                  <p>
                    Passar na cobertura de rotas não significa estar pronto para
                    produção.
                  </p>
                </div>
                <code className="iv-hash">{report.sourceHash}</code>
              </div>
              <div className="iv-checks">
                {report.checks.map((check) => (
                  <article key={check.id}>
                    <span className="iv-check-id">{check.id}</span>
                    <div>
                      <h3>{check.name}</h3>
                      <p>{check.detail}</p>
                    </div>
                    <span
                      className={`iv-badge ${check.status === "pendente" ? "iv-badge--planned" : check.status === "falha" ? "iv-badge--error" : "iv-badge--pass"}`}
                    >
                      {check.status === "passou"
                        ? "Passou"
                        : check.status === "falha"
                          ? "Falhou"
                          : "Pendente"}
                    </span>
                  </article>
                ))}
              </div>
              {report.errors.length > 0 && (
                <div className="iv-empty" role="alert">
                  <h3>Divergências encontradas</h3>
                  {report.errors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
              )}
              <div className="iv-scope">
                <h3>Escopo deste relatório</h3>
                <p>{report.scope}</p>
                <p>
                  {report.freshnessScope} {report.sourceFiles} arquivos
                  monitorados.
                </p>
                <p>
                  Snapshot gerado do código, não monitoramento do ambiente. Para
                  atualizar: <code>npm run inventory:sync</code>. Para conferir:{" "}
                  <code>npm run inventory:check</code>.
                </p>
                <h3>Exclusões explícitas</h3>
                {report.routes
                  .filter((route) => route.excluded)
                  .map((route, index) => (
                    <p key={`${route.file}-${index}`}>
                      <code>{route.path}</code> em <code>{route.file}</code> —{" "}
                      {route.excluded}
                    </p>
                  ))}
              </div>
            </>
          )}
          {view === "regras" && <InventoryGovernance />}
        </Tabs>
      </div>
      <footer className="iv-footer">
        <span>Lastre · Inventário vivo</span>
        <span>Declarado por pessoas. Conferido no código.</span>
      </footer>
      {selected && (
        <InventoryScreenDrawer
          key={selected.id}
          screen={selected}
          tab={params.get("tab")}
          onTabChange={(tab) =>
            update({ tab: tab === "visao-geral" ? null : tab }, true)
          }
          onClose={() => update({ screen: null, tab: null })}
        />
      )}
      {params.has("screen") && !selected && (
        <div className="iv-invalid" role="status">
          Ficha não encontrada.{" "}
          <button
            type="button"
            onClick={() => update({ screen: null, tab: null }, true)}
          >
            Fechar aviso
          </button>
        </div>
      )}
    </div>
  );
}
