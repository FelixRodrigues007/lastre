# Portão do material interno — cópia na raiz

O guarda mora em `web/functions-lib/`. As portas existem em dois lugares:

- `web/functions/` — usado quando o diretório-raiz do projeto Cloudflare Pages
  é `web/` (é o que `wrangler pages dev` enxerga quando se roda dentro de web).
- `functions/` (aqui) — usado quando o diretório-raiz é a raiz do repositório,
  que é como o build conectado ao Git está configurado hoje.

Por que os dois: em 07/09/2026 o build do Pages para o commit `45b25bf` subiu
com `web/functions/` **ignorado** — `https://3f1c6460.lastro-296.pages.dev/corpus/`
respondeu 200 com o documento inteiro, sem senha. O Pages procura `functions/`
na raiz do projeto, e a raiz configurada não é `web/`. Enquanto essa configuração
não estiver confirmada no painel, as duas portas ficam de pé: qualquer que seja
a raiz, o portão fecha.

A lógica não é duplicada — os dois lados importam o mesmo `deck-guard`.
