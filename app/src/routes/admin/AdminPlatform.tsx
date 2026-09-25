import { useState } from "react";
import { Link, useBlocker, useParams } from "react-router-dom";
import { ActionButton, useAction } from "./AdminActions";
import { surfaceLab } from "./surface-lab-runtime";
import {
  Badge,
  Button,
  DataTable,
  Entity,
  Facts,
  Filter,
  Missing,
  Notice,
  PageHeading,
  PageTabs,
  Panel,
  Surface,
  Timeline,
  Toolbar,
  filterValue,
  matches,
  useQuery,
  useTab,
  useUnloadGuard,
} from "./AdminUI";
import {
  deliveries,
  events,
  executions,
  integrations,
  models,
  organizationName,
} from "./admin-data";

export function AdminVerifications() {
  const { params } = useQuery();
  const [selected, setSelected] = useState<string[]>([]);
  const states = [...new Set(executions.map((e) => e.status))];
  const results = [...new Set(executions.map((e) => e.result))];
  const validity = [...new Set(executions.map((e) => e.validity))];
  const rows = executions.filter(
    (e) =>
      matches(
        params.get("q"),
        e.id,
        e.name,
        e.object,
        organizationName(e.organization),
      ) &&
      filterValue(params.get("execucao"), e.status, states) &&
      filterValue(params.get("resultado"), e.result, results) &&
      filterValue(params.get("validade"), e.validity, validity),
  );
  return (
    <>
      <PageHeading
        title="Verificações"
        description="Execução, resultado e validade: três dimensões para um diagnóstico preciso."
      />
      <Toolbar>
        <Filter name="execucao" label="Execução" options={states} />
        <Filter name="resultado" label="Resultado" options={results} />
        <Filter name="validade" label="Validade" options={validity} />
      </Toolbar>
      {selected.length > 0 && (
        <div className="ad-context-line">
          <strong>
            {selected.length} execuções selecionadas explicitamente
          </strong>
          <Link
            className="ad-button"
            to={`/admin/intervencoes/INT-106?alvos=${selected.join(",")}`}
          >
            Revisar reprocessamento
          </Link>
          <Button onClick={() => setSelected([])}>Limpar seleção</Button>
        </div>
      )}
      <DataTable
        rows={rows}
        label="Verificações do produto"
        columns={[
          {
            label: "Selecionar",
            render: (e) => (
              <input
                type="checkbox"
                aria-label={`Selecionar ${e.id}`}
                checked={selected.includes(e.id)}
                onChange={(event) =>
                  setSelected(
                    event.target.checked
                      ? [...selected, e.id]
                      : selected.filter((id) => id !== e.id),
                  )
                }
              />
            ),
          },
          {
            label: "Objeto e versão",
            render: (e) => (
              <Entity
                name={e.object}
                detail={`${e.version} · ${e.id}`}
                to={`/admin/verificacoes/${e.id}`}
              />
            ),
          },
          {
            label: "Método",
            render: (e) => (
              <Entity
                name={e.name}
                detail={`Versão ${e.methodVersion} · ${organizationName(e.organization)}`}
              />
            ),
          },
          { label: "Execução", render: (e) => <Badge>{e.status}</Badge> },
          { label: "Resultado", render: (e) => <Badge>{e.result}</Badge> },
          { label: "Validade", render: (e) => <Badge>{e.validity}</Badge> },
          {
            label: "Início / duração",
            render: (e) => <Entity name={e.started} detail={e.duration} />,
          },
        ]}
      />
      <p className="ad-footnote">
        Falha técnica não significa divergência documental. Concluída não
        significa conforme.
      </p>
    </>
  );
}
export function AdminExecution() {
  const { execucaoId } = useParams();
  const e = executions.find((item) => item.id === execucaoId);
  const tab = useTab([
    "Resumo",
    "Entradas e resultado",
    "Tentativas",
    "Eventos técnicos",
  ]);
  if (!e) return <Missing back="/admin/verificacoes" />;
  const context = {
    target: e.id,
    organization: organizationName(e.organization),
    version: e.version,
    details: `${e.dossier} · ${e.name} / método ${e.methodVersion} · entrada preservada`,
  };
  return (
    <>
      <PageHeading
        title={`${e.name} · ${e.object}`}
        eyebrow={`${e.id} · ${e.version}`}
        description={`${organizationName(e.organization)} · Método ${e.method} / versão ${e.methodVersion}`}
        back={{ to: "/admin/verificacoes", label: "Verificações" }}
        action={
          <ActionButton
            action="retry"
            context={context}
            primary
            disabled={!e.retry}
          >
            Tentar novamente
          </ActionButton>
        }
      />
      <div className="ad-execution-status">
        {[
          ["Execução", e.status],
          ["Resultado técnico", e.result],
          ["Validade", e.validity],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <Badge>{value}</Badge>
          </div>
        ))}
      </div>
      <PageTabs state={tab}>
        {tab.active === "resumo" && (
          <div className="ad-detail-grid">
            <div className="ad-stack">
              {e.status === "Falhou" ? (
                <Notice title="A fonte externa não respondeu" tone="warning">
                  A versão {e.version} continua recebida. Esta execução ainda
                  não produziu resultado documental.
                </Notice>
              ) : (
                <Notice
                  title={
                    e.result === "Não produzido"
                      ? "Resultado ainda não produzido"
                      : `Resultado: ${e.result}`
                  }
                >
                  O resultado descreve o método aplicado a esta entrada. Não
                  representa uma decisão de investimento.
                </Notice>
              )}
              <Panel title="Próxima ação">
                <p>
                  {e.retry
                    ? "Confirme a recuperação da fonte e revise entrada, versão e método antes de preparar uma nova tentativa."
                    : e.status === "Em espera"
                      ? "Aguardar a entrada da tarefa em processamento. Uma repetição não está disponível."
                      : "Consultar resultado e limitações. Uma nova entrada ou método exige outra execução identificada."}
                </p>
                <Link
                  className="ad-button"
                  to={`/admin/integracoes/${e.integration}`}
                >
                  Consultar integração →
                </Link>
              </Panel>
            </div>
            <Panel title="Contexto da execução">
              <Facts
                items={[
                  [
                    "Dossiê / versão",
                    <Link
                      to={`/admin/dossies/${e.dossier}?versao=${e.version}`}
                    >
                      {e.dossier} / {e.version}
                    </Link>,
                  ],
                  ["Início", `${e.started} BRT`],
                  ["Duração", e.duration],
                  ["Tentativas", "1"],
                  ["Ambiente", "Demonstração"],
                ]}
              />
              <Link className="ad-link" to={`/admin/modelos/${e.method}`}>
                Consultar método →
              </Link>
            </Panel>
          </div>
        )}
        {tab.active === "entradas-e-resultado" && (
          <div className="ad-stack">
            <Panel title="Entradas fixadas">
              <Facts
                items={[
                  ["Objeto", e.object],
                  ["Dossiê e versão", `${e.dossier} / ${e.version}`],
                  ["Método", `${e.method} / ${e.methodVersion}`],
                  [
                    "Fonte",
                    integrations.find((i) => i.id === e.integration)?.name,
                  ],
                  ["Resultado", e.result],
                  [
                    "Limitação",
                    "Consulta técnica; não substitui a decisão da organização analista",
                  ],
                ]}
              />
            </Panel>
            {e.validity === "Vigente" && (
              <Panel title="Validade do resultado">
                <ActionButton action="revokeResult" context={context} />
                <p className="ad-footnote">
                  Revogação é uma intervenção própria, com fundamento e
                  avaliação das análises relacionadas.
                </p>
              </Panel>
            )}
          </div>
        )}
        {tab.active === "tentativas" && (
          <Panel title="Tentativas com a mesma entrada">
            <DataTable
              rows={[{ ...e, id: `${e.id}-T01` }]}
              label="Tentativas"
              columns={[
                { label: "Tentativa", render: (x) => x.id },
                { label: "Início", render: (x) => `${x.started} BRT` },
                { label: "Duração", render: (x) => x.duration },
                { label: "Execução", render: (x) => <Badge>{x.status}</Badge> },
                {
                  label: "Diagnóstico",
                  render: (x) =>
                    x.retry
                      ? "SOURCE_UNAVAILABLE · fonte indisponível"
                      : x.result,
                },
              ]}
            />
            <Notice title="Resultado desconhecido exige consulta">
              Após perda da resposta, consulte a intervenção pela mesma
              referência antes de repetir.
            </Notice>
            <Link className="ad-link" to="/admin/intervencoes/INT-104">
              Inspecionar exemplo de resultado desconhecido →
            </Link>
          </Panel>
        )}
        {tab.active === "eventos-tecnicos" && (
          <Panel title="Diagnóstico minimizado">
            <Timeline
              entries={[
                {
                  title: "Entrada recebida",
                  meta: `${e.started} BRT`,
                  detail: `${e.dossier} / ${e.version} · método ${e.methodVersion}`,
                },
                {
                  title: e.status,
                  meta: `Tentativa ${e.id}-T01 · ${e.duration}`,
                  detail: e.retry
                    ? "SOURCE_UNAVAILABLE: a fonte não respondeu. Sem conteúdo de documento ou credenciais nos logs."
                    : e.result,
                },
              ]}
            />
            <details className="ad-disclosure">
              <summary>Identificadores de correlação</summary>
              <code>
                {e.id} / {e.id}-T01 / {e.method}
              </code>
              <p>Não há observabilidade externa conectada na prévia.</p>
            </details>
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
export function AdminModels() {
  const tab = useTab(["Requisitos", "Tipos de objeto", "Métodos"]);
  const { params } = useQuery();
  return (
    <>
      <PageHeading
        title="Modelos e regras"
        description="Requisitos e métodos versionados, com alcance e responsabilidade explícitos."
        action={
          <ActionButton
            action="model"
            context={{ target: "Novo modelo Lastre" }}
            primary
          >
            Criar modelo
          </ActionButton>
        }
      />
      <PageTabs state={tab}>
        <Toolbar />
        <DataTable
          rows={models.filter(
            (m) =>
              m.type === tab.tabs.find((t) => t.id === tab.active)?.label &&
              matches(params.get("q"), m.id, m.name, m.owner),
          )}
          label="Catálogo de modelos"
          columns={[
            {
              label: "Modelo",
              render: (m) => (
                <Entity
                  name={m.name}
                  detail={m.scope}
                  to={`/admin/modelos/${m.id}`}
                />
              ),
            },
            { label: "Proprietário", render: (m) => m.owner },
            { label: "Versão", render: (m) => `v${m.version}` },
            { label: "Situação", render: (m) => <Badge>{m.status}</Badge> },
          ]}
        />
      </PageTabs>
    </>
  );
}
export function AdminModel() {
  const { modeloId } = useParams();
  const m = models.find((x) => x.id === modeloId);
  const tab = useTab(["Definição", "Versões", "Uso", "Histórico"]);
  if (!m) return <Missing back="/admin/modelos" />;
  return (
    <>
      <PageHeading
        title={m.name}
        eyebrow={`${m.id} · ${m.type} · v${m.version}`}
        description={`${m.owner} · ${m.scope}`}
        back={{ to: "/admin/modelos", label: "Modelos e regras" }}
        action={
          m.type !== "Métodos" ? (
            <Link
              className="ad-button ad-button-primary"
              to={`/admin/modelos/${m.id}/editar`}
            >
              Preparar rascunho
            </Link>
          ) : (
            <ActionButton
              action="createCase"
              context={{ target: m.id, version: m.version }}
            >
              Solicitar revisão técnica
            </ActionButton>
          )
        }
      />
      <div className="ad-context-line">
        <Badge>{m.status}</Badge>
        <span>Publicações anteriores preservam suas referências.</span>
      </div>
      <PageTabs state={tab}>
        {tab.active === "definicao" ? (
          <div className="ad-detail-grid">
            <Panel
              title={
                m.type === "Métodos"
                  ? "O que o método confere"
                  : "Definição e requisitos"
              }
            >
              <p>{m.description}</p>
              <ol className="ad-requirements">
                {m.requirements.map((r) => (
                  <li key={r}>
                    <strong>{r}</strong>
                    <small>
                      {m.type === "Métodos"
                        ? "Entrada necessária para a execução"
                        : "Requisito aplicável ao escopo do modelo"}
                    </small>
                  </li>
                ))}
              </ol>
            </Panel>
            <Panel title="Aplicabilidade">
              <Facts
                items={[
                  ["Proprietário", m.owner],
                  ["Escopo", m.scope],
                  ["Versão", m.version],
                  ["Vigência", "Cenário fictício · 25 set. 2026"],
                  ["Casos recebidos", "Mantêm a versão originalmente aplicada"],
                ]}
              />
              {m.type === "Métodos" && (
                <Notice title="Implementação revisada">
                  Nenhum código livre pode ser executado pelo formulário
                  administrativo.
                </Notice>
              )}
            </Panel>
          </div>
        ) : tab.active === "versoes" ? (
          <Panel title="Publicações">
            <div className="ad-context-line">
              <Badge>{m.status}</Badge>
              <strong>Versão {m.version}</strong>
              <span>{m.owner}</span>
            </div>
            <p>{m.description}</p>
            <ActionButton
              action="model"
              context={{
                target: m.id,
                version: m.version,
                details: "Duplicação preserva a referência de origem.",
              }}
            >
              Preparar duplicação
            </ActionButton>
          </Panel>
        ) : tab.active === "uso" ? (
          <Panel title="Uso no cenário demonstrativo">
            <Facts
              items={[
                ["Aplicabilidade", m.scope],
                [
                  "Efeito de uma publicação",
                  "Solicitações futuras conforme vigência",
                ],
                [
                  "Migração de casos existentes",
                  "Exige intervenção própria; não é consequência de salvar",
                ],
              ]}
            />
            <Link
              className="ad-link"
              to={
                m.type === "Métodos"
                  ? `/admin/verificacoes?q=${encodeURIComponent(m.name)}`
                  : "/admin/registros?tipo=dossies"
              }
            >
              Consultar registros relacionados →
            </Link>
          </Panel>
        ) : (
          <Panel title="Histórico do modelo">
            <Timeline
              entries={[
                {
                  title: `Versão ${m.version} · ${m.status}`,
                  meta: `25 set. 2026 · ${m.owner}`,
                  detail:
                    "Evento demonstrativo. Histórico de produção depende de auditoria durável.",
                },
              ]}
            />
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
type ModelDraft = { name: string; purpose: string; requirements: string[] };
function loadDraft(id: string, fallback: ModelDraft): ModelDraft {
  if (surfaceLab)
    return surfaceLab.scenario === "long"
      ? {
          ...fallback,
          requirements: Array.from(
            { length: 16 },
            (_, i) =>
              `Requisito ${i + 1}: comprovar origem e responsável pelo material compartilhado.`,
          ),
        }
      : fallback;
  try {
    const raw: unknown = JSON.parse(
      sessionStorage.getItem(`lastre-admin-model:${id}`) ?? "null",
    );
    if (
      raw &&
      typeof raw === "object" &&
      "name" in raw &&
      typeof raw.name === "string" &&
      "purpose" in raw &&
      typeof raw.purpose === "string" &&
      "requirements" in raw &&
      Array.isArray(raw.requirements) &&
      raw.requirements.every((x) => typeof x === "string")
    )
      return raw as ModelDraft;
  } catch {
    /* Corrupt or unavailable browser storage never changes the fixture. */
  }
  return fallback;
}
export function AdminModelEditor() {
  const { modeloId = "" } = useParams();
  const m = models.find((x) => x.id === modeloId);
  const fallback = {
    name: m?.name ?? "",
    purpose: m?.description ?? "",
    requirements: m?.requirements ?? [],
  };
  const [draft, setDraft] = useState(() => loadDraft(modeloId, fallback));
  const [saved, setSaved] = useState(() =>
    JSON.stringify(loadDraft(modeloId, fallback)),
  );
  const [message, setMessage] = useState("");
  const dirty = JSON.stringify(draft) !== saved;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  );
  useUnloadGuard(dirty);
  const tab = useTab(["Identificação", "Requisitos", "Prévia", "Revisão"]);
  if (!m || m.type === "Métodos")
    return (
      <Missing
        title="Editor indisponível para este modelo"
        back="/admin/modelos"
      />
    );
  const valid =
    draft.name.trim().length > 2 &&
    draft.purpose.trim().length > 7 &&
    draft.requirements.length > 0 &&
    draft.requirements.every((r) => r.trim().length > 2);
  const save = () => {
    try {
      if (!surfaceLab)
        sessionStorage.setItem(
          `lastre-admin-model:${m.id}`,
          JSON.stringify(draft),
        );
      setSaved(JSON.stringify(draft));
      setMessage(
        surfaceLab
          ? "Rascunho mantido apenas nesta prévia. Nenhuma publicação foi alterada."
          : "Rascunho salvo nesta sessão do navegador. Nenhuma publicação foi alterada.",
      );
    } catch {
      setMessage(
        "Não foi possível salvar neste navegador. O rascunho permanece aberto.",
      );
    }
  };
  const added = draft.requirements.filter((r) => !m.requirements.includes(r));
  const removed = m.requirements.filter((r) => !draft.requirements.includes(r));
  return (
    <>
      <PageHeading
        title="Editar rascunho de modelo"
        eyebrow={`${m.id} · a partir da versão ${m.version}`}
        description="Prepare requisitos, confira a experiência dos produtos e revise o efeito da publicação."
        back={{ to: `/admin/modelos/${m.id}`, label: "Voltar ao modelo" }}
        action={
          <Button primary onClick={save} disabled={!valid}>
            Salvar rascunho local
          </Button>
        }
      />
      <div className="ad-context-line">
        <Badge>Rascunho local</Badge>
        <span>
          {dirty ? "Alterações não salvas" : "Nenhuma alteração pendente"}
        </span>
      </div>
      {message && (
        <p role="status" className="ad-notice">
          {message}
        </p>
      )}
      <PageTabs state={tab}>
        {tab.active === "identificacao" && (
          <Panel title="Identificação e finalidade">
            <div className="ad-form ad-form-limited">
              <label>
                Nome do modelo
                <input
                  required
                  maxLength={160}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                Finalidade
                <textarea
                  required
                  maxLength={1500}
                  value={draft.purpose}
                  onChange={(e) =>
                    setDraft({ ...draft, purpose: e.target.value })
                  }
                />
              </label>
              <Facts
                items={[
                  ["Proprietário", m.owner],
                  ["Base", `Versão ${m.version}`],
                  [
                    "Publicação",
                    "Somente após revisão e confirmação do servidor",
                  ],
                ]}
              />
            </div>
          </Panel>
        )}
        {tab.active === "requisitos" && (
          <Panel title="Requisitos e exceções">
            <div className="ad-form">
              {draft.requirements.map((r, i) => (
                <div className="ad-requirement-editor" key={i}>
                  <label>
                    Requisito {i + 1}
                    <input
                      aria-label={`Requisito ${i + 1}`}
                      maxLength={200}
                      value={r}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          requirements: draft.requirements.map((v, index) =>
                            index === i ? e.target.value : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <Button
                    aria-label={`Remover requisito ${i + 1}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        requirements: draft.requirements.filter(
                          (_, index) => index !== i,
                        ),
                      })
                    }
                  >
                    Remover
                  </Button>
                  <p>
                    Obrigatório no escopo do modelo. Ausência impede concluir a
                    solicitação; exceções exigem revisão do responsável.
                  </p>
                </div>
              ))}
              <Button
                onClick={() =>
                  setDraft({
                    ...draft,
                    requirements: [...draft.requirements, ""],
                  })
                }
              >
                Adicionar requisito
              </Button>
            </div>
          </Panel>
        )}
        {tab.active === "previa" && (
          <div className="ad-columns">
            {[
              "Assets · responder solicitação",
              "Investors · conferir recebimento",
            ].map((product) => (
              <Panel key={product} title={product}>
                <h3>{draft.name || "Modelo sem nome"}</h3>
                <p>{draft.purpose}</p>
                <ol className="ad-requirements">
                  {draft.requirements.map((r, i) => (
                    <li key={i}>
                      <strong>{r || "Requisito sem título"}</strong>
                      <small>
                        Obrigatório · documento ou referência da origem
                      </small>
                    </li>
                  ))}
                </ol>
              </Panel>
            ))}
          </div>
        )}
        {tab.active === "revisao" && (
          <div className="ad-stack">
            <Panel title="Diferenças da publicação atual">
              <Facts
                items={[
                  [
                    "Nome",
                    draft.name === m.name
                      ? "Sem alteração"
                      : `${m.name} → ${draft.name}`,
                  ],
                  [
                    "Finalidade",
                    draft.purpose === m.description
                      ? "Sem alteração"
                      : draft.purpose,
                  ],
                  ["Requisitos acrescentados", added.join("; ") || "Nenhum"],
                  ["Requisitos removidos", removed.join("; ") || "Nenhum"],
                  ["Vigência", "A definir na publicação"],
                  ["Alcance", m.scope],
                ]}
              />
            </Panel>
            <Notice title="Casos já enviados mantêm seus requisitos">
              Salvar rascunho não publica. A revisão independente deve se
              vincular à versão exata, e qualquer alteração exige nova revisão.
            </Notice>
            {!valid && (
              <p role="alert" className="ad-error">
                Preencha nome, finalidade e ao menos um requisito válido antes
                de salvar.
              </p>
            )}
            <div className="ad-actions">
              <Button disabled>Publicar modelo — backend pendente</Button>
              <Link className="ad-button" to="/admin/intervencoes/INT-103">
                Ver exemplo de revisão ampla
              </Link>
            </div>
          </div>
        )}
      </PageTabs>
      {blocker.state === "blocked" && (
        <Surface
          title="Rascunho não salvo"
          kind="modal"
          onClose={() => blocker.reset()}
        >
          <p>Salve o rascunho local ou descarte as alterações antes de sair.</p>
          <div className="ad-actions">
            <Button onClick={() => blocker.reset()}>Continuar editando</Button>
            <Button onClick={() => blocker.proceed()}>Descartar e sair</Button>
          </div>
        </Surface>
      )}
    </>
  );
}
export function AdminIntegrations() {
  const tab = useTab(["Conexões", "Comunicações"]);
  const { params } = useQuery();
  return (
    <>
      <PageHeading
        title="Integrações"
        description="Dependências, saúde observada e entregas que sustentam o ciclo operacional."
        action={
          <ActionButton
            action="connection"
            context={{ target: "Nova conexão" }}
            primary
          >
            Adicionar conexão
          </ActionButton>
        }
      />
      <PageTabs state={tab}>
        {tab.active === "conexoes" ? (
          <>
            <Toolbar />
            <DataTable
              rows={integrations.filter((i) =>
                matches(params.get("q"), i.name, i.id, i.category),
              )}
              label="Conexões da plataforma"
              columns={[
                {
                  label: "Conexão",
                  render: (i) => (
                    <Entity
                      name={i.name}
                      detail={i.purpose}
                      to={`/admin/integracoes/${i.id}`}
                    />
                  ),
                },
                { label: "Proprietário", render: (i) => i.owner },
                { label: "Saúde", render: (i) => <Badge>{i.health}</Badge> },
                { label: "Último sucesso", render: (i) => i.lastSuccess },
                { label: "Ambiente", render: () => "Demonstração" },
              ]}
            />
          </>
        ) : (
          <DeliveryList />
        )}
        <p className="ad-footnote">
          Dados fictícios para avaliar a interface. Nenhum conector real é
          configurado nesta prévia.
        </p>
      </PageTabs>
    </>
  );
}
function DeliveryList() {
  const { params, update } = useQuery();
  const action = useAction();
  const selected = deliveries.find((d) => d.id === params.get("entrega"));
  return (
    <>
      <Toolbar />
      <DataTable
        rows={deliveries.filter((d) =>
          matches(params.get("q"), d.id, d.name, d.status),
        )}
        label="Entregas"
        onSelect={(d) => update({ entrega: d.id })}
        columns={[
          {
            label: "Evento",
            render: (d) => <Entity name={d.name} detail={d.id} />,
          },
          { label: "Destino minimizado", render: (d) => d.destination },
          {
            label: "Estado conhecido",
            render: (d) => <Badge>{d.status}</Badge>,
          },
          { label: "Tentativas", render: (d) => d.attempts },
          { label: "Momento", render: (d) => `${d.time} BRT` },
        ]}
      />
      {params.has("entrega") && (
        <Surface
          title={selected?.name ?? "Entrega não encontrada"}
          description={selected?.id}
          onClose={() => update({ entrega: null })}
        >
          {selected ? (
            <div className="ad-stack">
              <Facts
                items={[
                  ["Evento", selected.id],
                  ["Destino", selected.destination],
                  ["Organização", organizationName(selected.organization)],
                  ["Estado", <Badge>{selected.status}</Badge>],
                  ["Tentativas", selected.attempts],
                  [
                    "Próximo passo",
                    selected.retry
                      ? "Revisar reenvio com identidade do evento original"
                      : "Consultar a entrega original; sem sinal de leitura",
                  ],
                ]}
              />
              <Notice title="Aceito, entregue e lido são estados distintos">
                A prévia só apresenta o sinal descrito no cenário.
              </Notice>
              <Button
                disabled={!selected.retry}
                onClick={() => {
                  update({ entrega: null });
                  action("delivery", {
                    target: selected.id,
                    organization: organizationName(selected.organization),
                    details: selected.destination,
                  });
                }}
              >
                Preparar reenvio
              </Button>
            </div>
          ) : (
            <Missing back="/admin/integracoes?tab=comunicacoes" />
          )}
        </Surface>
      )}
    </>
  );
}
export function AdminIntegration() {
  const { integracaoId } = useParams();
  const i = integrations.find((x) => x.id === integracaoId);
  const tab = useTab(["Resumo", "Configuração", "Entregas", "Histórico"]);
  if (!i) return <Missing back="/admin/integracoes" />;
  const context = {
    target: i.id,
    details: `${i.name} · proprietário ${i.owner}`,
  };
  return (
    <>
      <PageHeading
        title={i.name}
        eyebrow={`${i.id} · ${i.category}`}
        description={i.purpose}
        back={{ to: "/admin/integracoes", label: "Integrações" }}
      />
      <div className="ad-context-line">
        <Badge>{i.health}</Badge>
        <span>Observação de exemplo: 25 set. 2026, {i.observed} BRT</span>
      </div>
      <PageTabs state={tab}>
        {tab.active === "resumo" ? (
          <div className="ad-detail-grid">
            <Panel title="Capacidade e dependências">
              <Facts
                items={[
                  ["Finalidade", i.purpose],
                  ["Fluxo dependente", i.flow],
                  ["Último sucesso", i.lastSuccess],
                  ["Proprietário", i.owner],
                  [
                    "Teste de conexão",
                    "Indisponível — conector real não integrado",
                  ],
                ]}
              />
              {i.health === "Desconhecido" && (
                <Notice title="Sem observação recente" tone="warning">
                  A ausência de sinal não indica que o serviço está operacional.
                </Notice>
              )}
            </Panel>
            <Panel title="Recuperação">
              <p>
                Confirme a saúde da dependência antes de solicitar uma nova
                tentativa. Preserve a referência da execução original.
              </p>
              <Link
                className="ad-link"
                to="/admin/verificacoes?execucao=Falhou"
              >
                Ver falhas técnicas →
              </Link>
            </Panel>
          </div>
        ) : tab.active === "configuracao" ? (
          <Panel title="Configuração e credenciais">
            <Facts
              items={[
                ["Ambiente", "Demonstração"],
                ["Endpoint", "Nenhum endpoint real conectado"],
                ["Referência da credencial", i.credential],
                ["Escopo", i.purpose],
                [
                  "Repetição",
                  "Elegibilidade por evento; revisão de idempotência",
                ],
              ]}
            />
            <ActionButton action="credential" context={context} />
            <Notice title="Segredos não são exibidos">
              Criação, armazenamento e rotação de credenciais exigem o mecanismo
              do backend.
            </Notice>
          </Panel>
        ) : tab.active === "entregas" ? (
          i.id === "INTG-003" ? (
            <DeliveryList />
          ) : (
            <Panel title="Execuções relacionadas">
              <div className="ad-list">
                {executions
                  .filter((e) => e.integration === i.id)
                  .map((e) => (
                    <Link key={e.id} to={`/admin/verificacoes/${e.id}`}>
                      <Entity
                        name={`${e.name} · ${e.object}`}
                        detail={`${e.id} / ${e.version}`}
                      />
                      <Badge>{e.status}</Badge>
                    </Link>
                  ))}
              </div>
            </Panel>
          )
        ) : (
          <Panel title="Histórico da integração">
            <Timeline
              entries={events
                .filter((e) => i.id === "INTG-001" && e.target === "EX-204")
                .map((e) => ({
                  title: e.action,
                  meta: `${e.time} BRT`,
                  detail: e.reason,
                  to: `/admin/auditoria?evento=${e.id}`,
                }))}
            />
            <p className="ad-footnote">
              Sem rotação de credenciais ou alteração de configuração neste
              cenário.
            </p>
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
