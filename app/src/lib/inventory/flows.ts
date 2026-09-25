import type { Flow } from "./types";

/** Declared product journeys. Evidence for implemented Assets flows: app/test/assetsJourney.browser.py. */
export const flows: Flow[] = [
  {
    id: "FL-004",
    name: "Preparar e compartilhar sem convite",
    status: "implemented",
    precondition:
      "Sessão Assets e destinatário cadastrado em outra organização.",
    steps: [
      { screen: "LA-012", action: "Entrar ou criar organização" },
      { screen: "LA-003", action: "Salvar ativo como rascunho" },
      { screen: "LA-010", action: "Completar dados e anexar documentos" },
      { screen: "LA-015", action: "Revisar e confirmar compartilhamento" },
      { screen: "LA-014", action: "Destinatário consulta a versão autorizada" },
    ],
    result:
      "Snapshot imutável e recibo; acesso restrito à versão e à vigência. A troca de organização é um handoff.",
  },
  {
    id: "FL-005",
    name: "Colaboração com acesso delimitado",
    status: "implemented",
    precondition: "Administrador e cadastro existente.",
    steps: [
      { screen: "LA-011", action: "Criar convite com papel e objeto" },
      { screen: "LA-013", action: "Destinatário aceita com a conta indicada" },
      {
        screen: "LA-005",
        action: "Colaborador anexa documento somente ao lote autorizado",
      },
      {
        screen: "LA-007",
        action: "Responsável pelo envio revisa a contribuição",
      },
    ],
    result: "Autoria preservada; contribuição não autoriza envio externo.",
  },

  {
    id: "FL-001",
    name: "Apresentar um lote",
    status: "implemented",
    precondition:
      "Responsável autorizado na organização de origem; solicitação recebida.",
    steps: [
      { screen: "LA-008", action: "Encontrar a solicitação recebida" },
      { screen: "LA-006", action: "Conferir finalidade e requisitos" },
      {
        screen: "LA-009",
        action:
          "Cadastrar lote se ainda não existir; caso contrário, associar o existente",
      },
      { screen: "LA-005", action: "Organizar documentos do lote" },
      {
        screen: "LA-007",
        action: "Revisar destinatário e compartilhar a versão",
      },
    ],
    result:
      "Versão imutável compartilhada, com recibo e acesso limitado ao destinatário.",
  },
  {
    id: "FL-002",
    name: "Analisar e registrar uma decisão",
    status: "proposed",
    precondition:
      "Versão compartilhada com a organização analista; papel de decisor para concluir.",
    steps: [
      { screen: "LI-002", action: "Encontrar o caso" },
      { screen: "LI-003", action: "Examinar evidências e limitações" },
      { screen: "LI-005", action: "Revisar fundamentos e registrar a decisão" },
    ],
    result: "Decisão atribuída a uma pessoa e vinculada à versão examinada.",
  },
  {
    id: "FL-003",
    name: "Resolver uma pendência entre organizações",
    status: "proposed",
    precondition:
      "Analista identifica um requisito pendente na versão recebida.",
    steps: [
      { screen: "LI-003", action: "Identificar a pendência" },
      { screen: "LI-004", action: "Solicitar esclarecimento" },
      { screen: "LA-006", action: "Outra pessoa responde no Assets" },
      { screen: "LA-007", action: "Compartilhar a versão corrigida" },
      { screen: "LI-003", action: "Analista retoma o caso atualizado" },
    ],
    result:
      "Resposta e nova versão preservam o histórico. As trocas de ator são handoffs, não links de navegação.",
  },
];
