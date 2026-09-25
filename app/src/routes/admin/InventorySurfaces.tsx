import { useEffect, useState } from "react";
import { Link, useBlocker } from "react-router-dom";
import { Select } from "../../components/ui/Select";
import { Icon } from "../../components/ui/Icon";
import { adminSurfaceDefinitions } from "../../lib/inventory/admin";
import { screens } from "../../lib/inventory/screens";
import { useUnloadGuard } from "./AdminUI";
import { InventorySurfaceFrame } from "./InventorySurfaceFrame";
import { surfaceExamples, type SurfaceId } from "./inventory-surface-previews";
import {
  surfaceGroups,
  scenariosFor,
  scenarioLabels,
  validScenario,
} from "./surface-scenarios";
import { surfaceLab } from "./surface-lab-runtime";
import "./inventory-surfaces.css";

type Props = {
  params: URLSearchParams;
  update: (values: Record<string, string | null>, replace?: boolean) => void;
  onChoose: (id: string) => void;
};
type Definition = (typeof adminSurfaceDefinitions)[number];
const formats = [
  { id: "all", label: "Todos" },
  { id: "modal", label: "Modais" },
  { id: "drawer", label: "Drawers" },
  { id: "inline", label: "Na página" },
];
const kindOf = (s: Definition) =>
  s.format.startsWith("modal")
    ? "modal"
    : s.format.startsWith("drawer")
      ? "drawer"
      : "inline";
