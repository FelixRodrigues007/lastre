import { specifications } from "../../lib/inventory/specifications";

export function InventorySpecification({ screenId }: { screenId: string }) {
  const specification = specifications.find((item) => item.screen === screenId);
  if (!specification)
    return (
      <section>
        <h3>Contrato funcional a detalhar</h3>
        <p className="iv-muted">
          Esta ficha ainda precisa descrever usuário, entrada, dados, ação
          principal, permissões, recuperação, versões e critérios de aceitação.
        </p>
      </section>
    );
  const lists = [
    ["Contexto preservado", specification.context],
    ["Dados necessários", specification.data],
    ["Permissões", specification.permissions],
    ["Falhas e recuperação", specification.recovery],
    ["Critérios de aceitação", specification.acceptance],
    ["Dependências", specification.dependencies],
  ] as const;
  return (
    <section className="iv-specification">
      <div className="iv-specification-heading">
        <h3>Contrato funcional</h3>
        <span className="iv-badge">{specification.priority}</span>
      </div>
      <p className="iv-muted">
        Especificação para revisão. Os critérios abaixo não representam testes
        executados.
      </p>
      <dl className="iv-facts">
        <div>
          <dt>Quem realiza a tarefa</dt>
          <dd>{specification.actor}</dd>
        </div>
        <div>
          <dt>Como chega à tela</dt>
          <dd>{specification.entry}</dd>
        </div>
        <div>
          <dt>Ação principal</dt>
          <dd>
            <strong>{specification.primaryAction.label}</strong>
            <p>{specification.primaryAction.effect}</p>
          </dd>
        </div>
        <div>
          <dt>Quando pode agir</dt>
          <dd>{specification.primaryAction.enabledWhen}</dd>
        </div>
        <div>
          <dt>Efeito sobre versões</dt>
          <dd>{specification.versioning}</dd>
        </div>
        <div>
          <dt>Quem precisa ser avisado</dt>
          <dd>{specification.notifications}</dd>
        </div>
      </dl>
      {lists.map(([title, items]) => (
        <div className="iv-specification-list" key={title}>
          <h4>{title}</h4>
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
