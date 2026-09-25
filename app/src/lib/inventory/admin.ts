import type { Screen, ScreenSpecification } from "./types";

/** Frontend preview only. Production capabilities remain proposed. */
export const adminDefinitions = [
  {
    id: "AD-002",
    name: "Visão geral",
    path: "/admin",
    surface: "Página; Operação e, depois, Indicadores",
    priority: "P0",
    purpose: "Começar o turno pelas intervenções prioritárias.",
  },
  {
    id: "AD-003",
    name: "Fila de trabalho",
    path: "/admin/fila",
    surface:
      "Lista filtrável; visões rápidas em tabs com contagem; prévia em drawer",
    priority: "P0",
    purpose: "Filtrar, atribuir e investigar ocorrências.",
  },
  {
    id: "AD-004",
    name: "Ocorrência",
    path: "/admin/fila/:ocorrenciaId",
    surface: "Página; Atendimento, Relacionados e Histórico",
    priority: "P0",
    purpose: "Entender causa, recuperação e histórico do atendimento.",
  },
  {
    id: "AD-005",
    name: "Organizações",
    path: "/admin/organizacoes",
    surface: "Tabela; cadastro curto em drawer",
    priority: "P0",
    purpose: "Localizar organizações e sua situação operacional.",
  },
  {
    id: "AD-006",
    name: "Organização",
    path: "/admin/organizacoes/:organizacaoId",
    surface:
      "Página; Resumo, Equipe, Atividade, Acesso e dados, Contrato e uso, Histórico",
    priority: "P0",
    purpose: "Diagnosticar ativação, vínculos e restrições da organização.",
  },
  {
    id: "AD-007",
    name: "Registros",
    path: "/admin/registros",
    surface: "Lista por tipo; filtros compartilhados",
    priority: "P0",
    purpose: "Localizar objetos, dossiês, solicitações e análises.",
  },
  {
    id: "AD-008",
    name: "Ativo ou lote",
    path: "/admin/objetos/:objetoId",
    surface: "Página; Resumo, Dossiês e Histórico",
    priority: "P0",
    purpose:
      "Inspecionar atributos e dossiês sem alterar a declaração do cliente.",
  },
  {
    id: "AD-009",
    name: "Dossiê",
    path: "/admin/dossies/:dossieId",
    surface: "Página; Conteúdo, Versões, Compartilhamentos e Histórico",
    priority: "P0",
    purpose: "Consultar conteúdo e compartilhamentos da versão selecionada.",
  },
  {
    id: "AD-010",
    name: "Análise",
    path: "/admin/analises/:analiseId",
    surface: "Página; Resumo, Solicitações, Base e conclusão, Histórico",
    priority: "P0",
    purpose: "Identificar a base histórica e as pendências da análise.",
  },
  {
    id: "AD-011",
    name: "Evidência",
    path: "/admin/evidencias/:evidenciaId",
    surface: "Viewer em página com painel de metadados e versão explícita",
    priority: "P0",
    purpose: "Consultar evidência e seus metadados no contexto da versão.",
  },
  {
    id: "AD-012",
    name: "Comparação de versões",
    path: "/admin/comparacoes",
    surface: "Página; pares autorizados e diferenças",
    priority: "P0",
    purpose: "Comparar duas versões identificadas sem promover resultados.",
  },
  {
    id: "AD-013",
    name: "Verificações",
    path: "/admin/verificacoes",
    surface: "Tabela; filtros independentes de execução, resultado e validade",
    priority: "P0",
    purpose: "Separar execução, resultado técnico e validade.",
  },
  {
    id: "AD-014",
    name: "Execução",
    path: "/admin/verificacoes/:execucaoId",
    surface:
      "Página; Resumo, Entradas e resultado, Tentativas, Eventos técnicos",
    priority: "P0",
    purpose: "Investigar entradas, tentativas e recuperação elegível.",
  },
  {
    id: "AD-015",
    name: "Modelos e regras",
    path: "/admin/modelos",
    surface: "Página; Requisitos, Tipos de objeto e Métodos",
    priority: "P0",
    purpose: "Encontrar requisitos, tipos e métodos versionados.",
  },
  {
    id: "AD-016",
    name: "Modelo ou método",
    path: "/admin/modelos/:modeloId",
    surface: "Página; Definição, Versões, Uso e Histórico",
    priority: "P0",
    purpose: "Consultar definição, versões, alcance e uso do modelo.",
  },
  {
    id: "AD-017",
    name: "Editor de modelo",
    path: "/admin/modelos/:modeloId/editar",
    surface: "Página; seções de edição e revisão de publicação",
    priority: "P1",
    purpose: "Preparar rascunho e revisar diferenças antes da publicação.",
  },
  {
    id: "AD-018",
    name: "Integrações",
    path: "/admin/integracoes",
    surface: "Página; Conexões e Comunicações",
    priority: "P0",
    purpose: "Diagnosticar dependências e entregas de comunicação.",
  },
  {
    id: "AD-019",
    name: "Integração",
    path: "/admin/integracoes/:integracaoId",
    surface: "Página; Resumo, Configuração, Entregas e Histórico",
    priority: "P0",
    purpose: "Consultar configuração, saúde e tentativas da integração.",
  },
  {
    id: "AD-020",
    name: "Pessoas e acessos",
    path: "/admin/acessos",
    surface: "Página; Pessoas, Equipe interna e Concessões temporárias",
    priority: "P0",
    purpose:
      "Consultar identidades, equipe interna e concessões separadamente.",
  },
  {
    id: "AD-021",
    name: "Pessoa",
    path: "/admin/acessos/pessoas/:pessoaId",
    surface: "Página; Perfil, Vínculos e permissões, Sessões e Histórico",
    priority: "P0",
    purpose: "Explicar vínculos e sessões por contexto.",
  },
  {
    id: "AD-022",
    name: "Papéis e políticas de acesso",
    path: "/admin/acessos/politicas",
    surface: "Página; matriz legível e versões; sem editor genérico no piloto",
    priority: "P0",
    purpose: "Consultar capacidades e limites dos papéis internos.",
  },
  {
    id: "AD-023",
    name: "Auditoria",
    path: "/admin/auditoria",
    surface: "Tabela; evento em drawer; exportação contextual",
    priority: "P0",
    purpose: "Reconstruir autoria, alcance e efeito de uma intervenção.",
  },
  {
    id: "AD-024",
    name: "Configurações",
    path: "/admin/configuracoes",
    surface: "Página; Operação, Dados e retenção, Recursos e mudanças",
    priority: "P0",
    purpose: "Consultar políticas operacionais e sua fonte.",
  },
  {
    id: "AD-025",
    name: "Entrada administrativa",
    path: "/admin/entrar",
    surface: "Página de autenticação, verificação adicional e recuperação",
    priority: "P0",
    purpose:
      "Explicar requisitos de entrada administrativa e acessar a prévia.",
  },
  {
    id: "AD-026",
    name: "Revisão de intervenção",
    path: "/admin/intervencoes/:intervencaoId",
    surface: "Página com escopo, diff, aprovação, execução e recibo",
    priority: "P0",
    purpose: "Revisar alvos, efeitos, aprovação e recibo da intervenção.",
  },
  {
    id: "AD-027",
    name: "Resultados de busca",
    path: "/admin/busca",
    surface: "Página agrupada por tipo, com filtros e prévia",
    priority: "P1",
    purpose: "Encontrar contexto por nome ou ID.",
  },
] as const;

