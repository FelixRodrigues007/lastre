import { Link } from "react-router-dom";
import { Icon } from "../../components/ui/Icon";
import { useWorkspace } from "./context";
import {
  canCreate,
  dateLabel,
  objectPath,
  quantityLabel,
  requirementDone,
  sectorLabels,
  statusLabels,
} from "./model";
import { Badge, Empty, PageHead } from "./ui";
export function AssetsHome() {
  const { data } = useWorkspace();
  const open = data.requests.filter((r) => r.status === "open");
  const drafts = data.objects.filter((o) => o.status === "draft");
  const lots = data.objects.filter(
    (o) => o.kind === "lot" && o.status !== "archived",
  );
  const assets = data.objects.filter(
    (o) => o.kind === "asset" && o.status !== "archived",
  );
  const firstName = data.user.name.split(" ")[0];
  const activeShares = data.shares.filter(
    (s) => !s.revokedAt && new Date(s.expiresAt).getTime() > Date.now(),
  );
  return (
    <>
      <PageHead
        eyebrow="Sua operação, em perspectiva"
        title={`Bom trabalho, ${firstName}.`}
        description="Um lugar para organizar seus ativos e acompanhar o que precisa de você."
        action={
          canCreate(data.membership.role) && (
            <Link
              className="assets-button assets-button--primary"
              to="/assets/ativos/novo"
            >
              <span aria-hidden="true">＋</span> Cadastrar ativo
            </Link>
          )
        }
      />
      <div className="assets-metrics">
        <Link to="/assets/ativos">
          <span>Ativos cadastrados</span>
          <strong>{assets.length.toString().padStart(2, "0")}</strong>
          <small>
            Na sua organização <Icon name="chevron-right" size={14} />
          </small>
        </Link>
        <Link to="/assets/lotes">
          <span>Lotes de produção</span>
          <strong>{lots.length.toString().padStart(2, "0")}</strong>
          <small>
            Produção organizada <Icon name="chevron-right" size={14} />
          </small>
        </Link>
        <Link to="/assets/solicitacoes">
          <span>Solicitações abertas</span>
          <strong>{open.length.toString().padStart(2, "0")}</strong>
          <small>
            {open.length ? "Aguardando sua resposta" : "Tudo em dia"}{" "}
            <Icon name="chevron-right" size={14} />
          </small>
        </Link>
        <div>
          <span>Versões compartilhadas</span>
          <strong>{activeShares.length.toString().padStart(2, "0")}</strong>
          <small>Com acesso vigente</small>
        </div>
      </div>
      <div className="assets-home-grid">
        <section className="assets-panel assets-attention">
          <div className="assets-section-head">
            <div>
              <p className="assets-eyebrow">Próximos passos</p>
              <h2>Precisa da sua atenção</h2>
            </div>
            <Link className="assets-text-link" to="/assets/solicitacoes">
              Ver solicitações <Icon name="chevron-right" size={15} />
            </Link>
          </div>
          {open.length ? (
            open.slice(0, 3).map((r) => {
              const done = r.requirements.filter((q) =>
                requirementDone(r, q.id, data),
              ).length;
              return (
                <Link
                  key={r.id}
                  to={`/assets/solicitacoes/${r.id}`}
                  className="assets-task"
                >
                  <span className="assets-task__icon">
                    <Icon name="audit" size={23} />
                  </span>
                  <div>
                    <div className="assets-row">
                      <strong>{r.title}</strong>
                      <Badge tone="warning">Sua resposta</Badge>
                    </div>
                    <p>{r.requesterName}</p>
                    <div className="assets-task__meta">
                      <span>
                        {done} de {r.requirements.length} requisitos preparados
                      </span>
                      <span>
                        {r.dueAt
                          ? `Prazo: ${dateLabel(r.dueAt)}`
                          : "Sem prazo definido"}
                      </span>
                    </div>
                  </div>
                  <Icon name="chevron-right" />
                </Link>
              );
            })
          ) : (
            <Empty
              title="Nenhuma solicitação pendente"
              description="Quando outra organização pedir informações, você poderá responder por aqui."
            />
          )}
          {drafts.length > 0 && (
            <Link className="assets-draft-callout" to={objectPath(drafts[0])}>
              <Icon name="capture" />
              <div>
                <strong>Continue de onde parou</strong>
                <p>
                  {drafts[0].fields.name || "Cadastro sem identificação"} ·
                  rascunho salvo
                </p>
              </div>
              <Icon name="chevron-right" />
            </Link>
          )}
        </section>
        <aside className="assets-editorial">
          <img
            src="/media/marketplace/mine-site.jpg"
            alt="Profissional conferindo um equipamento em uma área de operação"
          />
          <div>
            <p className="assets-eyebrow">Do campo ao documento</p>
            <h2>
              Uma base organizada.
              <br />
              Um próximo passo claro.
            </h2>
            <p>
              Associe a produção aos seus ativos e reúna as evidências em um só
              dossiê.
            </p>
            {canCreate(data.membership.role) && (
              <Link className="assets-button" to="/assets/lotes/novo">
                Cadastrar lote <Icon name="chevron-right" size={15} />
              </Link>
            )}
          </div>
        </aside>
      </div>
      <section className="assets-recent">
        <div className="assets-section-head">
          <div>
            <p className="assets-eyebrow">Seu portfólio</p>
            <h2>Cadastros recentes</h2>
          </div>
          <Link className="assets-text-link" to="/assets/ativos">
            Ver meus ativos <Icon name="chevron-right" size={15} />
          </Link>
        </div>
        {data.objects.length ? (
          <div className="assets-recent-grid">
            {[...data.objects]
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
              .slice(0, 4)
              .map((o) => (
                <Link
                  to={objectPath(o)}
                  key={o.id}
                  className="assets-recent-item"
                >
                  <div className="assets-recent-symbol">
                    <Icon
                      name={o.kind === "lot" ? "lots" : "globe"}
                      size={24}
                    />
                    <span>{o.kind === "lot" ? "Produção" : "Patrimônio"}</span>
                  </div>
                  <div>
                    <span>
                      {sectorLabels[o.fields.sector]} ·{" "}
                      {o.kind === "lot" ? "Lote" : "Ativo"}
                    </span>
                    <h3>{o.fields.name || "Sem identificação"}</h3>
                    <p>
                      {o.kind === "lot"
                        ? quantityLabel(o)
                        : o.fields.location || "Localização a informar"}
                    </p>
                    <Badge tone={o.status === "ready" ? "good" : "neutral"}>
                      {statusLabels[o.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <Empty
            title="Seu primeiro ativo começa aqui"
            description="Cadastre uma área, direito, projeto ou equipamento. Você pode salvar e completar depois."
            action={
              canCreate(data.membership.role) && (
                <Link
                  className="assets-button assets-button--primary"
                  to="/assets/ativos/novo"
                >
                  Cadastrar primeiro ativo
                </Link>
              )
            }
          />
        )}
      </section>
      {data.received.length > 0 && (
        <section className="assets-panel">
          <div className="assets-section-head">
            <h2>Compartilhados com você</h2>
          </div>
          {data.received.map((s) => (
            <Link
              key={s.id}
              to={`/assets/recebidos/${s.id}`}
              className="assets-list-row"
            >
              <div>
                <strong>{s.objectName}</strong>
                <p>{s.senderName}</p>
              </div>
              <Badge>
                {s.revokedAt
                  ? "Revogado"
                  : new Date(s.expiresAt).getTime() < Date.now()
                    ? "Expirado"
                    : "Consultar versão"}
              </Badge>
              <Icon name="chevron-right" />
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
