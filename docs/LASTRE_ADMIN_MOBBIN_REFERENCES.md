# Lastre Admin — referências de interface no Mobbin

Pesquisa realizada em 25 de setembro de 2026 pelo conector Mobbin, com inspeção das prévias retornadas. As referências orientam hierarquia e interação; as cores, fontes, ícones e temas continuam sendo os do design system da Lastre. Não são uma validação das regras de negócio.

Foram pesquisadas individualmente as 27 telas canônicas. Uma mesma referência pode orientar duas tarefas semelhantes. Os links abaixo são permanentes das telas no Mobbin, sem URLs temporárias de imagem. Nenhuma imagem de terceiros foi incorporada ao produto.

| ID | Tela Lastre | Referência consultada | Padrão aproveitado e limite |
|---|---|---|---|
| AD-001 | Inventário | [Render](https://mobbin.com/screens/3e106d4a-c875-45d5-be51-387a519355f8) | Catálogo de serviços em tabela: nome, estado, contexto e ambiente. Preservados o catálogo e o drawer existentes do inventário. |
| AD-002 | Visão geral | [OpenAI Platform](https://mobbin.com/screens/d605f83d-3869-4ecc-8874-b913e09e2930) | Saúde por serviço com estado textual, horário e histórico de incidentes. Adaptado para indicadores acionáveis e ocorrências prioritárias; a landing page de incident.io não foi usada como referência de interface. |
| AD-003 | Fila de trabalho | [HubSpot](https://mobbin.com/screens/d99d4a6b-9634-4cd3-8ae1-39e337ebd2ea) | Filtros acima da tabela e visões de atendimento. Aplicados prioridade, estado, responsável e triagem sem sair da fila. |
| AD-004 | Ocorrência | [Zendesk](https://mobbin.com/screens/a5855ce7-b82b-4d19-b206-4842759e7d75) | Atendimento central e propriedades do caso em painéis laterais. Aplicados linha do tempo, contexto e distinção entre nota interna e comunicação externa. |
| AD-005 | Organizações | [WorkOS](https://mobbin.com/screens/b5451936-a16f-4ae2-87e3-85eb83ea1322) | Busca por nome ou identificador, tabela enxuta e criação contextual. Aplicados identidade, produto, situação, responsável e atividade. |
| AD-006 | Organização | [Attio](https://mobbin.com/screens/8b95ad8d-7e53-4ea1-ac7a-3f8be1b1ab3a) | Registro organizacional com tabs, atividade e propriedades. Aplicadas tabs estáveis e contexto lateral, sem copiar funções de CRM. |
| AD-007 | Registros | [Confluence](https://mobbin.com/screens/9b8efce7-50b2-456e-bade-e3915edaf973) | Banco de registros em tabela com campos de texto, tags e pessoas. Aplicado seletor de tipo que muda as colunas preservando contexto organizacional. |
| AD-008 | Ativo ou lote | [Faire](https://mobbin.com/screens/21bc409a-1d01-4003-8709-2bcb845a8199) | Quantidade apresentada com unidade e atributos junto à identidade do item. Aproveitado apenas esse padrão de informação; comércio, preços e compra não entram no Admin. |
| AD-009 | Dossiê | [Hashnode](https://mobbin.com/screens/06a5b4b0-0a7d-41c3-9f67-532f3e4e99f5) | Histórico com seleção de uma revisão e conteúdo correspondente. Aplicado seletor explícito de versão e aviso de base histórica. |
| AD-010 | Análise | [PlanetScale](https://mobbin.com/screens/78880fb1-c0dc-4307-a635-1fb9a0c5527e) | Solicitação com resumo, autor, mudanças e linha do tempo. Aplicada separação entre requisitos, base e conclusão da organização. |
| AD-011 | Evidência | [Aboard](https://mobbin.com/screens/e3d5820d-0096-4a1a-905f-00e61e547767) | Documento ocupa a maior parte da página, com controles de página e zoom. Aplicados área de leitura e metadados recolhíveis; a prévia usa um documento fictício em HTML. |
| AD-012 | Comparação | [Figma](https://mobbin.com/screens/ebb90bf9-735a-4f5f-968a-8152ff58dde8) | Comparação antes/depois com mudanças identificadas. Aplicados resumo estruturado, campos e arquivos afetados; comparação visual de PDFs continua P1. |
| AD-013 | Verificações | [Relevance AI](https://mobbin.com/screens/3a6e7b1a-0af1-4891-8e89-88bdc2c292c2) | Lista de tarefas com busca e visões por estado. Adaptada para filtros independentes de execução, resultado e validade. |
| AD-014 | Execução | [Vercel](https://mobbin.com/screens/ff81f1e9-25b1-46f9-8448-31fa40a77e4b) | Falha em destaque, contexto da execução e logs abaixo. Aplicados diagnóstico, tentativa elegível e eventos técnicos sob demanda. |
| AD-015 | Modelos e regras | [Employment Hero](https://mobbin.com/screens/9c1c68e4-3c29-420a-856a-0b865b82a95d) | Catálogo de modelos com tabs, tipo e estado. Aplicada propriedade e versão publicada sem um construtor universal. |
| AD-016 | Modelo | [Asana](https://mobbin.com/screens/cddd6cdf-754d-4ac5-9183-7210f28c4c16) | Definição do modelo e tab de uso separadas. Aplicadas definição, versões, alcance e histórico. |
| AD-017 | Editor | [Fresha](https://mobbin.com/screens/28284f88-5c09-498e-9fa2-6e30d048b2cd) | Navegação entre construção e prévia do formulário. Aplicadas seções de identificação, requisitos, prévia dos dois produtos e revisão. |
| AD-018 | Integrações | [Mistral AI](https://mobbin.com/screens/37547cbc-0809-41c6-b19c-d4df9f2cca59) | Conectores agrupados com indicação de conexão. Adaptados para tabela operacional com proprietário, saúde observada e ambiente. |
| AD-019 | Integração | [Hashnode](https://mobbin.com/screens/168e320b-3c66-467c-a88f-16ce90cb6959) | Histórico de entregas com evento selecionado e resposta. Aplicados drawer de inspeção, tentativas e distinção entre sinais do provedor. |
| AD-020 | Pessoas e acessos | [Copilot](https://mobbin.com/screens/6cd14492-9ff4-4564-80ee-d848043aba7b) | Equipe com papel, acesso e convite na mesma lista. Aplicadas identidades com tabs independentes para clientes, internos e concessões. |
| AD-021 | Pessoa | [Homerun](https://mobbin.com/screens/93769fc7-b019-48c6-b8b2-e0d65578c3d6) | Perfil com método de entrada e tabela de sessões ativas. Aplicados contexto da identidade e revogação delimitada por sessão. |
| AD-022 | Papéis e políticas | [StackAI](https://mobbin.com/screens/4ea9f2dc-ed99-4447-8e40-c929a2b40a2f) | Matriz de permissões por papel. Aplicada leitura de capacidades com escopo e condições; não há editor genérico de políticas. |
| AD-023 | Auditoria | [1Password](https://mobbin.com/screens/4df9de3d-fe83-46ba-b832-33c3ffbc48df) | Trilha com momento, ator, evento, filtros e download contextual. Aplicados evento em drawer, correlação e revisão de exportação. |
| AD-024 | Configurações | [Homerun](https://mobbin.com/screens/bc309dbf-b7d5-46a3-9cb8-34b9890adc5f) | Retenção como política separada por contexto e condição. Aplicadas classes de dados, finalidade e dependências; os prazos da referência não foram copiados. |
| AD-025 | Entrada | [Hotjar](https://mobbin.com/screens/8f40e903-2a53-4a09-acec-6613690ddfb0) | Entrada com opção corporativa SSO separada de credenciais. Aplicada apresentação da identidade administrativa; autenticação real permanece indisponível. |
| AD-026 | Intervenção | [PlanetScale](https://mobbin.com/screens/78880fb1-c0dc-4307-a635-1fb9a0c5527e) | Revisão de mudanças com participantes e eventos atribuídos. Aplicados alvos, elegibilidade, revisão, execução e recibo sem autoaprovação. |
| AD-027 | Busca | [Peerlist](https://mobbin.com/screens/28f1c1fc-6dc8-4df2-adad-76e920890fa9) | Busca separada por tipo e filtros com contexto suficiente para distinguir resultados. Aplicado agrupamento por organizações, pessoas, registros, execuções e ocorrências. |

## Aplicação no código

- Shell, dez destinos e utilidades: `app/src/routes/admin/AdminLayout.tsx`.
- Tabelas, filtros, tabs, estados e diálogos: `AdminUI.tsx`, `admin.css` e componentes existentes do design system.
- Operação e organizações: `AdminOperations.tsx`.
- Registros, versões, evidência e comparação: `AdminRecords.tsx`.
- Verificações, modelos e integrações: `AdminPlatform.tsx`.
- Acessos, auditoria, configurações, entrada, intervenção e busca: `AdminGovernance.tsx`.
- Preparação e revisão contextual: `AdminActions.tsx`.

## Adaptações deliberadas

Atribuição usa um modal curto para manter a mesma revisão acessível no celular. Filtros principais ficam visíveis; os adicionais da fila usam drawer. Publicação é uma seção do editor, e intervenções amplas usam página. Não se abrem dois diálogos bloqueantes ao mesmo tempo.

As interfaces operacionais são uma prévia local com fixtures imutáveis. Formulários permitem preparar e revisar comandos; o envio real fica desabilitado. Rascunhos de modelo e preparações podem ser salvos na sessão do navegador. Autenticação, concessões, reprocessamento, publicações, entrega de mensagens e auditoria de produção precisam dos contratos de backend descritos na [arquitetura](LASTRE_ADMIN_ARCHITECTURE.md).


## Refinamento do Admin no nível do DS · 25 set. 2026

Nova consulta ao conector Mobbin, com inspeção visual das sete prévias retornadas. Este refinamento trabalha sobre o mapa anterior de 27 telas. Os padrões aproveitados são:

| Referência inspecionada | Leitura da tela | Aplicação na Lastre |
|---|---|---|
| [Neon — operações do sistema](https://mobbin.com/screens/53d1a659-3ca1-4aba-9f7b-8353f71040dd) | Navegação contextual, tabs acima de uma tabela, status e horários em colunas | Hierarquia entre shell, visões, filtros e tabela; metadados secundários e estados legíveis |
| [ClickUp — lista de tarefas](https://mobbin.com/screens/a032e768-e08b-442b-8b4b-16a67f6033c9) | Identidade da tarefa em primeiro plano, avatares de responsáveis e prioridades com indicadores | Ocorrência na primeira coluna, prioridade com barras, responsável com monograma e prévia por linha |
| [Asana — tarefas de projeto](https://mobbin.com/screens/f7ec8174-d020-4121-8a8d-5464b4cf7a29) | Toolbar separada da tabela, atributos alinhados e agrupamento visual de trabalho | Ações próximas ao contexto e distinção entre prioridade e estado; agrupamentos da referência não foram adicionados |
| [Linear — cliente](https://mobbin.com/screens/5ad93879-002d-43e8-914d-983f4b534a07) | Cabeçalho da entidade, propriedades próximas da identidade e solicitações relacionadas | Cabeçalhos, contexto e relações preservados nas páginas de detalhe; sem importar atributos comerciais |
| [Customer.io — perfil e atividade](https://mobbin.com/screens/98aef2de-372a-4571-84fc-3635864db07d) | Identidade e tabs no topo, propriedades e atividade em painéis distintos | Separação entre atendimento/contexto e atividade recente com acesso ao evento de auditoria |

Também foram inspecionadas [Railway — uso e logs](https://mobbin.com/screens/3af70f9f-c560-4a42-a15c-cbd12db09c73) e [Supabase — observabilidade da API](https://mobbin.com/screens/5a658394-5d52-49f1-816e-381f7700b08d). Seus gráficos não foram adaptados: a prévia da Lastre não tem séries temporais operacionais para sustentar esse tipo de visualização.

O acabamento vem do DS local: `Button`, `Surface`, `SearchInput`, `SelectField`, `StatusBadge`, `Tabs`, ícones e marca originais. Mirage define as superfícies, Blue identifica ação, Gold sinaliza atenção. Os materiais, bordas de luz, elevações, movimento e temas vêm dos tokens compartilhados; nenhuma imagem do Mobbin integra o produto.