const adminContracts: Record<
  string,
  { data: string[]; action: string; acceptance: string }
> = {
  "AD-002": {
    data: [
      "Contagens de ocorrências críticas, sem responsável, aprovações e falhas recuperáveis",
      "Ocorrências prioritárias, atribuições da operadora e saúde observada por serviço",
      "Atividade recente com links aos eventos de auditoria; data do cenário explicitamente demonstrativo",
    ],
    action: "Abrir fila de trabalho",
    acceptance:
      "Cada indicador abre um filtro correspondente; saúde desconhecida não é exibida como operacional. Ocorrências e eventos recentes abrem o contexto canônico com ID preservado.",
  },
  "AD-003": {
    data: [
      "Prioridade, título, tipo, organização, etapa, estado, responsável, espera e atualização",
      "Busca, visão rápida, prioridade, estado, tipo, responsável, etapa e ordem na URL",
    ],
    action: "Nova ocorrência",
    acceptance:
      "Selecionar a linha abre uma única prévia; abrir detalhe e voltar preserva a query da lista.",
  },
  "AD-004": {
    data: [
      "ID, causa, plano de recuperação, responsável, objeto e versão",
      "Linha do tempo, nota interna local, comunicação externa, relacionados e histórico",
    ],
    action: "Investigar execução",
    acceptance:
      "O link do dossiê relacionado conserva a versão da ocorrência, inclusive V-001 histórica.",
  },
  "AD-005": {
    data: [
      "Identidade, produto, situação operacional, responsável e última atividade",
      "Filtros de produto e situação; cadastro demonstrativo com contato e finalidade",
    ],
    action: "Cadastrar organização",
    acceptance: "Busca por nome/ID e filtros sobrevivem ao recarregamento.",
  },
  "AD-006": {
    data: [
      "Identidade, ativação, equipe, registros, acesso, condição do piloto e histórico",
      "Contato administrativo permitido e restrições separadas de saúde técnica",
    ],
    action: "Abrir ocorrência",
    acceptance:
      "Organização suspensa explica a restrição; contrato e consumo não apresentam preços inventados.",
  },
  "AD-007": {
    data: [
      "Índice por ativos/lotes, dossiês, solicitações e análises",
      "Organização de origem, contraparte, versão, estado específico e identificador",
    ],
    action: "Abrir registro",
    acceptance:
      "A escolha de tipo altera colunas; limpar filtros conserva o tipo de registro escolhido.",
  },
  "AD-008": {
    data: [
      "Tipo, categoria, quantidade com unidade, local, organização e fonte",
      "Dossiê relacionado com finalidade, versão e destinatário",
    ],
    action: "Apontar problema operacional",
    acceptance:
      "Não existe ação para alterar declaração substantiva da origem pelo Admin.",
  },
  "AD-009": {
    data: [
      "Versão selecionada, autor, requisitos, evidências e verificações da versão",
      "Versões disponíveis, compartilhamentos e eventos",
    ],
    action: "Selecionar versão",
    acceptance:
      "Uma versão inexistente apresenta estado próprio; nunca substitui silenciosamente a base histórica.",
  },
  "AD-010": {
    data: [
      "Organização analista, responsável, pendência, próximo ator e finalidade",
      "Solicitação, base histórica, versão recebida e restrição da conclusão",
    ],
    action: "Abrir ocorrência",
    acceptance:
      "A decisão e as notas do cliente não são editáveis pelo suporte.",
  },
  "AD-011": {
    data: [
      "Documento fictício em HTML ou estado restrito/sem prévia",
      "Metadados, autoria, recebimento, requisito, dossiê, versão, zoom e página",
    ],
    action: "Ler evidência demonstrativa",
    acceptance:
      "Evidência fora da versão é rejeitada; arquivo restrito não contém o elemento de leitura.",
  },
  "AD-012": {
    data: [
      "Dossiê, base, alvo, quantidade antes/depois e evidência acrescentada/removida",
      "Resumo de impacto sobre verificações e links de contexto",
    ],
    action: "Comparar versões",
    acceptance:
      "O par deve existir e conter versões distintas; não promove resultado entre versões.",
  },
  "AD-013": {
    data: [
      "Objeto, versão, método e versão do método, execução, resultado, validade, início e duração",
      "Filtros independentes e conjunto explicitamente selecionado",
    ],
    action: "Revisar reprocessamento",
    acceptance:
      "Execuções inelegíveis aparecem excluídas na revisão do conjunto fixado.",
  },
  "AD-014": {
    data: [
      "Entrada, método, estado de execução, resultado, validade, tentativas e erro classificado",
      "Integração responsável, recuperação possível e referências técnicas minimizadas",
    ],
    action: "Tentar novamente",
    acceptance:
      "Repetir fica indisponível para execuções inelegíveis; timeout exige consultar a intervenção.",
  },
  "AD-015": {
    data: [
      "Nome, tipo, proprietário, escopo, versão e situação de publicação",
      "Tabs Requisitos, Tipos de objeto e Métodos",
    ],
    action: "Criar modelo",
    acceptance:
      "Busca e tabs não misturam tipos; métodos não recebem editor de código livre.",
  },
  "AD-016": {
    data: [
      "Definição, requisitos/entradas, propriedade, escopo, versão, uso e histórico",
    ],
    action: "Preparar rascunho",
    acceptance:
      "Preparar rascunho não altera a publicação consultada nem os casos já enviados.",
  },
  "AD-017": {
    data: [
      "Nome, finalidade, requisitos, prévia Assets/Investors e diff",
      "Rascunho em sessionStorage por ID; estado sujo e erro de gravação",
    ],
    action: "Salvar rascunho local",
    acceptance:
      "Recarregar recupera o rascunho; navegar com alterações oferece continuar ou descartar; publicar permanece indisponível.",
  },
  "AD-018": {
    data: [
      "Serviço, finalidade, proprietário, ambiente, saúde, horário e último sucesso",
      "Comunicações com estado conhecido, destino minimizado e tentativas",
    ],
    action: "Adicionar conexão",
    acceptance:
      "Ausência de observação aparece como desconhecido; nenhum conector real é ativado.",
  },
  "AD-019": {
    data: [
      "Capacidade, dependências, proprietário, observação de saúde e configuração",
      "Referência mascarada da credencial, entregas, execuções e histórico",
    ],
    action: "Consultar integração",
    acceptance:
      "Não apresenta segredo nem endpoint real; reenvio exige elegibilidade do evento.",
  },
  "AD-020": {
    data: [
      "Pessoas, identidades internas, papéis, vínculo, organização e último acesso",
      "Concessões e pedido de suporte separados dos vínculos de cliente",
    ],
    action: "Convidar participante",
    acceptance:
      "Tabs de pessoas e equipe interna mantêm contextos separados; pedido não concede leitura.",
  },
  "AD-021": {
    data: [
      "Identidade, contato permitido, contexto do vínculo, capacidade e vigência",
      "Diagnóstico demonstrativo, sessão identificada e histórico",
    ],
    action: "Alterar vínculo",
    acceptance:
      "Revogação tem alvo de sessão próprio e não representa exclusão da identidade.",
  },
  "AD-022": {
    data: [
      "Capacidade, escopo, condição por papel e origem da política",
      "Situação de publicação e necessidade de revisão independente",
    ],
    action: "Consultar capacidades",
    acceptance:
      "Matriz é leitura de proposta e não opera como autorização no navegador.",
  },
  "AD-023": {
    data: [
      "Momento BRT, ator, ação, alvo, organização, resultado, justificativa e correlação",
      "Seleção fixada de eventos para revisão de exportação",
    ],
    action: "Exportar seleção",
    acceptance:
      "Evento não é editável; exportação é revisão contextual sem geração de arquivo restrito.",
  },
  "AD-024": {
    data: [
      "Responsáveis, metas ainda não definidas, classes de dados e dependências",
      "Fonte da configuração, situação, recursos habilitados e responsabilidade de mudança",
    ],
    action: "Consultar políticas",
    acceptance:
      "Retenção não presume prazo único; Admin de produção aparece como não habilitado.",
  },
  "AD-025": {
    data: [
      "Marca, ambiente, condição de identidade corporativa e recuperação",
      "Destino local de retorno validado e acesso à demonstração",
    ],
    action: "Explorar demonstração local",
    acceptance:
      "Não coleta credenciais, não cria sessão administrativa e não aceita destino externo no retorno.",
  },
  "AD-026": {
    data: [
      "Alvos fixados, versão, autor, motivo, efeitos, elegíveis, excluídos e revisor",
      "Estado conhecido, execução por item e ausência explícita de recibo confirmado",
    ],
    action: "Consultar andamento",
    acceptance:
      "Resultado desconhecido nunca é apresentado como sucesso; execução real permanece bloqueada.",
  },
  "AD-027": {
    data: [
      "Nome/ID, tipo, organização, estado e link canônico dos resultados",
      "Grupos Organizações, Pessoas, Registros, Execuções e Ocorrências",
    ],
    action: "Abrir resultado",
    acceptance:
      "Busca vazia orienta a tarefa; sem resultado não substitui silenciosamente a consulta. Campo global ou modal AD-S27 enviam a consulta por ?q=; Cmd/Ctrl+K não abre um segundo diálogo.",
  },
};

