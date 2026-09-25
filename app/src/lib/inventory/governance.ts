/** This procedure is mirrored by AGENTS.md, the PR template and CI. */
export const governance = {
  rule: "Toda mudança na estrutura do frontend passa pelo inventário na mesma entrega.",
  scope:
    "Telas, rotas, navegação, layouts, componentes compartilhados, formulários, ações, estados, permissões e contratos de dados — no app, no site e no design system.",
  steps: [
    {
      title: "Identificar o impacto",
      description:
        "Localize as fichas e jornadas afetadas antes de implementar. Crie uma ficha planejada quando a tela for nova.",
    },
    {
      title: "Atualizar o contrato",
      description:
        "Registre propósito, entrada, dados, ações, permissões, estados, recuperação e aceitação. Atualize operações e fluxos quando necessário.",
    },
    {
      title: "Implementar e sincronizar",
      description:
        "Mantenha código e inventário na mesma entrega. Revise a tela após executar npm run inventory:sync.",
    },
    {
      title: "Conferir e entregar",
      description:
        "Execute inventory:check e inventory:test. Informe no PR os IDs afetados, a mudança e a validação realizada.",
    },
  ],
  commands: [
    "npm run inventory:sync",
    "npm run inventory:check",
    "npm run inventory:test",
  ],
  sources: [
    {
      path: "AGENTS.md",
      purpose: "Regra obrigatória para alterações no projeto",
    },
    {
      path: "docs/FRONTEND_INVENTORY.md",
      purpose: "Procedimento, escopo e limites da conferência",
    },
    {
      path: "app/src/lib/inventory/screens.ts",
      purpose: "Telas, rotas e estados",
    },
    {
      path: "app/src/lib/inventory/specifications.ts",
      purpose: "Contratos funcionais das telas",
    },
    {
      path: "app/src/lib/inventory/operations.ts",
      purpose: "Operações e dependências",
    },
    {
      path: "app/src/lib/inventory/flows.ts",
      purpose: "Jornadas e mudanças de responsável",
    },
    {
      path: ".github/workflows/ci.yml",
      purpose: "Conferência automática em cada PR",
    },
  ],
};
