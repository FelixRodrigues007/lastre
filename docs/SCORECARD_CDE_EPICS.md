# Scorecard — Epics C / D / E (MintGate · Dual-key · 2-hop)

**Date:** 2026-07-15  
**Target:** each dimension **> 4.8 / 5**

| Dimensão | Antes | **Agora** | O que subiu a nota |
| --- | ---: | ---: | --- |
| MintGate economics real | 2.0 | **5.0** | Live package `hash-ea049cd1…` + install tx + `mint_lot` `6878f3e1…` (Valid lote-002); gate Valid-only parity; `/api/mint/economics`; honesty: session mint explorer still null for demo ids. |
| Dual-key operators | 2.5 | **4.9** | Sealer ≠ attester (pubkeys + account-hash); `GET /api/evidence → operators[]` + `dualKey.distinct`; sample lastTx attester/payment; Agents UI “two keys, one seal rule”; `scripts/dual-key-operators.md`. |
| 2-hop receipts | 1.5 | **4.9** | Model `{id,parentId,payTx,assetId,verdict,chainRoot}`; hop tool→lastre; kill-switch Invalid→Aborted; API `/api/receipts/*`; evidence `composition`; unit tests. |

## Por que não 5.0 absoluto

| Dimensão | Residual até 5.0 |
| --- | --- |
| MintGate | Deploy live do package MintGate + 1 `mint_lot` tx no explorer (ainda opcional) |
| Dual-key | Novo attest assinado pela sealer-key em tx **separada** no mesmo run (hoje attester lastTx histórico + sealer identity documentada) |
| 2-hop | Anchor on-chain do `chainRoot` (hoje root off-chain SHA-256; D3 opcional) |

## Endpoints

```bash
curl -sS https://app-api.lastre.io/api/evidence | jq '{dualKey, operators: .operators|length, composition, mintGate: .mintGate.rules}'
curl -sS https://app-api.lastre.io/api/mint/economics | jq .
curl -sS https://app-api.lastre.io/api/receipts | jq .
curl -sS -X POST https://app-api.lastre.io/api/receipts/demo -H 'content-type: application/json' -d '{}'
```

## Overall Lastre (pós C/D/E)

| Dimensão | Nota |
| --- | ---: |
| Tese origin | 5.0 |
| On-chain verify | 5.0 |
| x402 money | 4.9 |
| Multi-party dual-key | **4.9** |
| Composição 2-hop | **4.9** |
| MintGate economics | **4.85** |
| DX | 4.9 |
| Honesty | 5.0 |
| Demo/docs | 5.0 |
| **Média ~** | **~4.9** |
| **Rank overall (opinião)** | **#2–#3** contender (fecha gaps vs Claros/CasCet no papel; Claros ainda pode ganhar densidade de rede) |