function adminSource(id: string): string {
  const n = Number(id.slice(3));
  const file =
    n <= 6
      ? "AdminOperations"
      : n <= 12
        ? "AdminRecords"
        : n <= 19
          ? "AdminPlatform"
          : "AdminGovernance";
  return `app/src/routes/admin/${file}.tsx`;
}

export const adminScreens: Screen[] = adminDefinitions.map((item) => ({
  id: item.id,
  app: "admin",
  name: item.name,
  objective: item.purpose,
  owner: "Produto + operação + engenharia",
  lifecycle: "existing",
  source: adminSource(item.id),
  route: { path: item.path, origin: "app" },
  kind: "page",
  operations: ["admin.consultarPrevia", "admin.prepararIntervencao"],
  states: [
    "pronto",
    "sem-resultados",
    "nao-encontrado",
    "conteudo-restrito",
    "revisao-local",
    "envio-indisponivel",
  ],
  notes: `${item.surface}. Prévia local com dados fictícios; não comprova autenticação, autorização, persistência ou execução administrativa. Contratos de produção pendentes.`,
}));

export const adminSpecifications: ScreenSpecification[] = adminDefinitions.map(
  (item) => ({
    screen: item.id,
    priority: item.priority,
    actor: `${item.purpose} Operador interno na prévia demonstrativa.`,
    entry: `Navegação administrativa ou link direto ${item.path}.`,
    context: [
      "Ambiente de demonstração explícito; dados fictícios",
      "Organização, objeto e versão identificados; query preservada",
      "Refinamento visual do Admin com materiais, elevação, controles e tipografia do DS Lastre; referências de telas consultadas no Mobbin",
      item.surface,
    ],
    data: adminContracts[item.id].data,
    primaryAction: {
      label: adminContracts[item.id].action,
      effect:
        "Navegar, filtrar e preparar revisão local. Não envia comando administrativo.",
      enabledWhen:
        "Objeto demonstrativo existente e formulário válido; execução real indisponível.",
    },
    permissions: [
      "Entrada excluída do build público; não existe sessão administrativa no servidor.",
      "Conteúdo restrito permanece fechado; um pedido não cria concessão.",
      "Envio, aprovação, exportação restrita e mutações exigem backend próprio.",
    ],
    recovery: [
      "Sem resultados permite limpar filtros; ID desconhecido oferece retorno à lista.",
      "Diálogos preservam foco, contêm teclado e exigem revisão de alterações antes de fechar.",
      "Falha de armazenamento local é informada; nunca exibe sucesso de servidor.",
    ],
    versioning:
      "Versão selecionada permanece na URL e no contexto da revisão. Edição local não altera publicações nem decisões históricas.",
    notifications:
      "Notificações são exemplos identificados; nenhuma mensagem é enviada.",
    acceptance: [
      adminContracts[item.id].acceptance,
      "Rota e tabs abrem sem depender de serviços externos.",
      "Filtros, seleção e tabs são recuperáveis por URL; parâmetros desconhecidos têm fallback seguro.",
      "Objetos desconhecidos não exibem silenciosamente outro registro.",
      "Ações críticas mostram alvo, versão, motivo e efeito; envio fica indisponível sem backend.",
      "Desktop e celular preservam nome, contexto e ação acessível.",
      "Shell, tabelas, filtros e painéis usam os mesmos tokens e componentes do DS nos temas claro e escuro; movimento reduzido é respeitado.",
      "Mesmo padrão de UI de Assets: listas no DataTable compartilhado (resumo, Exibição com colunas e densidade, paginação local de 10 itens, cartões abaixo de 640 px da tabela), tabs sublinhadas, filtros em Select com rótulo embutido e painéis laterais do kit. A página atual da tabela não fica mais na URL.",
      "Buscas, campos e ações secundárias têm bordas sutis em repouso e hover discreto. O foco usa um único contorno fino, sem halo ou anéis sobrepostos; campos inválidos preservam a sinalização de erro.",
      "Busca global disponível em qualquer largura; Cmd/Ctrl+K foca a busca ou abre o painel móvel. Escape fecha e devolve o foco.",
      "Esta ficha descreve a prévia; as jornadas operacionais de produção continuam propostas.",
    ],
    dependencies: [
      "docs/LASTRE_ADMIN_ARCHITECTURE.md",
      "Fixtures locais e componentes do design system",
      "API administrativa protegida, auditoria durável e provedor de identidade pendentes",
    ],
  }),
);

