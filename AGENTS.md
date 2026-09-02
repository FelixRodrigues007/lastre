# Lastre — contrato dos agentes (Codex · Fable · Grok)

Pasta: `/Users/felixrodrigues/Developer/lastro`. Brand pública: **Lastre**. Paths internos ainda usam `lastro`.

## Quem faz o quê

**Fable** (Claude Project / Claude Code) é o PMO. Lê `CLAUDE.md` + `docs/kb-negocio/FABLE.md`. Decide escopo, DoD, recusas, qualidade para a Laura. Você **não** substitui o Fable.

**Codex** (você, se este arquivo foi aberto no Codex) implementa TypeScript e Rust em fatias pequenas, com teste.

**Grok** pesquisa, SPE/corredor confidencial, copy de mesa (MAKE), fatias que o Fable atribuir.

Se a tarefa for tese, preço, Gate, call Tamara/Alex, ou “o que vender”: **pare** e devolva ao Fable. Não invente SKU.

## Stack

| Superfície | Path | Notas |
|---|---|---|
| App | `app/` | React + TS, Vite. Corridor = `/corridor` |
| Landing | `web/` | lastre.io |
| API | `app/server/` | Node TS; private-corridor, x402, Casper read |
| Agent | `agent/{sealer,x402,orchestrator}` | Selo SHA-256; x402; LLM só ação |
| Contratos | `contracts/lastro_origin/` | Rust / Odra / WASM — ProofOfOrigin + MintGate |
| CLI | `packages/cli/` | `lastre.mjs prove` |

Rede de prova: **Casper Testnet**. UI `/simulate` = mock. Settle real só com keys + `LASTRE_X402_MODE=casper`.

## Invariantes (quebra = revert o PR)

1. Selo SHA-256 decide `Valid` / `Invalid`. LLM nunca adjudica.
2. FieldSealer ≠ ChainAttester no runtime (teste que prove).
3. Invalid é permanente. Não apagar, não “crédito”.
4. Demo pública (Vale do Ouro, marketplace) **não** escreve no store do corridor.
5. Labels honestos: pública = DEMONSTRAÇÃO; corridor = confidencial.
6. Sem custódia, sem token de lote real, sem settlement USDT no v0.
7. `docs/kb-negocio/` é gitignorado — não `git add`.

## DoD de um PR

- Teste do caminho tocado (app/test, agent test, ou Odra).
- Smoke do que mudou (health / corridor / evidence, conforme a fatia).
- Copy sem investment/yield/buy/sell; sem nomes reais de offtaker.
- Tokens visuais: `design-system/tokens/lastro.css` — não paleta nova.

Inventário de frameworks/IPO e árvore “ganhar em cripto” vivem em `docs/kb-negocio/08-frameworks/` (gitignorado). Não viram feature. Monetização permitida no código desta semana: corridor + selo (motor 01). PCQ = spec. Mint/DeFi/stake = não.

## O que o v0 **não** é

PCQ faturando, MintGate de commodity, DeFi, staking, mainnet money, CMS, marketplace de metal. PCQ = spec de query paga (motor 02), não invoice desta semana.

Finish de produto: `docs/kb-negocio/07-produto/dod-finish.md` (se a pasta existir no disco). Roadmap de protocolo: `docs/POST_BUILDATHON_ROADMAP.md` — outro relógio.

## Estilo

Mudança cirúrgica. Sem refator cosmética. PT com Felix; código/identificadores em inglês. Não reorganizar o repo em Projetos/Memória/Áreas.
