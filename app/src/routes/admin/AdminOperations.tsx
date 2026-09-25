import { Tabs } from "../../components/ui/Tabs";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon, type IconName } from "../../components/ui/Icon";
import { Surface as DSSurface } from "../../components/ui/Surface";
import { ActionButton, useAction } from "./AdminActions";
import {
  AdvancedFilters,
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
} from "./AdminUI";
import {
  cases,
  dossiers,
  events,
  integrations,
  observedAt,
  organizationName,
  organizations,
  people,
  recordUrl,
} from "./admin-data";

function OrgLink({ id }: { id: string }) {
  return (
    <Link className="ad-link" to={`/admin/organizacoes/${id}`}>
      {organizationName(id)}
    </Link>
  );
}
export function CaseTable({
  rows,
  preview = false,
}: {
  rows: typeof cases;
  preview?: boolean;
}) {
  const { update } = useQuery();
  return (
    <DataTable
      rows={rows}
      label="Ocorrências"
      onSelect={preview ? (row) => update({ ocorrencia: row.id }) : undefined}
      columns={[
        {
          label: "Ocorrência",
          render: (c) => (
            <Entity
              name={c.title}
              detail={`${c.id} · ${c.type}`}
              to={`/admin/fila/${c.id}`}
            />
          ),
        },
        { label: "Prioridade", render: (c) => <Badge>{c.priority}</Badge> },
        {
          label: "Organização",
          render: (c) => <OrgLink id={c.organization} />,
        },
        { label: "Estado", render: (c) => <Badge>{c.status}</Badge> },
        {
          label: "Responsável",
          render: (c) =>
            c.owner === "Sem responsável" ? (
              <span className="ad-unassigned">
                <Icon name="user" size={15} />
                Sem responsável
              </span>
            ) : (
              <Entity
                name={c.owner}
                initials={c.owner
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              />
            ),
        },
        {
          label: "Espera",
          render: (c) => <span className="ad-nowrap">{c.wait}</span>,
        },
      ]}
    />
  );
}
export function AdminOverview() {
  const tab = useTab(["Operação", "Indicadores"]);
  const open = cases.filter((c) => c.status !== "Resolvida");
  const priorityOrder = ["Crítica", "Alta", "Normal", "Baixa"];
  const priorityCases = [...open]
    .sort(
      (a, b) =>
        priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
    )
    .slice(0, 3);
  const criticalCount = open.filter((c) => c.priority === "Crítica").length;
  const metrics = [
    {
      label: "Críticas abertas",
      value: criticalCount,
      note: "Precisam de triagem",
      to: "/admin/fila?prioridade=Crítica",
      tone: "danger",
      icon: "escalations" as IconName,
    },
    {
      label: "Sem responsável",
      value: open.filter((c) => c.owner === "Sem responsável").length,
      note: "Aguardam atribuição",
      to: "/admin/fila?visao=sem-responsavel",
      tone: "warning",
      icon: "users" as IconName,
    },
    {
      label: "Aguardando aprovação",
      value: open.filter((c) => c.status === "Aguardando aprovação").length,
      note: "Revisão independente",
      to: "/admin/fila?visao=aprovacao",
      tone: "neutral",
      icon: "shield" as IconName,
    },
    {
      label: "Falhas recuperáveis",
      value: open.filter((c) => c.execution).length,
      note: "Revisar nova tentativa",
      to: "/admin/verificacoes?execucao=Falhou",
      tone: "neutral",
      icon: "refresh" as IconName,
    },
  ];
  return (
    <>
      <PageHeading
        title="Visão geral"
        eyebrow="OPERAÇÃO DA PLATAFORMA"
        description="Seu ponto de partida para cuidar da operação."
        action={
          <>
            <span className="ad-snapshot">
              <Icon name="calendar" size={15} />
              25 set. 2026
            </span>
            <Link className="ad-button ad-button-primary" to="/admin/fila">
              Abrir fila de trabalho <Icon name="arrow-right" size={16} />
            </Link>
          </>
        }
      />
      <PageTabs state={tab}>
        {tab.active === "operacao" ? (
          <>
            <div
              className="ad-stats"
              aria-label="Resumo das ocorrências abertas"
            >
              {metrics.map((m) => (
                <Link
                  key={m.label}
                  to={m.to}
                  className={`ad-stat ad-stat-${m.tone}`}
                >
                  <DSSurface elevation={1} className="ad-stat-surface">
                    <span className="ad-stat-label">
                      {m.label}
                      <Icon name={m.icon} size={17} />
                    </span>
                    <strong>{m.value.toString().padStart(2, "0")}</strong>
                    <small>
                      {m.note}
                      <Icon name="arrow-right" size={15} />
                    </small>
                  </DSSurface>
                </Link>
              ))}
            </div>
            <div className="ad-overview-grid">
              <Panel
                title="Precisa de atenção"
                aside={
                  <Link className="ad-link" to="/admin/fila">
                    Ver fila <Icon name="arrow-right" size={14} />
                  </Link>
                }
              >
                {criticalCount > 0 && (
                  <div className="ad-attention-summary">
                    <span className="ad-attention-icon">
                      <Icon name="escalations" size={20} />
                    </span>
                    <div>
                      <strong>
                        {criticalCount === 1
                          ? "Comece pela ocorrência crítica"
                          : "Comece pelas ocorrências críticas"}
                      </strong>
                      <p>Revise o contexto e defina o próximo responsável.</p>
                    </div>
                    <span className="ad-count">
                      {String(criticalCount).padStart(2, "0")}
                    </span>
                  </div>
                )}
                <div className="ad-attention-list">
                  {priorityCases.map((item) => (
                    <Link key={item.id} to={`/admin/fila/${item.id}`}>
                      <div className="ad-attention-meta">
                        <span className="ad-record-id">{item.id}</span>
                        <Badge>{item.priority}</Badge>
                        <span className="ad-attention-wait">
                          <Icon name="clock" size={13} />
                          {item.wait}
                        </span>
                      </div>
                      <strong>{item.title}</strong>
                      <div className="ad-attention-context">
                        <span>
                          {organizationName(item.organization)}
                          <span aria-hidden="true"> · </span>
                          {item.owner}
                        </span>
                        <Icon name="arrow-right" size={17} />
                      </div>
                    </Link>
                  ))}
                </div>
              </Panel>
              <Panel
                title="Saúde dos serviços"
                aside={<Icon name="process" size={18} />}
              >
                <p className="ad-panel-intro">Última observação do cenário</p>
                <div className="ad-services">
                  {integrations.map((service) => (
                    <Link
                      key={service.id}
                      to={`/admin/integracoes/${service.id}`}
                    >
                      <div className="ad-service-heading">
                        <span className="ad-service-icon">
                          <Icon
                            name={service.id === "INTG-003" ? "send" : "chain"}
                            size={17}
                          />
                        </span>
                        <strong>{service.name}</strong>
                        <Icon name="chevron-right" size={14} />
                      </div>
                      <div className="ad-service-state">
                        <Badge>{service.health}</Badge>
                        <small>{service.observed} BRT</small>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link className="ad-panel-link" to="/admin/integracoes">
                  Consultar integrações <Icon name="arrow-right" size={14} />
                </Link>
              </Panel>
            </div>
            <div className="ad-columns ad-overview-bottom">
              <Panel
                title="Meu trabalho"
                aside={<span className="ad-muted">Marina Costa</span>}
              >
                <div className="ad-list">
                  {open
                    .filter((c) => c.owner === "Marina Costa")
                    .map((c) => (
                      <Link key={c.id} to={`/admin/fila/${c.id}`}>
                        <div>
                          <strong>{c.title}</strong>
                          <small>
                            {organizationName(c.organization)} · {c.stage}
                          </small>
                        </div>
                        <Badge>{c.status}</Badge>
                      </Link>
                    ))}
                </div>
                <Link className="ad-panel-link" to="/admin/fila?visao=minhas">
                  Ver minhas ocorrências →
                </Link>
              </Panel>
              <Panel
                title="Atividade recente"
                aside={
                  <Link className="ad-link" to="/admin/auditoria">
                    Ver auditoria <Icon name="arrow-right" size={14} />
                  </Link>
                }
              >
                <Timeline
                  entries={events.slice(0, 3).map((event) => ({
                    title: event.action,
                    meta: `${event.time} · ${event.actor}`,
                    to: `/admin/auditoria?evento=${event.id}`,
                  }))}
                />
              </Panel>
            </div>
            <p className="ad-footnote">
              Cenário demonstrativo de {observedAt}. “Desconhecido” indica
              ausência de observação recente.
            </p>
          </>
        ) : (
          <Panel title="Qualidade do ciclo operacional">
            <Notice title="Ainda sem coleta de indicadores">
              Conclusão de envio, tempo de análise e retrabalho precisam de
              fonte e denominador definidos. A prévia não apresenta métricas
              inventadas.
            </Notice>
            <Facts
              items={[
                [
                  "Conclusão de envio",
                  "Envios concluídos / solicitações elegíveis",
                ],
                [
                  "Tempo de processamento",
                  "Início até término; espera por fonte separada",
                ],
                [
                  "Retrabalho",
                  "Reaberturas no conjunto de atendimentos resolvidos",
                ],
                ["Fonte", "Instrumentação e política de exclusões pendentes"],
              ]}
            />
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
const queueViews = [
  ["", "Todas"],
  ["minhas", "Minhas"],
  ["sem-responsavel", "Sem responsável"],
  ["terceiro", "Aguardando terceiro"],
  ["aprovacao", "Aguardando aprovação"],
] as const;
function inView(c: (typeof cases)[number], view: string) {
  return view === "minhas"
    ? c.owner === "Marina Costa"
    : view === "sem-responsavel"
      ? c.owner === "Sem responsável"
      : view === "terceiro"
        ? c.status === "Aguardando terceiro"
        : view === "aprovacao"
          ? c.status === "Aguardando aprovação"
          : true;
}
export function AdminQueue() {
  const { params, update } = useQuery();
  const action = useAction();
  const status = [...new Set(cases.map((c) => c.status))];
  const types = [...new Set(cases.map((c) => c.type))];
  const priorities = ["Crítica", "Alta", "Normal", "Baixa"];
  const view = params.get("visao") ?? "";
  // Each quick view counts against the other active filters.
  const passes = (c: (typeof cases)[number], view: string) =>
        matches(
          params.get("q"),
          c.id,
          c.title,
          organizationName(c.organization),
        ) &&
        filterValue(params.get("estado-fila"), c.status, status) &&
        filterValue(params.get("prioridade"), c.priority, priorities) &&
        filterValue(params.get("tipo"), c.type, types) &&
        filterValue(params.get("responsavel"), c.owner, [
          ...new Set(cases.map((x) => x.owner)),
        ]) &&
        filterValue(params.get("etapa"), c.stage, [
          ...new Set(cases.map((x) => x.stage)),
        ]) &&
        (!params.get("organizacao") ||
          c.organization === params.get("organizacao")) &&
        inView(c, view);
  const rows = cases
    .filter((c) => passes(c, view))
    .sort((a, b) =>
      params.get("ordem") === "id"
        ? b.id.localeCompare(a.id)
        : priorities.indexOf(a.priority) - priorities.indexOf(b.priority),
    );
  const selected = cases.find((c) => c.id === params.get("ocorrencia"));
  return (
    <>
      <PageHeading
        title="Fila de trabalho"
        description="Uma fila para coordenar suporte, falhas e aprovações."
        action={
          <ActionButton
            action="createCase"
            context={{ target: "Nova ocorrência" }}
            primary
          >
            Nova ocorrência
          </ActionButton>
        }
      />
      <Tabs
        variant="underline"
        ariaLabel="Visões rápidas"
        panelId="ad-queue-results"
        active={view || "todas"}
        onChange={(next) => update({ visao: next === "todas" ? "" : next })}
        tabs={queueViews.map(([value, label]) => ({
          id: value || "todas",
          label,
          count: cases.filter((c) => passes(c, value)).length,
          attention: value === "sem-responsavel" && cases.some((c) => passes(c, value)),
        }))}
      />
      <div id="ad-queue-results" role="tabpanel" aria-label="Ocorrências da visão" className="ad-tabpanel">
      <Toolbar>
        <Filter name="prioridade" label="Prioridade" options={priorities} />
        <Filter name="estado-fila" label="Estado" options={status} />
        <Filter name="tipo" label="Tipo" options={types} />
        <Filter
          name="ordem"
          label="Ordenar"
          placeholder="Prioridade"
          options={[{ value: "id", label: "Mais recentes" }]}
        />
        <AdvancedFilters
          fields={[
            {
              name: "responsavel",
              label: "Responsável",
              options: [...new Set(cases.map((c) => c.owner))],
            },
            {
              name: "etapa",
              label: "Etapa bloqueada",
              options: [...new Set(cases.map((c) => c.stage))],
            },
          ]}
        />
      </Toolbar>
      {params.get("organizacao") && (
        <p className="ad-context-line">
          Organização: {organizationName(params.get("organizacao")!)}{" "}
          <Button onClick={() => update({ organizacao: null })}>Remover</Button>
        </p>
      )}
      <CaseTable rows={rows} preview />
      </div>
      {params.has("ocorrencia") && (
        <Surface
          title={selected?.title ?? "Ocorrência não encontrada"}
          description={selected?.id}
          onClose={() => update({ ocorrencia: null })}
        >
          {selected ? (
            <div className="ad-stack">
              <div className="ad-actions">
                <Badge>{selected.priority}</Badge>
                <Badge>{selected.status}</Badge>
              </div>
              <p>{selected.description}</p>
              <Facts
                items={[
                  ["Organização", <OrgLink id={selected.organization} />],
                  [
                    "Objeto / versão",
                    `${selected.object || "Não se aplica"} ${selected.version}`,
                  ],
                  ["Responsável", selected.owner],
                  ["Próximo passo", selected.next],
                ]}
              />
              <div className="ad-actions">
                <Link
                  className="ad-button ad-button-primary"
                  to={`/admin/fila/${selected.id}`}
                >
                  Abrir página
                </Link>
                <Button
                  onClick={() => {
                    update({ ocorrencia: null });
                    action("assign", {
                      target: selected.id,
                      organization: organizationName(selected.organization),
                      version: selected.version,
                    });
                  }}
                >
                  Atribuir responsável
                </Button>
              </div>
            </div>
          ) : (
            <Missing back="/admin/fila" />
          )}
        </Surface>
      )}
    </>
  );
}
export function AdminCase() {
  const { ocorrenciaId } = useParams();
  const item = cases.find((c) => c.id === ocorrenciaId);
  const tab = useTab(["Atendimento", "Relacionados", "Histórico"]);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  if (!item) return <Missing back="/admin/fila" />;
  const context = {
    target: item.id,
    organization: organizationName(item.organization),
    version: item.version,
  };
  return (
    <>
      <PageHeading
        title={item.title}
        eyebrow={`${item.id} · ${item.type}`}
        description={`${organizationName(item.organization)} · ${item.object || item.stage}${item.version ? ` / ${item.version}` : ""}`}
        back={{ to: "/admin/fila", label: "Fila de trabalho" }}
        action={
          item.execution ? (
            <Link
              className="ad-button ad-button-primary"
              to={`/admin/verificacoes/${item.execution}`}
            >
              Investigar execução
            </Link>
          ) : (
            <ActionButton action="assign" context={context} primary>
              Atribuir responsável
            </ActionButton>
          )
        }
      />
      <div className="ad-context-line">
        <Badge>{item.status}</Badge>
        <Badge>{item.priority}</Badge>
        <span>
          {item.owner} · {item.wait} em espera
        </span>
        <ActionButton action="priority" context={context}>
          Alterar prioridade
        </ActionButton>
      </div>
      <PageTabs state={tab}>
        {tab.active === "atendimento" ? (
          <div className="ad-detail-grid">
            <div className="ad-stack">
              <Panel title="Problema e recuperação">
                <p>{item.description}</p>
                <Notice title="Próxima ação">{item.next}</Notice>
                <div className="ad-actions">
                  <ActionButton action="assign" context={context}>
                    Atribuir
                  </ActionButton>
                  <ActionButton
                    action="resolve"
                    context={context}
                    disabled={item.status === "Resolvida"}
                  >
                    Resolver atendimento
                  </ActionButton>
                </div>
              </Panel>
              <Panel title="Linha do tempo">
                <Timeline
                  entries={[
                    {
                      title: "Ocorrência recebida",
                      meta: "25 set., 09:18 BRT · Operação",
                      detail: item.description,
                    },
                    {
                      title:
                        item.owner === "Sem responsável"
                          ? "Aguardando atribuição"
                          : `Atribuída a ${item.owner}`,
                      meta: `25 set., ${item.updated} BRT`,
                      detail: item.next,
                    },
                  ]}
                />
                {notes.map((n, i) => (
                  <Notice key={i} title="Nota local · não enviada">
                    {n}
                  </Notice>
                ))}
                <form
                  className="ad-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (note.trim()) {
                      setNotes([...notes, note.trim()]);
                      setNote("");
                    }
                  }}
                >
                  <label>
                    Nota interna
                    <textarea
                      required
                      maxLength={2000}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Registre o diagnóstico para a equipe…"
                    />
                  </label>
                  <small>
                    Rascunho demonstrativo. Não é enviado nem incorporado à
                    auditoria.
                  </small>
                  <div className="ad-actions">
                    <Button type="submit">Adicionar nota local</Button>
                    <ActionButton action="message" context={context}>
                      Mensagem para a organização
                    </ActionButton>
                  </div>
                </form>
              </Panel>
            </div>
            <Panel title="Contexto">
              <Facts
                items={[
                  ["Organização", <OrgLink id={item.organization} />],
                  ["Etapa bloqueada", item.stage],
                  ["Responsável", item.owner],
                  ["Versão", item.version || "Não se aplica"],
                  ["Prazo", "Sem meta contratual definida"],
                  ["Acesso ao conteúdo", "Nenhuma concessão de suporte ativa"],
                ]}
              />
              <ActionButton action="support" context={context}>
                Solicitar acesso de suporte
              </ActionButton>
            </Panel>
          </div>
        ) : tab.active === "relacionados" ? (
          <Panel title="Cadeia de contexto">
            <div className="ad-list">
              {[item.organization, item.dossier, item.execution]
                .filter(Boolean)
                .map((id) => (
                  <Link
                    key={id}
                    to={
                      id === item.dossier
                        ? `/admin/dossies/${id}?versao=${item.version}`
                        : recordUrl(id)
                    }
                  >
                    <Entity
                      name={id.startsWith("ORG") ? organizationName(id) : id}
                      detail="Abrir contexto relacionado"
                    />
                    <span>→</span>
                  </Link>
                ))}
            </div>
          </Panel>
        ) : (
          <Panel title="Histórico do atendimento">
            <Timeline
              entries={events
                .filter((e) => e.target === item.id)
                .map((e) => ({
                  title: e.action,
                  meta: `${e.time} BRT · ${e.actor}`,
                  detail: e.reason,
                  to: `/admin/auditoria?evento=${e.id}`,
                }))}
            />
            <Link className="ad-link" to={`/admin/auditoria?q=${item.id}`}>
              Consultar trilha de auditoria →
            </Link>
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
export function AdminOrganizations() {
  const { params } = useQuery();
  const statuses = [...new Set(organizations.map((o) => o.status))];
  const rows = organizations.filter(
    (o) =>
      matches(params.get("q"), o.name, o.id, o.owner) &&
      filterValue(params.get("produto"), o.product, ["Assets", "Investors"]) &&
      filterValue(params.get("situacao"), o.status, statuses),
  );
  return (
    <>
      <PageHeading
        title="Organizações"
        description="Ativação, contexto operacional e acesso aos produtos da Lastre."
        action={
          <ActionButton
            action="organization"
            context={{ target: "Nova organização" }}
            primary
          >
            Cadastrar organização
          </ActionButton>
        }
      />
      <Toolbar>
        <Filter
          name="produto"
          label="Produto"
          options={["Assets", "Investors"]}
        />
        <Filter name="situacao" label="Situação" options={statuses} />
      </Toolbar>
      <DataTable
        rows={rows}
        label="Organizações"
        columns={[
          {
            label: "Organização",
            render: (o) => (
              <Entity
                name={o.name}
                detail={o.id}
                initials={o.initials}
                to={`/admin/organizacoes/${o.id}`}
              />
            ),
          },
          {
            label: "Produto",
            render: (o) => <span className="ad-product">{o.product}</span>,
          },
          { label: "Situação", render: (o) => <Badge>{o.status}</Badge> },
          { label: "Responsável interno", render: (o) => o.owner },
          { label: "Última atividade", render: (o) => o.activity },
        ]}
      />
    </>
  );
}
export function AdminOrganization() {
  const { organizacaoId } = useParams();
  const org = organizations.find((o) => o.id === organizacaoId);
  const tab = useTab([
    "Resumo",
    "Equipe",
    "Atividade",
    "Acesso e dados",
    "Contrato e uso",
    "Histórico",
  ]);
  if (!org) return <Missing back="/admin/organizacoes" />;
  const context = { target: org.id, organization: org.name };
  const members = people.filter((p) => p.organization === org.id);
  const related = cases.filter(
    (c) => c.organization === org.id && c.status !== "Resolvida",
  );
  return (
    <>
      <PageHeading
        title={org.name}
        eyebrow={`${org.id} · ${org.product}`}
        description={`${org.segment} · Responsável interno: ${org.owner}`}
        back={{ to: "/admin/organizacoes", label: "Organizações" }}
        action={
          <ActionButton action="createCase" context={context}>
            Abrir ocorrência
          </ActionButton>
        }
      />
      <div className="ad-context-line">
        <Badge>{org.status}</Badge>
        <span>{org.activation}</span>
      </div>
      <PageTabs state={tab}>
        {tab.active === "resumo" && (
          <div className="ad-detail-grid">
            <div className="ad-stack">
              <Panel title="Situação operacional">
                <Facts
                  items={[
                    ["Produto habilitado", `Lastre ${org.product}`],
                    ["Ativação", org.activation],
                    ["Última atividade", org.activity],
                    [
                      "Restrição",
                      org.status === "Suspensa"
                        ? "Suspensão operacional. Revisão pela gestão de organizações necessária."
                        : "Nenhuma suspensão no cenário",
                    ],
                  ]}
                />
                {org.status === "Suspensa" && (
                  <Notice title="Acesso suspenso" tone="warning">
                    Revisar a restrição antes de reativar. Concessões expiradas
                    permanecem encerradas.
                  </Notice>
                )}
              </Panel>
              <Panel title={`Ocorrências abertas · ${related.length}`}>
                <div className="ad-list">
                  {related.map((c) => (
                    <Link to={`/admin/fila/${c.id}`} key={c.id}>
                      <Entity name={c.title} detail={c.stage} />
                      <Badge>{c.status}</Badge>
                    </Link>
                  ))}
                </div>
                {!related.length && (
                  <p className="ad-muted">
                    Nenhuma ocorrência aberta nesta organização.
                  </p>
                )}
              </Panel>
            </div>
            <Panel title="Identificação">
              <Facts
                items={[
                  ["Organização", org.id],
                  ["Contato administrativo", org.contact],
                  ["Responsável interno", org.owner],
                  ["Fonte", "Cadastro fictício da prévia"],
                ]}
              />
            </Panel>
          </div>
        )}
        {tab.active === "equipe" && (
          <Panel
            title="Participantes e convites"
            aside={
              <ActionButton action="invite" context={context}>
                Convidar participante
              </ActionButton>
            }
          >
            <DataTable
              rows={members}
              label="Equipe da organização"
              columns={[
                {
                  label: "Pessoa",
                  render: (p) => (
                    <Entity
                      name={p.name}
                      detail={p.email}
                      to={`/admin/acessos/pessoas/${p.id}`}
                    />
                  ),
                },
                { label: "Papel", render: (p) => p.role },
                { label: "Vínculo", render: (p) => <Badge>{p.status}</Badge> },
              ]}
            />
            {org.status === "Em ativação" && (
              <Notice title="Convite expirado">
                O aceite ainda não foi confirmado. Revise o contato antes de
                preparar um reenvio.
              </Notice>
            )}
          </Panel>
        )}
        {tab.active === "atividade" && (
          <Panel title="Registros relacionados">
            <div className="ad-list">
              {dossiers
                .filter(
                  (d) => d.organization === org.id || d.recipient === org.id,
                )
                .map((d) => (
                  <Link
                    key={d.id}
                    to={`/admin/dossies/${d.id}?versao=${d.latest}`}
                  >
                    <Entity name={d.name} detail={`${d.id} · ${d.latest}`} />
                    <Badge>{d.status}</Badge>
                  </Link>
                ))}
            </div>
            <Link
              className="ad-panel-link"
              to={`/admin/registros?organizacao=${org.id}`}
            >
              Consultar todos os registros →
            </Link>
          </Panel>
        )}
        {tab.active === "acesso-e-dados" && (
          <div className="ad-stack">
            <Panel title="Restrições e concessões">
              <Facts
                items={[
                  ["Produto", org.product],
                  ["Situação de acesso", org.status],
                  ["Acesso assistido", "Nenhuma concessão ativa"],
                  [
                    "Retenção",
                    "Política ainda precisa de definição antes da operação real",
                  ],
                ]}
              />
              <div className="ad-actions">
                <ActionButton
                  action={org.status === "Suspensa" ? "reactivate" : "suspend"}
                  context={context}
                />
                <ActionButton action="support" context={context}>
                  Solicitar acesso de suporte
                </ActionButton>
              </div>
            </Panel>
            <Panel title="Pedidos de dados">
              <p>
                Revisar escopo, dependências e fundamento antes de preparar uma
                exportação.
              </p>
              <ActionButton action="export" context={context}>
                Preparar exportação
              </ActionButton>
            </Panel>
          </div>
        )}
        {tab.active === "contrato-e-uso" && (
          <Panel title="Condição do piloto">
            <Facts
              items={[
                ["Participação", "Cenário demonstrativo"],
                ["Produtos", org.product],
                ["Condições comerciais", "Sem contrato comercial conectado"],
                ["Consumo", "Sem fonte de medição integrada"],
              ]}
            />
            <Notice title="Limites dependem do contrato">
              A interface não presume planos, preços ou faturas.
            </Notice>
          </Panel>
        )}
        {tab.active === "historico" && (
          <Panel title="Eventos da organização">
            <Timeline
              entries={events
                .filter((e) => e.organization === org.id)
                .map((e) => ({
                  title: e.action,
                  meta: `${e.time} BRT · ${e.actor}`,
                  detail: e.reason,
                  to: `/admin/auditoria?evento=${e.id}`,
                }))}
            />
            <Link
              className="ad-link"
              to={`/admin/auditoria?organizacao=${org.id}`}
            >
              Abrir auditoria filtrada →
            </Link>
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
