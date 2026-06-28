# Prompt para Fugu Ultra - Setup Completo Vercel + Render para Lastro

Fugu, o usuário tem o Vercel CLI instalado e quer colocar o Vercel no ar para a landing page React da Laurinha (iaexperiencebr@gmail.com).

O GitHub repo é: https://github.com/FelixRodrigues007/lastro

O gateway será deployado separadamente no Render com Docker.

A LP é um app React SEPARADO (Vite recomendado) que consome a API do gateway.

O usuário vai rodar os comandos do CLI localmente (logado com a conta dele no Vercel por enquanto), criar o projeto linked ao GitHub, setar envs, deploy, e depois adicionar a Laurinha como owner no dashboard.

Forneça TUDO pronto para o usuário executar:

1. O Dockerfile completo e corrigido para o gateway no Render (baseado no spec quebrado do Claude abaixo - arrume paths, build order, multi-stage, envs, etc.).

2. Quaisquer mudanças no código do gateway para production (CORS com ALLOWED_ORIGINS do env, PORT do env, etc. - já deve ter base, complete se necessário).

3. O guia exato com comandos Vercel CLI para o usuário rodar (após login no Vercel).

4. Estrutura básica para a React LP (crie em uma pasta 'landing/' no repo se não existir, com Vite + React + TS, usando o API Contract fornecido).

5. vercel.json se necessário.

6. Instruções para setar envs no Vercel (VITE_GATEWAY_URL como placeholder, o usuário atualiza com a URL do Render depois).

7. Como adicionar a Laurinha como owner depois.

Use o API Contract e o spec do Claude (corrigido) abaixo.

Mantenha tudo em DEMONSTRATION mode, sem linguagem financeira.

O gateway em produção terá SANDBOX_ANCHOR_ENABLED=false.

## Spec do Claude (quebrado - você corrige e entrega pronto)

[ Cole aqui o texto completo do spec do Claude sobre BLOCO K e o API Contract para a LP ]

## Comandos Vercel CLI esperados (gere a sequência exata)

Assuma que o usuário está logado no Vercel CLI com a conta que criará o projeto (depois transfere ownership).

Exemplo de fluxo:

vercel login   # se necessário, mas ele já tem CLI

# Para criar o projeto para a LP React
cd landing   # ou o dir da LP
vercel link   # ou vercel para init

# Set env
vercel env add VITE_GATEWAY_URL   # https://lastro.onrender.com

# Deploy
vercel --prod

Forneça o fluxo completo adaptado.

Para o gateway Render, gere o Dockerfile e o .render.yaml ou instruções para o Render (conectar GitHub, usar Docker, setar envs).

Entregue arquivos prontos para commit se necessário (Dockerfile, updates no gateway/src/index.ts para CORS/PORT, landing/ básico).

Garanta que o CORS no gateway aceite o domínio do Vercel + localhost para dev.

O usuário vai rodar e depois add a Laurinha como owner no dashboard do Vercel.

Faça de forma que ele possa copiar e executar imediatamente.

Inclua como testar localmente o CORS (fetch de outra origem).

Se precisar de mudanças no código, liste os diffs ou o código completo das partes afetadas.

Priorize: gateway pronto para Render + Vercel project criado via CLI + LP básica funcional com o /proof e /verdict.

Obrigado, Fugu!