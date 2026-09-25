import type { Flow } from "./types";

/** Declared product journeys. Evidence for implemented Assets flows: app/test/assetsJourney.browser.py. */
export const flows: Flow[] = [
  {
    id: "JA-08",
    name: "Explorar modais e drawers do Admin",
    status: "implemented",
    precondition: "Inventário disponível na prévia local de desenvolvimento.",
    steps: [
      {
        screen: "AD-001",
        action:
          "Abrir Modais e drawers, buscar pelo nome ou ID e filtrar o formato.",
      },
      {
        screen: "AD-S02",
        action:
          "Interagir com Criar ocorrência na prévia viva; alternar formulário, validação, revisão e conteúdo extenso.",
      },
      {
        screen: "AD-S03",
        action:
          "Comparar estados do modal Atribuir responsável lado a lado no inventário, em viewport amplo ou móvel.",
      },
      {
        screen: "AD-001",
        action:
          "Fechar ou reiniciar a prévia, protegendo campos alterados; retomar o índice com filtros e cenário preservados.",
      },
    ],
    result:
      "Formato, gatilho e contexto inspecionados. Nenhum comando administrativo enviado; preparação permanece local.",
  },
  {
    id: "JA-07",
    name: "Encontrar contexto na prévia administrativa",
    status: "implemented",
    precondition:
      "Prévia local de desenvolvimento; não requer nem cria sessão administrativa.",
    steps: [
      {
        screen: "AD-002",
        action:
          "Acionar a busca global pelo campo, ícone compacto ou Cmd/Ctrl+K.",
      },
      {
        screen: "AD-S27",
        action:
          "No shell compacto, digitar nome ou ID no modal; no desktop usar o campo da barra. Escape fecha sem navegar e devolve foco.",
      },
      {
        screen: "AD-027",
        action:
          "Enviar a consulta; revisar resultados agrupados e abrir o registro pelo ID canônico.",
      },
    ],
    result:
      "Consulta recuperável por URL e navegação para contexto de demonstração. Nenhuma escrita de API ou autorização de produção.",
  },
  {
    id: "JA-01",
    name: "Recuperar falha de processamento",
    status: "proposed",
    precondition:
      "Autoridade e contratos de backend definidos; prévia permite apenas inspecionar a jornada.",
    steps: [
      {
        screen: "AD-002",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-004",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-014",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-019",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-026",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
    ],
    result:
      "Tentativa confirmada ligada à versão e evidência de recuperação. Backend ainda não implementado.",
  },
  {
    id: "JA-02",
    name: "Diagnosticar acesso a documento",
    status: "proposed",
    precondition:
      "Autoridade e contratos de backend definidos; prévia permite apenas inspecionar a jornada.",
    steps: [
      {
        screen: "AD-005",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-021",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-010",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-011",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
    ],
    result:
      "Causa identificada e concessão validada pelo servidor. Backend ainda não implementado.",
  },
  {
    id: "JA-03",
    name: "Ativar organização",
    status: "proposed",
    precondition:
      "Autoridade e contratos de backend definidos; prévia permite apenas inspecionar a jornada.",
    steps: [
      {
        screen: "AD-005",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-006",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-020",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
    ],
    result:
      "Convite e vínculo confirmados no contexto correto. Backend ainda não implementado.",
  },
  {
    id: "JA-04",
    name: "Publicar requisitos",
    status: "proposed",
    precondition:
      "Autoridade e contratos de backend definidos; prévia permite apenas inspecionar a jornada.",
    steps: [
      {
        screen: "AD-015",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-016",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-017",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-026",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
    ],
    result:
      "Publicação versionada sem alterar casos enviados. Backend ainda não implementado.",
  },
  {
    id: "JA-05",
    name: "Revogar acesso comprometido",
    status: "proposed",
    precondition:
      "Autoridade e contratos de backend definidos; prévia permite apenas inspecionar a jornada.",
    steps: [
      {
        screen: "AD-003",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-021",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-019",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-023",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
    ],
    result:
      "Revogação delimitada confirmada e auditada. Backend ainda não implementado.",
  },
  {
    id: "JA-06",
    name: "Atender pedido de dados",
    status: "proposed",
    precondition:
      "Autoridade e contratos de backend definidos; prévia permite apenas inspecionar a jornada.",
    steps: [
      {
        screen: "AD-004",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-024",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-026",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
      {
        screen: "AD-023",
        action: "Consultar contexto e revisar a etapa na prévia local.",
      },
    ],
    result:
      "Recibo por conjunto e impedimentos de retenção identificados. Backend ainda não implementado.",
  },
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
