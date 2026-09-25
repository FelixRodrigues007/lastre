import { Select } from "../../components/ui/Select";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
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
  Timeline,
  Toolbar,
  matches,
  useQuery,
  useTab,
} from "./AdminUI";
import {
  analyses,
  dossiers,
  events,
  evidence,
  executions,
  objects,
  organizationName,
  organizations,
} from "./admin-data";

function History({
  organization,
  target,
}: {
  organization: string;
  target?: string;
}) {
  const rows = events.filter((e) =>
    target ? e.target === target : e.organization === organization,
  );
  return (
    <Panel title="Histórico e autoria">
      {rows.length ? (
        <Timeline
          entries={rows.map((e) => ({
            title: e.action,
            meta: `${e.time} BRT · ${e.actor}`,
            detail: e.reason,
            to: `/admin/auditoria?evento=${e.id}`,
          }))}
        />
      ) : (
        <p className="ad-muted">
          Sem eventos adicionais para este registro na prévia.
        </p>
      )}
      <Link
        className="ad-panel-link"
        to={`/admin/auditoria?organizacao=${organization}`}
      >
        Consultar auditoria da organização →
      </Link>
    </Panel>
  );
}
export function AdminRecords() {
  const tab = useTab(
    ["Ativos e lotes", "Dossiês", "Solicitações", "Análises"],
    "tipo",
  );
  const { params } = useQuery();
  const selectedOrg = organizations.some(
    (o) => o.id === params.get("organizacao"),
  )
    ? params.get("organizacao")
    : null;
  const orgFilter = (id: string, recipient = "") =>
    !selectedOrg || id === selectedOrg || recipient === selectedOrg;
  return (
    <>
      <PageHeading
        title="Registros"
        description="Da origem à análise: encontre o objeto, a organização e a versão recebida."
      />
      <PageTabs state={tab}>
        <Toolbar>
          <Filter
            name="organizacao"
            label="Organização"
            options={organizations.map((o) => ({ value: o.id, label: o.name }))}
          />
        </Toolbar>
        {tab.active === "ativos-e-lotes" && (
          <DataTable
            label="Ativos e lotes"
            rows={objects.filter(
              (o) =>
                matches(
                  params.get("q"),
                  o.id,
                  o.name,
                  organizationName(o.organization),
                ) && orgFilter(o.organization),
            )}
            columns={[
              {
                label: "Objeto",
                render: (o) => (
                  <Entity
                    name={o.name}
                    detail={o.id}
                    to={`/admin/objetos/${o.id}`}
                  />
                ),
              },
              { label: "Tipo", render: (o) => o.type },
              {
                label: "Organização de origem",
                render: (o) => organizationName(o.organization),
              },
              { label: "Quantidade", render: (o) => o.quantity },
              { label: "Cadastro", render: (o) => <Badge>{o.status}</Badge> },
            ]}
          />
        )}
        {tab.active === "dossies" && (
          <DataTable
            label="Dossiês"
            rows={dossiers.filter(
              (d) =>
                matches(
                  params.get("q"),
                  d.id,
                  d.name,
                  organizationName(d.organization),
                  ...evidence
                    .filter((e) => e.dossier === d.id)
                    .map((e) => `${e.id} ${e.name}`),
                ) && orgFilter(d.organization, d.recipient),
            )}
            columns={[
              {
                label: "Dossiê",
                render: (d) => (
                  <Entity
                    name={d.name}
                    detail={d.id}
                    to={`/admin/dossies/${d.id}?versao=${d.latest}`}
                  />
                ),
              },
              {
                label: "Origem",
                render: (d) => organizationName(d.organization),
              },
              {
                label: "Destinatário",
                render: (d) =>
                  d.recipient
                    ? organizationName(d.recipient)
                    : "Ainda não enviado",
              },
              { label: "Versão", render: (d) => d.latest },
              {
                label: "Recebimento",
                render: (d) => <Badge>{d.status}</Badge>,
              },
            ]}
          />
        )}
        {["solicitacoes", "analises"].includes(tab.active) && (
          <DataTable
            label={tab.active === "analises" ? "Análises" : "Solicitações"}
            rows={analyses.filter(
              (a) =>
                matches(params.get("q"), a.id, a.name, a.request) &&
                orgFilter(
                  a.organization,
                  dossiers.find((d) => d.id === a.dossier)?.organization,
                ),
            )}
            columns={[
              {
                label: tab.active === "analises" ? "Análise" : "Solicitação",
                render: (a) => (
                  <Entity
                    name={a.name}
                    detail={tab.active === "analises" ? a.id : a.request}
                    to={`/admin/analises/${a.id}${tab.active === "solicitacoes" ? `?tab=solicitacoes&solicitacao=${a.request}` : ""}`}
                  />
                ),
              },
              {
                label: "Organização analista",
                render: (a) => organizationName(a.organization),
              },
              { label: "Responsável", render: (a) => a.owner },
              { label: "Base", render: (a) => a.version },
              { label: "Análise", render: (a) => <Badge>{a.status}</Badge> },
            ]}
          />
        )}
      </PageTabs>
    </>
  );
}
export function AdminObject() {
  const { objetoId } = useParams();
  const object = objects.find((o) => o.id === objetoId);
  const tab = useTab(["Resumo", "Dossiês", "Histórico"]);
  if (!object) return <Missing back="/admin/registros" />;
  const dossier = dossiers.find((d) => d.id === object.dossier)!;
  return (
    <>
      <PageHeading
        title={object.name}
        eyebrow={`${object.id} · ${object.type}`}
        description={`${organizationName(object.organization)} · ${object.category}`}
        back={{ to: "/admin/registros", label: "Registros" }}
        action={
          <ActionButton
            action="createCase"
            context={{
              target: object.id,
              organization: organizationName(object.organization),
            }}
          >
            Apontar problema operacional
          </ActionButton>
        }
      />
      <div className="ad-context-line">
        <Badge>{object.status}</Badge>
        <span>Declaração da organização de origem</span>
      </div>
      <PageTabs state={tab}>
        {tab.active === "resumo" ? (
          <div className="ad-detail-grid">
            <Panel title="Atributos declarados">
              <Facts
                items={[
                  ["Tipo de objeto", object.type],
                  ["Categoria", object.category],
                  ["Quantidade e unidade", object.quantity],
                  ["Localidade", object.location],
                  [
                    "Organização responsável",
                    <Link to={`/admin/organizacoes/${object.organization}`}>
                      {organizationName(object.organization)}
                    </Link>,
                  ],
                  ["Fonte", "Declaração da organização · exemplo fictício"],
                ]}
              />
            </Panel>
            <Panel title="Contexto documental">
              <Entity
                name={dossier.name}
                detail={`${dossier.id} · ${dossier.latest}`}
                to={`/admin/dossies/${dossier.id}?versao=${dossier.latest}`}
              />
              <Notice title="Autoria preservada">
                Correções da declaração devem ser feitas pelo responsável no
                Assets.
              </Notice>
            </Panel>
          </div>
        ) : tab.active === "dossies" ? (
          <Panel title="Dossiês do objeto">
            <Facts
              items={[
                ["Finalidade", dossier.purpose],
                ["Versão recebida", dossier.latest],
                [
                  "Destinatário",
                  dossier.recipient
                    ? organizationName(dossier.recipient)
                    : "Ainda não compartilhado",
                ],
              ]}
            />
            <Link
              className="ad-button"
              to={`/admin/dossies/${dossier.id}?versao=${dossier.latest}`}
            >
              Abrir dossiê →
            </Link>
          </Panel>
        ) : (
          <History organization={object.organization} target={object.id} />
        )}
      </PageTabs>
    </>
  );
}
export function AdminDossier() {
  const { dossieId } = useParams();
  const item = dossiers.find((d) => d.id === dossieId);
  const { params, update } = useQuery();
  const tab = useTab(["Conteúdo", "Versões", "Compartilhamentos", "Histórico"]);
  if (!item) return <Missing back="/admin/registros?tipo=dossies" />;
  const version = params.get("versao") ?? item.latest;
  if (!item.versions.includes(version))
    return (
      <Missing
        title="Versão não encontrada"
        back={`/admin/dossies/${item.id}?versao=${item.latest}`}
      />
    );
  const docs = evidence.filter(
    (e) => e.dossier === item.id && e.version === version,
  );
  const checks = executions.filter(
    (e) => e.dossier === item.id && e.version === version,
  );
  return (
    <>
      <PageHeading
        title={item.name}
        eyebrow={`${item.id} · ${version}`}
        description={`${organizationName(item.organization)} · ${item.purpose}`}
        back={{ to: "/admin/registros?tipo=dossies", label: "Dossiês" }}
        action={
          <label className="ad-version">
            Versão
            <Select
              variant="toolbar"
              aria-label="Versão do dossiê"
              value={version}
              onChange={(next) => update({ versao: next })}
              options={item.versions.map((v) => ({ value: v, label: v, icon: "history" as const }))}
            />
          </label>
        }
      />
      <div className="ad-context-line">
        <Badge>{item.status}</Badge>
        <span>
          {version === "Rascunho"
            ? "Ainda não enviado"
            : `Base recebida · ${version} · autoria da organização`}
        </span>
      </div>
      {version !== item.latest && (
        <Notice
          title="Você está consultando uma versão histórica"
          tone="warning"
        >
          A versão {item.latest} foi recebida depois. Os resultados abaixo
          pertencem exclusivamente a {version}.
        </Notice>
      )}
      <PageTabs state={tab}>
        {tab.active === "conteudo" && (
          <div className="ad-stack">
            <Panel title="Requisitos e evidências">
              <DataTable
                rows={docs}
                label="Evidências da versão selecionada"
                columns={[
                  {
                    label: "Requisito",
                    render: (e) => (
                      <Entity
                        name={e.requirement}
                        detail={e.name}
                        to={`/admin/evidencias/${e.id}?dossie=${item.id}&versao=${version}`}
                      />
                    ),
                  },
                  { label: "Autoria", render: (e) => e.author },
                  { label: "Recebimento", render: (e) => e.date },
                  {
                    label: "Leitura",
                    render: (e) => <Badge>{e.status}</Badge>,
                  },
                ]}
              />
              {item.id === "DOS-014" && version === "V-001" && (
                <Notice title="Classificação ainda não recebida" tone="warning">
                  Esta versão contém somente a declaração de origem.
                </Notice>
              )}
            </Panel>
            <Panel title="Verificações desta versão">
              <div className="ad-list">
                {checks.map((c) => (
                  <Link key={c.id} to={`/admin/verificacoes/${c.id}`}>
                    <Entity
                      name={c.name}
                      detail={`${c.id} · método ${c.methodVersion}`}
                    />
                    <div className="ad-actions">
                      <Badge>{c.status}</Badge>
                      <Badge>{c.result}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
              {!checks.length && (
                <p className="ad-muted">
                  Nenhuma verificação vinculada a esta versão.
                </p>
              )}
            </Panel>
          </div>
        )}
        {tab.active === "versoes" && (
          <Panel
            title="Versões preservadas"
            aside={
              item.versions.length > 1 && (
                <Link
                  className="ad-button"
                  to={`/admin/comparacoes?dossie=${item.id}&base=V-001&alvo=V-002`}
                >
                  Comparar versões
                </Link>
              )
            }
          >
            <div className="ad-list">
              {[...item.versions].reverse().map((v) => (
                <Link
                  key={v}
                  to={`/admin/dossies/${item.id}?tab=conteudo&versao=${v}`}
                >
                  <Entity
                    name={v}
                    detail={
                      v === "V-002"
                        ? "25 set. 2026 · Ana Ribeiro · laudo acrescentado"
                        : v === "V-001"
                          ? "24 set. 2026 · organização de origem · envio inicial"
                          : "Ainda não enviado"
                    }
                  />
                  <Badge>
                    {v === item.latest ? "Mais recente" : "Histórica"}
                  </Badge>
                </Link>
              ))}
            </div>
          </Panel>
        )}
        {tab.active === "compartilhamentos" && (
          <Panel title="Destinatários e vigência">
            {item.recipient ? (
              <>
                <Facts
                  items={[
                    ["Destinatário", organizationName(item.recipient)],
                    ["Finalidade", item.purpose],
                    ["Versão autorizada", version],
                    ["Operações", "Leitura da versão compartilhada"],
                    ["Vigência demonstrativa", "Até 30 set. 2026, 18:00 BRT"],
                    [
                      "Acesso do suporte",
                      "Não incluído no compartilhamento do cliente",
                    ],
                  ]}
                />
                <ActionButton
                  action="support"
                  context={{
                    target: item.id,
                    organization: organizationName(item.organization),
                    version,
                  }}
                >
                  Solicitar acesso de suporte
                </ActionButton>
              </>
            ) : (
              <Empty
                title="Ainda não compartilhado"
                description="O responsável no Assets precisa concluir e enviar o rascunho."
              />
            )}
          </Panel>
        )}
        {tab.active === "historico" && (
          <History organization={item.organization} target={item.id} />
        )}
      </PageTabs>
    </>
  );
}
export function AdminAnalysis() {
  const { analiseId } = useParams();
  const a = analyses.find((item) => item.id === analiseId);
  const tab = useTab([
    "Resumo",
    "Solicitações",
    "Base e conclusão",
    "Histórico",
  ]);
  if (!a) return <Missing back="/admin/registros?tipo=analises" />;
  const d = dossiers.find((item) => item.id === a.dossier)!;
  return (
    <>
      <PageHeading
        title={a.name}
        eyebrow={a.id}
        description={`${organizationName(a.organization)} · responsável: ${a.owner}`}
        back={{ to: "/admin/registros?tipo=analises", label: "Análises" }}
        action={
          <ActionButton
            action="createCase"
            context={{
              target: a.id,
              organization: organizationName(a.organization),
              version: a.version,
            }}
          >
            Abrir ocorrência
          </ActionButton>
        }
      />
      <div className="ad-context-line">
        <Badge>{a.status}</Badge>
        <span>Base da análise: {a.version}</span>
      </div>
      <PageTabs state={tab}>
        {tab.active === "resumo" ? (
          <div className="ad-detail-grid">
            <Panel title="Situação da análise">
              <Facts
                items={[
                  ["Objeto", d.name],
                  ["Origem", organizationName(d.organization)],
                  ["Organização analista", organizationName(a.organization)],
                  ["Finalidade", d.purpose],
                  [
                    "Próximo ator",
                    a.status === "Aguardando verificação"
                      ? "Responsável técnico pela verificação"
                      : a.owner,
                  ],
                  [
                    "Bloqueio",
                    a.status === "Aguardando verificação"
                      ? "Consulta da origem indisponível"
                      : "Sem impedimento operacional conhecido",
                  ],
                ]}
              />
            </Panel>
            <Panel title="Base documental">
              <Link
                className="ad-link"
                to={`/admin/dossies/${d.id}?versao=${a.version}`}
              >
                {d.id} / {a.version} →
              </Link>
              {a.version !== d.latest && (
                <Notice title="Nova versão recebida" tone="warning">
                  A análise usou {a.version}. Existe uma versão {d.latest}{" "}
                  posterior; a base anterior permanece preservada.
                </Notice>
              )}
            </Panel>
          </div>
        ) : tab.active === "solicitacoes" ? (
          <Panel title={`Solicitação ${a.request}`}>
            <Facts
              items={[
                ["Destinatário", organizationName(d.organization)],
                ["Requisitos", d.purpose],
                ["Versão da resposta", d.latest],
                ["Pendência", "Análise pela organização destinatária"],
              ]}
            />
            <Link
              className="ad-button"
              to={`/admin/dossies/${d.id}?versao=${d.latest}`}
            >
              Abrir resposta recebida
            </Link>
          </Panel>
        ) : tab.active === "base-e-conclusao" ? (
          <Panel title="Base e responsabilidade da conclusão">
            <Facts
              items={[
                ["Base examinada", `${d.id} / ${a.version}`],
                ["Responsável pela análise", a.owner],
                [
                  "Texto da conclusão e notas",
                  "Conteúdo restrito à organização analista",
                ],
              ]}
            />
            <Notice title="A conclusão pertence à organização analista">
              O suporte pode recuperar processamento e entrega. Não pode editar
              ou aprovar a decisão do cliente.
            </Notice>
            <ActionButton
              action="support"
              context={{
                target: a.id,
                organization: organizationName(a.organization),
                version: a.version,
              }}
            />
          </Panel>
        ) : (
          <History organization={a.organization} target={a.id} />
        )}
      </PageTabs>
    </>
  );
}
export function AdminEvidence() {
  const { evidenciaId } = useParams();
  const doc = evidence.find((e) => e.id === evidenciaId);
  const { params } = useQuery();
  const [zoom, setZoom] = useState(100);
  const [meta, setMeta] = useState(true);
  if (!doc) return <Missing back="/admin/registros?tipo=dossies" />;
  const d = dossiers.find((d) => d.id === doc.dossier)!;
  if (
    (params.has("versao") && params.get("versao") !== doc.version) ||
    (params.has("dossie") && params.get("dossie") !== doc.dossier)
  )
    return (
      <Missing
        title="Evidência fora da versão solicitada"
        back={`/admin/dossies/${d.id}?versao=${doc.version}`}
      />
    );
  const context = {
    target: doc.id,
    organization: organizationName(d.organization),
    version: doc.version,
  };
  return (
    <>
      <PageHeading
        title={doc.name}
        eyebrow={`${doc.id} · ${d.id} / ${doc.version}`}
        description={`${organizationName(d.organization)} · ${doc.date}`}
        back={{
          to: `/admin/dossies/${d.id}?versao=${doc.version}&tab=conteudo`,
          label: "Voltar ao dossiê e à versão",
        }}
        action={
          <Button onClick={() => setMeta(!meta)}>
            {meta ? "Ocultar" : "Mostrar"} metadados
          </Button>
        }
      />
      <div className={`ad-viewer-layout${meta ? "" : " ad-viewer-wide"}`}>
        <section className="ad-viewer" aria-label="Leitura da evidência">
          {doc.preview ? (
            <>
              <div className="ad-viewer-toolbar">
                <span>Página 1 de 1</span>
                <div className="ad-actions">
                  <Button
                    disabled={zoom <= 60}
                    aria-label="Diminuir zoom"
                    onClick={() => setZoom(Math.max(60, zoom - 20))}
                  >
                    −
                  </Button>
                  <span>{zoom}%</span>
                  <Button
                    disabled={zoom >= 160}
                    aria-label="Aumentar zoom"
                    onClick={() => setZoom(Math.min(160, zoom + 20))}
                  >
                    +
                  </Button>
                  <Button onClick={() => setZoom(100)}>Ajustar largura</Button>
                </div>
              </div>
              <div className="ad-paper-canvas">
                <article className="ad-paper" style={{ width: `${zoom}%` }}>
                  <p className="ad-eyebrow">
                    DOCUMENTO FICTÍCIO · SEM VALOR PROBATÓRIO
                  </p>
                  <div className="ad-paper-rule" />
                  <h2>Declaração de origem</h2>
                  <p>Lote HZ-014 · safra 2026</p>
                  <dl>
                    <dt>Organização de origem</dt>
                    <dd>Horizonte Agro</dd>
                    <dt>Produção declarada</dt>
                    <dd>
                      {doc.version === "V-001" ? "460" : "480"} toneladas de
                      soja
                    </dd>
                    <dt>Local de origem</dt>
                    <dd>Rio Verde, Goiás</dd>
                    <dt>Responsável pela declaração</dt>
                    <dd>Ana Ribeiro</dd>
                  </dl>
                  <p>
                    Exemplo de leitura de um documento vinculado a uma versão. O
                    conteúdo serve exclusivamente à avaliação da interface
                    administrativa.
                  </p>
                  <div className="ad-paper-signature">
                    Ana Ribeiro
                    <span>Responsável pela origem · {doc.version}</span>
                  </div>
                  <footer>
                    Lastre · demonstração de evidência <span>1 / 1</span>
                  </footer>
                </article>
              </div>
            </>
          ) : (
            <Empty
              title={
                doc.status === "Sem prévia"
                  ? "Arquivo sem prévia disponível"
                  : "Conteúdo restrito"
              }
              description={
                doc.status === "Sem prévia"
                  ? "Os metadados continuam disponíveis. Uma alternativa de leitura depende de autorização e integração de arquivos."
                  : "Os metadados deste caso estão disponíveis. Para abrir o documento, é necessária uma concessão de suporte."
              }
              action={
                <ActionButton action="support" context={context} primary />
              }
            />
          )}
        </section>
        {meta && (
          <Panel title="Metadados da evidência">
            <Facts
              items={[
                ["Autor", doc.author],
                ["Recebimento", doc.date],
                ["Dossiê / versão", `${d.id} / ${doc.version}`],
                ["Requisito", doc.requirement],
                ["Fonte", "Organização de origem"],
                ["Download", "Requer capacidade separada e backend"],
              ]}
            />
            <div className="ad-context-line">
              <Icon name="lock" size={14} />
              <span>Sem URL pública de arquivo</span>
            </div>
            <Link className="ad-link" to={`/admin/verificacoes?q=${d.object}`}>
              Verificações relacionadas →
            </Link>
          </Panel>
        )}
      </div>
    </>
  );
}
export function AdminComparison() {
  const { params, update } = useQuery();
  const d = dossiers.find(
    (item) => item.id === (params.get("dossie") ?? "DOS-014"),
  );
  if (!d) return <Missing back="/admin/registros?tipo=dossies" />;
  const base = params.get("base") ?? d.versions[0];
  const target = params.get("alvo") ?? d.latest;
  const valid = d.versions.includes(base) && d.versions.includes(target);
  const forward = base === "V-001";
  return (
    <>
      <PageHeading
        title="Comparação de versões"
        eyebrow={d.id}
        description={`${d.name} · ${organizationName(d.organization)}`}
        back={{
          to: `/admin/dossies/${d.id}?tab=versoes&versao=${d.latest}`,
          label: "Versões do dossiê",
        }}
      />
      <div className="ad-comparison-select">
        <label>
          Versão base
          <Select
            variant="toolbar"
            aria-label="Versão base"
            value={base}
            onChange={(next) => update({ base: next })}
            options={d.versions.map((v) => ({ value: v, label: v }))}
          />
        </label>
        <span aria-hidden="true">→</span>
        <label>
          Versão alvo
          <Select
            variant="toolbar"
            aria-label="Versão alvo"
            value={target}
            onChange={(next) => update({ alvo: next })}
            options={d.versions.map((v) => ({ value: v, label: v }))}
          />
        </label>
      </div>
      {!valid ? (
        <Missing
          title="Par de versões indisponível"
          back={`/admin/comparacoes?dossie=${d.id}`}
        />
      ) : base === target ? (
        <Empty
          title="Selecione duas versões diferentes"
          description={
            d.versions.length < 2
              ? "Este dossiê tem somente uma versão disponível."
              : "A comparação mostra mudanças entre a base e o alvo."
          }
        />
      ) : (
        <div className="ad-stack">
          <Notice
            title={`1 campo alterado · 1 evidência ${forward ? "adicionada" : "removida"}`}
          >
            Resultados de verificações permanecem vinculados à versão em que
            foram produzidos.
          </Notice>
          <Panel title="Quantidade declarada">
            <div className="ad-diff">
              <div>
                <span>{base} · antes</span>
                <strong>{forward ? "460" : "480"} t</strong>
                <small>Declaração da origem</small>
              </div>
              <div>
                <span>{target} · depois</span>
                <strong>{forward ? "480" : "460"} t</strong>
                <small>Declaração da origem</small>
              </div>
            </div>
          </Panel>
          <Panel title="Documentos">
            <div className="ad-context-line">
              <Badge>{forward ? "Adicionado" : "Removido do alvo"}</Badge>
              <strong>Laudo de classificação</strong>
            </div>
            <p>
              O conteúdo continua restrito. A comparação não expõe trechos do
              arquivo.
            </p>
            <Link
              className="ad-link"
              to="/admin/evidencias/EVD-015?dossie=DOS-014&versao=V-002"
            >
              Consultar metadados →
            </Link>
          </Panel>
          <Panel title="Verificações afetadas">
            <p>
              A consulta de origem precisa usar a entrada da versão alvo. O
              resultado inconclusivo de V-001 não comprova o resultado de V-002.
            </p>
            <Link
              className="ad-link"
              to={`/admin/dossies/${d.id}?versao=${target}`}
            >
              Abrir conteúdo da versão alvo →
            </Link>
          </Panel>
        </div>
      )}
    </>
  );
}
