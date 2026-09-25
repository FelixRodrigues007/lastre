import { downloadCsv, downloadJson } from "./csv";
import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Button, buttonClassName } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { DropdownMenu } from "../../components/ui/DropdownMenu";
import { Select } from "../../components/ui/Select";
import { Tabs } from "../../components/ui/Tabs";
import {
  api,
  request,
  type DossierObject,
  type Fields,
  type Share,
  type Snapshot,
} from "./api";
import { useWorkspace } from "./context";
import {
  canEdit,
  canSend,
  categoryLabels,
  dateLabel,
  missingFields,
  objectPath,
  quantityLabel,
  sectorLabels,
  statusLabels,
} from "./model";
import {
  Avatar,
  Badge,
  Empty,
  Feedback,
  Glyph,
  Notice,
  Panel,
  Progress,
  Properties,
  Timeline,
  relativeTime,
  useAction,
  useUnsaved,
} from "./ui";
import { Dialog, toast } from "./overlay";
import { ObjectFields } from "./ObjectForm";
import { Documents, EvidenceList } from "./Documents";

export function ObjectSummary({
  fields,
  kind,
}: {
  fields: Fields;
  kind: "asset" | "lot";
}) {
  const items = [
    { label: "Tipo de cadastro", value: categoryLabels[fields.category] },
    { label: "Setor", value: sectorLabels[fields.sector] },
    { label: "Localização", value: fields.location || "A informar" },
    { label: "Responsável", value: fields.responsible || "A informar" },
    ...(kind === "lot"
      ? [
          { label: "Material ou produção", value: fields.material || "A informar" },
          { label: "Quantidade declarada", value: quantityLabel({ fields }) },
          {
            label: "Período da produção",
            value: `${dateLabel(fields.periodStart)} — ${dateLabel(fields.periodEnd)}`,
          },
        ]
      : []),
    ...(fields.area
      ? [
          {
            label: "Área declarada",
            value: `${Number(fields.area).toLocaleString("pt-BR")} ha`,
          },
        ]
      : []),
    ...(fields.registration
      ? [{ label: "Referência declarada", value: fields.registration, mono: true }]
      : []),
  ];
  return (
    <div className="assets-summary">
      <Properties items={items} columns={2} />
      {fields.description && (
        <div className="assets-summary__desc">
          <p className="assets-eyebrow">Descrição</p>
          <p>{fields.description}</p>
        </div>
      )}
    </div>
  );
}

