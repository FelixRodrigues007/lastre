import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { api, type InformationRequest } from "./api";
import { useWorkspace } from "./context";
import {
  canEdit,
  canSend,
  dateLabel,
  objectPath,
  requirementDone,
} from "./model";
import {
  Badge,
  Empty,
  Feedback,
  Field,
  Notice,
  PageHead,
  useAction,
} from "./ui";
export function AssetsRequests() {
  const { data } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = params.get("status") ?? "all";
  const filtered = data.requests.filter(
    (r) =>
      `${r.title} ${r.requesterName} ${r.purpose}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "all" || r.status === status),
  );
  return (
    <>
      <PageHead
        eyebrow="Trabalho entre organizações"
        title="Solicitações"
        description="Entenda o que pediram, reúna as informações e acompanhe sua resposta."
      />
      <div className="assets-toolbar">
        <label className="assets-search">
          <Icon name="search" />
          <input
            aria-label="Buscar solicitações"
            value={search}
            placeholder="Buscar por assunto ou organização…"
            onChange={(e) =>
              setParams({ q: e.target.value, status }, { replace: true })
            }
          />
        </label>
        <select
          aria-label="Situação das solicitações"
          value={status}
          onChange={(e) => setParams({ q: search, status: e.target.value })}
        >
          <option value="all">Todas as solicitações</option>
          <option value="open">Aguardando resposta</option>
          <option value="responded">Respostas enviadas</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="assets-request-list">
          {filtered.map((r) => {
            const done = r.requirements.filter((q) =>
              requirementDone(r, q.id, data),
            ).length;
            const object = data.objects.find((o) => o.id === r.objectId);
            return (
              <Link
                className="assets-request-card"
                key={r.id}
                to={`/assets/solicitacoes/${r.id}`}
              >
                <div className="assets-row">
                  <div className="assets-request-sender">
                    <span className="assets-avatar">
                      {r.requesterName.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <strong>{r.requesterName}</strong>
                      <p>{r.requesterEmail}</p>
                    </div>
                  </div>
                  <Badge tone={r.status === "open" ? "warning" : "info"}>
                    {r.status === "open" ? "Sua resposta" : "Resposta enviada"}
                  </Badge>
                </div>
                <h2>{r.title}</h2>
                <p>{r.purpose}</p>
                <div className="assets-request-card__footer">
                  <span>{object?.fields.name || "Cadastro a associar"}</span>
                  <span>
                    {done}/{r.requirements.length} requisitos preparados
                  </span>
                  <span>
                    {r.dueAt ? `Até ${dateLabel(r.dueAt)}` : "Sem prazo"}
                  </span>
                  <Icon name="chevron-right" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            data.requests.length
              ? "Nenhuma solicitação com esses filtros"
              : "Tudo em dia por aqui"
          }
          description={
            data.requests.length
              ? "Limpe os filtros para consultar os outros pedidos."
              : "Quando uma organização solicitar informações, o pedido aparecerá aqui com finalidade, prazo e requisitos."
          }
          action={
            data.requests.length ? (
              <button className="assets-button" onClick={() => setParams({})}>
                Limpar filtros
              </button>
            ) : (
              <Link className="assets-button" to="/assets/lotes">
                Organizar meus lotes
              </Link>
            )
          }
        />
      )}
    </>
  );
}
export function AssetsRequestDetail() {
  const { solicitacaoId } = useParams();
  const { data, reload } = useWorkspace();
  const action = useAction();
  const [selected, setSelected] = useState("");
  const r = data.requests.find((r) => r.id === solicitacaoId);
  if (!r)
    return (
      <Empty
        title="Solicitação não encontrada"
        description="Confira o endereço ou solicite acesso à organização responsável."
        action={
          <Link className="assets-button" to="/assets/solicitacoes">
            Voltar às solicitações
          </Link>
        }
      />
    );
  const object = data.objects.find((o) => o.id === r.objectId);
  const writable =
    canEdit(data.membership.role) && object?.status !== "archived";
  const done = r.requirements.filter((q) =>
    requirementDone(r, q.id, data),
  ).length;
  return (
    <>
      <PageHead
        eyebrow={`Solicitado por ${r.requesterName}`}
        title={r.title}
        description={r.purpose}
        back="/assets/solicitacoes"
        action={
          object &&
          canSend(data.membership.role) &&
          object.status !== "archived" && (
            <Link
              className="assets-button assets-button--primary"
              to={`${objectPath(object)}/compartilhar?solicitacao=${r.id}`}
            >
              {r.status === "responded"
                ? "Revisar nova versão"
                : "Revisar envio"}
              <Icon name="chevron-right" size={16} />
            </Link>
          )
        }
      />
      <div className="assets-context-bar">
        <Badge tone={r.status === "open" ? "warning" : "info"}>
          {r.status === "open"
            ? "Aguardando sua resposta"
            : "Resposta recebida pelo sistema"}
        </Badge>
        <span>Prazo: {dateLabel(r.dueAt)}</span>
        <span>Modelo {r.templateVersion}</span>
      </div>
      {r.status === "responded" && (
        <Notice>
          A versão foi registrada para {r.requesterName}. A organização
          destinatária é responsável pela análise. Uma resposta enviada não
          significa documentação aprovada.
        </Notice>
      )}
      <div className="assets-detail-grid">
        <div className="assets-stack">
          <section className="assets-panel">
            <div className="assets-section-head">
              <div>
                <h2>Cadastro associado</h2>
                <p>As informações enviadas serão sobre este objeto.</p>
              </div>
            </div>
            {object ? (
              <Link className="assets-origin-link" to={objectPath(object)}>
                <Icon name="lots" />
                <div>
                  <strong>{object.fields.name || "Sem identificação"}</strong>
                  <p>{object.fields.location || "Localização a informar"}</p>
                </div>
                <Icon name="chevron-right" />
              </Link>
            ) : writable ? (
              <div className="assets-stack">
                <Field label="Escolher um cadastro existente">
                  <select
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  >
                    <option value="">Selecione um ativo ou lote</option>
                    {data.objects
                      .filter((o) => o.status !== "archived")
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.fields.name || "Sem identificação"}
                        </option>
                      ))}
                  </select>
                </Field>
                <div className="assets-actions">
                  <button
                    className="assets-button assets-button--primary"
                    disabled={!selected || action.busy}
                    onClick={() =>
                      void action.run(async () => {
                        await api.updateRequest(r.id, {
                          revision: r.revision,
                          objectId: selected,
                        });
                        await reload();
                      })
                    }
                  >
                    Associar cadastro
                  </button>
                  <Link
                    className="assets-button"
                    to={`/assets/lotes/novo?solicitacao=${r.id}`}
                  >
                    Cadastrar novo lote
                  </Link>
                  <Link
                    className="assets-text-link"
                    to={`/assets/ativos/novo?solicitacao=${r.id}`}
                  >
                    Cadastrar ativo
                  </Link>
                </div>
              </div>
            ) : (
              <Notice>
                O responsável pelo cadastro precisa associar um ativo ou lote.
              </Notice>
            )}
            <Feedback error={action.error} />
          </section>
          <section className="assets-panel">
            <div className="assets-section-head">
              <div>
                <h2>O que você precisa apresentar</h2>
                <p>
                  {done} de {r.requirements.length} requisitos preparados.
                </p>
              </div>
              <Badge>
                {done}/{r.requirements.length}
              </Badge>
            </div>
            <div className="assets-requirements">
              {r.requirements.map((q, i) => {
                const complete = requirementDone(r, q.id, data);
                const evidence = data.evidence.filter(
                  (e) =>
                    object?.evidenceIds.includes(e.id) &&
                    e.requirementId === q.id,
                );
                return (
                  <article key={q.id} className="assets-requirement">
                    <span
                      className={`assets-requirement__number${complete ? " is-complete" : ""}`}
                    >
                      {complete ? <Icon name="check" size={18} /> : i + 1}
                    </span>
                    <div>
                      <div className="assets-row">
                        <h3>{q.label}</h3>
                        <Badge
                          tone={
                            complete
                              ? "good"
                              : q.required
                                ? "warning"
                                : "neutral"
                          }
                        >
                          {complete
                            ? "Preparado"
                            : q.required
                              ? "Necessário"
                              : "Opcional"}
                        </Badge>
                      </div>
                      <p>{q.description}</p>
                      {evidence.map((e) => (
                        <p className="assets-requirement-file" key={e.id}>
                          <Icon name="audit" size={15} />
                          {e.name}
                        </p>
                      ))}
                      {object && writable && (
                        <Link
                          className="assets-text-link"
                          to={`${objectPath(object)}?aba=documentos&requisito=${q.id}`}
                        >
                          {evidence.length
                            ? "Consultar ou substituir documento"
                            : "Anexar documento"}{" "}
                          <Icon name="chevron-right" size={15} />
                        </Link>
                      )}
                      {q.allowJustification && object && (
                        <Justification
                          request={r}
                          requirementId={q.id}
                          writable={writable}
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
          {r.clarifications.length > 0 && (
            <section className="assets-panel">
              <div className="assets-section-head">
                <h2>Pendências e esclarecimentos</h2>
              </div>
              {r.clarifications.map((c) => (
                <Clarification
                  key={c.id}
                  request={r}
                  clarificationId={c.id}
                  writable={writable}
                />
              ))}
            </section>
          )}
        </div>
        <aside className="assets-panel assets-request-context">
          <p className="assets-eyebrow">Antes de enviar</p>
          <h2>Saiba quem recebe.</h2>
          <dl className="assets-facts">
            <div>
              <dt>Organização</dt>
              <dd>{r.requesterName}</dd>
            </div>
            <div>
              <dt>Contato</dt>
              <dd>{r.requesterEmail}</dd>
            </div>
            <div>
              <dt>Finalidade</dt>
              <dd>{r.purpose}</dd>
            </div>
            <div>
              <dt>Prazo solicitado</dt>
              <dd>{dateLabel(r.dueAt)}</dd>
            </div>
            <div>
              <dt>Próximo responsável</dt>
              <dd>
                {r.status === "open" ? data.organization.name : r.requesterName}
              </dd>
            </div>
          </dl>
          <p>
            Salvar uma resposta prepara o rascunho. Somente a confirmação na
            revisão compartilha uma versão.
          </p>
          {!canSend(data.membership.role) && (
            <Notice>
              Seu papel pode preparar documentos. O responsável pelo envio deve
              revisar e compartilhar.
            </Notice>
          )}
        </aside>
      </div>
    </>
  );
}
function Justification({
  request: r,
  requirementId,
  writable,
}: {
  request: InformationRequest;
  requirementId: string;
  writable: boolean;
}) {
  const { reload } = useWorkspace();
  const [value, setValue] = useState(r.justifications[requirementId] ?? "");
  const [revision, setRevision] = useState(r.revision);
  const action = useAction();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void action.run(async () => {
      const updated = await api.updateRequest(r.id, {
        revision,
        justifications: { [requirementId]: value },
      });
      setRevision(updated.revision);
      await reload();
    }, "Justificativa salva para revisão.");
  };
  return (
    <details className="assets-justification">
      <summary>
        {r.justifications[requirementId]
          ? "Justificativa registrada"
          : "Este documento não se aplica?"}
      </summary>
      {writable ? (
        <form onSubmit={submit} className="assets-stack">
          <Field label="Explique por que o documento não se aplica">
            <textarea
              rows={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={4000}
            />
          </Field>
          <Feedback error={action.error} success={action.success} />
          {r.revision !== revision && (
            <button
              type="button"
              className="assets-text-link"
              onClick={() => {
                setValue(r.justifications[requirementId] ?? "");
                setRevision(r.revision);
              }}
            >
              Carregar resposta mais recente
            </button>
          )}
          <button
            className="assets-button"
            disabled={action.busy || r.revision !== revision}
          >
            Salvar justificativa
          </button>
        </form>
      ) : (
        <p>{value || "Nenhuma justificativa registrada."}</p>
      )}
    </details>
  );
}
function Clarification({
  request: r,
  clarificationId,
  writable,
}: {
  request: InformationRequest;
  clarificationId: string;
  writable: boolean;
}) {
  const { reload } = useWorkspace();
  const c = r.clarifications.find((c) => c.id === clarificationId)!;
  const [response, setResponse] = useState(c.response);
  const action = useAction();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void action.run(async () => {
      await api.updateRequest(r.id, {
        revision: r.revision,
        clarificationId: c.id,
        response,
      });
      await reload();
    }, "Resposta salva. Revise e envie uma nova versão para apresentá-la.");
  };
  return (
    <div className="assets-clarification">
      <div className="assets-row">
        <h3>
          {r.requirements.find((q) => q.id === c.requirementId)?.label ??
            "Esclarecimento"}
        </h3>
        <Badge>
          {c.status === "open"
            ? "A responder"
            : c.status === "responded"
              ? "Resposta enviada · aguarda análise"
              : "Resolvida pelo solicitante"}
        </Badge>
      </div>
      <p>{c.question}</p>
      <small>
        {c.author} · {dateLabel(c.createdAt)}
      </small>
      {writable && c.status !== "resolved" ? (
        <form onSubmit={submit} className="assets-stack">
          <Field label="Sua resposta">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              required
              maxLength={4000}
              rows={3}
            />
          </Field>
          <Feedback error={action.error} success={action.success} />
          <button className="assets-button" disabled={action.busy}>
            Salvar resposta para revisão
          </button>
        </form>
      ) : (
        <p>{c.response || "Ainda sem resposta."}</p>
      )}
    </div>
  );
}