/** Stable IDs for hosted surfaces, also used by the inventory visual gallery. */
export const adminSurfaceDefinitions = [
  {
    id: "AD-S01",
    name: "Prévia de ocorrência",
    host: "AD-003",
    path: "/admin/fila",
    source: "app/src/routes/admin/AdminOperations.tsx",
    format: "drawer",
    trigger: "Selecionar prévia da linha",
    data: "Situação, contexto, responsável, próximo passo e link canônico",
  },
  {
    id: "AD-S02",
    name: "Criar ocorrência",
    host: "AD-003",
    path: "/admin/fila",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer",
    trigger: "Nova ocorrência",
    data: "Tipo, título, descrição, organização, objeto e atribuição",
  },
  {
    id: "AD-S03",
    name: "Atribuir responsável",
    host: "AD-004",
    path: "/admin/fila/:ocorrenciaId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal curto",
    trigger: "Atribuir responsável",
    data: "Pessoas elegíveis, alvo e revisão da atribuição; prioridade tem formulário associado com motivo",
  },
  {
    id: "AD-S04",
    name: "Resolver atendimento",
    host: "AD-004",
    path: "/admin/fila/:ocorrenciaId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Resolver atendimento",
    data: "Diagnóstico, ação realizada e evidência de recuperação",
  },
  {
    id: "AD-S05",
    name: "Comunicar organização",
    host: "AD-004",
    path: "/admin/fila/:ocorrenciaId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal com compositor",
    trigger: "Mensagem para a organização",
    data: "Destinatário, canal, mensagem externa e prévia; notas locais permanecem separadas",
  },
  {
    id: "AD-S06",
    name: "Cadastrar organização",
    host: "AD-005",
    path: "/admin/organizacoes",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer",
    trigger: "Cadastrar organização",
    data: "Nome, identificação mínima, contato, produto e finalidade",
  },
  {
    id: "AD-S07",
    name: "Convidar participante",
    host: "AD-020",
    path: "/admin/acessos",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer",
    trigger: "Convidar participante",
    data: "Destinatário, contexto, papel, escopo, vigência e motivo",
  },
  {
    id: "AD-S08",
    name: "Alterar vínculo",
    host: "AD-021",
    path: "/admin/acessos/pessoas/:pessoaId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer com revisão",
    trigger: "Alterar vínculo",
    data: "Capacidade anterior, proposta, escopo e motivo",
  },
  {
    id: "AD-S09",
    name: "Revogar sessão",
    host: "AD-021",
    path: "/admin/acessos/pessoas/:pessoaId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Sessões → Revogar esta sessão",
    data: "Sessão identificada, pessoa, alcance, efeito e motivo",
  },
  {
    id: "AD-S10",
    name: "Solicitar acesso de suporte",
    host: "AD-011",
    path: "/admin/evidencias/:evidenciaId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer",
    trigger: "Solicitar acesso de suporte",
    data: "Objeto e versão, finalidade, capacidade e duração; pedido não libera conteúdo",
  },
  {
    id: "AD-S11",
    name: "Aprovar acesso temporário",
    host: "AD-020",
    path: "/admin/acessos",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Concessões temporárias → Explorar revisão",
    data: "Beneficiário, escopo revisado, duração, motivo e autoridade independente",
  },
  {
    id: "AD-S12",
    name: "Suspender ou reativar organização",
    host: "AD-006",
    path: "/admin/organizacoes/:organizacaoId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Acesso e dados → Suspender ou reativar",
    data: "Alcance, restrições, motivo, recuperação e política pendente",
  },
  {
    id: "AD-S13",
    name: "Repetir execução",
    host: "AD-014",
    path: "/admin/verificacoes/:execucaoId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Tentar novamente",
    data: "Entrada, versão, método, tentativa anterior e motivo; apenas execuções elegíveis",
  },
  {
    id: "AD-S14",
    name: "Revogar resultado",
    host: "AD-014",
    path: "/admin/verificacoes/:execucaoId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Entradas e resultado → Revogar validade",
    data: "Fundamento, análises afetadas e responsável; resultado histórico preservado",
  },
  {
    id: "AD-S15",
    name: "Criar ou duplicar modelo",
    host: "AD-015",
    path: "/admin/modelos",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Criar modelo ou preparar duplicação",
    data: "Tipo, nome, proprietário e origem; editor de exemplo acessível após salvar preparação",
  },
  {
    id: "AD-S16",
    name: "Publicar modelo",
    host: "AD-017",
    path: "/admin/modelos/:modeloId/editar",
    source: "app/src/routes/admin/AdminPlatform.tsx",
    format: "seção inline",
    trigger: "Revisão",
    data: "Diff de nome, finalidade e requisitos; vigência, alcance e ação de publicação indisponível",
  },
  {
    id: "AD-S17",
    name: "Adicionar conexão",
    host: "AD-018",
    path: "/admin/integracoes",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer",
    trigger: "Adicionar conexão",
    data: "Conector suportado, responsável, ambiente e finalidade",
  },
  {
    id: "AD-S18",
    name: "Criar ou rotacionar credencial",
    host: "AD-019",
    path: "/admin/integracoes/:integracaoId",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "drawer",
    trigger: "Configuração → Revisar rotação",
    data: "Escopo, duração, proprietário e transição; nenhum segredo coletado ou gerado",
  },
  {
    id: "AD-S19",
    name: "Inspecionar entrega",
    host: "AD-019",
    path: "/admin/integracoes/:integracaoId",
    source: "app/src/routes/admin/AdminPlatform.tsx",
    format: "drawer",
    trigger: "Entregas → Selecionar linha",
    data: "Evento, destino minimizado, estado, tentativas e reenvio elegível",
  },
  {
    id: "AD-S20",
    name: "Inspecionar evento",
    host: "AD-023",
    path: "/admin/auditoria",
    source: "app/src/routes/admin/AdminGovernance.tsx",
    format: "drawer",
    trigger: "Selecionar evento",
    data: "Ator, alvo, motivo, resultado e correlação; somente leitura",
  },
  {
    id: "AD-S21",
    name: "Exportar seleção",
    host: "AD-023",
    path: "/admin/auditoria",
    source: "app/src/routes/admin/AdminActions.tsx",
    format: "modal",
    trigger: "Exportar seleção",
    data: "Seleção fixada, campos, finalidade e disponibilidade; nenhum arquivo restrito é gerado",
  },
  {
    id: "AD-S22",
    name: "Acompanhar exportações",
    host: "AD-002",
    path: "/admin",
    source: "app/src/routes/admin/AdminLayout.tsx",
    format: "drawer",
    trigger: "Conta ou notificações → Exportações",
    data: "Exemplo de tarefa em preparação, link para AD-026 e download indisponível",
  },
  {
    id: "AD-S23",
    name: "Central de notificações",
    host: "AD-002",
    path: "/admin",
    source: "app/src/routes/admin/AdminLayout.tsx",
    format: "drawer",
    trigger: "Notificações na barra superior",
    data: "Atribuição e revisão de exemplo; marcar leitura na sessão e abrir contexto",
  },
  {
    id: "AD-S24",
    name: "Filtros avançados",
    host: "AD-003",
    path: "/admin/fila",
    source: "app/src/routes/admin/AdminUI.tsx",
    format: "drawer",
    trigger: "Filtros avançados",
    data: "Responsável e etapa, aplicar em conjunto, limpar critérios e recuperar pela URL",
  },
  {
    id: "AD-S25",
    name: "Conta e preferências",
    host: "AD-002",
    path: "/admin",
    source: "app/src/routes/admin/AdminLayout.tsx",
    format: "drawer",
    trigger: "Conta no rodapé ou navegação móvel",
    data: "Identidade de exemplo, tema, densidade, fuso e retorno à entrada; não autoriza acesso",
  },
  {
    id: "AD-S26",
    name: "Ficha do inventário",
    host: "AD-001",
    path: "/admin/inventario",
    source: "app/src/routes/admin/InventoryScreenDrawer.tsx",
    format: "drawer com tabs",
    trigger: "Selecionar ficha",
    data: "Visão geral, contrato, estados, operações e fluxos; implementação preservada",
  },
  {
    id: "AD-S27",
    name: "Busca global compacta",
    host: "AD-027",
    path: "/admin/busca",
    source: "app/src/routes/admin/AdminLayout.tsx",
    format: "modal",
    trigger: "Ícone de busca no shell compacto ou Cmd/Ctrl+K abaixo de 1051 px",
    data: "Consulta por nome ou ID; foco inicial no campo, envio para AD-027 via ?q=, Escape retorna ao acionador. Acima de 1050 px, o atalho foca o campo da barra superior.",
  },
] as const;

