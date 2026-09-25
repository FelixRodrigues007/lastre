import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { Button, buttonClassName } from "../../components/ui/Button";
import { DataTable, type Column, type SortState } from "../../components/ui/DataTable";
import { FacetFilter } from "../../components/ui/FacetFilter";
import { FilterBar } from "../../components/ui/FilterBar";
import { Select } from "../../components/ui/Select";
import { Tabs } from "../../components/ui/Tabs";
import { listParam, sortParam } from "./listing";
import { api, type InformationRequest } from "./api";
import { useWorkspace } from "./context";
import {
  canEdit,
  canSend,
  categoryLabels,
  dateLabel,
  objectPath,
  requirementDone,
} from "./model";
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
  Progress,
  Properties,
  Segmented,
  relativeTime,
  useAction,
} from "./ui";

const overdue = (r: InformationRequest) =>
  r.status === "open" &&
  Boolean(r.dueAt) &&
  new Date(`${r.dueAt.slice(0, 10)}T23:59:59`).getTime() < Date.now();

function DueLabel({ request: r }: { request: InformationRequest }) {
  const late = overdue(r);
  return (
    <span className="assets-due" data-overdue={late || undefined}>
      <Icon name="clock" size={14} />
      {r.dueAt
        ? `${late ? "Venceu em" : "Até"} ${dateLabel(r.dueAt)}`
        : "Sem prazo"}
    </span>
  );
}

type RequestTab = "all" | "open" | "responded" | "overdue";
const DEFAULT_REQUEST_SORT: SortState = { id: "due", dir: "asc" };

