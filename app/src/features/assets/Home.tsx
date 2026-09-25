import { Link } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { buttonClassName } from "../../components/ui/Button";
import { DonutStat } from "../../components/ui/DonutStat";
import { useWorkspace } from "./context";
import {
  canCreate,
  categoryLabels,
  dateLabel,
  objectPath,
  quantityLabel,
  requirementDone,
  sectorLabels,
  statusLabels,
} from "./model";
import {
  Badge,
  Empty,
  Glyph,
  Panel,
  Progress,
  Timeline,
  relativeTime,
} from "./ui";

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
};

export function AssetsHome() {
  const { data } = useWorkspace();
  const open = data.requests.filter((r) => r.status === "open");
  const drafts = data.objects.filter((o) => o.status === "draft");
  const live = data.objects.filter((o) => o.status !== "archived");
  const lots = live.filter((o) => o.kind === "lot");
  const assets = live.filter((o) => o.kind === "asset");
  const ready = live.filter((o) => o.status === "ready").length;
  const firstName = data.user.name.split(" ")[0];
  const activeShares = data.shares.filter(
    (s) => !s.revokedAt && new Date(s.expiresAt).getTime() > Date.now(),
  );
  const creator = canCreate(data.membership.role);
  const recent = [...data.objects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);
  const activity = [...data.activity]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const metrics = [
    { label: "Ativos cadastrados", value: assets.length, hint: "Na sua organização", to: "/assets/ativos", icon: "globe" as const },
    { label: "Lotes de produção", value: lots.length, hint: "Produção organizada", to: "/assets/lotes", icon: "lots" as const },
    {
      label: "Solicitações abertas",
      value: open.length,
      hint: open.length ? "Aguardando sua resposta" : "Tudo em dia",
      to: "/assets/solicitacoes",
      icon: "inbox" as const,
      attention: open.length > 0,
    },
    { label: "Versões compartilhadas", value: activeShares.length, hint: "Com acesso vigente", icon: "share" as const },
  ];

  return (
    <>
      <header className="assets-home-hero">
        <div>
          <p className="assets-eyebrow">
            {new Intl.DateTimeFormat("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </p>
          <h1>
            {greeting()}, <span className="lastre-gold-text">{firstName}</span>.
          </h1>
          <p className="assets-lead">
            Um lugar para organizar seus ativos e acompanhar o que precisa de
            você.
          </p>
        </div>
        {creator && (
          <div className="assets-actions">
            <Link className={buttonClassName({ variant: "secondary" })} to="/assets/lotes/novo">
              <Icon name="lots" size={16} /> Cadastrar lote
            </Link>
            <Link className={buttonClassName({})} to="/assets/ativos/novo">
              <Icon name="plus" size={16} /> Cadastrar ativo
            </Link>
          </div>
        )}
      </header>

      <div className="assets-kpis assets-stagger">
        {metrics.map((m) => {
          const body = (
            <>
              <span className="assets-kpi__top">
                <span className="assets-kpi__label">{m.label}</span>
                <Glyph icon={m.icon} size="sm" tone={m.attention ? "warning" : "info"} />
              </span>
              <strong className="assets-kpi__value">
                {m.value.toString().padStart(2, "0")}
              </strong>
              <span className="assets-kpi__hint">
                {m.attention && <span className="assets-kpi__pulse" aria-hidden="true" />}
                {m.hint}
                {m.to && <Icon name="arrow-right" size={14} />}
              </span>
            </>
          );
          return m.to ? (
            <Link
              key={m.label}
              to={m.to}
              className="lastre-surface assets-kpi assets-lift"
              data-elevation={1}
            >
              {body}
            </Link>
          ) : (
            <div key={m.label} className="lastre-surface assets-kpi" data-elevation={1}>
              {body}
            </div>
          );
        })}
      </div>

      <div className="assets-home-grid">
        <Panel
          eyebrow="Próximos passos"
          title="Precisa da sua atenção"
          className="assets-attention"
          action={
            <Link className="assets-text-link" to="/assets/solicitacoes">
              Ver solicitações <Icon name="chevron-right" size={15} />
            </Link>
          }
        >
          {open.length ? (
            <ul className="assets-tasks assets-stagger">
              {open.slice(0, 3).map((r) => {
                const done = r.requirements.filter((q) =>
                  requirementDone(r, q.id, data),
                ).length;
                const overdue = r.dueAt && new Date(r.dueAt).getTime() < Date.now();
                return (
                  <li key={r.id}>
                    <Link to={`/assets/solicitacoes/${r.id}`} className="assets-task">
                      <Glyph icon="inbox" tone="warning" />
                      <div className="assets-task__main">
                        <div className="assets-row">
                          <strong>{r.title}</strong>
                          <Badge tone="warning">Sua resposta</Badge>
                        </div>
                        <p className="assets-task__from">
                          {r.requesterName}
                          <span aria-hidden="true"> · </span>
                          <span data-overdue={overdue || undefined}>
                            <Icon name="clock" size={13} />{" "}
                            {r.dueAt ? `Prazo: ${dateLabel(r.dueAt)}` : "Sem prazo definido"}
                          </span>
                        </p>
                        <Progress
                          value={done}
                          max={r.requirements.length}
                          label={`${done} de ${r.requirements.length} requisitos preparados`}
                          tone="warning"
                          showValue={false}
                        />
                      </div>
                      <Icon name="chevron-right" className="assets-task__chevron" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty
              compact
              icon="inbox"
              title="Nenhuma solicitação pendente"
              description="Quando outra organização pedir informações, você poderá responder por aqui."
            />
          )}
          {drafts.length > 0 && (
            <Link className="assets-draft-callout" to={objectPath(drafts[0])}>
              <Glyph icon="capture" tone="neutral" size="sm" />
              <div>
                <strong>Continue de onde parou</strong>
                <p>
                  {drafts[0].fields.name || "Cadastro sem identificação"} ·
                  rascunho salvo {relativeTime(drafts[0].updatedAt)}
                </p>
              </div>
              <Icon name="arrow-right" size={16} />
            </Link>
          )}
        </Panel>

        <div className="assets-stack assets-stack--lg">
          <Panel eyebrow="Prontidão" title="Base de cadastros">
            <DonutStat
              percent={live.length ? (ready / live.length) * 100 : 0}
              label={`${ready} de ${live.length} prontos para revisão`}
              sublabel={
                drafts.length
                  ? `${drafts.length} rascunho(s) para completar`
                  : "Nenhum rascunho pendente"
              }
              tone={ready === live.length && live.length ? "valid" : "accent"}
            />
          </Panel>
          <aside className="assets-editorial">
            <img
              src="/media/marketplace/mine-site.jpg"
              alt="Profissional conferindo um equipamento em uma área de operação"
            />
            <div className="assets-editorial__glass">
              <p className="assets-eyebrow">Do campo ao documento</p>
              <h2>Uma base organizada. Um próximo passo claro.</h2>
              <p>
                Associe a produção aos seus ativos e reúna as evidências em um
                só dossiê.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <section className="assets-section">
        <div className="assets-section-head">
          <div>
            <p className="assets-eyebrow">Seu portfólio</p>
            <h2>Cadastros recentes</h2>
          </div>
          <Link className="assets-text-link" to="/assets/ativos">
            Ver meus ativos <Icon name="chevron-right" size={15} />
          </Link>
        </div>
        {recent.length ? (
          <div className="assets-recent-grid assets-stagger">
            {recent.map((o) => (
              <Link
                to={objectPath(o)}
                key={o.id}
                className="lastre-surface assets-recent-item assets-lift"
                data-elevation={1}
              >
                <div className="assets-recent-item__top">
                  <Glyph
                    icon={o.kind === "lot" ? "lots" : "globe"}
                    tone={o.status === "ready" ? "success" : "info"}
                  />
                  <Badge
                    tone={o.status === "ready" ? "good" : o.status === "archived" ? "neutral" : "info"}
                  >
                    {statusLabels[o.status]}
                  </Badge>
                </div>
                <p className="assets-recent-item__kind">
                  {sectorLabels[o.fields.sector]} · {categoryLabels[o.fields.category]}
                </p>
                <h3>{o.fields.name || "Sem identificação"}</h3>
                <p className="assets-recent-item__meta">
                  <Icon name={o.kind === "lot" ? "lots" : "pin"} size={14} />
                  {o.kind === "lot"
                    ? quantityLabel(o)
                    : o.fields.location || "Localização a informar"}
                </p>
                <p className="assets-recent-item__foot">
                  <span>{o.evidenceIds.length} documento(s)</span>
                  <span>{relativeTime(o.updatedAt)}</span>
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            title="Seu primeiro ativo começa aqui"
            description="Cadastre uma área, direito, projeto ou equipamento. Você pode salvar e completar depois."
            icon="globe"
            action={
              creator && (
                <Link className={buttonClassName({})} to="/assets/ativos/novo">
                  <Icon name="plus" size={16} /> Cadastrar primeiro ativo
                </Link>
              )
            }
          />
        )}
      </section>

      {(activity.length > 0 || data.received.length > 0) && (
        <div className="assets-section assets-home-lower">
          {activity.length > 0 && (
            <Panel eyebrow="Atividade" title="O que mudou">
              <Timeline
                items={activity.map((a) => ({
                  id: a.id,
                  title: (
                    <>
                      <strong>{a.actor}</strong> {a.message}
                    </>
                  ),
                  meta: relativeTime(a.createdAt),
                  tone: a.versionId ? "success" : "neutral",
                  icon: a.versionId ? "share" : undefined,
                }))}
              />
            </Panel>
          )}
          {data.received.length > 0 && (
            <Panel eyebrow="Recebidos" title="Compartilhados com você" flush>
              <ul className="assets-received-list">
                {data.received.map((s) => {
                  const state = s.revokedAt
                    ? "Revogado"
                    : new Date(s.expiresAt).getTime() < Date.now()
                      ? "Expirado"
                      : "Consultar versão";
                  return (
                    <li key={s.id}>
                      <Link to={`/assets/recebidos/${s.id}`}>
                        <Glyph icon="inbox" tone={state === "Consultar versão" ? "info" : "neutral"} size="sm" />
                        <div>
                          <strong>{s.objectName}</strong>
                          <p>{s.senderName}</p>
                        </div>
                        <Badge tone={state === "Consultar versão" ? "info" : "neutral"}>{state}</Badge>
                        <Icon name="chevron-right" size={16} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}
