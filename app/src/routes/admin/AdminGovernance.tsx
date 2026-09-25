import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LastreWordmark } from "../../components/ui/LastreWordmark";
import { ActionButton } from "./AdminActions";
import {
  Badge,
  Button,
  DataTable,
  Empty,
  Entity,
  Facts,
  Filter,
  Missing,
  Notice,
  PageHeading,
  PageTabs,
  Panel,
  SearchField,
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
  executions,
  interventions,
  objects,
  organizationName,
  organizations,
  people,
  recordUrl,
} from "./admin-data";

export function AdminAccess() {
  const tab = useTab(["Pessoas", "Equipe interna", "Concessões temporárias"]);
  const { params } = useQuery();
  return (
    <>
      <PageHeading
        title="Pessoas e acessos"
        description="Identidades, vínculos e concessões com contexto e vigência próprios."
        action={
          <>
            <Link className="ad-button" to="/admin/acessos/politicas">
              Papéis e políticas
            </Link>
            <ActionButton
              action="invite"
              context={{
                target:
                  tab.active === "equipe-interna"
                    ? "Equipe interna Lastre"
                    : "Participação organizacional",
                details:
                  "O contexto precisa ser validado pelo servidor antes do convite.",
              }}
              primary
            >
              Convidar participante
            </ActionButton>
          </>
        }
      />
      <PageTabs state={tab}>
        {tab.active === "concessoes-temporarias" ? (
          <Panel title="Acessos assistidos">
            <Notice title="Nenhuma concessão ativa">
              Pedidos de acesso não liberam conteúdo. A aprovação precisa
              identificar beneficiário, objetos, finalidade e expiração.
            </Notice>
            <div className="ad-list">
              <Link to="/admin/fila/OC-108">
                <Entity
                  name="Acesso ao documento interrompido"
                  detail="OC-108 · Grupo Aurora · diagnóstico de compartilhamento expirado"
                />
                <Badge>Nova</Badge>
              </Link>
            </div>
            <ActionButton
              action="approveAccess"
              context={{
                target: "Exemplo de concessão de suporte",
                organization: "Grupo Aurora",
                version: "V-002",
                details:
                  "Somente EVD-015; leitura por 30 minutos; não inclui notas da análise.",
              }}
            >
              Explorar revisão de concessão
            </ActionButton>
          </Panel>
        ) : (
          <>
            <Toolbar>
              <Filter
                name="situacao"
                label="Vínculo"
                options={["Ativo", "Convidado", "Expirado", "Revogado"]}
              />
            </Toolbar>
            <DataTable
              rows={people.filter(
                (p) =>
                  p.type === tab.tabs.find((t) => t.id === tab.active)?.label &&
                  matches(
                    params.get("q"),
                    p.name,
                    p.id,
                    p.email,
                    organizationName(p.organization),
                  ) &&
                  filterValue(params.get("situacao"), p.status, [
                    "Ativo",
                    "Convidado",
                    "Expirado",
                    "Revogado",
                  ]),
              )}
              label="Pessoas e vínculos"
              columns={[
                {
                  label: "Pessoa",
                  render: (p) => (
                    <Entity
                      name={p.name}
                      detail={p.email}
                      initials={p.initials}
                      to={`/admin/acessos/pessoas/${p.id}`}
                    />
                  ),
                },
                {
                  label: "Contexto",
                  render: (p) => organizationName(p.organization),
                },
                { label: "Papel", render: (p) => p.role },
                { label: "Vínculo", render: (p) => <Badge>{p.status}</Badge> },
                { label: "Último acesso", render: (p) => p.last },
              ]}
            />
          </>
        )}
      </PageTabs>
    </>
  );
}
export function AdminPerson() {
  const { pessoaId } = useParams();
  const p = people.find((x) => x.id === pessoaId);
  const tab = useTab([
    "Perfil",
    "Vínculos e permissões",
    "Sessões",
    "Histórico",
  ]);
  const [diagnosis, setDiagnosis] = useState(false);
  if (!p) return <Missing back="/admin/acessos" />;
  const context = {
    target: p.id,
    organization: organizationName(p.organization),
    details: `${p.name} · ${p.role}`,
  };
  return (
    <>
      <PageHeading
        title={p.name}
        eyebrow={`${p.id} · ${p.type}`}
        description={`${organizationName(p.organization)} · ${p.role}`}
        back={{
          to: `/admin/acessos?tab=${p.type === "Equipe interna" ? "equipe-interna" : "pessoas"}`,
          label: "Pessoas e acessos",
        }}
        action={
          <ActionButton action="membership" context={context}>
            Alterar vínculo
          </ActionButton>
        }
      />
      <PageTabs state={tab}>
        {tab.active === "perfil" && (
          <div className="ad-detail-grid">
            <Panel title="Identidade">
              <Facts
                items={[
                  ["Nome", p.name],
                  ["Contato", p.email],
                  ["Vínculo", <Badge>{p.status}</Badge>],
                  ["Último acesso", p.last],
                  ["Contexto", organizationName(p.organization)],
                ]}
              />
            </Panel>
            <Panel title="Limites do acesso">
              <p>
                O papel se aplica ao vínculo indicado. Permissões
                administrativas e participação em uma organização são
                independentes.
              </p>
              <Link className="ad-link" to="/admin/acessos/politicas">
                Consultar matriz de capacidades →
              </Link>
            </Panel>
          </div>
        )}
        {tab.active === "vinculos-e-permissoes" && (
          <div className="ad-stack">
            <Panel title="Vínculo efetivo no cenário">
              <Facts
                items={[
                  ["Contexto", organizationName(p.organization)],
                  ["Papel", p.role],
                  ["Origem", "Participação demonstrativa"],
                  ["Vigência", "Ativa no cenário"],
                  [
                    "Documentos de terceiros",
                    "Exigem compartilhamento e capacidade específica",
                  ],
                ]}
              />
            </Panel>
            <Panel title="Diagnóstico de autorização">
              <p>Exemplo: tentar ler EVD-015 no dossiê DOS-014 / V-002.</p>
              <Button onClick={() => setDiagnosis(true)}>
                Consultar diagnóstico de exemplo
              </Button>
              {diagnosis && (
                <Notice title="Leitura negada no cenário" tone="warning">
                  {p.type === "Equipe interna"
                    ? "O papel interno não concede leitura de conteúdo. Não existe concessão de suporte ativa para este objeto."
                    : p.organization === "ORG-014"
                      ? "O vínculo de origem está ativo. A prévia administrativa continua sem concessão de suporte; o operador não assume a identidade do cliente."
                      : "O compartilhamento consultado expirou. O vínculo organizacional continua ativo; uma nova concessão deve ser feita pelo responsável."}{" "}
                  Nenhuma leitura foi executada.
                </Notice>
              )}
            </Panel>
          </div>
        )}
        {tab.active === "sessoes" && (
          <Panel title="Sessões da pessoa">
            <Facts
              items={[
                ["Sessão de exemplo", `SES-${p.id.slice(-3)}`],
                ["Dispositivo", "Navegador · desktop"],
                ["Última atividade", p.last],
                ["Contexto", organizationName(p.organization)],
                ["Estado", "Ativa no cenário fictício"],
              ]}
            />
            <ActionButton
              action="revokeSession"
              context={{
                ...context,
                target: `SES-${p.id.slice(-3)}`,
                details: `${p.name} · somente esta sessão`,
              }}
            />
            <p className="ad-footnote">
              Revogar esta sessão não apaga a identidade e não encerra seus
              demais vínculos.
            </p>
          </Panel>
        )}
        {tab.active === "historico" && (
          <Panel title="Histórico de acesso">
            <Timeline
              entries={[
                {
                  title: "Participação ativa",
                  meta: "Cenário de 25 set. 2026",
                  detail: `${p.role} · ${organizationName(p.organization)}`,
                },
              ]}
            />
            <Link
              className="ad-link"
              to={`/admin/auditoria?ator=${encodeURIComponent(p.name)}`}
            >
              Consultar eventos desta pessoa →
            </Link>
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
export function AdminPolicies() {
  const capabilities = [
    {
      id: "metadata",
      name: "Consultar metadados operacionais",
      scope: "Equipe e ambiente",
      support: "Permitido no escopo",
      tech: "Permitido no escopo",
      access: "Somente identidades",
      audit: "Somente leitura",
    },
    {
      id: "content",
      name: "Abrir conteúdo documental",
      scope: "Organização e objeto",
      support: "Concessão específica",
      tech: "Concessão específica",
      access: "Não incluído",
      audit: "Concessão específica",
    },
    {
      id: "retry",
      name: "Repetir execução elegível",
      scope: "Entrada e método revisados",
      support: "Capacidade adicional",
      tech: "Permitido no escopo",
      access: "Não incluído",
      audit: "Não incluído",
    },
    {
      id: "session",
      name: "Revogar sessão",
      scope: "Pessoa e sessão",
      support: "Não incluído",
      tech: "Não incluído",
      access: "Reautenticação",
      audit: "Não incluído",
    },
    {
      id: "grant",
      name: "Conceder privilégio interno",
      scope: "Capacidade e vigência",
      support: "Não incluído",
      tech: "Não incluído",
      access: "Revisão independente",
      audit: "Não incluído",
    },
    {
      id: "export",
      name: "Exportar informações restritas",
      scope: "Campos e seleção fixada",
      support: "Capacidade separada",
      tech: "Capacidade separada",
      access: "Capacidade separada",
      audit: "Capacidade separada",
    },
  ];
  return (
    <>
      <PageHeading
        title="Papéis e políticas de acesso"
        description="Capacidades propostas por escopo. Um papel interno não concede leitura irrestrita."
        back={{ to: "/admin/acessos", label: "Pessoas e acessos" }}
      />
      <Notice title="Matriz de referência · política ainda não aplicada no servidor">
        Esta prévia mostra a proposta da arquitetura. Não concede permissões e
        não permite autoaprovação.
      </Notice>
      <DataTable
        rows={capabilities}
        label="Matriz de capacidades administrativas"
        columns={[
          {
            label: "Capacidade",
            render: (c) => <Entity name={c.name} detail={c.scope} />,
          },
          { label: "Operação e suporte", render: (c) => c.support },
          { label: "Responsável técnico", render: (c) => c.tech },
          { label: "Gestão de acesso", render: (c) => c.access },
          { label: "Auditoria interna", render: (c) => c.audit },
        ]}
      />
      <Panel title="Versão e responsabilidade">
        <Facts
          items={[
            ["Fonte", "Arquitetura Lastre Admin · versão 0.1"],
            ["Publicação da política", "Pendente de validação pela equipe"],
            ["Editor de papéis", "Não disponível no piloto"],
            [
              "Revisão independente",
              "Elevação de privilégios e intervenções de grande alcance",
            ],
          ]}
        />
      </Panel>
    </>
  );
}
export function AdminAudit() {
  const { params, update } = useQuery();
  const actors = [...new Set(events.map((e) => e.actor))];
  const results = [...new Set(events.map((e) => e.result))];
  const rows = events.filter(
    (e) =>
      matches(
        params.get("q"),
        e.id,
        e.actor,
        e.action,
        e.target,
        e.correlation,
      ) &&
      (!params.get("organizacao") ||
        e.organization === params.get("organizacao")) &&
      filterValue(params.get("ator"), e.actor, actors) &&
      filterValue(params.get("resultado"), e.result, results),
  );
  const selected = events.find((e) => e.id === params.get("evento"));
  return (
    <>
      <PageHeading
        title="Auditoria"
        description="Autoria, alcance e resultado das intervenções, em uma trilha consultável."
        action={
          <ActionButton
            action="export"
            context={{
              target: `${rows.length} eventos: ${rows.map((e) => e.id).join(", ")}`,
              organization: params.get("organizacao")
                ? organizationName(params.get("organizacao")!)
                : "Organizações da seleção",
              details:
                "Janela demonstrativa de 25 set. 2026; somente metadados operacionais.",
            }}
          >
            Exportar seleção
          </ActionButton>
        }
      />
      <Toolbar>
        <Filter name="ator" label="Ator" options={actors} />
        <Filter name="resultado" label="Resultado" options={results} />
        <Filter
          name="organizacao"
          label="Organização"
          options={organizations.map((o) => ({ value: o.id, label: o.name }))}
        />
      </Toolbar>
      <DataTable
        rows={rows}
        label="Eventos administrativos"
        onSelect={(e) => update({ evento: e.id })}
        columns={[
          { label: "Momento (BRT)", render: (e) => e.time },
          { label: "Ator", render: (e) => e.actor },
          {
            label: "Ação e alvo",
            render: (e) => (
              <Entity name={e.action} detail={`${e.target} · ${e.id}`} />
            ),
          },
          {
            label: "Organização",
            render: (e) => organizationName(e.organization),
          },
          { label: "Resultado", render: (e) => <Badge>{e.result}</Badge> },
        ]}
      />
      <p className="ad-footnote">
        Eventos fictícios, somente leitura. Integridade e retenção da trilha de
        produção exigem implementação no servidor.
      </p>
      {params.has("evento") && (
        <Surface
          title={selected?.action ?? "Evento não encontrado"}
          description={selected?.id}
          onClose={() => update({ evento: null })}
        >
          {selected ? (
            <div className="ad-stack">
              <Facts
                items={[
                  ["Ator real", selected.actor],
                  ["Momento", `${selected.time} BRT`],
                  [
                    "Alvo",
                    <Link to={recordUrl(selected.target)}>
                      {selected.target} →
                    </Link>,
                  ],
                  ["Organização", organizationName(selected.organization)],
                  ["Ambiente", "Demonstração"],
                  ["Resultado", <Badge>{selected.result}</Badge>],
                  ["Fundamento", selected.reason],
                ]}
              />
              <Notice title="Registro histórico">
                Correções devem produzir novos eventos; esta interface não
                permite editar a trilha.
              </Notice>
              <details className="ad-disclosure">
                <summary>Referências técnicas</summary>
                <Facts
                  items={[
                    ["Evento", selected.id],
                    ["Correlação", selected.correlation],
                    ["Conteúdo sensível", "Não incluído"],
                  ]}
                />
              </details>
              <Link
                className="ad-button"
                to={`/admin/auditoria?q=${selected.correlation}`}
              >
                Eventos correlacionados
              </Link>
            </div>
          ) : (
            <Missing back="/admin/auditoria" />
          )}
        </Surface>
      )}
    </>
  );
}
export function AdminSettings() {
  const tab = useTab(["Operação", "Dados e retenção", "Recursos e mudanças"]);
  return (
    <>
      <PageHeading
        title="Configurações"
        description="Políticas compartilhadas, com fonte, responsabilidade e vigência identificadas."
      />
      <PageTabs state={tab}>
        {tab.active === "operacao" ? (
          <div className="ad-detail-grid">
            <Panel title="Responsabilidade operacional">
              <Facts
                items={[
                  ["Fila de suporte", "Operação e suporte"],
                  ["Falhas de processamento", "Responsável técnico"],
                  ["Acessos", "Gestão de acesso"],
                  ["Modelos de requisitos", "Produto e qualidade"],
                  [
                    "Horário e metas de resposta",
                    "Ainda não definidos para operação real",
                  ],
                ]}
              />
            </Panel>
            <Panel title="Origem da configuração">
              <Facts
                items={[
                  [
                    "Fonte",
                    "Arquitetura Lastre Admin · configuração versionada",
                  ],
                  ["Situação", "Proposta para validação"],
                  ["Edição", "Arquivos versionados e revisão da equipe"],
                ]}
              />
              <Notice title="Consulta no piloto">
                Prazos só serão exibidos quando houver uma política aprovada.
              </Notice>
            </Panel>
          </div>
        ) : tab.active === "dados-e-retencao" ? (
          <div className="ad-stack">
            <Panel title="Classes de dados e dependências">
              <DataTable
                label="Políticas de dados"
                rows={[
                  {
                    id: "documents",
                    name: "Evidências e versões",
                    purpose: "Base histórica de envios e análises",
                    dependency: "Compartilhamentos e decisões de terceiros",
                  },
                  {
                    id: "audit",
                    name: "Eventos de auditoria",
                    purpose: "Reconstrução de autoria e intervenções",
                    dependency: "Integridade e impedimentos de eliminação",
                  },
                  {
                    id: "identity",
                    name: "Identidades e vínculos",
                    purpose: "Controle de acesso",
                    dependency: "Participações em outras organizações",
                  },
                ]}
                columns={[
                  { label: "Classe", render: (r) => r.name },
                  { label: "Finalidade", render: (r) => r.purpose },
                  { label: "Dependências", render: (r) => r.dependency },
                  { label: "Prazo", render: () => "A definir pela política" },
                ]}
              />
            </Panel>
            <Notice
              title="Eliminação depende de um processo aprovado"
              tone="warning"
            >
              A prévia não presume um prazo de retenção nem permite apagar
              dados. Pedidos precisam de revisão de dependências e recibo por
              conjunto.
            </Notice>
            <Link className="ad-button" to="/admin/intervencoes/INT-105">
              Consultar exemplo de pedido de dados →
            </Link>
          </div>
        ) : (
          <Panel title="Recursos por ambiente">
            <Facts
              items={[
                ["Admin local", "Prévia com dados fictícios"],
                [
                  "Admin em produção",
                  "Não habilitado; excluído do build público",
                ],
                [
                  "Inventário",
                  "Leitura das fontes versionadas e do relatório gerado",
                ],
                [
                  "Autoridade para publicação",
                  "Produto e engenharia, após revisão",
                ],
                [
                  "Mudanças de código",
                  "Implantação e rollback seguem o fluxo de engenharia",
                ],
              ]}
            />
            <Link className="ad-link" to="/admin/inventario">
              Consultar inventário de implementação →
            </Link>
          </Panel>
        )}
      </PageTabs>
    </>
  );
}
export function AdminEntry() {
  const { params } = useQuery();
  const raw = params.get("retorno") ?? "/admin";
  const safeReturn =
    /^\/admin(?:\/|\?|$)/.test(raw) &&
    !raw.includes("\\") &&
    !raw.startsWith("/admin/entrar")
      ? raw
      : "/admin";
  return (
    <div className="ad-entry">
      <div className="ad-entry-brand">
        <LastreWordmark />
        <span>ADMIN</span>
      </div>
      <p className="ad-eyebrow">AMBIENTE LOCAL</p>
      <h1>
        Operação com contexto.
        <br />
        Acesso com responsabilidade.
      </h1>
      <p>
        A entrada administrativa exige identidade interna e verificação
        adicional. Contas de clientes não recebem acesso ao Admin.
      </p>
      <Panel title="Entrada administrativa">
        <Button primary disabled>
          Continuar com identidade corporativa
        </Button>
        <p className="ad-footnote">
          Provedor administrativo e verificação adicional ainda não conectados.
        </p>
        <details className="ad-disclosure">
          <summary>Recuperar acesso administrativo</summary>
          <p>
            A recuperação deve ser validada pela equipe de gestão de acesso no
            provedor escolhido, preservando os fatores de autenticação.
          </p>
        </details>
        <Link className="ad-button" to={safeReturn}>
          Explorar demonstração local →
        </Link>
        <small>
          Somente dados fictícios. Este acesso à prévia não autentica uma
          pessoa.
        </small>
      </Panel>
    </div>
  );
}
export function AdminIntervention() {
  const { intervencaoId } = useParams();
  const { params } = useQuery();
  const [message, setMessage] = useState("");
  const isBatch = intervencaoId === "INT-106";
  const item = interventions.find((i) => i.id === intervencaoId);
  const targetIds = [
    ...new Set((params.get("alvos") ?? "").split(",").filter(Boolean)),
  ];
  const targets = executions.filter((e) => targetIds.includes(e.id));
  if (
    (!item && !isBatch) ||
    (isBatch && (!targets.length || targets.length !== targetIds.length))
  )
    return (
      <Missing
        title={
          isBatch
            ? "Seleção de execuções indisponível"
            : "Intervenção não encontrada"
        }
        back="/admin/verificacoes"
      />
    );
  const data = item ?? {
    id: "INT-106",
    name: "Revisar reprocessamento em conjunto",
    status: "Em preparação",
    author: "Operador da demonstração",
    organization: "",
    target: targets.map((t) => t.id).join(", "),
    version: "Seleção explícita",
    effect:
      "Nova tentativa somente para execuções elegíveis, preservando entrada, versão e método de cada alvo.",
    reason: "Preparação local de recuperação técnica.",
    kind: "Reprocessamento",
    eligible: targets
      .filter((t) => t.retry)
      .map((t) => `${t.id} / ${t.version}`),
    excluded: targets
      .filter((t) => !t.retry)
      .map((t) => `${t.id} · execução não elegível para repetição`),
    reviewer: "Responsável técnico",
  };
  return (
    <>
      <PageHeading
        title={data.name}
        eyebrow={`${data.id} · ${data.kind}`}
        description="Revise o conjunto exato, os efeitos e a autoridade antes de executar."
        back={{
          to: isBatch ? "/admin/verificacoes" : "/admin/fila",
          label: isBatch ? "Verificações" : "Fila de trabalho",
        }}
      />
      <div className="ad-context-line">
        <Badge>{data.status}</Badge>
        <span>Ambiente: demonstração</span>
      </div>
      <div className="ad-intervention-grid">
        <div className="ad-stack">
          <Panel title="Alvos e motivo">
            <Facts
              items={[
                ["Alvos", data.target],
                ["Organização / alcance", organizationName(data.organization)],
                ["Versão revisada", data.version],
                ["Solicitante", data.author],
                ["Justificativa", data.reason],
              ]}
            />
          </Panel>
          <Panel title="Efeito e dependências">
            <p>{data.effect}</p>
            <div className="ad-columns">
              <div>
                <h3>Elegíveis · {data.eligible.length}</h3>
                <ul className="ad-simple-list">
                  {data.eligible.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Excluídos · {data.excluded.length}</h3>
                <ul className="ad-simple-list">
                  {data.excluded.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Panel>
          <Panel title="Revisão e aprovação">
            <Facts
              items={[
                ["Responsável pela revisão", data.reviewer],
                [
                  "Independência",
                  "Solicitante não aprova a própria elevação ou publicação",
                ],
                ["Mudança de alvos ou efeito", "Invalida a aprovação anterior"],
                ["Autorização no servidor", "Não conectada nesta prévia"],
              ]}
            />
            <Button disabled>Aprovar intervenção</Button>
          </Panel>
          <Panel title="Execução e recibo">
            {data.status === "Resultado desconhecido" ? (
              <Notice title="O efeito ainda não foi confirmado" tone="warning">
                Consulte a mesma referência antes de repetir. Não foi gerado um
                recibo de sucesso.
              </Notice>
            ) : (
              <Notice title="Execução ainda não iniciada">
                Nenhum alvo foi alterado por esta prévia. A confirmação e os
                resultados por item dependem do servidor.
              </Notice>
            )}
            {isBatch && (
              <DataTable
                rows={targets}
                label="Resultado por alvo"
                columns={[
                  {
                    label: "Alvo e versão",
                    render: (e) => (
                      <Entity
                        name={e.id}
                        detail={e.version}
                        to={`/admin/verificacoes/${e.id}`}
                      />
                    ),
                  },
                  {
                    label: "Elegibilidade",
                    render: (e) =>
                      e.retry ? "Elegível após revisão" : "Excluído",
                  },
                  {
                    label: "Execução da intervenção",
                    render: () => "Não iniciada",
                  },
                ]}
              />
            )}
            <div className="ad-actions">
              <Button disabled>Executar intervenção</Button>
              <Button
                onClick={() =>
                  setMessage(
                    `A consulta de ${data.id} depende da API administrativa. O estado demonstrativo permanece ${data.status.toLowerCase()}.`,
                  )
                }
              >
                Consultar andamento
              </Button>
            </div>
            {message && <p role="status">{message}</p>}
          </Panel>
        </div>
        <Panel title="Resumo da revisão">
          <Facts
            items={[
              ["Referência", data.id],
              ["Estado", <Badge>{data.status}</Badge>],
              ["Efeito histórico", "Versões e decisões anteriores preservadas"],
              [
                "Reversão",
                "Exige avaliação própria; não existe desfazer genérico",
              ],
            ]}
          />
          <Link className="ad-link" to={`/admin/auditoria?q=${data.id}`}>
            Consultar auditoria →
          </Link>
        </Panel>
      </div>
    </>
  );
}
export function AdminSearch() {
  const { params } = useQuery();
  const all = [
    ...organizations.map((o) => ({
      id: o.id,
      name: o.name,
      detail: `${o.product} · ${o.status}`,
      type: "Organizações",
      to: `/admin/organizacoes/${o.id}`,
    })),
    ...people.map((p) => ({
      id: p.id,
      name: p.name,
      detail: `${organizationName(p.organization)} · ${p.role}`,
      type: "Pessoas",
      to: `/admin/acessos/pessoas/${p.id}`,
    })),
    ...objects.map((o) => ({
      id: o.id,
      name: o.name,
      detail: organizationName(o.organization),
      type: "Registros",
      to: `/admin/objetos/${o.id}`,
    })),
    ...dossiers.map((d) => ({
      id: d.id,
      name: d.name,
      detail: `${organizationName(d.organization)} · ${d.latest}`,
      type: "Registros",
      to: `/admin/dossies/${d.id}?versao=${d.latest}`,
    })),
    ...executions.map((e) => ({
      id: e.id,
      name: `${e.name} · ${e.object}`,
      detail: `${e.version} · ${e.status}`,
      type: "Execuções",
      to: `/admin/verificacoes/${e.id}`,
    })),
    ...cases.map((c) => ({
      id: c.id,
      name: c.title,
      detail: `${organizationName(c.organization)} · ${c.status}`,
      type: "Ocorrências",
      to: `/admin/fila/${c.id}`,
    })),
  ];
  const types = [
    "Organizações",
    "Pessoas",
    "Registros",
    "Execuções",
    "Ocorrências",
  ];
  const query = params.get("q")?.trim();
  const rows = query
    ? all.filter(
        (r) =>
          matches(query, r.id, r.name, r.detail) &&
          filterValue(params.get("tipo"), r.type, types),
      )
    : [];
  return (
    <>
      <PageHeading
        title="Busca"
        description="Localize nomes e identificadores para retomar o contexto correto."
      />
      <div className="ad-toolbar">
        <SearchField placeholder="Buscar organizações, pessoas, registros…" />
        <Filter name="tipo" label="Tipo de resultado" options={types} />
      </div>
      {!query ? (
        <Empty
          title="Qual contexto você procura?"
          description="Busque por um nome ou identificador, como Horizonte, HZ-014 ou OC-104."
        />
      ) : rows.length === 0 ? (
        <Empty />
      ) : (
        <div className="ad-stack">
          <p className="ad-muted">
            {rows.length} resultados para “{query}”
          </p>
          {types
            .filter((t) => rows.some((r) => r.type === t))
            .map((t) => (
              <Panel title={t} key={t}>
                <div className="ad-list">
                  {rows
                    .filter((r) => r.type === t)
                    .map((r) => (
                      <Link key={r.id} to={r.to}>
                        <Entity
                          name={r.name}
                          detail={`${r.id} · ${r.detail}`}
                        />
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                </div>
              </Panel>
            ))}
        </div>
      )}
    </>
  );
}
