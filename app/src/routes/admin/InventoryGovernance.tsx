import { governance } from "../../lib/inventory/governance";

export function InventoryGovernance() {
  return (
    <section aria-labelledby="iv-governance-heading">
      <div className="iv-section-heading">
        <div>
          <h2 id="iv-governance-heading">Regra de alteração</h2>
          <p>Um procedimento comum para produto, design e engenharia.</p>
        </div>
        <span className="iv-badge iv-badge--planned">Obrigatória</span>
      </div>
      <div className="iv-governance-rule">
        <p className="iv-eyebrow">ANTES DE CONCLUIR UMA MUDANÇA</p>
        <h3>{governance.rule}</h3>
        <p>{governance.scope}</p>
      </div>
      <ol className="iv-governance-steps">
        {governance.steps.map((step, index) => (
          <li key={step.title}>
            <span className="iv-step-index" aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="iv-governance-details">
        <section>
          <h3>Conferência antes da entrega</h3>
          <pre aria-label="Comandos de atualização e conferência">
            <code>{governance.commands.join("\n")}</code>
          </pre>
          <p>
            O build do app e a CI falham quando há rotas sem ficha, referências
            inválidas ou relatório desatualizado.
          </p>
          <p>
            Sincronizar o relatório não substitui a revisão funcional. A
            conferência automática não julga se a ficha explica corretamente a
            mudança.
          </p>
        </section>
        <section>
          <h3>Onde atualizar</h3>
          <p>
            Edite os registros no repositório. Esta tela reúne as fontes e o
            relatório gerado, com histórico mantido no Git.
          </p>
          <dl>
            {governance.sources.map((source) => (
              <div key={source.path}>
                <dt>
                  <code>{source.path}</code>
                </dt>
                <dd>{source.purpose}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </section>
  );
}
