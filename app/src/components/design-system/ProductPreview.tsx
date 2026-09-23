import { useState } from "react";
import { Button } from "../ui/Button";
import { StatusBadge } from "../ui/StatusBadge";
import { MetricCard } from "../ui/MetricCard";
import { Tabs } from "../ui/Tabs";
import { EmptyState } from "../ui/EmptyState";
import { SkeletonBlock } from "../ui/Skeleton";
import { InlineNotice } from "../ui/InlineNotice";
import { ChoiceGroup } from "./ChoiceGroup";

const rows = [
  {
    name: "Lote Serra Azul",
    id: "LST-001",
    label: "Verificado",
    tone: "success" as const,
    status: "valid",
  },
  {
    name: "Lote Horizonte",
    id: "LST-002",
    label: "Em análise",
    tone: "warning" as const,
    status: "review",
  },
  {
    name: "Lote Campo Norte",
    id: "LST-003",
    label: "Inválido",
    tone: "danger" as const,
    status: "invalid",
  },
];

export function ProductPreview({
  onCopy,
}: {
  onCopy: (value: string) => void;
}) {
  const [state, setState] = useState<"ready" | "loading" | "empty" | "error">(
    "ready",
  );
  const [tab, setTab] = useState<"all" | "valid" | "review">("all");
  return (
    <>
      <div className="ds-pattern-controls">
        <ChoiceGroup
          label="Simular estado da tela"
          value={state}
          onChange={setState}
          options={[
            { value: "ready", label: "Com dados" },
            { value: "loading", label: "Carregando" },
            { value: "empty", label: "Vazio" },
            { value: "error", label: "Erro" },
          ]}
        />
      </div>
      <div className="ds-product">
        <div className="ds-product__header">
          <div>
            <span className="ds-label">VISÃO GERAL</span>
            <h3>Cadeia de evidências</h3>
          </div>
          <StatusBadge label="Demonstração" tone="info" />
        </div>
        <div
          className="ds-product__content"
          aria-busy={state === "loading" || undefined}
        >
          {state === "loading" && (
            <div className="ds-pattern-loading">
              <p role="status" className="ds-caption">
                Carregando evidências…
              </p>
              <div className="ds-metrics">
                {[1, 2, 3].map((n) => (
                  <SkeletonBlock key={n} height="128px" />
                ))}
              </div>
              <SkeletonBlock height="44px" />
              {[1, 2, 3].map((n) => (
                <SkeletonBlock key={n} height="52px" />
              ))}
            </div>
          )}
          {state === "empty" && (
            <EmptyState
              title="A primeira evidência começa aqui"
              hint="Adicione um registro para acompanhar sua origem e as próximas verificações."
              action={
                <Button onClick={() => setState("ready")}>
                  Carregar exemplo
                </Button>
              }
            />
          )}
          {state === "error" && (
            <InlineNotice
              tone="danger"
              title="Não foi possível carregar as evidências"
              action={
                <Button variant="secondary" onClick={() => setState("ready")}>
                  Tentar novamente
                </Button>
              }
            >
              Os registros permanecem salvos. Tente carregar a lista novamente.
            </InlineNotice>
          )}
          {state === "ready" && (
            <>
              <div className="ds-metrics">
                <MetricCard
                  label="Ativos acompanhados"
                  value="24"
                  hint="Dados de exemplo"
                />
                <MetricCard
                  label="Origem verificada"
                  value="21"
                  tone="valid"
                  hint="Evidências consistentes"
                />
                <MetricCard
                  label="Em análise"
                  value="03"
                  hint="Aguardando conferência"
                />
              </div>
              <Tabs
                tabs={[
                  { id: "all", label: "Todos os registros" },
                  { id: "valid", label: "Verificados" },
                  { id: "review", label: "Em análise" },
                ]}
                active={tab}
                onChange={setTab}
                ariaLabel="Filtrar registros de exemplo"
              >
                <div className="ds-table-wrap">
                  <table className="ds-table">
                    <caption className="ds-sr-only">
                      Registros de evidências — dados fictícios
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Ativo</th>
                        <th scope="col">Identificador</th>
                        <th scope="col">Estado</th>
                        <th scope="col">
                          <span className="ds-sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows
                        .filter((r) => tab === "all" || r.status === tab)
                        .map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>
                              <code>{r.id}</code>
                            </td>
                            <td>
                              <StatusBadge label={r.label} tone={r.tone} />
                            </td>
                            <td>
                              <Button
                                size="sm"
                                variant="ghost"
                                aria-label={`Copiar identificador de ${r.name}`}
                                onClick={() => onCopy(r.id)}
                              >
                                Copiar ID
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </>
  );
}