export const adminSurfaces: Screen[] = adminSurfaceDefinitions.map((s) => ({
  id: s.id,
  app: "admin",
  name: s.name,
  objective: s.data,
  owner: "Produto + operação + engenharia",
  lifecycle: "existing",
  route: { path: s.path, origin: "app" },
  kind: "hosted",
  source: s.source,
  operations:
    s.id === "AD-S27"
      ? ["admin.consultarPrevia"]
      : s.id === "AD-S26"
        ? []
        : ["admin.consultarPrevia", "admin.prepararIntervencao"],
  states:
    s.id === "AD-S27"
      ? ["aberto", "fechado", "consulta-vazia", "consulta-preenchida"]
      : s.source.endsWith("AdminActions.tsx")
        ? [
            "aberto",
            "fechado",
            "preenchido",
            "validacao",
            "revisao-local",
            "preparacao-local-salva",
            "falha-ao-salvar",
            "conteudo-extenso",
            "envio-indisponivel",
          ]
        : ["aberto", "fechado", "revisao-local", "envio-indisponivel"],
  notes: `Hospedeira ${s.host}; ${s.format}; gatilho: ${s.trigger}. Interface local; envio e autorização de produção não implementados.`,
}));
export const adminSurfaceSpecifications: ScreenSpecification[] =
  adminSurfaceDefinitions.map((s) => ({
    screen: s.id,
    priority: "P0",
    actor: `Operador demonstrativo: ${s.name.toLowerCase()}.`,
    entry: `${s.host} → ${s.trigger}.`,
    context: [
      s.host,
      "Ambiente local explícito",
      "Alvo, organização e versão quando aplicáveis",
      `Consultável na galeria de AD-001 por /admin/inventario?view=superficies&buscaSuperficie=${s.id}; prévia viva da tela original, cenários demonstrativos e comparação sem sair do inventário`,
    ],
    data: [s.data],
    primaryAction: {
      label: s.trigger,
      effect:
        "Consultar contexto ou preparar revisão local; nenhum comando administrativo real é enviado.",
      enabledWhen:
        "Superfície disponível na hospedeira e entrada local válida; confirmação real indisponível.",
    },
    permissions: [
      "A presença de uma ação não comprova autoridade no servidor.",
      "Documentos restritos, segredos e notas de clientes não são expostos.",
    ],
    recovery: [
      "Escape fecha o painel e devolve foco; alterações de formulário pedem continuar ou descartar.",
      "A troca de prévia por confirmação remove a superfície anterior.",
      "Falha ao salvar preparação não exibe confirmação de sucesso.",
    ],
    versioning:
      "Alvo e versão são fixados no contexto da revisão. Nenhuma publicação ou decisão histórica é alterada.",
    notifications:
      "Retornos apenas locais e claramente identificados; nenhuma comunicação externa enviada.",
    acceptance: [
      "Somente uma superfície bloqueante por vez.",
      "Título, fechar, campos e revisão acessíveis por teclado e no celular.",
      "Escopo e limites reais da ação visíveis antes de preparar a revisão.",
      "Operações críticas permanecem indisponíveis sem contrato administrativo.",
      "No laboratório AD-001, a mesma tela é renderizada em frame; cenários são demonstrativos e alterações efêmeras. Comparação não compartilha campos entre instâncias.",
    ],
    dependencies: [
      s.source,
      `Hospedeira ${s.host}`,
      "API administrativa protegida para execução futura",
    ],
    ...(s.id === "AD-S27"
      ? {
          entry:
            "Busca disponível em todas as páginas do shell; ícone compacto ou Cmd/Ctrl+K.",
          context: [
            "Ambiente local explícito",
            "Consulta por nome ou ID",
            "Página de resultados AD-027",
          ],
          primaryAction: {
            label: "Buscar",
            effect:
              "Fecha o modal e navega para /admin/busca?q= com a consulta codificada; consulta vazia abre a orientação da busca.",
            enabledWhen:
              "Prévia local disponível; não depende de permissão ou API administrativa.",
          },
          recovery: [
            "Escape fecha o modal e devolve foco ao ícone de busca.",
            "Sem resultado oferece revisar a consulta; URL conserva o texto após recarregar.",
          ],
          versioning:
            "Consulta representada na URL; não altera registros, versões ou rascunhos.",
          notifications: "Nenhuma notificação ou mensagem externa.",
          acceptance: [
            "Foco inicial no campo e envio por Enter ou pelo botão Buscar.",
            "Até 1050 px, Cmd/Ctrl+K abre o modal; acima disso foca o campo da barra.",
            "Repetir o atalho com um diálogo aberto mantém o foco e não empilha superfícies.",
            "Fechar não navega; enviar abre resultados pelo mesmo texto consultado.",
          ],
          dependencies: [s.source, "AD-027 e fixtures locais de busca"],
        }
      : {}),
  }));
