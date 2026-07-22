# Dry-run closeout — prioridades finais (sem vídeo)

**Data:** 2026-07-22 ~14:52 UTC  
**Escopo:** tudo residual **exceto** gravação de vídeo (Felix cria novo).

---

## 1. Dry-run técnico scorecard (API path)

| Bloco scorecard | Check | Resultado |
| --- | --- | --- |
| Health / casper | `/api/health` | **PASS** `ok` + `facilitatorMode=casper` |
| Evidence jury | `/api/evidence` | **PASS** lastCasperSettle · honesty · dualKey.distinct |
| Run Demo path | `POST /api/x402/simulate/…` | **PASS** Valid · sealMatch true · **mock** |
| Invalid explorer | `5a7b0e01…` | **HTTP 200** |
| Settle real | `POST /api/x402/settle/…` | **PASS** `casper_deploy` |
| Autonomy ×3+ | smoke + priority-close | **PASS** cyclesTotal **6**/6 (sessão) |
| Mint summary | `/api/mint/summary` | **200** |
| jury-smoke.sh | full script | **fail=0** |

### Settle densify (esta sessão)

- **txHash:** `25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a`  
- **Explorer:** https://testnet.cspr.live/transaction/25088a6a3710e40d586b50ab325a82240a36e82f07c42f561a7194b6e48b509a  
- Prior: `b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106`

### Visual UI (Run Demo no browser)

**Não automatizado nesta sessão** (sem browser MCP estável).  
Felix: 1 ensaio visual opcional com `docs/DEMO_DAY_SCORECARD_1PAGE_JURY8.md` — paths de API já verdes.

---

## 2. Campo Final Round

| Métrica | Valor |
| --- | --- |
| Badge BUIDLs | **54** |
| Hackers | **166** |
| Lastre | **46748** público |
| NEW Tier A | **46745 CanopyMRV** — agentic carbon MRV + Odra registry ISSUE/FREEZE |

**Counter CanopyMRV (colar se atualizar Dora):**  
*CanopyMRV freezes/issues carbon credits after MRV hash. Lastre is dual-key origin seal + permanent Invalid + Valid-only MintGate across mineral and carbon — proof before any credit or finance action.*

---

## 3. Checklist residual

| Item | Status |
| --- | --- |
| Dora BUIDL pack | ✅ live |
| API jury + Render | ✅ |
| jury-smoke fail=0 | ✅ |
| Autonomy densify | ✅ (6/6 sessão) |
| Settle densify | ✅ `25088a6a…` |
| Dry-run técnico scorecard | ✅ este doc |
| Ranking + CanopyMRV | ✅ |
| **Vídeo novo** | ⏸ **Felix** (script: `docs/VIDEO_60S_SCRIPT.md`) |
| Ensaio visual 5 min browser | ☐ opcional Felix |
| Autonomy ×3 **no dia do jury** | ☐ no dia (cold start) |

---

## 4. No dia do jury (único P0 restante de ops)

1. `bash scripts/jury-smoke.sh`  
2. Autonomy ×3 (`node scripts/autonomous-cycle.mjs`)  
3. Tabs: marketplace · evidence · Invalid · settle · BUIDL  
4. Scorecard 1-page  
5. Vídeo novo no BUIDL (quando pronto)
