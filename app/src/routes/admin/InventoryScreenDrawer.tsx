import { useLayoutEffect, useRef } from "react";
import { Tabs } from "../../components/ui/Tabs";
import { apps } from "../../lib/inventory/apps";
import { flows } from "../../lib/inventory/flows";
import { operations } from "../../lib/inventory/operations";
import type { Screen } from "../../lib/inventory/types";
import { InventorySpecification } from "./InventorySpecification";

const drawerTabs = [
  { id: "visao-geral", label: "Visão geral" },
  { id: "contrato", label: "Contrato" },
  { id: "estados", label: "Estados" },
  { id: "operacoes", label: "Operações" },
  { id: "fluxos", label: "Fluxos" },
];

type InventoryScreenDrawerProps = {
  screen: Screen;
  tab: string | null;
  onTabChange: (tab: string) => void;
  onClose: () => void;
};

export function InventoryScreenDrawer({
  screen,
  tab,
  onTabChange,
  onClose,
}: InventoryScreenDrawerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const active =
    drawerTabs.find((item) => item.id === tab)?.id ?? "visao-geral";
  const app = apps.find((item) => item.id === screen.app)!;
  const relatedFlows = flows.filter((flow) =>
    flow.steps.some((step) => step.screen === screen.id),
  );
  const status =
    screen.lifecycle === "planned"
      ? "Planejada"
      : screen.route.origin === "web"
        ? "Leitura manual"
        : "Rota encontrada";

  useLayoutEffect(() => {
    const element = dialog.current;
    const opener =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : document.getElementById("admin-main");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element?.showModal();
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const panel =
      dialog.current?.querySelector<HTMLElement>('[role="tabpanel"]');
    if (panel) panel.scrollTop = 0;
    dialog.current
      ?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      ?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
  }, [active]);

  return (
    <dialog
      ref={dialog}
      className="iv-dossier"
      aria-labelledby="iv-dossier-title"
      aria-describedby="iv-dossier-description"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        // Keep the cycle inside the drawer, including at the browser chrome boundary.
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button, a[href], input, select, textarea, [tabindex]",
          ),
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            element.getClientRects().length > 0,
        );
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first && last) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === last &&
          first
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <span className="iv-eyebrow">
          {screen.id} / {app.name}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar ficha"
          className="iv-button"
        >
          Fechar ×
        </button>
      </header>
      <div className="iv-dossier-summary">
        <span
          className={`iv-badge ${screen.lifecycle === "planned" ? "iv-badge--planned" : ""}`}
        >
          {status}
        </span>
        <h2 id="iv-dossier-title">{screen.name}</h2>
        <p id="iv-dossier-description" className="iv-lead">
          {screen.objective}
        </p>
      </div>
      <Tabs
        tabs={drawerTabs}
        active={active}
        onChange={onTabChange}
        ariaLabel={`Seções da ficha ${screen.id}`}
      >
        {active === "visao-geral" && (
          <>
            <dl className="iv-facts">
              <div>
                <dt>
                  Rota{" "}
                  {screen.lifecycle === "planned" ? "proposta" : "declarada"}
                </dt>
                <dd>
                  <code>{screen.route.path}</code>
                </dd>
              </div>
              <div>
                <dt>Superfície</dt>
                <dd>
                  {screen.kind === "redirect"
                    ? "Redirecionamento"
                    : screen.kind === "hosted"
                      ? "Superfície hospedada"
                      : "Página"}{" "}
                  · origem {screen.route.origin}/
                </dd>
              </div>
              <div>
                <dt>Fonte</dt>
                <dd>
                  <code>{screen.source ?? "Ainda não implementada"}</code>
                </dd>
              </div>
              <div>
                <dt>Responsável proposto</dt>
                <dd>{screen.owner}</dd>
              </div>
            </dl>
            <section>
              <h3>O que sabemos</h3>
              <p>{screen.notes}</p>
              <p className="iv-muted">
                A presença da rota não comprova integração, autorização ou
                prontidão para produção.
              </p>
            </section>
            <section>
              <h3>Acesso</h3>
              <p>{app.access}</p>
            </section>
            <section>
              <h3>Risco e evidência</h3>
              <p>
                Não avaliados. Dossiê, dados pessoais e testes de contrato serão
                associados na próxima etapa.
              </p>
            </section>
          </>
        )}
        {active === "contrato" && (
          <InventorySpecification screenId={screen.id} />
        )}
        {active === "estados" && (
          <section>
            <h3>
              Estados{" "}
              {screen.lifecycle === "planned" ? "propostos" : "da interface"}
            </h3>
            {screen.states.length ? (
              <div className="iv-tags">
                {screen.states.map((state) => (
                  <span className="iv-badge" key={state}>
                    {state}
                  </span>
                ))}
              </div>
            ) : (
              <p className="iv-muted">
                Ainda não auditados. Vazio e indisponível precisam de
                verificações separadas.
              </p>
            )}
          </section>
        )}
        {active === "operacoes" && (
          <section>
            <h3>
              Operações declaradas{" "}
              <span className="iv-count">{screen.operations.length}</span>
            </h3>
            {screen.operations.length ? (
              screen.operations.map((id) => {
                const operation = operations.find((item) => item.id === id)!;
                return (
                  <div className="iv-contract" key={id}>
                    <code>{id}</code>
                    <p>{operation.name}</p>
                    <small>
                      {operation.status === "proposed"
                        ? "Proposta · sem endpoint definido"
                        : operation.transport}
                    </small>
                  </div>
                );
              })
            ) : (
              <p className="iv-muted">
                Nenhuma operação mapeada nesta ficha. Isso não comprova que a
                tela é estática.
              </p>
            )}
            <p className="iv-muted">
              Mapeamento parcial; chamadas ainda não reconciliadas com o código.
            </p>
          </section>
        )}
        {active === "fluxos" && (
          <section>
            <h3>Fluxos relacionados</h3>
            {relatedFlows.length ? (
              relatedFlows.map((flow) => (
                <div className="iv-contract" key={flow.id}>
                  <code>{flow.id}</code>
                  <p>{flow.name}</p>
                  <small>Proposto</small>
                </div>
              ))
            ) : (
              <p className="iv-muted">Ainda sem fluxo registrado.</p>
            )}
          </section>
        )}
      </Tabs>
    </dialog>
  );
}
