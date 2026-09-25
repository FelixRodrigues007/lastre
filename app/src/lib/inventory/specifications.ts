import type { ScreenSpecification } from "./types";

/** Product contracts to review. They do not certify implemented behavior. */
export const specifications: ScreenSpecification[] = [
  {
    screen: "LA-001",
    priority: "P0",
    actor:
      "Retomar a tarefa prioritária — participante autorizado da organização.",
    entry: "Entrada após login ou navegação Início.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Contagens derivadas da organização",
      "Solicitações abertas, rascunhos e versões recebidas",
    ],
    primaryAction: {
      label: "Abrir tarefa",
      effect: "Navegar ao objeto ou solicitação com contexto preservado.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Indicadores refletem dados reais do workspace ou demonstração explicitamente identificada.",
      "Organização nova apresenta estado vazio com cadastro inicial.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-002",
    priority: "P0",
    actor: "Localizar um ativo — participante autorizado da organização.",
    entry: "Menu Meus ativos.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Ativos duradouros, categoria, setor, responsável, atualização",
      "Filtros de nome, setor, situação e modo de visualização na URL",
    ],
    primaryAction: {
      label: "Cadastrar ativo",
      effect: "Abrir cadastro de área, direito, projeto ou equipamento.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Pesquisa e filtros sobrevivem ao recarregamento.",
      "Arquivados são consultáveis por filtro; lista funciona no celular.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-003",
    priority: "P0",
    actor:
      "Criar um ativo identificável — participante autorizado da organização.",
    entry: "Cadastrar ativo na lista ou solicitação.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Tipo e setor",
      "Localização, responsável, área declarada, referência e descrição",
    ],
    primaryAction: {
      label: "Salvar rascunho",
      effect: "Persistir cadastro mínimo no servidor e abrir o dossiê.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Rascunho incompleto é permitido; envio exige os campos do tipo.",
      "Erros preservam campos enquanto o formulário está aberto.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-004",
    priority: "P0",
    actor:
      "Retomar um lote de produção — participante autorizado da organização.",
    entry: "Menu Lotes.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Identificação, material, quantidade com unidade e período",
      "Situação do cadastro e filtros na URL",
    ],
    primaryAction: {
      label: "Cadastrar lote",
      effect: "Abrir cadastro contextual de produção.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Quantidade nunca aparece sem unidade.",
      "Rascunhos e arquivados podem ser filtrados.",
      "Importação CSV com até 100 lotes valida o lote completo antes de gravar; erro não cria cadastros parciais e repetição não duplica.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-005",
    priority: "P0",
    actor:
      "Organizar o dossiê de um lote — participante autorizado da organização.",
    entry: "Lista de lotes ou solicitação.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Rascunho com revisão otimista",
      "Documentos, versões, verificações, histórico e compartilhamentos",
    ],
    primaryAction: {
      label: "Revisar compartilhamento",
      effect:
        "Abrir revisão exata do rascunho, condicionada ao papel de envio.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Editar ou substituir documento não altera uma versão enviada.",
      "Histórico compara campos e documentos entre versões.",
      "Exportação JSON identifica organização, versão, autoria e limites e registra um evento.",
      "Conferência de integridade tem método, versão, momento e limites.",
      "Arquivar mantém histórico e compartilhamentos; revogar é ação separada.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-008",
    priority: "P0",
    actor:
      "Encontrar uma solicitação — participante autorizado da organização.",
    entry: "Menu Solicitações.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Organização solicitante, finalidade e prazo",
      "Requisitos preparados e estado da resposta",
    ],
    primaryAction: {
      label: "Responder solicitação",
      effect: "Abrir pedido preservando seu cadastro associado.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Resposta enviada não é apresentada como aprovada.",
      "Listagem vazia não fabrica pedidos nem destinatários.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-009",
    priority: "P0",
    actor:
      "Cadastrar a produção solicitada — participante autorizado da organização.",
    entry: "Cadastrar lote ou criação a partir de uma solicitação.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Material ou produção, quantidade, unidade, período",
      "Ativo de origem opcional, responsável e localização",
    ],
    primaryAction: {
      label: "Salvar rascunho",
      effect:
        "Criar lote e associar à solicitação na mesma transação quando informado.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Período invertido e quantidade inválida são rejeitados no servidor.",
      "Mudança de setor limpa quantidade e explicita unidade; unidade não converte o valor.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-010",
    priority: "P0",
    actor:
      "Organizar o dossiê de um ativo — participante autorizado da organização.",
    entry: "Lista de ativos ou vínculo de origem.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Dados próprios do tipo de ativo",
      "Evidências, versões imutáveis, histórico e acessos",
    ],
    primaryAction: {
      label: "Revisar compartilhamento",
      effect: "Abrir confirmação de destinatário e versão do ativo.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Cadastro não comprova titularidade.",
      "Leitor não edita; colaborador acessa apenas o objeto atribuído.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-011",
    priority: "P0",
    actor:
      "Gerir organização e participação — participante autorizado da organização.",
    entry: "Menu Organização e equipe ou conta no celular.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Nome da organização e participantes",
      "Papéis, convites com validade, escopo de colaborador, preferências",
    ],
    primaryAction: {
      label: "Criar convite",
      effect: "Criar link com token aleatório, uso único e e-mail de destino.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Somente administrador gerencia pessoas na UI e API.",
      "Convite de colaborador exige objeto autorizado.",
      "Revogar convite impede aceitação; encerrar participação impede consultas posteriores.",
      "Link é copiado pelo usuário; nenhum e-mail é enviado.",
      "Alternar organização só aceita uma participação ativa da conta; mantém dados e papéis isolados.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-012",
    priority: "P0",
    actor:
      "Entrar em uma organização — participante autorizado da organização.",
    entry: "Entrada principal, sessão ausente ou convite.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Nome, e-mail, senha e organização",
      "Destino interno validado e acesso explícito à demonstração",
    ],
    primaryAction: {
      label: "Entrar na organização",
      effect:
        "Estabelecer sessão no servidor; criar organização vazia no cadastro.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Senhas são derivadas com scrypt e não retornam nas respostas.",
      "Cookie é HttpOnly e SameSite; token da sessão é armazenado como digest.",
      "Demonstração cria organização isolada e identificada.",
      "Produção requer operação de identidade, recuperação e verificação de e-mail antes de uso público.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-013",
    priority: "P0",
    actor:
      "Aceitar colaboração delimitada — participante autorizado da organização.",
    entry: "Link copiado pelo administrador.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: ["Organização, e-mail, papel, objeto e vigência do convite"],
    primaryAction: {
      label: "Aceitar convite",
      effect: "Criar ou validar a conta indicada e registrar participação.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Convite expirado, revogado ou utilizado não pode ser aceito.",
      "Uma conta diferente do destinatário não aceita o convite.",
      "O papel e o escopo são conferidos pelo servidor, sem conceder acesso geral a colaborador.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-014",
    priority: "P0",
    actor:
      "Consultar uma versão recebida — participante autorizado da organização.",
    entry: "Notificação ou seção Compartilhados com você no início.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Versão imutável recebida, remetente e finalidade",
      "Documentos autorizados e resultados limitados ao escopo",
    ],
    primaryAction: {
      label: "Consultar documento",
      effect:
        "Baixar somente quando a concessão permite, com registro da ação.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Acesso expirado ou revogado é negado na API e no arquivo.",
      "Trocar IDs não expõe outra versão ou documento.",
      "A nova versão do remetente não é herdada automaticamente.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-015",
    priority: "P0",
    actor:
      "Revisar envio de um ativo — participante autorizado da organização.",
    entry: "Dossiê de ativo ou solicitação associada.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: [
      "Destinatário, finalidade, revisão e documentos incluídos",
      "Vigência, download e recibo de recebimento",
    ],
    primaryAction: {
      label: "Confirmar compartilhamento",
      effect:
        "Preservar retrato do ativo e conceder acesso somente ao destinatário.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Aplicam-se os mesmos controles de versão e idempotência de LA-007.",
      "Campos incompletos e destinatário inexistente impedem envio.",
      "Destinatário com vários vínculos exige escolher a organização que receberá a versão.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-016",
    priority: "P0",
    actor: "Entrar no produto Assets — participante autorizado da organização.",
    entry: "URL raiz do app.",
    context: [
      "Organização ativa e papel da sessão",
      "Ambiente real local ou demonstração identificada",
    ],
    data: ["Destino /assets e sessão atual"],
    primaryAction: {
      label: "Abrir Assets",
      effect: "Redirecionar a entrada principal para Assets.",
      enabledWhen:
        "Sessão e papel adequados; campos exigidos presentes para a operação.",
    },
    permissions: [
      "Servidor aplica organização e escopo do objeto; estado local da interface não autoriza ações.",
      "Arquivos, versões e compartilhamentos obedecem ao vínculo e vigência.",
    ],
    recovery: [
      "Carregamento, ausência de dados e falha de serviço têm mensagens e caminho de retomada.",
      "Conflito de revisão não sobrescreve dados do servidor; recarregar e revisar explicitamente.",
      "Dados confirmados são persistidos por escrita atômica; campos não salvos permanecem somente no formulário.",
    ],
    versioning:
      "Rascunho tem revisão otimista; envio cria snapshot imutável com documentos, respostas, autoria e resultados próprios.",
    notifications:
      "Eventos ficam no histórico e na central interna contextual. Sem envio automático de e-mail.",
    acceptance: [
      "Console demonstrativo permanece em /console.",
      "Entrada em Assets não inicializa sessão falsa ou gate de idioma da demo antiga.",
    ],
    dependencies: [
      "API /api/assets e armazenamento local de instância única",
      "Tokens e símbolo compartilhados do design system",
      "Sessão do servidor e regras de autorização em assets/store.ts",
    ],
  },
  {
    screen: "LA-006",
    priority: "P0",
    actor:
      "Responsável por reunir informações; o responsável pelo envio pode ser outra pessoa.",
    entry:
      "Lista de solicitações ou notificação contextual; sessão real de Assets exigida e destino preservado no login.",
    context: [
      "Organização solicitante e destinatária",
      "Finalidade e prazo quando houver",
      "Solicitação, lote associado e modelo versionado de requisitos",
    ],
    data: [
      "Requisitos com instrução, obrigatoriedade e aplicabilidade",
      "Identificação do lote, material, quantidade e unidade",
      "Evidências por requisito: arquivo, autor, fonte e situação do upload",
      "Pendências vinculadas ao campo ou documento e resposta esperada",
    ],
    primaryAction: {
      label: "Revisar envio",
      effect:
        "Abrir a revisão do rascunho com destinatário, finalidade e conteúdo selecionados.",
      enabledWhen:
        "Requisitos obrigatórios atendidos ou exceções explicitamente permitidas; uploads confirmados; pessoa autorizada para envio. Quem só prepara encaminha ao responsável.",
    },
    permissions: [
      "Preparar exige vínculo com a organização e escopo sobre a solicitação.",
      "Anexar não concede permissão para compartilhar.",
      "Documentos e APIs aplicam a mesma restrição por objeto.",
    ],
    recovery: [
      "Salvar rascunho incompleto e retomar em outra sessão.",
      "Falha de upload preserva os campos e permite nova tentativa sem duplicar evidência.",
      "Sessão expirada exige novo login. O destino é preservado; somente rascunhos já confirmados no servidor sobrevivem à navegação.",
      "Conflito de edição exige resolução explícita; não sobrescrever silenciosamente.",
    ],
    versioning:
      "Editar altera apenas o rascunho. Corrigir após envio prepara uma nova versão e preserva a anterior; responder não resolve automaticamente a pendência.",
    notifications:
      "Após envio confirmado, o destinatário recebe notificação no workspace. Não há envio de e-mail. Salvamento não notifica outra organização.",
    acceptance: [
      "O usuário identifica quem pediu, para quê e quais requisitos faltam.",
      "Dados e arquivos confirmados permanecem após sair e voltar.",
      "Upload parcial não recebe confirmação de envio final.",
      "Quem não pode enviar não conclui o compartilhamento pela UI ou API.",
      "Correção permanece ligada à pendência e à versão que a originou.",
      "A tarefa funciona pelo celular e por teclado, com erros associados aos campos.",
    ],
    dependencies: [
      "Sessão HttpOnly, conta com senha e organização no servidor local",
      "Solicitações e requisitos versionados",
      "Persistência de rascunho",
      "Upload com autoria e autorização",
      "Revisão e envio de versão",
    ],
  },
  {
    screen: "LA-007",
    priority: "P0",
    actor: "Responsável autorizado pelo envio externo.",
    entry: "Revisar envio a partir da solicitação ou do dossiê.",
    context: [
      "Destinatário e finalidade",
      "Lote, revisão do rascunho e escopo de acesso",
    ],
    data: [
      "Campos e arquivos incluídos",
      "Requisitos e exceções permitidas",
      "Permissões, vigência e versão a enviar",
    ],
    primaryAction: {
      label: "Enviar para [organização]",
      effect:
        "Compartilhar uma versão imutável e receber confirmação durável do servidor.",
      enabledWhen:
        "Permissão de envio, destinatário válido, uploads confirmados e revisão ainda atual.",
    },
    permissions: [
      "Apenas o responsável pelo envio confirma.",
      "Compartilhamento restringe destinatário, conteúdo e vigência.",
    ],
    recovery: [
      "Repetição após falha não gera envio duplicado.",
      "Se o conteúdo mudar durante a revisão, exigir atualização antes de confirmar.",
      "Falha informa o último estado confirmado e permite tentar novamente.",
    ],
    versioning:
      "O recebimento identifica a versão exata enviada; futuras versões não são compartilhadas automaticamente.",
    notifications:
      "Criar notificação para a organização destinatária após persistir a versão. Canal implementado: central interna, sem e-mail.",
    acceptance: [
      "A confirmação identifica organização, conteúdo e versão.",
      "Cliques repetidos produzem um único envio.",
      "A versão enviada permanece recuperável após correção.",
    ],
    dependencies: [
      "Compartilhamento por objeto, destinatário e versão no servidor local",
      "Versionamento imutável",
      "Idempotência",
      "Histórico e notificações",
    ],
  },
  {
    screen: "AD-001",
    priority: "P0",
    actor: "Equipe de produto, design e engenharia no ambiente local.",
    entry: "Menu Inventário do console, design system ou /admin/inventario.",
    context: [
      "Área, situação e busca na URL",
      "Ficha selecionada por ID estável",
      "Aba interna do drawer selecionada na URL",
      "Inventário é uma página do Admin; suas visões são abas locais, separadas da navegação administrativa",
      "Snapshot das fontes do projeto",
    ],
    data: [
      "Telas existentes e planejadas",
      "Especificações funcionais, operações e jornadas",
      "Relatório gerado e procedimento obrigatório de atualização",
    ],
    primaryAction: {
      label: "Abrir ficha",
      effect:
        "Abrir um drawer com abas de visão geral, contrato, estados, operações e fluxos da tela.",
      enabledWhen: "O ID existe no catálogo.",
    },
    permissions: [
      "Somente leitura; disponível em desenvolvimento.",
      "A prévia local não implementa autorização administrativa de produção.",
    ],
    recovery: [
      "Busca vazia oferece limpar filtros.",
      "ID desconhecido informa que a ficha não existe e permite fechar o aviso.",
      "Escape fecha a ficha e devolve foco ao acionador.",
      "Aba desconhecida abre Visão geral; fechar limpa a seleção da ficha e da aba, preservando os filtros.",
    ],
    versioning:
      "Fontes e relatório são versionados no Git. A exportação JSON identifica o snapshot; não altera registros.",
    notifications:
      "Sem notificações externas. Divergências aparecem no relatório e na conferência local/CI.",
    acceptance: [
      "Filtros e ficha selecionada sobrevivem ao recarregamento pela URL.",
      "Toda ficha, incluindo telas planejadas e atalhos, abre o mesmo drawer com cinco abas internas.",
      "Clicar no nome, descrição, área, rota, status ou espaço da linha abre uma única ficha; o indicador Abrir ficha deixa a ação visível.",
      "Enter e Espaço no botão da ficha abrem o drawer; fechar retorna o foco a esse botão, inclusive após clique em outra célula.",
      "O menu administrativo tem uma única entrada Inventário. Visão geral, catálogo, fluxos, operações, verificações e regra ficam dentro da página.",
      "A aba selecionada sobrevive ao recarregamento; outra ficha começa em Visão geral.",
      "Setas esquerda/direita e Home/End navegam nas abas. Tab acessa o painel ativo e o foco permanece no drawer.",
      "Cabeçalho e abas ficam visíveis durante a rolagem do painel, inclusive no celular.",
      "Planejado não é apresentado como implementado.",
      "Catálogo, fluxos, exportação e regra de alteração são acessíveis.",
      "A CI falha com rota não inventariada ou snapshot desatualizado.",
      "O bundle público não contém a prévia do inventário.",
    ],
    dependencies: [
      "Catálogo versionado",
      "Relatório gerado por inventory:sync",
      "Conferência no build e na CI",
    ],
  },
];