const kindLabel = (s: Definition) =>
  kindOf(s) === "modal"
    ? "Modal"
    : kindOf(s) === "drawer"
      ? "Drawer"
      : "Na página";
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const byId = new Map(screens.map((s) => [s.id, s]));
export function InventorySurfaces(props: Props) {
  // Following an inventory link inside an example must never nest laboratories.
  if (surfaceLab)
    return (
      <p>
        Explore outras interfaces pelo índice do inventário, fora desta prévia.
      </p>
    );
  return <SurfaceStudio {...props} />;
}
function SurfaceStudio({ params, update, onChoose }: Props) {
  const query = params.get("buscaSuperficie") ?? "";
  const kind = formats.find((f) => f.id === params.get("formato"))?.id ?? "all";
  const selectedId = params.get("preview") ?? "AD-S02";
  const selected = adminSurfaceDefinitions.find((s) => s.id === selectedId);
  const filtered = adminSurfaceDefinitions.filter(
    (s) =>
      (kind === "all" || kindOf(s) === kind) &&
      normalize(
        `${s.id} ${s.name} ${s.trigger} ${s.host} ${byId.get(s.host)?.name} ${s.data}`,
      ).includes(normalize(query)),
  );
  const [dirtyA, setDirtyA] = useState(false);
  const [dirtyB, setDirtyB] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [smallScreen, setSmallScreen] = useState(
    () => window.matchMedia("(max-width: 650px)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(max-width: 650px)");
    const changed = () => setSmallScreen(query.matches);
    query.addEventListener("change", changed);
    return () => query.removeEventListener("change", changed);
  }, []);
  const dirty = dirtyA || dirtyB;
  useUnloadGuard(dirty);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!dirty) return false;
    const current = new URLSearchParams(currentLocation.search),
      next = new URLSearchParams(nextLocation.search);
    return (
      currentLocation.pathname !== nextLocation.pathname ||
      [
        "view",
        "preview",
        "cenario",
        "comparar",
        "tentativa",
        "tentativaB",
      ].some((key) => current.get(key) !== next.get(key))
    );
  });
  const scenario = selected
    ? validScenario(selected.id, params.get("cenario"))
    : "initial";
  const comparison =
    selected && params.has("comparar")
      ? validScenario(selected.id, params.get("comparar"))
      : null;
  const mobile =
    params.get("viewport") === "mobile" ||
    (params.get("viewport") !== "desktop" && smallScreen);
  const choose = (id: SurfaceId) =>
    update({
      preview: id,
      cenario: null,
      comparar: null,
      tentativa: null,
      tentativaB: null,
      screen: null,
      tab: null,
    });
  const restart = (key: "tentativa" | "tentativaB") =>
    update({ [key]: String(Date.now()) }, true);
  return (
    <div className="iv-studio">
      <div className="iv-section-heading iv-surfaces-heading">
        <div>
          <h2>Biblioteca interativa</h2>
        </div>
        <span className="iv-studio-total">
          <strong>{adminSurfaceDefinitions.length}</strong> interfaces vivas
        </span>
      </div>
      <div className="iv-surfaces-toolbar">
        <div
          className="iv-surface-formats"
          role="group"
          aria-label="Filtrar por formato"
        >
          {formats.map((format) => (
            <button
              key={format.id}
              type="button"
              aria-pressed={kind === format.id}
              onClick={() => update({ formato: format.id })}
            >
              {format.label}
              <span>
                {
                  adminSurfaceDefinitions.filter(
                    (s) => format.id === "all" || kindOf(s) === format.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <label className="iv-surface-search">
          <Icon name="search" size={16} />
          <span className="iv-sr-only">Buscar modal ou drawer</span>
          <input
            type="search"
            value={query}
            placeholder="Nome, ID ou tela de origem…"
            onChange={(e) => update({ buscaSuperficie: e.target.value }, true)}
          />
        </label>
      </div>
      {(query || kind !== "all") && (
        <div className="iv-studio-filter-result" role="status">
          <span>
            {filtered.length}{" "}
            {filtered.length === 1
              ? "interface encontrada"
              : "interfaces encontradas"}
            {!filtered.length && ". A prévia atual permanece aberta."}
          </span>
          <button
            type="button"
            className="iv-text-button"
            onClick={() => update({ formato: null, buscaSuperficie: null })}
          >
            Limpar filtros
          </button>
        </div>
      )}
      {blocker.state === "blocked" && (
        <div className="iv-studio-discard" role="alert">
          <div>
            <strong>Há alterações nesta prévia</strong>
            <p>Trocar o exemplo descarta os campos que você alterou.</p>
          </div>
          <button
            type="button"
            className="iv-button"
            onClick={() => blocker.reset()}
          >
            Continuar explorando
          </button>
          <button
            type="button"
            className="iv-button"
            onClick={() => {
              setDirtyA(false);
              setDirtyB(false);
              blocker.proceed();
            }}
          >
            Descartar e continuar
          </button>
        </div>
      )}
      <div
        className={`iv-studio-layout${expanded || comparison ? " iv-studio-layout--wide" : ""}`}
      >
        <aside className="iv-surface-index" aria-label="Índice de interfaces">
          <div className="iv-index-heading">
            <span role="status">
              {filtered.length}{" "}
              {filtered.length === 1 ? "interface" : "interfaces"}
            </span>
            <span>POR TAREFA</span>
          </div>
          <div className="iv-index-items">
            {surfaceGroups.map((group) => {
              const items = group.ids
                .map((id) => filtered.find((s) => s.id === id))
                .filter((s): s is Definition => !!s);
              return (
                items.length > 0 && (
                  <section key={group.name}>
                    <h3>{group.name}</h3>
                    {items.map((surface) => (
                      <button
                        key={surface.id}
                        type="button"
                        className="iv-surface-index-item"
                        aria-current={
                          surface.id === selectedId ? "true" : undefined
                        }
                        onClick={() => choose(surface.id)}
                      >
                        <span
                          className={`iv-format-icon iv-format-icon--${kindOf(surface)}`}
                          aria-hidden="true"
                        >
                          <i />
                        </span>
                        <span>
                          <strong>{surface.name}</strong>
                          <small>
                            {surface.id} · {kindLabel(surface)}
                          </small>
                        </span>
                        <span className="iv-index-arrow" aria-hidden="true">
                          →
                        </span>
                      </button>
                    ))}
                  </section>
                )
              );
            })}
            {!filtered.length && (
              <div className="iv-index-empty">
                <h3>Nenhuma interface encontrada</h3>
                <p>A prévia atual permanece aberta enquanto você busca.</p>
                <button
                  type="button"
                  className="iv-text-button"
                  onClick={() =>
                    update({ formato: null, buscaSuperficie: null })
                  }
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </aside>
        <div className="iv-studio-workspace">
          <label className="iv-studio-picker">
            <span>Interface</span>
            <Select
              aria-label="Escolher interface"
              searchable
              value={selected?.id ?? ""}
              onChange={choose}
              options={filtered.map((s) => ({
                value: s.id,
                label: s.name,
                description: `${s.id} · ${kindLabel(s)}`,
                group: surfaceGroups.find((g) => g.ids.includes(s.id))?.name,
              }))}
            />
          </label>
          {selected ? (
            <>
              <header className="iv-studio-selected">
                <div>
                  <div className="iv-studio-kicker">
                    <code>{selected.id}</code>
                    <span className="iv-badge">{kindLabel(selected)}</span>
                  </div>
                  <h3>{selected.name}</h3>
                  <p>
                    {byId.get(selected.host)?.name}
                    <span aria-hidden="true"> / </span>
                    {selected.trigger}
                  </p>
                </div>
                {!comparison && (
                  <button
                    type="button"
                    className="iv-button iv-expand-button"
                    aria-pressed={expanded}
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? "Mostrar índice" : "Ampliar prévia"}
                  </button>
                )}
              </header>
              <div className="iv-studio-controls">
                <label>
                  <span>Estado</span>
                  <Select
                    aria-label="Estado da prévia"
                    size="sm"
                    value={scenario}
                    onChange={(value) => update({ cenario: value })}
                    options={scenariosFor(selected.id).map((value) => ({
                      value,
                      label: scenarioLabels[value],
                    }))}
                  />
                </label>
                <label>
                  <span>Viewport</span>
                  <Select
                    aria-label="Viewport da prévia"
                    size="sm"
                    value={mobile ? "mobile" : "desktop"}
                    onChange={(value) => update({ viewport: value })}
                    options={[
                      { value: "desktop", label: "Amplo · 720 px" },
                      { value: "mobile", label: "Celular · 390 px" },
                    ]}
                  />
                </label>
                <button
                  type="button"
                  className="iv-button iv-compare-button"
                  aria-pressed={!!comparison}
                  disabled={scenariosFor(selected.id).length < 2}
                  onClick={() =>
                    update({
                      comparar: comparison
                        ? null
                        : (scenariosFor(selected.id).find(
                            (s) => s !== scenario,
                          ) ?? "initial"),
                    })
                  }
                >
                  Comparar estados
                </button>
              </div>
              {comparison && (
                <div className="iv-comparison-control">
                  <span>Comparando com</span>
                  <Select
                    aria-label="Estado de comparação"
                    size="sm"
                    value={comparison}
                    onChange={(value) => update({ comparar: value })}
                    options={scenariosFor(selected.id).map((value) => ({
                      value,
                      label: scenarioLabels[value],
                    }))}
                  />
                  <button
                    type="button"
                    className="iv-text-button"
                    onClick={() => update({ comparar: null })}
                  >
                    Fechar comparação
                  </button>
                </div>
              )}
              <div
                className={`iv-studio-frames${comparison ? " iv-studio-frames--compare" : ""}`}
              >
                <InventorySurfaceFrame
                  id={selected.id}
                  name={selected.name}
                  scenario={scenario}
                  mobile={mobile}
                  revision={params.get("tentativa") ?? "0"}
                  onDirty={setDirtyA}
                  onRestart={() => restart("tentativa")}
                />
                {comparison && (
                  <InventorySurfaceFrame
                    id={selected.id}
                    name={selected.name}
                    scenario={comparison}
                    mobile={mobile}
                    revision={params.get("tentativaB") ?? "0"}
                    onDirty={setDirtyB}
                    onRestart={() => restart("tentativaB")}
                  />
                )}
              </div>
              <div className="iv-studio-context">
                <div>
                  <span className="iv-eyebrow">O QUE CONFERIR</span>
                  <p>{selected.data}</p>
                  <small>
                    Dados fictícios. Alterações ficam nesta prévia e são
                    descartadas ao reiniciar.
                  </small>
                </div>
                <div className="iv-studio-links">
                  <button
                    type="button"
                    className="iv-text-button"
                    aria-haspopup="dialog"
                    onClick={() => onChoose(selected.id)}
                  >
                    Ver ficha {selected.id} →
                  </button>
                  <Link to={surfaceExamples[selected.id].href}>
                    Abrir tela de origem ↗
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="iv-empty" role="status">
              <h3>Interface não encontrada</h3>
              <p>Escolha uma interface no índice para retomar a exploração.</p>
              <button
                type="button"
                className="iv-button"
                onClick={() => choose("AD-S02")}
              >
                Abrir Criar ocorrência
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
