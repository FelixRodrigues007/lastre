# Pre-loader Lastro — design

**Data:** 2026-06-29
**Status:** aprovado (design), pendente implementação

## Objetivo

Pre-loader premium que pinta no primeiro frame (antes do bundle React), conta a
marca de forma sóbria e editorial, e sai sem flash. Conceito: **wordmark +
medidor**.

## Decisões

| Tema | Decisão |
|------|---------|
| Conceito | Wordmark `LASTRO` + medidor editorial hairline |
| Saída | `document.fonts.ready` **e** tempo mínimo ~1200ms; fade + wipe |
| Frequência | Toda visita (sem `sessionStorage`) |
| Arquitetura | Markup + CSS + script **inline no `index.html`** (pinta a 0ms) |

## Visual

- Fundo `--lastro-bg-primary` (#132C24) com grão/grid sutil coerente com as seções.
- Wordmark `LASTRO`: Inter Display, tracking largo, letras com fade-in + subida
  escalonada (stagger ~60ms).
- Medidor: hairline ~220px abaixo do wordmark, preenche da esquerda em mint
  (#B2ED97).
- Micro-label mono: JetBrains Mono 11px, uppercase, tracking, `--lastro-text-muted`,
  texto `PROOF BEFORE TOKEN`.

## Comportamento do medidor (honesto)

- Anima 0 → ~90% durante o tempo mínimo e **segura** em ~90%.
- Só fecha pra 100% quando `fonts.ready` resolve.
- Nunca finge completar antes do load real.

## Saída

- Ao concluir: meter snap pra 100% → adiciona `.is-done` ao `#preloader`.
- Curtain: `opacity` + leve `clip-path`/`transform` wipe pra cima.
- Nó removido no `transitionend`.
- **Fallback de segurança:** timeout de 4000ms força a saída caso `fonts.ready`
  trave.

## Arquitetura

Markup, `<style>` escopado e script curto **inline no `index.html`**. O loader
precisa pintar antes do JS do bundle; um componente React renderizaria tarde
demais e causaria flash. O CSS puro dirige a animação de entrada; o script só
orquestra a saída:

```
Promise.all([document.fonts.ready, minTimer(1200)])
  .then(() => preloader.classList.add('is-done'))
preloader.addEventListener('transitionend', () => preloader.remove(), { once })
setTimeout(forceDone, 4000)  // fallback
```

*Alternativa rejeitada:* componente React `<Preloader/>` — mais limpo no código,
mas renderiza depois do parse do bundle → não funciona como preloader real.

## Acessibilidade / performance

- `prefers-reduced-motion: reduce`: sem stagger nem creep; wordmark estático que
  só dá fade na saída.
- Apenas `transform` / `opacity` / `clip-path` (compositor-friendly).
- Container `role="status"` + `aria-hidden` no conteúdo decorativo; sem trap de foco.
- CSS inline ~1.5kb, zero dependência adicional.

## Nota CSP

Script inline é o padrão para preloader, mas conflita com CSP nonce-based. Sem
CSP estrito no Vite hoje, ok. Se entrar CSP depois, mover script para arquivo
externo servido com nonce.

## Escopo (YAGNI)

- Sem `sessionStorage` (toda visita).
- Sem variação de conceito alternativo.
- Sem theming light (loader é sempre dark, igual ao first paint do site).