export function VerificationList({ version }: { version?: Snapshot }) {
  return (
    <div className="assets-stack">
      <div className="assets-section-head">
        <div>
          <h2>Verificações disponíveis</h2>
          <p className="assets-panel__desc">
            {version
              ? `Resultados sobre a versão ${version.number}, enviada em ${dateLabel(version.createdAt)}.`
              : "As conferências são vinculadas a uma versão enviada."}
          </p>
        </div>
      </div>
      {version ? (
        <div className="assets-checks assets-stagger">
          {version.verifications.map((check) => {
            const unavailable = check.status === "unavailable";
            const ok = !unavailable && check.result === "consistent";
            return (
              <article
                className="assets-verify"
                data-state={unavailable ? "unavailable" : ok ? "ok" : "warn"}
                key={check.id}
              >
                <header className="assets-verify__head">
                  <Glyph
                    icon={unavailable ? "lock" : ok ? "shield" : "escalations"}
                    tone={unavailable ? "neutral" : ok ? "success" : "warning"}
                    size="sm"
                  />
                  <h3>{check.method}</h3>
                  <Badge
                    tone={unavailable ? "neutral" : ok ? "good" : "warning"}
                  >
                    {unavailable
                      ? "Indisponível"
                      : ok
                        ? "Conferência concluída"
                        : "Divergência encontrada"}
                  </Badge>
                </header>
                <p>{check.scope}</p>
                <p className="assets-verify__limit">
                  <Icon name="info" size={14} /> {check.limitation}
                </p>
                {check.status === "completed" && (
                  <p className="assets-verify__meta assets-mono">
                    {dateLabel(check.checkedAt, true)} · método{" "}
                    {check.methodVersion} · versão {version.number}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <Notice tone="info" title="Nenhuma verificação executada">
          Cadastre os dados, reúna os documentos e revise uma versão para
          compartilhar. Cadastro completo não comprova origem ou titularidade.
        </Notice>
      )}
    </div>
  );
}

function EditObject({
  object,
  close,
}: {
  object: DossierObject;
  close: () => void;
}) {
  const { reload } = useWorkspace();
  const [fields, setFields] = useState(object.fields);
  const [revision, setRevision] = useState(object.revision);
  const action = useAction();
  const dirty = JSON.stringify(fields) !== JSON.stringify(object.fields);
  useUnsaved(dirty);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void action.run(async () => {
      await api.saveObject(object.id, { fields, revision });
      await reload();
      toast("Alterações salvas no rascunho.");
      close();
    });
  };
  return (
    <form onSubmit={submit} className="assets-stack assets-stack--lg">
      <ObjectFields
        fields={fields}
        kind={object.kind}
        setFields={setFields}
        disabled={action.busy}
      />
      <Feedback error={action.error} />
      {action.error && (
        <button
          type="button"
          className="assets-text-link"
          onClick={() => void reload().catch(() => {})}
        >
          Consultar versão mais recente sem descartar meus campos
        </button>
      )}
      {object.revision !== revision && (
        <Notice
          error
          title="O cadastro foi alterado enquanto você editava"
          action={
            <button
              type="button"
              className="assets-text-link"
              onClick={() => {
                setFields(object.fields);
                setRevision(object.revision);
              }}
            >
              Descartar meus campos e carregar versão atual
            </button>
          }
        >
          Seus campos continuam neste formulário.
        </Notice>
      )}
      <div className="assets-savebar">
        <span className="assets-savebar__state" data-dirty={dirty || undefined}>
          <span aria-hidden="true" />
          {dirty ? "Alterações ainda não salvas." : "Rascunho salvo no servidor."}
        </span>
        <div className="assets-actions">
          <Button variant="ghost" onClick={close}>
            Cancelar edição
          </Button>
          <Button
            type="submit"
            loading={action.busy}
            disabled={revision !== object.revision}
          >
            Salvar alterações
          </Button>
        </div>
      </div>
    </form>
  );
}

const fieldLabels: Record<string, string> = {
  name: "Identificação",
  category: "Tipo",
  sector: "Setor",
  material: "Material",
  quantity: "Quantidade",
  unit: "Unidade",
  location: "Localização",
  responsible: "Responsável",
  periodStart: "Início",
  periodEnd: "Fim",
  originId: "Ativo de origem",
  description: "Descrição",
  registration: "Referência",
  area: "Área",
};
const fieldKeys = Object.keys(fieldLabels) as (keyof Fields)[];
function displayValue(key: keyof Fields, value: string, objects: DossierObject[]) {
  if (!value) return "";
  if (key === "category") return categoryLabels[value as Fields["category"]] ?? value;
  if (key === "sector") return sectorLabels[value as Fields["sector"]] ?? value;
  if (key === "periodStart" || key === "periodEnd") return dateLabel(value);
  if (key === "quantity") return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 4 });
  if (key === "area") return `${Number(value).toLocaleString("pt-BR")} ha`;
  if (key === "originId") return objects.find((o) => o.id === value)?.fields.name ?? "Cadastro indisponível";
  return value;
}

type TabId = "resumo" | "documentos" | "verificacoes" | "versoes" | "historico" | "acessos";
const tabLabels: Record<TabId, string> = {
  resumo: "Resumo",
  documentos: "Documentos",
  verificacoes: "Verificações",
  versoes: "Versões",
  historico: "Histórico",
  acessos: "Acessos",
};

export function AssetsObjectDetail({ kind }: { kind: "asset" | "lot" }) {
  const { ativoId, loteId } = useParams();
  const { data, reload } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const action = useAction();
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const object = data.objects.find(
    (o) => o.id === (ativoId ?? loteId) && o.kind === kind,
  );
  const listPath = `/assets/${kind === "lot" ? "lotes" : "ativos"}`;
  if (!object)
    return (
      <Empty
        icon="lock"
        title="Cadastro não encontrado"
        description="O endereço pode ter mudado ou seu acesso pode ter sido encerrado."
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to={listPath}>
            Voltar aos cadastros
          </Link>
        }
      />
    );
  const role = data.membership.role;
  const writable = canEdit(role) && object.status !== "archived";
  const versions = data.versions
    .filter((v) => v.objectId === object.id)
    .sort((a, b) => b.number - a.number);
  const version = versions.find((v) => v.id === params.get("versao"));
  const related = data.requests.filter((r) => r.objectId === object.id);
  const fields = version?.fields ?? object.fields;
  const missing = missingFields(object);
  const origin = data.objects.find((o) => o.id === fields.originId);
  const shares = data.shares.filter((s) => s.objectId === object.id);
  const activity = data.activity
    .filter((e) => e.objectId === object.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const tabs = (Object.keys(tabLabels) as TabId[]).filter(
    (t) => t !== "acessos" || role !== "contributor",
  );
  const requested = params.get("aba") as TabId | null;
  const tab: TabId = requested && tabs.includes(requested) ? requested : "resumo";
  const setTab = (value: TabId) => {
    const next = new URLSearchParams(params);
    next.set("aba", value);
    setParams(next, { replace: true });
    setEditing(false);
  };
  const setVersion = (id: string) => {
    const next = new URLSearchParams(params);
    if (id) next.set("versao", id);
    else next.delete("versao");
    setParams(next);
    setEditing(false);
  };
  const setStatus = (status: DossierObject["status"], message = "") =>
    void action.run(async () => {
      await api.status(object.id, object.revision, status);
      await reload();
      setArchiving(false);
      if (message) toast(message);
    }, message);
  const exportVersion = (v: Snapshot) =>
    void action.run(async () => {
      const result = await request(
        `/objects/${object.id}/versions/${v.id}/export`,
      );
      downloadJson(result, `lastre-versao-${v.number}.json`);
    });
  const managing = !version && role !== "contributor" && canEdit(role);
  const requiredCount = kind === "lot" ? 6 : 3;
  const done = Math.max(0, requiredCount - missing.length);

  return (
    <>
      <header className="assets-detail-head">
        <Link className="assets-back" to={listPath}>
          <Icon name="chevron-left" size={16} /> Voltar
        </Link>
        <div className="assets-detail-head__row">
          <Glyph
            icon={kind === "lot" ? "lots" : "globe"}
            tone={object.status === "ready" ? "success" : object.status === "archived" ? "neutral" : "info"}
            size="lg"
          />
          <div className="assets-detail-head__copy">
            <p className="assets-eyebrow">
              {kind === "lot" ? "Lote de produção" : categoryLabels[fields.category]}{" "}
              · {sectorLabels[fields.sector]}
            </p>
            <h1>{fields.name || "Cadastro sem identificação"}</h1>
            <div className="assets-detail-head__meta">
              <Badge
                tone={
                  version
                    ? "info"
                    : object.status === "ready"
                      ? "good"
                      : object.status === "archived"
                        ? "neutral"
                        : "info"
                }
              >
                {version ? `Versão enviada ${version.number}` : statusLabels[object.status]}
              </Badge>
              <span className="assets-mono">
                {version ? `v${version.number}` : `rev. ${object.revision}`}
              </span>
              <span>
                <Icon name="file" size={14} />{" "}
                {(version?.evidence.length ?? object.evidenceIds.length)} documento(s)
              </span>
              <span>
                <Icon name="clock" size={14} />{" "}
                {version
                  ? `Enviada por ${version.author} · ${dateLabel(version.createdAt, true)}`
                  : `${data.organization.name} · atualizado ${relativeTime(object.updatedAt)}`}
              </span>
            </div>
          </div>
          <div className="assets-actions assets-detail-head__actions">
            {version && (
              <Button
                variant="secondary"
                disabled={action.busy}
                startIcon={<Icon name="download" size={16} />}
                onClick={() => exportVersion(version)}
              >
                Exportar resumo desta versão
              </Button>
            )}
            {!version && writable && tab === "resumo" && !editing && (
              <Button
                variant="secondary"
                startIcon={<Icon name="capture" size={16} />}
                onClick={() => setEditing(true)}
              >
                Editar cadastro
              </Button>
            )}
            {!version && object.status !== "archived" && canSend(role) && (
              <Link
                className={buttonClassName({})}
                to={`${objectPath(object)}/compartilhar`}
              >
                <Icon name="share" size={16} /> Revisar compartilhamento
              </Link>
            )}
            {managing && (
              <DropdownMenu
                label="Mais ações"
                triggerClassName="assets-icon-button assets-detail-more"
                items={[
                  ...(object.status === "draft"
                    ? [
                        {
                          id: "ready",
                          label: "Marcar pronto para revisão",
                          icon: "check" as const,
                          description: missing.length ? `Falta: ${missing.join(", ")}` : "Nenhum dado é compartilhado.",
                          disabled: missing.length > 0,
                          onSelect: () =>
                            setStatus(
                              "ready",
                              "Cadastro pronto para revisão. Nenhum dado foi compartilhado.",
                            ),
                        },
                      ]
                    : []),
                  {
                    id: "export",
                    label: "Exportar dados em CSV",
                    icon: "download",
                    onSelect: () =>
                      downloadCsv(
                        [
                          ["Campo", "Valor"],
                          ...fieldKeys
                            .map((k) => [fieldLabels[k], displayValue(k, object.fields[k] ?? "", data.objects)])
                            .filter(([, v]) => v),
                        ],
                        `lastre-${(object.fields.name || object.id).replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.csv`,
                      ),
                  },
                  { type: "separator", id: "sep" },
                  object.status === "archived"
                    ? {
                        id: "restore",
                        label: "Restaurar cadastro",
                        icon: "refresh",
                        onSelect: () => setStatus("draft", "Cadastro restaurado."),
                      }
                    : {
                        id: "archive",
                        label: "Arquivar cadastro",
                        icon: "archive",
                        danger: true,
                        onSelect: () => setArchiving(true),
                      },
                ]}
              />
            )}
          </div>
        </div>
      </header>

      <div className="assets-versionbar">
        <Select
          variant="toolbar"
          className="assets-versionbar__select"
          aria-label="Versão do dossiê"
          prefix={
            <>
              <Icon name="history" size={15} /> Consultar
            </>
          }
          value={version?.id ?? ""}
          onChange={setVersion}
          options={[
            {
              value: "",
              label: "Rascunho atual",
              description: `rev. ${object.revision} · atualizado ${relativeTime(object.updatedAt)}`,
              icon: "capture",
            },
            ...versions.map((v) => ({
              value: v.id,
              label: `Versão ${v.number}`,
              description: `${v.author} · ${dateLabel(v.createdAt, true)} · ${v.evidence.length} doc.`,
              icon: "lock" as const,
              group: "Versões enviadas",
            })),
          ]}
        />
        {version ? (
          <p className="assets-versionbar__note" data-tone="info">
            <Icon name="lock" size={14} /> Versão preservada. Alterações no
            rascunho não modificam estes dados e documentos.{" "}
            <button type="button" className="assets-text-link" onClick={() => setVersion("")}>
              Voltar ao rascunho
            </button>
          </p>
        ) : missing.length > 0 ? (
          <p className="assets-versionbar__note" data-tone="warning">
            <Icon name="escalations" size={14} /> Para compartilhar, complete:{" "}
            {missing.join(", ")}. O rascunho já está salvo.
          </p>
        ) : (
          <p className="assets-versionbar__note" data-tone="success">
            <Icon name="check" size={14} /> Dados obrigatórios preenchidos.
          </p>
        )}
      </div>

      <Feedback error={action.error} success={action.success} />

      <div className="assets-detail">
        <div className="assets-detail__main">
          <Tabs
            variant="underline"
            ariaLabel="Seções do dossiê"
            tabs={tabs.map((id) => ({
              id,
              label: tabLabels[id],
              count:
                id === "documentos"
                  ? version?.evidence.length ?? object.evidenceIds.length
                  : id === "versoes"
                    ? versions.length
                    : id === "historico"
                      ? activity.length
                      : id === "acessos"
                        ? shares.length
                        : undefined,
            }))}
            active={tab}
            onChange={setTab}
          >
            {tab === "resumo" &&
              (editing ? (
                <Panel
                  title={`Editar ${kind === "lot" ? "lote" : "ativo"}`}
                  description="As alterações ficam no rascunho até você salvá-las."
                  elevation={2}
                >
                  <EditObject object={object} close={() => setEditing(false)} />
                </Panel>
              ) : (
                <div className="assets-stack assets-stack--lg">
                  <Panel
                    title={`Informações do ${kind === "lot" ? "lote" : "ativo"}`}
                    description="Dossiê: informações e documentos deste cadastro."
                  >
                    <ObjectSummary fields={fields} kind={kind} />
                  </Panel>
                  {related.length > 0 && (
                    <Panel title="Solicitações relacionadas" flush>
                      <ul className="assets-linklist">
                        {related.map((r) => (
                          <li key={r.id}>
                            <Link to={`/assets/solicitacoes/${r.id}`}>
                              <Glyph icon="inbox" size="sm" tone={r.status === "open" ? "warning" : "info"} />
                              <div>
                                <strong>{r.title}</strong>
                                <p>{r.requesterName}</p>
                              </div>
                              <Badge tone={r.status === "open" ? "warning" : "info"}>
                                {r.status === "open" ? "Aguardando resposta" : "Resposta enviada"}
                              </Badge>
                              <Icon name="chevron-right" size={16} />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Panel>
                  )}
                  {managing && (
                    <div className="assets-nextstep">
                      <Glyph
                        icon={object.status === "archived" ? "archive" : "arrow-right"}
                        tone={object.status === "archived" ? "neutral" : "info"}
                        size="sm"
                      />
                      <div>
                        <p className="assets-nextstep__title">Próximo passo</p>
                        <p className="assets-caption">
                          {object.status === "archived"
                            ? "Restaure o cadastro para voltar a trabalhar nele."
                            : object.status === "draft"
                              ? "Organize os documentos e prepare a revisão."
                              : "Revise o compartilhamento quando uma organização pedir este dossiê."}
                        </p>
                      </div>
                      <div className="assets-actions">
                        {object.status === "draft" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={action.busy || missing.length > 0}
                            onClick={() =>
                              setStatus(
                                "ready",
                                "Cadastro pronto para revisão. Nenhum dado foi compartilhado.",
                              )
                            }
                          >
                            Marcar pronto para revisão
                          </Button>
                        )}
                        {object.status === "archived" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={action.busy}
                            onClick={() => setStatus("draft", "Cadastro restaurado.")}
                          >
                            Restaurar cadastro
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            {tab === "documentos" &&
              (version ? (
                <div className="assets-stack">
                  <div className="assets-section-head">
                    <div>
                      <h2>Documentos da versão {version.number}</h2>
                      <p className="assets-panel__desc">Arquivos preservados nesta versão enviada.</p>
                    </div>
                  </div>
                  <EvidenceList documents={version.evidence} readOnly />
                </div>
              ) : (
                <Documents
                  key={`${object.id}-${params.get("requisito") ?? ""}`}
                  object={object}
                  requirementId={params.get("requisito") ?? ""}
                />
              ))}
            {tab === "verificacoes" && (
              <VerificationList version={version ?? versions[0]} />
            )}
            {tab === "versoes" && (
              <Versions
                versions={versions}
                onOpen={(id) => setParams({ aba: "resumo", versao: id })}
                onExport={exportVersion}
                busy={action.busy}
              />
            )}
            {tab === "historico" && (
              <div className="assets-stack">
                <div className="assets-section-head">
                  <div>
                    <h2>Histórico do dossiê</h2>
                    <p className="assets-panel__desc">
                      Cada mudança preserva quem agiu e sobre qual versão.
                    </p>
                  </div>
                </div>
                {activity.length ? (
                  <Panel>
                    <Timeline
                      items={activity.map((e) => ({
                        id: e.id,
                        title: e.message,
                        meta: `${e.actor} · ${dateLabel(e.createdAt, true)}`,
                        tone: e.versionId ? "success" : "neutral",
                        icon: e.versionId ? "share" : undefined,
                      }))}
                    />
                  </Panel>
                ) : (
                  <Empty compact icon="history" title="Sem registros" description="As ações sobre este cadastro aparecerão aqui." />
                )}
              </div>
            )}
            {tab === "acessos" && (
              <div className="assets-stack">
                <div className="assets-section-head">
                  <div>
                    <h2>Compartilhamentos</h2>
                    <p className="assets-panel__desc">
                      Cada acesso se refere a uma versão específica.
                    </p>
                  </div>
                </div>
                {shares.length ? (
                  <SharesTable shares={shares} versions={versions} />
                ) : (
                  <Empty
                    compact
                    title="Este dossiê ainda é da sua organização"
                    description="Revise os documentos, escolha o destinatário e confirme uma versão para compartilhar."
                    icon="lock"
                  />
                )}
              </div>
            )}
          </Tabs>
        </div>

        <aside className="assets-detail__rail" aria-label="Resumo do cadastro">
          <Panel eyebrow="Propriedades" className="assets-rail-panel">
            <Properties
              items={[
                {
                  label: "Situação",
                  icon: "process",
                  value: (
                    <Badge tone={object.status === "ready" ? "good" : object.status === "archived" ? "neutral" : "info"} pill={false}>
                      {statusLabels[object.status]}
                    </Badge>
                  ),
                },
                { label: "Responsável", icon: "user", value: fields.responsible || "A informar" },
                { label: "Local", icon: "pin", value: fields.location || "A informar" },
                { label: "Versões", icon: "history", value: versions.length ? `${versions.length} enviada(s)` : "Nenhuma enviada" },
                { label: "Criado", icon: "calendar", value: dateLabel(object.createdAt) },
                { label: "Identificador", icon: "link", value: object.id.slice(-8), mono: true },
              ]}
            />
          </Panel>
          {!version && object.status !== "archived" && (
            <Panel eyebrow="Prontidão" className="assets-rail-panel">
              <Progress
                value={done}
                max={requiredCount}
                label="Dados obrigatórios"
                tone={missing.length ? "warning" : "success"}
              />
              {missing.length > 0 && (
                <ul className="assets-missing">
                  {missing.map((m) => (
                    <li key={m}>
                      <span aria-hidden="true" /> {m}
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
          {origin && (
            <Link className="assets-origin" to={objectPath(origin)}>
              <Glyph icon="chain" size="sm" />
              <span>
                <small>Ativo de origem</small>
                <strong>{origin.fields.name}</strong>
              </span>
              <Icon name="chevron-right" size={16} />
            </Link>
          )}
          {activity.length > 0 && (
            <Panel
              eyebrow="Atividade recente"
              className="assets-rail-panel"
              action={
                <button type="button" className="assets-text-link" onClick={() => setTab("historico")}>
                  Ver tudo
                </button>
              }
            >
              <Timeline
                items={activity.slice(0, 4).map((e) => ({
                  id: e.id,
                  title: e.message,
                  meta: `${e.actor} · ${relativeTime(e.createdAt)}`,
                  tone: e.versionId ? "success" : "neutral",
                }))}
              />
            </Panel>
          )}
        </aside>
      </div>

      <Dialog
        open={archiving}
        onClose={() => setArchiving(false)}
        tone="danger"
        icon="archive"
        size="sm"
        title="Arquivar este cadastro?"
        description="O cadastro sairá da lista ativa. Versões e acessos compartilhados permanecem; revogue os acessos separadamente, se necessário."
        actions={
          <>
            <Button variant="ghost" onClick={() => setArchiving(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={action.busy}
              onClick={() => setStatus("archived", "Cadastro arquivado.")}
            >
              Confirmar arquivamento
            </Button>
          </>
        }
      />
    </>
  );
}

function Versions({
  versions,
  onOpen,
  onExport,
  busy,
}: {
  versions: Snapshot[];
  onOpen: (id: string) => void;
  onExport: (v: Snapshot) => void;
  busy: boolean;
}) {
  const { data } = useWorkspace();
  const [afterId, setAfterId] = useState(versions[0]?.id ?? "");
  const [beforeId, setBeforeId] = useState(versions[1]?.id ?? "");
  if (!versions.length)
    return (
      <Empty
        compact
        icon="history"
        title="Nenhuma versão enviada"
        description="Uma versão é criada quando você confirma um compartilhamento. Ela preserva campos, documentos e respostas."
      />
    );
  const after = versions.find((v) => v.id === afterId) ?? versions[0];
  const before = versions.find((v) => v.id === beforeId && v.id !== after.id);
  const rows = fieldKeys
    .map((k) => ({
      key: k,
      before: displayValue(k, before?.fields[k] ?? "", data.objects),
      after: displayValue(k, after.fields[k] ?? "", data.objects),
    }))
    .filter((r) => r.before || r.after);
  const changed = before ? rows.filter((r) => r.before !== r.after).length : 0;
  const versionColumns: Column<Snapshot>[] = [
    {
      id: "number",
      header: "Versão",
      primary: true,
      sortValue: (v) => v.number,
      firstDir: "desc",
      cell: (v) => (
        <button type="button" className="assets-version-cell" onClick={() => onOpen(v.id)}>
          <span className="assets-versions__num assets-mono">v{v.number}</span>
          <span>
            <strong>Versão {v.number}</strong>
            <small>{v.request ? v.request.title : "Compartilhamento direto"}</small>
          </span>
        </button>
      ),
    },
    {
      id: "author",
      header: "Enviada por",
      sortValue: (v) => v.author,
      cell: (v) => (
        <span className="assets-person">
          <Avatar name={v.author} size="sm" />
          {v.author}
        </span>
      ),
    },
    {
      id: "date",
      header: "Data",
      firstDir: "desc",
      sortValue: (v) => v.createdAt,
      cell: (v) => <span className="assets-nowrap">{dateLabel(v.createdAt, true)}</span>,
    },
    {
      id: "docs",
      header: "Docs.",
      align: "end",
      sortValue: (v) => v.evidence.length,
      cell: (v) => (
        <span className="assets-count-cell" data-zero={v.evidence.length === 0 || undefined}>
          <Icon name="file" size={13} />
          {v.evidence.length}
        </span>
      ),
    },
  ];
  const added = before
    ? after.evidence.filter((e) => !before.evidence.some((p) => p.id === e.id))
    : [];
  const removed = before
    ? before.evidence.filter((e) => !after.evidence.some((p) => p.id === e.id))
    : [];
  return (
    <div className="assets-stack assets-stack--lg">
      <div className="assets-section-head">
        <div>
          <h2>Versões enviadas</h2>
          <p className="assets-panel__desc">
            Cada versão preserva campos, documentos e respostas no momento do envio.
          </p>
        </div>
      </div>
      <DataTable<Snapshot>
        id="assets-versions"
        label="Versões enviadas"
        rows={versions}
        getRowId={(v) => v.id}
        rowLabel={(v) => `versão ${v.number}`}
        defaultSort={{ id: "number", dir: "desc" }}
        settings={false}
        columns={versionColumns}
        rowActions={(v) => [
          { id: "open", label: "Consultar esta versão", icon: "eye", onSelect: () => onOpen(v.id) },
          ...(versions.length > 1 && v.number > 1
            ? [
                {
                  id: "compare",
                  label: "Comparar com a anterior",
                  icon: "compare" as const,
                  onSelect: () => {
                    setAfterId(v.id);
                    setBeforeId(versions.find((x) => x.number === v.number - 1)?.id ?? "");
                  },
                },
              ]
            : []),
          { type: "separator", id: "sep" },
          { id: "export", label: "Exportar resumo (JSON)", icon: "download", disabled: busy, onSelect: () => onExport(v) },
        ]}
        rowTone={(v) => (v.id === after.id ? "success" : undefined)}
      />
      {versions.length > 1 && (
        <Panel
          flush
          eyebrow="Comparar"
          title="O que mudou entre versões"
          description={
            before
              ? `${changed} campo(s) alterado(s), ${added.length} documento(s) adicionado(s) e ${removed.length} removido(s).`
              : "Escolha uma versão anterior para comparar."
          }
        >
          <div className="assets-compare__pickers">
            <Select
              variant="toolbar"
              prefix="Antes"
              aria-label="Versão anterior"
              placeholder="Selecione"
              value={before?.id ?? ""}
              onChange={setBeforeId}
              options={versions
                .filter((v) => v.id !== after.id)
                .map((v) => ({ value: v.id, label: `Versão ${v.number}`, description: dateLabel(v.createdAt, true) }))}
            />
            <Icon name="arrow-right" size={16} />
            <Select
              variant="toolbar"
              prefix="Depois"
              aria-label="Versão posterior"
              value={after.id}
              onChange={setAfterId}
              options={versions.map((v) => ({ value: v.id, label: `Versão ${v.number}`, description: dateLabel(v.createdAt, true) }))}
            />
          </div>
          {before && (
            <div className="assets-compare" role="table" aria-label={`Comparação entre versão ${before.number} e versão ${after.number}`}>
              <div className="assets-compare__row assets-compare__row--head" role="row">
                <span role="columnheader">Campo</span>
                <span role="columnheader">Versão {before.number}</span>
                <span role="columnheader">Versão {after.number}</span>
              </div>
              {rows.map((r) => {
                const diff = r.before !== r.after;
                return (
                  <div key={r.key} className="assets-compare__row" role="row" data-changed={diff || undefined}>
                    <span role="cell" className="assets-compare__field">
                      {fieldLabels[r.key]}
                      {diff && <span className="assets-sr-only"> (alterado)</span>}
                    </span>
                    <span role="cell" className="assets-compare__before">{r.before || "Não informado"}</span>
                    <span role="cell" className="assets-compare__after">{r.after || "Não informado"}</span>
                  </div>
                );
              })}
              {[...added.map((e) => ({ e, kind: "+" })), ...removed.map((e) => ({ e, kind: "−" }))].map(({ e, kind }) => (
                <div key={e.id + kind} className="assets-compare__row" role="row" data-doc={kind === "+" ? "added" : "removed"}>
                  <span role="cell" className="assets-compare__field">Documento</span>
                  <span role="cell" className="assets-compare__before">{kind === "−" ? e.name : "—"}</span>
                  <span role="cell" className="assets-compare__after">{kind === "+" ? e.name : "—"}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}

function SharesTable({ shares, versions }: { shares: Share[]; versions: Snapshot[] }) {
  const { data, reload } = useWorkspace();
  const action = useAction();
  const [confirm, setConfirm] = useState<Share | null>(null);
  const stateOf = (share: Share) => {
    const expired = new Date(share.expiresAt).getTime() < Date.now();
    return share.revokedAt
      ? { label: "Revogado", tone: "danger" as const, active: false }
      : expired
        ? { label: "Expirado", tone: "neutral" as const, active: false }
        : { label: "Acesso ativo", tone: "good" as const, active: true };
  };
  const numberOf = (share: Share) => versions.find((v) => v.id === share.versionId)?.number ?? 0;
  const columns: Column<Share>[] = [
    {
      id: "recipient",
      header: "Destinatário",
      primary: true,
      sortValue: (sh) => sh.recipientName,
      cell: (sh) => (
        <span className="assets-object-name">
          <Avatar name={sh.recipientName} square />
          <span>
            <strong>{sh.recipientName}</strong>
            <small title={sh.purpose}>{sh.purpose}</small>
          </span>
        </span>
      ),
    },
    {
      id: "version",
      header: "Versão",
      sortValue: numberOf,
      firstDir: "desc",
      cell: (sh) => <span className="assets-mono assets-cell-strong">v{numberOf(sh)}</span>,
    },
    {
      id: "expires",
      header: "Validade",
      sortValue: (sh) => sh.expiresAt,
      cell: (sh) => <span className="assets-nowrap">Até {dateLabel(sh.expiresAt)}</span>,
    },
    {
      id: "download",
      header: "Download",
      hideBelow: "md",
      sortValue: (sh) => (sh.allowDownload ? 0 : 1),
      cell: (sh) => (
        <span className="assets-inline-ref">
          <Icon name={sh.allowDownload ? "download" : "eye"} size={14} />
          {sh.allowDownload ? "Permitido" : "Só consulta"}
        </span>
      ),
    },
    {
      id: "state",
      header: "Situação",
      sortValue: (sh) => stateOf(sh).label,
      cell: (sh) => {
        const st = stateOf(sh);
        return <Badge tone={st.tone}>{st.label}</Badge>;
      },
    },
  ];
  return (
    <>
      <Feedback error={action.error} />
      <DataTable<Share>
        id="assets-shares"
        label="Compartilhamentos deste dossiê"
        rows={shares}
        columns={columns}
        getRowId={(sh) => sh.id}
        rowLabel={(sh) => sh.recipientName}
        defaultSort={{ id: "expires", dir: "desc" }}
        rowTone={(sh) => (stateOf(sh).active ? undefined : "danger")}
        rowActions={(sh) =>
          stateOf(sh).active && canSend(data.membership.role)
            ? [
                {
                  id: "revoke",
                  label: "Revogar acesso",
                  icon: "lock",
                  danger: true,
                  description: "Impede novas consultas desta versão.",
                  onSelect: () => setConfirm(sh),
                },
              ]
            : []
        }
        summary={
          <>
            <strong>{shares.filter((sh) => stateOf(sh).active).length}</strong> ativo(s) de{" "}
            {shares.length}
          </>
        }
      />
      <Dialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        tone="danger"
        icon="lock"
        size="sm"
        title={`Revogar o acesso de ${confirm?.recipientName ?? ""}?`}
        description="Revogar impedirá novas consultas. Arquivos já baixados não podem ser apagados remotamente."
        actions={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Manter acesso
            </Button>
            <Button
              variant="danger"
              loading={action.busy}
              onClick={() =>
                confirm &&
                void action.run(async () => {
                  await api.revoke(confirm.id);
                  await reload();
                  setConfirm(null);
                  toast("Acesso revogado.");
                })
              }
            >
              Confirmar revogação
            </Button>
          </>
        }
      />
    </>
  );
}
