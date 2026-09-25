import { downloadJson } from "./csv";
import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import {
  api,
  request,
  type DossierObject,
  type Fields,
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
  Badge,
  Empty,
  Feedback,
  Notice,
  PageHead,
  useAction,
  useUnsaved,
} from "./ui";
import { ObjectFields } from "./ObjectForm";
import { Documents, EvidenceList } from "./Documents";
export function ObjectSummary({
  fields,
  kind,
}: {
  fields: Fields;
  kind: "asset" | "lot";
}) {
  return (
    <dl className="assets-facts">
      <div>
        <dt>Tipo de cadastro</dt>
        <dd>{categoryLabels[fields.category]}</dd>
      </div>
      <div>
        <dt>Setor</dt>
        <dd>{sectorLabels[fields.sector]}</dd>
      </div>
      <div>
        <dt>Localização</dt>
        <dd>{fields.location || "A informar"}</dd>
      </div>
      <div>
        <dt>Responsável</dt>
        <dd>{fields.responsible || "A informar"}</dd>
      </div>
      {kind === "lot" && (
        <>
          <div>
            <dt>Material ou produção</dt>
            <dd>{fields.material || "A informar"}</dd>
          </div>
          <div>
            <dt>Quantidade declarada</dt>
            <dd>{quantityLabel({ fields })}</dd>
          </div>
          <div>
            <dt>Período da produção</dt>
            <dd>
              {dateLabel(fields.periodStart)} — {dateLabel(fields.periodEnd)}
            </dd>
          </div>
        </>
      )}
      {fields.area && (
        <div>
          <dt>Área declarada</dt>
          <dd>{Number(fields.area).toLocaleString("pt-BR")} ha</dd>
        </div>
      )}
      {fields.registration && (
        <div>
          <dt>Referência declarada</dt>
          <dd>{fields.registration}</dd>
        </div>
      )}
      {fields.description && (
        <div className="assets-facts__wide">
          <dt>Descrição</dt>
          <dd>{fields.description}</dd>
        </div>
      )}
    </dl>
  );
}
export function VerificationList({ version }: { version?: Snapshot }) {
  return (
    <div className="assets-stack">
      <div className="assets-section-head">
        <div>
          <h2>Verificações disponíveis</h2>
          <p>
            {version
              ? `Resultados sobre a versão ${version.number}, enviada em ${dateLabel(version.createdAt)}.`
              : "As conferências são vinculadas a uma versão enviada."}
          </p>
        </div>
      </div>
      {version ? (
        version.verifications.map((check) => (
          <article className="assets-check" key={check.id}>
            <div className="assets-row">
              <h3>{check.method}</h3>
              <Badge
                tone={
                  check.status === "unavailable"
                    ? "neutral"
                    : check.result === "consistent"
                      ? "good"
                      : "warning"
                }
              >
                {check.status === "unavailable"
                  ? "Indisponível"
                  : check.result === "consistent"
                    ? "Conferência concluída"
                    : "Divergência encontrada"}
              </Badge>
            </div>
            <p>{check.scope}</p>
            <p className="assets-muted">{check.limitation}</p>
            {check.status === "completed" && (
              <small>
                Executada em {dateLabel(check.checkedAt, true)} · Método{" "}
                {check.methodVersion} · Versão {version.number}
              </small>
            )}
          </article>
        ))
      ) : (
        <Notice>
          Nenhuma verificação executada. Cadastre os dados, reúna os documentos
          e revise uma versão para compartilhar. Cadastro completo não comprova
          origem ou titularidade.
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
      close();
    });
  };
  return (
    <form onSubmit={submit}>
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
        <Notice error>
          O cadastro foi alterado enquanto você editava. Seus campos continuam
          neste formulário.{" "}
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
        </Notice>
      )}
      <div className="assets-form-footer">
        <span>
          {dirty
            ? "Alterações ainda não salvas."
            : "Rascunho salvo no servidor."}
        </span>
        <div className="assets-actions">
          <button type="button" className="assets-button" onClick={close}>
            Cancelar edição
          </button>
          <button
            className="assets-button assets-button--primary"
            disabled={action.busy || revision !== object.revision}
          >
            Salvar alterações
          </button>
        </div>
      </div>
    </form>
  );
}
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
  const tabs = ["resumo", "documentos", "verificacoes", "historico", "acessos"];
  const tab = tabs.includes(params.get("aba") ?? "")
    ? params.get("aba")!
    : "resumo";
  if (!object)
    return (
      <Empty
        title="Cadastro não encontrado"
        description="O endereço pode ter mudado ou seu acesso pode ter sido encerrado."
        action={
          <Link
            className="assets-button"
            to={`/assets/${kind === "lot" ? "lotes" : "ativos"}`}
          >
            Voltar aos cadastros
          </Link>
        }
      />
    );
  const writable =
    canEdit(data.membership.role) && object.status !== "archived";
  const versions = data.versions
    .filter((v) => v.objectId === object.id)
    .sort((a, b) => b.number - a.number);
  const chosenVersion = params.get("versao");
  const version = versions.find((v) => v.id === chosenVersion);
  const related = data.requests.filter((r) => r.objectId === object.id);
  const fields = version?.fields ?? object.fields;
  const missing = missingFields(object);
  const origin = data.objects.find((o) => o.id === fields.originId);
  const shares = data.shares.filter((s) => s.objectId === object.id);
  const setTab = (value: string) => {
    const next = new URLSearchParams(params);
    next.set("aba", value);
    setParams(next, { replace: true });
    setEditing(false);
  };
  return (
    <>
      <PageHead
        eyebrow={`${kind === "lot" ? "Lote de produção" : categoryLabels[fields.category]} · ${sectorLabels[fields.sector]}`}
        title={fields.name || "Cadastro sem identificação"}
        description={`${data.organization.name} · Atualizado em ${dateLabel(object.updatedAt)}`}
        back={`/assets/${kind === "lot" ? "lotes" : "ativos"}`}
        action={
          !version &&
          object.status !== "archived" &&
          canSend(data.membership.role) && (
            <Link
              className="assets-button assets-button--primary"
              to={`${objectPath(object)}/compartilhar`}
            >
              Revisar compartilhamento <Icon name="chevron-right" size={16} />
            </Link>
          )
        }
      />
      {version && (
        <button
          className="assets-button"
          disabled={action.busy}
          onClick={() =>
            void action.run(async () => {
              const result = await request(
                `/objects/${object.id}/versions/${version.id}/export`,
              );
              downloadJson(result, `lastre-versao-${version.number}.json`);
            })
          }
        >
          <Icon name="download" size={16} /> Exportar resumo desta versão
        </button>
      )}
      <div className="assets-context-bar">
        <Badge tone={object.status === "ready" ? "good" : "neutral"}>
          {version
            ? `Versão enviada ${version.number}`
            : statusLabels[object.status]}
        </Badge>
        <span>
          {version
            ? `Enviada por ${version.author} · ${dateLabel(version.createdAt, true)}`
            : `Rascunho · revisão ${object.revision} · ${object.evidenceIds.length} documento(s)`}
        </span>
        <label>
          Consultar{" "}
          <select
            aria-label="Versão do dossiê"
            value={version?.id ?? ""}
            onChange={(e) => {
              const next = new URLSearchParams(params);
              if (e.target.value) next.set("versao", e.target.value);
              else next.delete("versao");
              setParams(next);
              setEditing(false);
            }}
          >
            <option value="">Rascunho atual</option>
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Versão {v.number} · {dateLabel(v.createdAt)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {version ? (
        <Notice>
          Você está consultando uma versão preservada. Alterações no rascunho
          não modificam estes dados e documentos.
        </Notice>
      ) : (
        missing.length > 0 && (
          <Notice>
            Para compartilhar, complete: {missing.join(", ")}. O rascunho já
            está salvo.
          </Notice>
        )
      )}
      <nav className="assets-tabs" aria-label="Seções do dossiê">
        {tabs
          .filter(
            (t) => t !== "acessos" || data.membership.role !== "contributor",
          )
          .map((t, i) => (
            <button
              key={t}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => setTab(t)}
            >
              {
                [
                  "Resumo",
                  "Documentos",
                  "Verificações",
                  "Histórico",
                  "Acessos",
                ][i]
              }
            </button>
          ))}
      </nav>
      <section className="assets-panel">
        <Feedback error={action.error} success={action.success} />
        {tab === "resumo" &&
          (editing ? (
            <EditObject object={object} close={() => setEditing(false)} />
          ) : (
            <>
              <div className="assets-section-head">
                <div>
                  <h2>Informações do {kind === "lot" ? "lote" : "ativo"}</h2>
                  <p>Dossiê: informações e documentos deste cadastro.</p>
                </div>
                {writable && !version && (
                  <button
                    className="assets-button"
                    onClick={() => setEditing(true)}
                  >
                    Editar cadastro
                  </button>
                )}
              </div>
              <ObjectSummary fields={fields} kind={kind} />
              {origin && (
                <Link className="assets-origin-link" to={objectPath(origin)}>
                  <Icon name="chain" /> Ativo de origem: {origin.fields.name}
                  <Icon name="chevron-right" />
                </Link>
              )}
              {related.length > 0 && (
                <div className="assets-related">
                  <h3>Solicitações relacionadas</h3>
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/assets/solicitacoes/${r.id}`}
                      className="assets-list-row"
                    >
                      <div>
                        <strong>{r.title}</strong>
                        <p>{r.requesterName}</p>
                      </div>
                      <Badge tone={r.status === "open" ? "warning" : "info"}>
                        {r.status === "open"
                          ? "Aguardando resposta"
                          : "Resposta enviada"}
                      </Badge>
                      <Icon name="chevron-right" />
                    </Link>
                  ))}
                </div>
              )}
              {!version &&
                data.membership.role !== "contributor" &&
                canEdit(data.membership.role) && (
                  <div className="assets-form-footer">
                    <div>
                      <p>Próximo passo</p>
                      <small>
                        {object.status === "archived"
                          ? "Restaure o cadastro para voltar a trabalhar nele."
                          : "Organize os documentos e prepare a revisão."}
                      </small>
                    </div>
                    <div className="assets-actions">
                      {object.status !== "archived" && (
                        <>
                          <button
                            className="assets-text-link"
                            onClick={() => setArchiving(!archiving)}
                          >
                            Arquivar cadastro
                          </button>
                          {object.status === "draft" && (
                            <button
                              className="assets-button"
                              disabled={action.busy || missing.length > 0}
                              onClick={() =>
                                void action.run(async () => {
                                  await api.status(
                                    object.id,
                                    object.revision,
                                    "ready",
                                  );
                                  await reload();
                                }, "Cadastro pronto para revisão. Nenhum dado foi compartilhado.")
                              }
                            >
                              Marcar pronto para revisão
                            </button>
                          )}
                        </>
                      )}
                      {object.status === "archived" && (
                        <button
                          className="assets-button"
                          disabled={action.busy}
                          onClick={() =>
                            void action.run(async () => {
                              await api.status(
                                object.id,
                                object.revision,
                                "draft",
                              );
                              await reload();
                            })
                          }
                        >
                          Restaurar cadastro
                        </button>
                      )}
                    </div>
                  </div>
                )}
              {archiving && (
                <div className="assets-inline-confirm">
                  <p>
                    O cadastro sairá da lista ativa. Versões e acessos
                    compartilhados permanecem; revogue os acessos separadamente,
                    se necessário.
                  </p>
                  <button
                    className="assets-button"
                    onClick={() => setArchiving(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="assets-button assets-button--danger"
                    disabled={action.busy}
                    onClick={() =>
                      void action.run(async () => {
                        await api.status(
                          object.id,
                          object.revision,
                          "archived",
                        );
                        await reload();
                        setArchiving(false);
                      })
                    }
                  >
                    Confirmar arquivamento
                  </button>
                </div>
              )}
            </>
          ))}
        {tab === "documentos" &&
          (version ? (
            <EvidenceList documents={version.evidence} readOnly />
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
        {tab === "historico" && (
          <>
            <div className="assets-section-head">
              <div>
                <h2>Histórico do dossiê</h2>
                <p>Cada mudança preserva quem agiu e sobre qual versão.</p>
              </div>
            </div>
            {versions.length > 0 && (
              <div className="assets-version-list">
                {versions.map((v, i) => {
                  const previous = versions[i + 1];
                  const changed = previous
                    ? Object.keys(v.fields).filter(
                        (k) =>
                          v.fields[k as keyof Fields] !==
                          previous.fields[k as keyof Fields],
                      ).length
                    : 0;
                  return (
                    <details key={v.id}>
                      <summary>
                        <strong>Versão {v.number}</strong>
                        <span>
                          {dateLabel(v.createdAt, true)} · {v.author}
                        </span>
                        <Badge>{v.evidence.length} documento(s)</Badge>
                      </summary>
                      <div>
                        <p>
                          {previous
                            ? `${changed} campo(s) alterado(s), ${v.evidence.filter((e) => !previous.evidence.some((p) => p.id === e.id)).length} documento(s) adicionado(s) e ${previous.evidence.filter((e) => !v.evidence.some((p) => p.id === e.id)).length} removido(s) em relação à versão ${previous.number}.`
                            : "Primeira versão enviada deste cadastro."}
                        </p>
                        {previous &&
                          Object.keys(v.fields)
                            .filter(
                              (k) =>
                                v.fields[k as keyof Fields] !==
                                previous.fields[k as keyof Fields],
                            )
                            .map((k) => (
                              <p key={k}>
                                <strong>{fieldLabels[k] ?? k}:</strong>{" "}
                                {previous.fields[k as keyof Fields] ||
                                  "Não informado"}{" "}
                                →{" "}
                                {v.fields[k as keyof Fields] || "Não informado"}
                              </p>
                            ))}
                        <button
                          className="assets-text-link"
                          onClick={() =>
                            setParams({ aba: "resumo", versao: v.id })
                          }
                        >
                          Consultar esta versão
                        </button>
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
            <ol className="assets-timeline">
              {data.activity
                .filter((e) => e.objectId === object.id)
                .map((e) => (
                  <li key={e.id}>
                    <span />
                    <div>
                      <strong>{e.message}</strong>
                      <p>
                        {e.actor} · {dateLabel(e.createdAt, true)}
                      </p>
                    </div>
                  </li>
                ))}
            </ol>
          </>
        )}
        {tab === "acessos" && (
          <>
            <div className="assets-section-head">
              <div>
                <h2>Compartilhamentos</h2>
                <p>Cada acesso se refere a uma versão específica.</p>
              </div>
            </div>
            {shares.length ? (
              shares.map((s) => (
                <ShareRow
                  key={s.id}
                  share={s}
                  number={
                    versions.find((v) => v.id === s.versionId)?.number ?? 0
                  }
                />
              ))
            ) : (
              <Empty
                title="Este dossiê ainda é da sua organização"
                description="Revise os documentos, escolha o destinatário e confirme uma versão para compartilhar."
                icon="lock"
              />
            )}
          </>
        )}
      </section>
    </>
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
function ShareRow({
  share,
  number,
}: {
  share: import("./api").Share;
  number: number;
}) {
  const { data, reload } = useWorkspace();
  const action = useAction();
  const [confirm, setConfirm] = useState(false);
  const expired = new Date(share.expiresAt).getTime() < Date.now();
  return (
    <article className="assets-share">
      <div className="assets-row">
        <div>
          <h3>{share.recipientName}</h3>
          <p>
            {share.recipientEmail} · Versão {number}
          </p>
        </div>
        <Badge tone={share.revokedAt || expired ? "neutral" : "good"}>
          {share.revokedAt ? "Revogado" : expired ? "Expirado" : "Acesso ativo"}
        </Badge>
      </div>
      <p>{share.purpose}</p>
      <small>
        Vigência até {dateLabel(share.expiresAt)} ·{" "}
        {share.allowDownload ? "Download permitido" : "Consulta sem download"}
      </small>
      <Feedback error={action.error} />
      {!share.revokedAt &&
        !expired &&
        canSend(data.membership.role) &&
        (confirm ? (
          <div className="assets-inline-confirm">
            <p>
              Revogar impedirá novas consultas. Arquivos já baixados não podem
              ser apagados remotamente.
            </p>
            <button className="assets-button" onClick={() => setConfirm(false)}>
              Manter acesso
            </button>
            <button
              className="assets-button assets-button--danger"
              disabled={action.busy}
              onClick={() =>
                void action.run(async () => {
                  await api.revoke(share.id);
                  await reload();
                  setConfirm(false);
                })
              }
            >
              Confirmar revogação
            </button>
          </div>
        ) : (
          <button className="assets-text-link" onClick={() => setConfirm(true)}>
            Revogar acesso
          </button>
        ))}
    </article>
  );
}