export function AssetsRequests() {
  const { data } = useWorkspace();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const status = (params.get("status") ?? "all") as RequestTab;
  const requesters = listParam(params, "organizacao");
  const linked = listParam(params, "cadastro");
  const view = params.get("view") === "cards" ? "cards" : "table";
  const sort = sortParam(params.get("sort")) ?? DEFAULT_REQUEST_SORT;
  const set = (key: string, value: string | string[]) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const v = Array.isArray(value) ? value.join(",") : value;
        if (v) next.set(key, v);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );

  const progress = (r: InformationRequest) =>
    r.requirements.filter((q) => requirementDone(r, q.id, data)).length;
  const objectOf = (r: InformationRequest) =>
    data.objects.find((o) => o.id === r.objectId);
  const text = search.toLocaleLowerCase("pt-BR");
  const inTab = (r: InformationRequest, tab: RequestTab) =>
    tab === "all" || (tab === "overdue" ? overdue(r) : r.status === tab);
  const passes = (r: InformationRequest, skip?: "status" | "organizacao" | "cadastro") =>
    (!text ||
      `${r.title} ${r.requesterName} ${r.purpose}`
        .toLocaleLowerCase("pt-BR")
        .includes(text)) &&
    (skip === "status" || inTab(r, status)) &&
    (skip === "organizacao" || !requesters.length || requesters.includes(r.requesterName)) &&
    (skip === "cadastro" ||
      !linked.length ||
      linked.includes(objectOf(r) ? "linked" : "missing"));
  const filtered = data.requests.filter((r) => passes(r));
  const count = (tab: RequestTab) =>
    data.requests.filter((r) => passes(r, "status") && inTab(r, tab)).length;
  const requesterCounts = new Map<string, number>();
  data.requests.forEach((r) =>
    requesterCounts.set(
      r.requesterName,
      (requesterCounts.get(r.requesterName) ?? 0) + (passes(r, "organizacao") ? 1 : 0),
    ),
  );
  const linkCount = (value: "linked" | "missing") =>
    data.requests.filter(
      (r) => passes(r, "cadastro") && (objectOf(r) ? "linked" : "missing") === value,
    ).length;
  const filtering = Boolean(search || requesters.length || linked.length);

  const columns: Column<InformationRequest>[] = [
    {
      id: "title",
      header: "Solicitação",
      primary: true,
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="assets-object-name">
          <Avatar name={r.requesterName} square />
          <span>
            <strong title={r.title}>{r.title}</strong>
            <small>{r.requesterName}</small>
          </span>
        </span>
      ),
    },
    {
      id: "object",
      header: "Cadastro",
      hideBelow: "lg",
      sortValue: (r) => objectOf(r)?.fields.name ?? "",
      cell: (r) => {
        const o = objectOf(r);
        return o ? (
          <span className="assets-inline-ref">
            <Icon name={o.kind === "lot" ? "lots" : "globe"} size={14} />
            <span className="lastre-dt__clip">{o.fields.name || "Sem identificação"}</span>
          </span>
        ) : (
          <span className="assets-inline-ref" data-tone="warning">
            <Icon name="link" size={14} /> A associar
          </span>
        );
      },
    },
    {
      id: "progress",
      header: "Requisitos",
      sortValue: (r) => (r.requirements.length ? progress(r) / r.requirements.length : 0),
      cell: (r) => {
        const done = progress(r);
        const total = r.requirements.length;
        return (
          <span className="assets-meter" data-complete={done === total || undefined}>
            <span className="assets-meter__track" aria-hidden="true">
              <span style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
            </span>
            <span className="assets-mono">
              {done}/{total}
            </span>
          </span>
        );
      },
    },
    {
      id: "due",
      header: "Prazo",
      sortValue: (r) => r.dueAt || null,
      cell: (r) => <DueLabel request={r} />,
    },
    {
      id: "status",
      header: "Situação",
      sortValue: (r) => (r.status === "open" ? 0 : 1),
      cell: (r) => (
        <Badge tone={r.status === "open" ? "warning" : "info"}>
          {r.status === "open" ? "Sua resposta" : "Resposta enviada"}
        </Badge>
      ),
    },
    {
      id: "received",
      header: "Recebida",
      defaultHidden: true,
      firstDir: "desc",
      sortValue: (r) => r.createdAt,
      cell: (r) => (
        <time dateTime={r.createdAt} title={dateLabel(r.createdAt, true)}>
          {relativeTime(r.createdAt)}
        </time>
      ),
    },
  ];

  const emptyState = (
    <Empty
      compact={data.requests.length > 0}
      icon="inbox"
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
          <Button variant="secondary" onClick={() => setParams({}, { replace: true })}>
            Limpar filtros
          </Button>
        ) : (
          <Link className={buttonClassName({ variant: "secondary" })} to="/assets/lotes">
            Organizar meus lotes
          </Link>
        )
      }
    />
  );

  return (
    <>
      <PageHead
        eyebrow="Trabalho entre organizações"
        title="Solicitações"
        description="Entenda o que pediram, reúna as informações e acompanhe sua resposta."
      />
      <div className="assets-listview">
        <Tabs<RequestTab>
          variant="underline"
          ariaLabel="Situação das solicitações"
          panelId="assets-requests-results"
          active={status}
          onChange={(v) => set("status", v === "all" ? "" : v)}
          tabs={[
            { id: "all", label: "Todas", count: count("all") },
            { id: "open", label: "Aguardando resposta", count: count("open"), attention: count("open") > 0 },
            { id: "overdue", label: "Vencidas", count: count("overdue"), attention: count("overdue") > 0 },
            { id: "responded", label: "Respostas enviadas", count: count("responded") },
          ]}
        />
        <FilterBar
          search={search}
          onSearch={(v) => set("q", v)}
          searchLabel="Buscar solicitações"
          placeholder="Buscar por assunto ou organização…"
          active={filtering}
          onClear={() =>
            setParams(
              (prev) => {
                const next = new URLSearchParams(prev);
                ["q", "organizacao", "cadastro"].forEach((k) => next.delete(k));
                return next;
              },
              { replace: true },
            )
          }
          filters={
            <>
              <FacetFilter
                label="Organização"
                icon="users"
                selected={requesters}
                onChange={(v) => set("organizacao", v)}
                options={[...requesterCounts.entries()]
                  .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
                  .map(([value, n]) => ({
                    value,
                    label: value,
                    count: n,
                    leading: <Avatar name={value} size="sm" square />,
                  }))}
              />
              <FacetFilter
                label="Cadastro"
                icon="link"
                selected={linked}
                onChange={(v) => set("cadastro", v)}
                options={[
                  { value: "linked", label: "Associado", icon: "check", count: linkCount("linked") },
                  { value: "missing", label: "A associar", icon: "link", count: linkCount("missing") },
                ]}
              />
            </>
          }
          end={
            <Segmented
              label="Modo de exibição"
              value={view}
              onChange={(v) => set("view", v === "table" ? "" : v)}
              options={[
                { value: "table", label: "Exibir tabela", icon: "list", iconOnly: true },
                { value: "cards", label: "Exibir cartões", icon: "grid", iconOnly: true },
              ]}
            />
          }
        />
        <div id="assets-requests-results" role="tabpanel" aria-label="Solicitações filtradas">
          {view === "table" ? (
            <DataTable<InformationRequest>
              id="assets-requests"
              label="Solicitações recebidas"
              rows={filtered}
              columns={columns}
              getRowId={(r) => r.id}
              rowHref={(r) => `/assets/solicitacoes/${r.id}`}
              rowLabel={(r) => r.title}
              sort={sort}
              onSortChange={(next) =>
                set(
                  "sort",
                  next &&
                    !(next.id === DEFAULT_REQUEST_SORT.id && next.dir === DEFAULT_REQUEST_SORT.dir)
                    ? `${next.id}:${next.dir}`
                    : "",
                )
              }
              rowTone={(r) => (overdue(r) ? "danger" : undefined)}
              rowActions={(r) => {
                const o = objectOf(r);
                return [
                  { id: "open", label: "Abrir solicitação", icon: "arrow-right", href: `/assets/solicitacoes/${r.id}` },
                  ...(o
                    ? [
                        { id: "object", label: "Abrir cadastro associado", icon: o.kind === "lot" ? ("lots" as const) : ("globe" as const), href: objectPath(o) },
                        ...(canSend(data.membership.role) && o.status !== "archived"
                          ? [{ id: "send", label: r.status === "responded" ? "Revisar nova versão" : "Revisar envio", icon: "send" as const, href: `${objectPath(o)}/compartilhar?solicitacao=${r.id}` }]
                          : []),
                      ]
                    : []),
                ];
              }}
              pageSize={25}
              summary={
                <>
                  <strong>{filtered.length}</strong>{" "}
                  {filtered.length === 1 ? "solicitação" : "solicitações"}
                </>
              }
              empty={emptyState}
            />
          ) : filtered.length ? (
            <ul className="assets-request-list assets-stagger">
              {filtered.map((r) => {
                const done = progress(r);
                const object = objectOf(r);
                return (
                  <li key={r.id}>
                    <Link
                      className="lastre-surface assets-request-card assets-lift"
                      data-elevation={1}
                      data-status={r.status}
                      to={`/assets/solicitacoes/${r.id}`}
                    >
                      <div className="assets-request-card__head">
                        <Avatar name={r.requesterName} square />
                        <div className="assets-request-card__sender">
                          <strong>{r.requesterName}</strong>
                          <span>{r.requesterEmail}</span>
                        </div>
                        <Badge tone={r.status === "open" ? "warning" : "info"}>
                          {r.status === "open" ? "Sua resposta" : "Resposta enviada"}
                        </Badge>
                      </div>
                      <div className="assets-request-card__body">
                        <h2>{r.title}</h2>
                        <p>{r.purpose}</p>
                      </div>
                      <Progress
                        value={done}
                        max={r.requirements.length}
                        label={`${done}/${r.requirements.length} requisitos preparados`}
                        tone={r.status === "open" ? "warning" : "info"}
                        showValue={false}
                      />
                      <div className="assets-request-card__foot">
                        <span>
                          <Icon name={object?.kind === "lot" ? "lots" : "link"} size={14} />
                          {object?.fields.name || "Cadastro a associar"}
                        </span>
                        <DueLabel request={r} />
                        <Icon name="arrow-right" size={16} className="assets-request-card__go" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            emptyState
          )}
        </div>
      </div>
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
        icon="inbox"
        title="Solicitação não encontrada"
        description="Confira o endereço ou solicite acesso à organização responsável."
        action={
          <Link className={buttonClassName({ variant: "secondary" })} to="/assets/solicitacoes">
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
  const firstOpen = r.requirements.find((q) => !requirementDone(r, q.id, data));
  const sendable =
    object && canSend(data.membership.role) && object.status !== "archived";
  const reviewLink = object && (
    <Link
      className={buttonClassName({ size: "md" })}
      to={`${objectPath(object)}/compartilhar?solicitacao=${r.id}`}
    >
      {r.status === "responded" ? "Revisar nova versão" : "Revisar envio"}
      <Icon name="arrow-right" size={16} />
    </Link>
  );
  return (
    <>
      <PageHead
        eyebrow={`Solicitado por ${r.requesterName}`}
        title={r.title}
        description={r.purpose}
        back="/assets/solicitacoes"
        icon={<Glyph icon="inbox" tone={r.status === "open" ? "warning" : "info"} size="lg" />}
        meta={
          <>
            <Badge tone={r.status === "open" ? "warning" : "info"}>
              {r.status === "open"
                ? "Aguardando sua resposta"
                : "Resposta recebida pelo sistema"}
            </Badge>
            <DueLabel request={r} />
            <span className="assets-mono">Modelo {r.templateVersion}</span>
          </>
        }
        action={sendable && reviewLink}
      />
      {r.status === "responded" && (
        <Notice tone="info" title="Resposta registrada">
          A versão foi registrada para {r.requesterName}. A organização
          destinatária é responsável pela análise. Uma resposta enviada não
          significa documentação aprovada.
        </Notice>
      )}
      <div className="assets-split assets-request-detail">
        <div className="assets-stack assets-stack--lg">
          <Panel
            eyebrow="Passo 1"
            title="Cadastro associado"
            description="As informações enviadas serão sobre este objeto."
          >
            {object ? (
              <Link className="assets-linked-record" to={objectPath(object)}>
                <Glyph icon={object.kind === "lot" ? "lots" : "globe"} tone={object.status === "ready" ? "success" : "info"} />
                <div>
                  <strong>{object.fields.name || "Sem identificação"}</strong>
                  <p>
                    {categoryLabels[object.fields.category]} ·{" "}
                    {object.fields.location || "Localização a informar"}
                  </p>
                </div>
                <Icon name="chevron-right" />
              </Link>
            ) : writable ? (
              <div className="assets-associate">
                <Field label="Escolher um cadastro existente">
                  <Select
                    value={selected}
                    onChange={setSelected}
                    placeholder="Selecione um ativo ou lote"
                    options={data.objects
                      .filter((o) => o.status !== "archived")
                      .map((o) => ({
                        value: o.id,
                        label: o.fields.name || "Sem identificação",
                        description: `${o.kind === "lot" ? "Lote" : categoryLabels[o.fields.category]} · ${o.fields.location || "Local a informar"}`,
                        icon: o.kind === "lot" ? ("lots" as const) : ("globe" as const),
                        group: o.kind === "lot" ? "Lotes" : "Ativos",
                      }))
                      .sort((a, b) => (a.group ?? "").localeCompare(b.group ?? "") || a.label.localeCompare(b.label, "pt-BR"))}
                  />
                </Field>
                <div className="assets-actions">
                  <Button
                    disabled={!selected}
                    loading={action.busy}
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
                  </Button>
                  <span className="assets-associate__or">ou</span>
                  <Link
                    className={buttonClassName({ variant: "secondary" })}
                    to={`/assets/lotes/novo?solicitacao=${r.id}`}
                  >
                    <Icon name="plus" size={16} />
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
              <Notice tone="info" title="Associação pendente">
                O responsável pelo cadastro precisa associar um ativo ou lote.
              </Notice>
            )}
            <Feedback error={action.error} />
          </Panel>

          <Panel
            eyebrow="Passo 2"
            title="O que você precisa apresentar"
            description={`${done} de ${r.requirements.length} requisitos preparados.`}
            action={
              <Badge tone={done === r.requirements.length ? "good" : "warning"}>
                {done}/{r.requirements.length}
              </Badge>
            }
          >
            <ol className="assets-checklist">
              {r.requirements.map((q, i) => {
                const complete = requirementDone(r, q.id, data);
                const state = complete
                  ? "done"
                  : firstOpen?.id === q.id
                    ? "current"
                    : "todo";
                const evidence = data.evidence.filter(
                  (e) =>
                    object?.evidenceIds.includes(e.id) &&
                    e.requirementId === q.id,
                );
                return (
                  <li key={q.id} className="assets-checklist__item" data-state={state}>
                    <span className="assets-checklist__mark" aria-hidden="true">
                      {complete ? <Icon name="check" size={15} /> : i + 1}
                    </span>
                    <article className="assets-checklist__card">
                      <div className="assets-checklist__head">
                        <h3>{q.label}</h3>
                        <Badge
                          tone={complete ? "good" : q.required ? "warning" : "neutral"}
                        >
                          {complete
                            ? "Preparado"
                            : q.required
                              ? "Necessário"
                              : "Opcional"}
                        </Badge>
                      </div>
                      {q.description && <p className="assets-checklist__desc">{q.description}</p>}
                      {evidence.length > 0 && (
                        <ul className="assets-checklist__files">
                          {evidence.map((e) => (
                            <li key={e.id}>
                              <Icon name="file" size={15} />
                              <span>{e.name}</span>
                              <small>{relativeTime(e.uploadedAt)}</small>
                            </li>
                          ))}
                        </ul>
                      )}
                      {object && writable && (
                        <Link
                          className={
                            evidence.length
                              ? "assets-text-link"
                              : buttonClassName({ variant: "secondary", size: "sm" })
                          }
                          to={`${objectPath(object)}?aba=documentos&requisito=${q.id}`}
                        >
                          {!evidence.length && <Icon name="upload" size={15} />}
                          {evidence.length
                            ? "Consultar ou substituir documento"
                            : "Anexar documento"}
                          {evidence.length > 0 && <Icon name="chevron-right" size={15} />}
                        </Link>
                      )}
                      {q.allowJustification && object && (
                        <Justification
                          request={r}
                          requirementId={q.id}
                          writable={writable}
                        />
                      )}
                    </article>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {r.clarifications.length > 0 && (
            <Panel
              eyebrow="Passo 3"
              title="Pendências e esclarecimentos"
              description="Perguntas do solicitante sobre os requisitos desta solicitação."
            >
              <div className="assets-stack">
                {r.clarifications.map((c) => (
                  <Clarification
                    key={c.id}
                    request={r}
                    clarificationId={c.id}
                    writable={writable}
                  />
                ))}
              </div>
            </Panel>
          )}
        </div>

        <aside className="assets-stack assets-request-rail">
          <Panel eyebrow="Antes de enviar" title="Saiba quem recebe." elevation={2}>
            <div className="assets-request-rail__who">
              <Avatar name={r.requesterName} size="lg" square />
              <div>
                <strong>{r.requesterName}</strong>
                <span>{r.requesterEmail}</span>
              </div>
            </div>
            <Properties
              items={[
                { label: "Organização", value: r.requesterName, icon: "users" },
                { label: "Contato", value: r.requesterEmail, icon: "send" },
                { label: "Finalidade", value: r.purpose, icon: "info" },
                { label: "Prazo solicitado", value: dateLabel(r.dueAt), icon: "calendar" },
                {
                  label: "Próximo responsável",
                  value: r.status === "open" ? data.organization.name : r.requesterName,
                  icon: "user",
                },
              ]}
            />
            <div className="assets-request-rail__progress">
              <Progress
                value={done}
                max={r.requirements.length}
                label="Prontidão da resposta"
                tone="warning"
              />
            </div>
            <p className="assets-caption">
              Salvar uma resposta prepara o rascunho. Somente a confirmação na
              revisão compartilha uma versão.
            </p>
          </Panel>
          {!canSend(data.membership.role) && (
            <Notice tone="info" title="Envio por outro papel">
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
    <details className="assets-disclosure">
      <summary>
        <Icon name="chevron-right" size={14} />
        {r.justifications[requirementId]
          ? "Justificativa registrada"
          : "Este documento não se aplica?"}
      </summary>
      {writable ? (
        <form onSubmit={submit} className="assets-stack assets-disclosure__body">
          <Field label="Explique por que o documento não se aplica">
            <textarea
              rows={3}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={4000}
            />
          </Field>
          <Feedback error={action.error} success={action.success} />
          <div className="assets-actions">
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
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              loading={action.busy}
              disabled={r.revision !== revision}
            >
              Salvar justificativa
            </Button>
          </div>
        </form>
      ) : (
        <p className="assets-disclosure__body assets-muted">
          {value || "Nenhuma justificativa registrada."}
        </p>
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
    <article className="assets-thread" data-status={c.status}>
      <div className="assets-thread__head">
        <h3>
          {r.requirements.find((q) => q.id === c.requirementId)?.label ??
            "Esclarecimento"}
        </h3>
        <Badge
          tone={c.status === "open" ? "warning" : c.status === "responded" ? "info" : "good"}
        >
          {c.status === "open"
            ? "A responder"
            : c.status === "responded"
              ? "Resposta enviada · aguarda análise"
              : "Resolvida pelo solicitante"}
        </Badge>
      </div>
      <div className="assets-thread__message">
        <Avatar name={c.author} size="sm" />
        <div>
          <p className="assets-thread__meta">
            <strong>{c.author}</strong> · {dateLabel(c.createdAt)}
          </p>
          <p>{c.question}</p>
        </div>
      </div>
      {writable && c.status !== "resolved" ? (
        <form onSubmit={submit} className="assets-stack assets-thread__reply">
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
          <div className="assets-actions">
            <Button type="submit" variant="secondary" size="sm" loading={action.busy}>
              Salvar resposta para revisão
            </Button>
          </div>
        </form>
      ) : (
        <div className="assets-thread__message assets-thread__message--reply">
          <span className="assets-thread__arrow" aria-hidden="true">
            <Icon name="send" size={13} />
          </span>
          <p>{c.response || "Ainda sem resposta."}</p>
        </div>
      )}
    </article>
  );
}
