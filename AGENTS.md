# Regras de trabalho da Lastre

## Inventário obrigatório do frontend

Toda alteração de estrutura do frontend deve passar pelo inventário do Admin
(`/admin/inventario`) na mesma entrega. Isso inclui criar, remover ou reorganizar
telas, rotas, navegação, layouts, componentes compartilhados, formulários, ações,
estados, permissões, contratos de dados e etapas de uma jornada, em `app/`, `web/`
ou no design system.

1. Antes de implementar, localizar as fichas afetadas em
   `app/src/lib/inventory/screens.ts`. Criar uma ficha planejada para uma tela nova.
2. Registrar a tarefa, contexto, dados, ações, permissões, recuperação, efeitos
   sobre versões e critérios de aceitação em `specifications.ts`. Atualizar
   `operations.ts` e `flows.ts` quando contratos ou jornadas mudarem.
3. Reutilizar IDs estáveis. Ao remover uma tela, atualizar as referências e
   registrar a remoção no PR. Não reaproveitar o ID para outro propósito.
4. Para mudanças em componentes/layouts compartilhados, identificar no PR as
   telas e jornadas afetadas e atualizar suas fichas se o comportamento mudar.
5. Depois de implementar, executar `npm run inventory:sync`, revisar a tela do
   Admin e incluir o relatório gerado na mesma entrega.
6. Executar `npm run inventory:check` e `npm run inventory:test`, além das
   verificações pertinentes ao código alterado. Divergência bloqueia a entrega.

Não editar `app/src/lib/inventory/generated/report.json` manualmente, não
desabilitar a conferência para liberar uma mudança e não marcar propostas como
implementadas sem código correspondente. Sincronizar o relatório não substitui
a revisão funcional das fichas.

A prévia atual do Admin é local, somente leitura e excluída do build público.
Os arquivos versionados são a fonte das fichas. Autorização administrativa em
produção precisa de implementação própria antes de publicar essa área.

Procedimento e limites: [docs/FRONTEND_INVENTORY.md](docs/FRONTEND_INVENTORY.md).
