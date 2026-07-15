# Grok validator checklist — pós-Fugu Beat Claros

Usar **depois** do Fugu entregar `docs/FUGU_HANDOFF_BEAT_CLAROS.md`.

## 1. Ler handoff
- [ ] Abrir `docs/FUGU_HANDOFF_BEAT_CLAROS.md`
- [ ] Confrontar cada PASS com comando/URL

## 2. Git
```bash
git fetch origin && git log -8 --oneline origin/main
git diff origin/main~5..origin/main --stat
```
- [ ] Sem `.pem` / B64 de secret no diff  
- [ ] Arquivos T0.1–T0.5 presentes  

## 3. Prod
```bash
API=https://app-api.lastre.io
curl -sS $API/api/health | jq .x402
curl -sS $API/api/evidence | jq '{
  dualKey: .dualKey,
  mintLive: .mintGate.livePackageHash,
  anchor: .composition.anchorTx,
  fullyVerified: .onChain.rpcEvidence.fullyVerified,
  x402: .x402.facilitatorMode
}'
curl -sS -X POST $API/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001 \
  -H 'content-type: application/json' -d '{}' \
  | jq '{settlementKind, facilitatorMode, mint: .provenance.csprLinks.mint}'
```

| Check | Esperado |
| --- | --- |
| dualKey.distinct | true |
| mintLive | non-null se T0.2 PASS |
| anchor | 64 hex se T0.3 PASS |
| fullyVerified | true |
| simulate | synthetic_receipt + mint null |

## 4. Explorer
- [ ] Payment `27461bd7…` ainda ok  
- [ ] MintGate package URL do handoff abre  
- [ ] mint_lot tx abre  
- [ ] anchor tx abre  

## 5. Dual-key file
```bash
jq -e '.sealer.accountHash != .attester.accountHash' output/dual-key-run.json
# ou path indicado no handoff
```

## 6. Verdict
| Resultado | Ação |
| --- | --- |
| Todos T0.1–T0.6 PASS | Autorizar claim beat-Claros-rubric; atualizar RANKING #1 origin + overall #1 contender |
| Algum FAIL | Listar falhas; **não** autorizar claim; pedir rework Fugu só no item |

## 7. Atualizar notas (só se validado)
Editar `docs/RANKING_UPDATE_2026-07-15.md` e `docs/SCORECARD_BEAT_CLAROS.md` se Fugu criou.
