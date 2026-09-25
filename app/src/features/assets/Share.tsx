import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Select } from "../../components/ui/Select";
import { Button, buttonClassName } from "../../components/ui/Button";
import { SealMark } from "../../components/ui/SealMark";
import {
  api,
  request,
  type DossierObject,
  type Evidence,
  type Fields,
  type InformationRequest,
  type Share,
  type Snapshot,
  type Workspace,
} from "./api";
import { useWorkspace } from "./context";
import {
  canSend,
  categoryLabels,
  dateLabel,
  missingFields,
  objectPath,
  quantityLabel,
  requirementDone,
  sectorLabels,
} from "./model";
import { toast } from "./overlay";
import {
  Avatar,
  Badge,
  Empty,
  Feedback,
  Field,
  Glyph,
  Notice,
  PageHead,
  Panel,
  Properties,
  Stepper,
  formatBytes,
  type Step,
  useAction,
} from "./ui";

/** Read-only field summary of a version or draft. Shared with the received view. */
export function FieldsSummary({
  fields,
  kind,
}: {
  fields: Fields;
  kind: "asset" | "lot";
}) {
  const items: { label: string; value: ReactNode; icon?: Parameters<typeof Properties>[0]["items"][number]["icon"] }[] = [
    { label: "Tipo de cadastro", value: categoryLabels[fields.category], icon: kind === "lot" ? "lots" : "globe" },
    { label: "Setor", value: sectorLabels[fields.sector], icon: "grid" },
    { label: "Localização", value: fields.location || "A informar", icon: "pin" },
    { label: "Responsável", value: fields.responsible || "A informar", icon: "user" },
  ];
  if (kind === "lot")
    items.push(
      { label: "Material ou produção", value: fields.material || "A informar", icon: "lots" },
      { label: "Quantidade declarada", value: quantityLabel({ fields }), icon: "compare" },
      {
        label: "Período da produção",
        value: `${dateLabel(fields.periodStart)} — ${dateLabel(fields.periodEnd)}`,
        icon: "calendar",
      },
    );
  if (fields.area)
    items.push({
      label: "Área declarada",
      value: `${Number(fields.area).toLocaleString("pt-BR")} ha`,
      icon: "globe",
    });
  if (fields.registration)
    items.push({ label: "Referência declarada", value: fields.registration, icon: "link" });
  return (
    <div className="assets-fields-summary">
      <Properties items={items} columns={2} />
      {fields.description && (
        <div className="assets-fields-summary__desc">
          <p className="assets-eyebrow">Descrição</p>
          <p>{fields.description}</p>
        </div>
      )}
    </div>
  );
}

/** Compact document row used in review, receipt and received views. */
export function DocumentRow({
  evidence: e,
  aside,
}: {
  evidence: Evidence;
  aside?: ReactNode;
}) {
  return (
    <li className="assets-doc-row">
      <span className="assets-doc-row__icon" aria-hidden="true">
        <Icon name="file" size={18} />
        <span>{e.name.split(".").pop()?.slice(0, 4)}</span>
      </span>
      <div className="assets-doc-row__main">
        <strong>{e.name}</strong>
        <p>
          {e.source} · {e.author} · {formatBytes(e.size)}
          {e.issuedAt && ` · Emitido em ${dateLabel(e.issuedAt)}`}
        </p>
        <span className="assets-hash" title={`SHA-256: ${e.digest}`}>
          SHA-256 {e.digest.slice(0, 12)}…{e.digest.slice(-6)}
        </span>
      </div>
      {aside && <div className="assets-doc-row__aside">{aside}</div>}
    </li>
  );
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="assets-icon-button"
      aria-label={copied ? `${label} copiado` : `Copiar ${label}`}
      onClick={() =>
        void navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            toast(`${label} copiado.`);
            window.setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => toast("Não foi possível copiar.", "warning"))
      }
    >
      <Icon name={copied ? "check" : "copy"} size={15} />
    </button>
  );
}

