import { useRef, useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import {
  api,
  request,
  type DossierObject,
  type InformationRequest,
  type Share,
  type Snapshot,
  type Workspace,
} from "./api";
import { useWorkspace } from "./context";
import {
  canSend,
  dateLabel,
  missingFields,
  objectPath,
  requirementDone,
} from "./model";
import { ObjectSummary } from "./ObjectDetail";
import {
  Badge,
  Empty,
  Feedback,
  Field,
  Notice,
  PageHead,
  useAction,
} from "./ui";
export function AssetsShare() {
  const { ativoId, loteId } = useParams();
  const { data } = useWorkspace();
  const [params] = useSearchParams();
  const object = data.objects.find((o) => o.id === (ativoId ?? loteId));
  const request = data.requests.find((r) => r.id === params.get("solicitacao"));
  if (!object)
    return (
      <Empty
        title="Cadastro não encontrado"
        description="Volte à lista e confira o cadastro disponível para você."
        action={
          <Link className="assets-button" to="/assets">
            Voltar ao início
          </Link>
        }
      />
    );
  if (!canSend(data.membership.role))
    return (
      <Notice error>
        Somente o responsável pelo envio ou administrador pode compartilhar. O
        cadastro permanece salvo.
      </Notice>
    );
  if (params.get("solicitacao") && !request)
    return (
      <Notice error>
        Solicitação indisponível. Volte ao dossiê e escolha uma solicitação
        válida.
      </Notice>
    );
  return (
    <ShareReview
      key={`${object.id}-${request?.id ?? ""}`}
      object={object}
      request={request}
      workspace={data}
    />
  );
}
function ShareReview({
  object,
  request: solicitation,
  workspace,
}: {
  object: DossierObject;
  request?: InformationRequest;
  workspace: Workspace;
}) {
  const { reload } = useWorkspace();
  const [review, setReview] = useState(() =>
    structuredClone({ object, solicitation, workspace }),
  );
  const [recipientEmail, setRecipient] = useState(
    solicitation?.requesterEmail ?? "",
  );
  const [recipients, setRecipients] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [recipientId, setRecipientId] = useState("");
  const [purpose, setPurpose] = useState(solicitation?.purpose ?? "");
  const [expires, setExpires] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  );
  const [allowDownload, setAllowDownload] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const action = useAction();
  const key = useRef({ fingerprint: "", value: crypto.randomUUID() });
  const [receipt, setReceipt] = useState<{
    share: Share;
    version: Snapshot;
  } | null>(null);
  const stale =
    review.object.revision !== object.revision ||
    review.solicitation?.revision !== solicitation?.revision;
  const files = review.workspace.evidence.filter((e) =>
    review.object.evidenceIds.includes(e.id),
  );
  const missing = missingFields(review.object);
  const absent =
    review.solicitation?.requirements.filter(
      (q) =>
        q.required &&
        !requirementDone(review.solicitation!, q.id, review.workspace),
    ) ?? [];
  const noResponse = review.solicitation?.clarifications.some(
    (c) => c.status === "open" && !c.response.trim(),
  );
  const blocked =
    stale ||
    missing.length > 0 ||
    absent.length > 0 ||
    noResponse ||
    object.status === "archived";
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (blocked || !confirmed) return;
    const payload = {
      revision: review.object.revision,
      recipientEmail,
      recipientId: recipientId || undefined,
      purpose,
      expiresAt: `${expires}T23:59:59-03:00`,
      allowDownload,
      requestId: review.solicitation?.id ?? "",
      requestRevision: review.solicitation?.revision,
    };
    const fingerprint = JSON.stringify(payload);
    if (key.current.fingerprint !== fingerprint)
      key.current = { fingerprint, value: crypto.randomUUID() };
    void action.run(async () => {
      const result = await api.share(object.id, {
        ...payload,
        key: key.current.value,
      });
      setReceipt(result);
      await reload();
    });
  };
  if (receipt)
    return (
      <>
        <PageHead
          eyebrow="Recebimento confirmado pelo servidor"
          title={
            workspace.organization.demo
              ? "Versão registrada na demonstração."
              : "Sua versão foi compartilhada."
          }
          back={objectPath(object)}
        />
        <div className="assets-panel assets-receipt">
          <span className="assets-receipt__check">
            <Icon name="check" size={30} />
          </span>
          <h2>
            Versão {receipt.version.number} · {receipt.version.fields.name}
          </h2>
          <p>
            {receipt.share.recipientName} tem acesso a esta versão até{" "}
            {dateLabel(receipt.share.expiresAt)}.
          </p>
          <dl className="assets-facts">
            <div>
              <dt>Quem enviou</dt>
              <dd>{receipt.version.author}</dd>
            </div>
            <div>
              <dt>Quando</dt>
              <dd>{dateLabel(receipt.share.createdAt, true)}</dd>
            </div>
            <div>
              <dt>Documentos incluídos</dt>
              <dd>{receipt.version.evidence.length}</dd>
            </div>
            <div>
              <dt>Finalidade</dt>
              <dd>{receipt.share.purpose}</dd>
            </div>
          </dl>
          <Notice>
            A análise é responsabilidade da organização destinatária. A
            conferência de integridade não comprova origem ou titularidade.
          </Notice>
          <small className="assets-receipt-id">
            Recibo: {receipt.share.receipt}
          </small>
          <div className="assets-actions">
            <Link
              className="assets-button assets-button--primary"
              to={`${objectPath(object)}?versao=${receipt.version.id}`}
            >
              Consultar versão enviada
            </Link>
            <Link
              className="assets-button"
              to={`${objectPath(object)}?aba=acessos`}
            >
              Gerir acesso
            </Link>
          </div>
        </div>
      </>
    );
  return (
    <>
      <PageHead
        eyebrow="Compartilhamento · revisão final"
        title="Confira antes de enviar."
        description="Você compartilha uma versão específica. Alterações futuras no rascunho não serão incluídas automaticamente."
        back={
          solicitation
            ? `/assets/solicitacoes/${solicitation.id}`
            : objectPath(object)
        }
      />
      {stale && (
        <Notice error>
          O cadastro mudou durante a revisão.{" "}
          <button
            className="assets-text-link"
            onClick={() => {
              setReview(structuredClone({ object, solicitation, workspace }));
              setConfirmed(false);
            }}
          >
            Atualizar conteúdo e revisar novamente
          </button>
        </Notice>
      )}
      {missing.length > 0 && (
        <Notice error>
          Complete no cadastro: {missing.join(", ")}.{" "}
          <Link className="assets-text-link" to={objectPath(object)}>
            Voltar ao cadastro
          </Link>
        </Notice>
      )}
      {absent.length > 0 && (
        <Notice error>
          Requisitos pendentes: {absent.map((q) => q.label).join(", ")}.{" "}
          <Link
            className="assets-text-link"
            to={`/assets/solicitacoes/${solicitation!.id}`}
          >
            Completar solicitação
          </Link>
        </Notice>
      )}
      {noResponse && (
        <Notice error>
          Responda aos esclarecimentos na solicitação antes de apresentar uma
          nova versão.
        </Notice>
      )}
      {object.status === "archived" && (
        <Notice error>Restaure o cadastro antes de compartilhar.</Notice>
      )}
      <form onSubmit={submit} className="assets-detail-grid">
        <section className="assets-panel">
          <div className="assets-section-head">
            <div>
              <h2>
                {review.object.fields.name || "Cadastro sem identificação"}
              </h2>
              <p>Conteúdo incluído no compartilhamento</p>
            </div>
            <Badge>Revisão {review.object.revision}</Badge>
          </div>
          <ObjectSummary fields={review.object.fields} kind={object.kind} />
          <div className="assets-related">
            <h3>{files.length} documento(s) incluído(s)</h3>
            {files.map((e) => (
              <div key={e.id} className="assets-review-file">
                <Icon name="audit" />
                <div>
                  <strong>{e.name}</strong>
                  <p>
                    {e.source} · {e.author}
                  </p>
                </div>
                <Icon name="check" size={16} />
              </div>
            ))}
            {files.length === 0 && (
              <p>
                Nenhum arquivo foi anexado. O envio conterá apenas os dados do
                cadastro.
              </p>
            )}
          </div>
          {review.solicitation &&
            Object.entries(review.solicitation.justifications)
              .filter(([, value]) => value)
              .map(([id, value]) => (
                <div key={id} className="assets-review-file">
                  <div>
                    <strong>
                      Justificativa ·{" "}
                      {
                        review.solicitation!.requirements.find(
                          (q) => q.id === id,
                        )?.label
                      }
                    </strong>
                    <p>{value}</p>
                  </div>
                </div>
              ))}
        </section>
        <aside className="assets-panel assets-stack">
          <div>
            <p className="assets-eyebrow">Destino e acesso</p>
            <h2>Quem poderá consultar?</h2>
          </div>
          <Field
            label="E-mail do destinatário"
            hint={
              solicitation
                ? solicitation.requesterName
                : "Uma conta ativa em outra organização Lastre."
            }
          >
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipient(e.target.value);
                setRecipients([]);
                setRecipientId("");
              }}
              readOnly={Boolean(solicitation)}
              required
              maxLength={254}
            />
          </Field>
          {!solicitation && (
            <>
              <button
                type="button"
                className="assets-button"
                disabled={action.busy || !recipientEmail}
                onClick={() =>
                  void action.run(async () => {
                    const result = await request<
                      { id: string; name: string }[]
                    >(
                      `/recipients?email=${encodeURIComponent(recipientEmail)}`,
                    );
                    setRecipients(result);
                    setRecipientId(result.length === 1 ? result[0].id : "");
                    if (!result.length)
                      throw new Error(
                        "Nenhuma organização destinatária disponível para este e-mail.",
                      );
                  })
                }
              >
                Conferir destinatário
              </button>
              {recipients.length > 0 && (
                <Field label="Organização destinatária">
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    required
                  >
                    <option value="">Selecione a organização</option>
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </>
          )}
          <Field label="Finalidade do compartilhamento">
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              readOnly={Boolean(solicitation)}
              required
              rows={4}
              maxLength={4000}
            />
          </Field>
          <Field
            label="Acesso até"
            hint="O acesso termina às 23h59, horário de Brasília."
          >
            <input
              type="date"
              value={expires}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setExpires(e.target.value)}
              required
            />
          </Field>
          <label className="assets-checkbox">
            <input
              type="checkbox"
              checked={allowDownload}
              onChange={(e) => setAllowDownload(e.target.checked)}
            />
            <span>
              Permitir download dos documentos
              <small>
                Arquivos já baixados não podem ser apagados remotamente.
              </small>
            </span>
          </label>
          <label className="assets-checkbox">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              required
            />
            <span>
              Conferi o destinatário, a finalidade e o conteúdo desta versão.
            </span>
          </label>
          <Feedback error={action.error} />
          {action.error && (
            <button
              type="button"
              className="assets-text-link"
              onClick={() => void reload().catch(() => {})}
            >
              Buscar alterações antes de tentar novamente
            </button>
          )}
          <button
            className="assets-button assets-button--primary"
            disabled={
              action.busy ||
              blocked ||
              !confirmed ||
              (!solicitation && !recipientId)
            }
          >
            {action.busy
              ? "Confirmando recebimento…"
              : solicitation
                ? `Enviar para ${solicitation.requesterName.replace(" · demonstração", "")}`
                : "Confirmar compartilhamento"}
          </button>
          <p className="assets-muted">
            A confirmação aparecerá após o servidor registrar a versão e o
            acesso.
          </p>
        </aside>
      </form>
    </>
  );
}
