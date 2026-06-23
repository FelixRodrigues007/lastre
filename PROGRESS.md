# Lastro — PROGRESS

> Painel vivo do projeto. Atualize o `%` e marque os checkboxes a cada checkpoint.
> Prazo: **30/jun 21:00 (Brasília)** · Casper Agentic Buildathon 2026.
> Tese: *Proof before token — a cadeia de prova da terra ao token, verificada offline e ancorada na Casper.*

---

## Tracker 0–100%

| Tópico | % | Status / próximo passo |
|---|---:|---|
| Ambiente (Rust · WASM · cargo-odra) | **100%** | ✅ Concluído |
| Monorepo + Licença BUSL-1.1 (Bloco 1) | **100%** | ✅ Concluído — monorepo base + BUSL-1.1 + skeleton Odra; `cargo odra test` verde em `contracts/lastro_origin` |
| Contrato `ProofOfOrigin` (Camada 1) | 0% | Bloco 2 — atesta/rejeita on-chain |
| Sealer · ponte AuPass (selo SHA-256) | 0% | Bloco 3 |
| Camada x402 (pagamento M2M) | 0% | Bloco 4 |
| Agente (loop orquestrador) | 0% | Bloco 5 |
| Deploy Testnet + tx real | 0% | Bloco 6 — prova on-chain |
| Web · Landing (Laurinha) | 0% | Bloco 6 — diferencial visual |
| Samples fictícios (Mineradora Vale do Ouro) | 0% | Doc válido + doc adulterado |
| Vídeo demo (Unlisted) | 0% | Bloco 7 |
| Submissão DoraHacks | 0% | Reserva — submeter cedo |

---

## Blocos (checkpoints)

- [x] **Bloco 0 — Ambiente.** rustc 1.96 · wasm32 · cargo-odra 0.1.7 ✅
- [x] **Bloco 1 — Fundação.** monorepo + BUSL-1.1 + skeleton Odra · `cargo odra test` verde em `contracts/lastro_origin` · 1º commit
- [ ] **Bloco 2 — `ProofOfOrigin`.** registra atestação · aceita selo válido · REJEITA inválido · testes verdes
- [ ] **Bloco 3 — Sealer.** ponte AuPass gera selo SHA-256 do input fictício · bate com o contrato
- [ ] **Bloco 4 — x402.** 402 → pagamento → dado liberado
- [ ] **Bloco 5 — Agente.** loop completo: input → selo → x402 → atesta/rejeita
- [ ] **Bloco 6 — On-chain + Web.** deploy Testnet · tx real no cspr.live · landing no ar
- [ ] **Bloco 7 — Empacotar.** vídeo demo (válido aprova / inválido rejeita) · README final
- [ ] **Reserva (30/jun).** polish + SUBMETER no DoraHacks (cedo)

---

## Definition of Done (um bloco só é "verde" quando…)

1. Testes do bloco passam.
2. Você **leu e entendeu** o código (não só o Fugu gerou).
3. Commit git descritivo fechando o bloco.
4. Este `PROGRESS.md` atualizado.
5. Nenhum dado real de terceiro — **apenas samples fictícios**.

---

## Guardrails

- **Dados:** 100% fictícios na submissão pública. O protocolo combate fraude de procedência; não cita entidades reais sem título de lavra verificado.
- **Escopo:** Camada 1 rodando de verdade > 4 camadas meio-prontas. Camadas 3–4 = roadmap no pitch.
- **On-chain real:** tx no cspr.live é o que separa tier A de C. Deploy Testnet é inegociável.
- **Fugu:** imparável dentro do bloco, checkpoint entre blocos.