export function AssetsShare() {
  const { ativoId, loteId } = useParams();
  const { data } = useWorkspace();
  const [params] = useSearchParams();
  const object = data.objects.find((o) => o.id === (ativoId ?? loteId));
  const request = data.requests.find((r) => r.id === params.get("solicitacao"));
  if (!object)
    return (
      <Empty
        icon="search"
        title="Cadastro não encontrado"
        description="Volte à lista e confira o cadastro disponível para você."
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to="/assets">
            Voltar ao início
          </Link>
        }
      />
    );
  if (!canSend(data.membership.role))
    return (
      <Notice error title="Compartilhamento indisponível para seu papel">
        Somente o responsável pelo envio ou administrador pode compartilhar. O
        cadastro permanece salvo.
      </Notice>
    );
  if (params.get("solicitacao") && !request)
    return (
      <Notice error title="Solicitação indisponível">
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
  const [checking, setChecking] = useState(false);
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
  const recipientName = solicitation
    ? solicitation.requesterName.replace(" · demonstração", "")
    : recipients.find((r) => r.id === recipientId)?.name;
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
      <Receipt
        receipt={receipt}
        object={object}
        demo={workspace.organization.demo}
      />
    );

  const contentOk = !stale && missing.length === 0 && absent.length === 0 && !noResponse && object.status !== "archived";
  const recipientOk = Boolean(solicitation || recipientId) && Boolean(purpose.trim());
  const steps: Step[] = [
    {
      label: "Conteúdo",
      description: contentOk ? `Revisão ${review.object.revision} · ${files.length} documento(s)` : "Há pendências no cadastro",
      state: contentOk ? "done" : "current",
    },
    {
      label: "Destinatário",
      description: recipientName ?? "Confira o e-mail e a organização",
      state: recipientOk ? "done" : contentOk ? "current" : "todo",
    },
    {
      label: "Permissões",
      description: `Até ${dateLabel(expires)} · ${allowDownload ? "com download" : "somente consulta"}`,
      state: recipientOk ? "done" : "todo",
    },
    {
      label: "Confirmar",
      description: confirmed ? "Conferência registrada" : "Confirme a conferência",
      state: confirmed && !blocked ? "done" : recipientOk && contentOk ? "current" : "todo",
    },
  ];

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
      {(stale || missing.length > 0 || absent.length > 0 || noResponse || object.status === "archived") && (
        <div className="assets-stack assets-share-blockers">
          {stale && (
            <Notice
              error
              title="O cadastro mudou durante a revisão."
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  startIcon={<Icon name="refresh" size={15} />}
                  onClick={() => {
                    setReview(structuredClone({ object, solicitation, workspace }));
                    setConfirmed(false);
                  }}
                >
                  Atualizar conteúdo e revisar novamente
                </Button>
              }
            />
          )}
          {missing.length > 0 && (
            <Notice error title="Complete o cadastro antes de enviar">
              Complete no cadastro: {missing.join(", ")}.{" "}
              <Link className="assets-text-link" to={objectPath(object)}>
                Voltar ao cadastro
              </Link>
            </Notice>
          )}
          {absent.length > 0 && (
            <Notice error title="Requisitos obrigatórios pendentes">
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
            <Notice error title="Esclarecimentos sem resposta">
              Responda aos esclarecimentos na solicitação antes de apresentar
              uma nova versão.
            </Notice>
          )}
          {object.status === "archived" && (
            <Notice error title="Cadastro arquivado">
              Restaure o cadastro antes de compartilhar.
            </Notice>
          )}
        </div>
      )}
      <form onSubmit={submit} className="assets-split assets-share">
        <div className="assets-stack assets-stack--lg">
          <Panel
            eyebrow="1 · Conteúdo"
            title={review.object.fields.name || "Cadastro sem identificação"}
            description="Conteúdo incluído no compartilhamento"
            action={<Badge tone="info">Revisão {review.object.revision}</Badge>}
          >
            <FieldsSummary fields={review.object.fields} kind={object.kind} />
            <div className="assets-share-docs">
              <h3>
                {files.length} documento(s) incluído(s)
              </h3>
              {files.length ? (
                <ul className="assets-doc-list">
                  {files.map((e) => (
                    <DocumentRow
                      key={e.id}
                      evidence={e}
                      aside={<Icon name="check" size={16} className="assets-doc-row__ok" />}
                    />
                  ))}
                </ul>
              ) : (
                <p className="assets-muted">
                  Nenhum arquivo foi anexado. O envio conterá apenas os dados do
                  cadastro.
                </p>
              )}
            </div>
            {review.solicitation &&
              Object.entries(review.solicitation.justifications)
                .filter(([, value]) => value)
                .map(([id, value]) => (
                  <div key={id} className="assets-share-justification">
                    <Icon name="info" size={16} />
                    <div>
                      <strong>
                        Justificativa ·{" "}
                        {review.solicitation!.requirements.find((q) => q.id === id)?.label}
                      </strong>
                      <p>{value}</p>
                    </div>
                  </div>
                ))}
          </Panel>

          <Panel
            eyebrow="2 · Destinatário"
            title="Quem poderá consultar?"
            description={
              solicitation
                ? "O destinatário e a finalidade vêm da solicitação e não podem ser alterados."
                : "O acesso é concedido a uma organização Lastre ativa."
            }
          >
            <div className="assets-stack">
              <div className="assets-recipient-row">
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
                  <Button
                    type="button"
                    variant="secondary"
                    loading={checking}
                    disabled={!recipientEmail || action.busy}
                    startIcon={<Icon name="search" size={15} />}
                    onClick={() => {
                      setChecking(true);
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
                      }).finally(() => setChecking(false));
                    }}
                  >
                    Conferir destinatário
                  </Button>
                )}
              </div>
              {!solicitation && recipients.length > 0 && (
                <Field label="Organização destinatária">
                  <Select
                    name="recipientId"
                    required
                    value={recipientId}
                    onChange={setRecipientId}
                    placeholder="Selecione a organização"
                    options={recipients.map((r) => ({
                      value: r.id,
                      label: r.name,
                      leading: <Avatar name={r.name} size="sm" square />,
                    }))}
                  />
                </Field>
              )}
              {recipientName && (
                <div className="assets-recipient-card">
                  <Glyph icon="users" tone="info" size="sm" />
                  <div>
                    <strong>{recipientName}</strong>
                    <span>{recipientEmail}</span>
                  </div>
                  <Badge tone="good">Organização conferida</Badge>
                </div>
              )}
              <Field label="Finalidade do compartilhamento">
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  readOnly={Boolean(solicitation)}
                  required
                  rows={3}
                  maxLength={4000}
                />
              </Field>
            </div>
          </Panel>

          <Panel
            eyebrow="3 · Permissões"
            title="Por quanto tempo e como?"
            description="Você pode revogar o acesso a qualquer momento na aba Acessos do cadastro."
          >
            <div className="assets-permissions">
              <div className="assets-permission">
                <span className="assets-permission__icon" aria-hidden="true">
                  <Icon name="calendar" size={18} />
                </span>
                <div className="assets-permission__copy">
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
                </div>
              </div>
              <label className="assets-permission assets-permission--toggle">
                <span className="assets-permission__icon" aria-hidden="true">
                  <Icon name="download" size={18} />
                </span>
                <span className="assets-permission__copy">
                  <strong>Permitir download dos documentos</strong>
                  <small>
                    Arquivos já baixados não podem ser apagados remotamente.
                  </small>
                </span>
                <input
                  type="checkbox"
                  className="assets-toggle"
                  checked={allowDownload}
                  onChange={(e) => setAllowDownload(e.target.checked)}
                />
              </label>
            </div>
          </Panel>
        </div>

        <aside className="assets-share-summary">
          <div className="lastre-surface assets-panel assets-share-summary__card" data-elevation={3} data-material="matte">
            <p className="assets-eyebrow">4 · Confirmar</p>
            <h2>Resumo do envio</h2>
            <Stepper steps={steps} label="Etapas do compartilhamento" />
            <Properties
              items={[
                { label: "Destinatário", value: recipientName ?? "A conferir", icon: "users" },
                { label: "Vigência", value: `Até ${dateLabel(expires)}`, icon: "clock" },
                { label: "Download", value: allowDownload ? "Permitido" : "Não permitido", icon: "download" },
                { label: "Documentos", value: files.length, icon: "file" },
              ]}
            />
            <label className="assets-check assets-share-confirm">
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
            <Button
              type="submit"
              size="lg"
              className="assets-share-submit"
              loading={action.busy && confirmed}
              endIcon={<Icon name="send" size={16} />}
              disabled={
                action.busy ||
                blocked ||
                !confirmed ||
                (!solicitation && !recipientId)
              }
            >
              {solicitation
                ? `Enviar para ${solicitation.requesterName.replace(" · demonstração", "")}`
                : "Confirmar compartilhamento"}
            </Button>
            <p className="assets-caption" aria-live="polite">
              {action.busy && confirmed
                ? "Confirmando recebimento…"
                : "A confirmação aparecerá após o servidor registrar a versão e o acesso."}
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Receipt({
  receipt,
  object,
  demo,
}: {
  receipt: { share: Share; version: Snapshot };
  object: DossierObject;
  demo: boolean;
}) {
  return (
    <>
      <PageHead
        eyebrow="Recebimento confirmado pelo servidor"
        title={
          demo
            ? "Versão registrada na demonstração."
            : "Sua versão foi compartilhada."
        }
        back={objectPath(object)}
      />
      <div className="assets-receipt">
        <div className="lastre-surface assets-receipt__card" data-elevation={3} data-material="matte">
          <div className="assets-receipt__hero">
            <div className="assets-receipt__seal">
              <Glyph icon="check" tone="gold" size="lg" />
              <span className="assets-receipt__ring" aria-hidden="true" />
            </div>
            <div>
              <p className="assets-eyebrow">Versão {receipt.version.number}</p>
              <h2>{receipt.version.fields.name}</h2>
              <p className="assets-muted">
                {receipt.share.recipientName} tem acesso a esta versão até{" "}
                {dateLabel(receipt.share.expiresAt)}.
              </p>
            </div>
            <SealMark size={44} label="Selo Lastre" />
          </div>
          <Properties
            columns={2}
            items={[
              { label: "Quem enviou", value: receipt.version.author, icon: "user" },
              { label: "Quando", value: dateLabel(receipt.share.createdAt, true), icon: "clock" },
              { label: "Destinatário", value: receipt.share.recipientName, icon: "users" },
              { label: "Documentos incluídos", value: receipt.version.evidence.length, icon: "file" },
              { label: "Download", value: receipt.share.allowDownload ? "Permitido" : "Não permitido", icon: "download" },
              { label: "Finalidade", value: receipt.share.purpose, icon: "info" },
            ]}
          />
          <div className="assets-receipt__id">
            <span className="assets-eyebrow">Recibo</span>
            <span className="assets-hash">{receipt.share.receipt}</span>
            <CopyValue value={receipt.share.receipt} label="Recibo" />
          </div>
          <Notice tone="info" title="Responsabilidade da análise">
            A análise é responsabilidade da organização destinatária. A
            conferência de integridade não comprova origem ou titularidade.
          </Notice>
          <div className="assets-actions assets-receipt__actions">
            <Link
              className={buttonClassName({})}
              to={`${objectPath(object)}?versao=${receipt.version.id}`}
            >
              Consultar versão enviada
            </Link>
            <Link
              className={buttonClassName({ variant: "secondary" })}
              to={`${objectPath(object)}?aba=acessos`}
            >
              Gerir acesso
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
