# x402 — CSPR.cloud + WCSPR (official MAKE path)

**Date:** 2026-07-22  
**Status:** Implemented in runtime (`LASTRE_X402_MODE=cspr_cloud`)

## Sources

- Facilitator API: https://docs.cspr.cloud/x402-facilitator-api/reference  
- Examples: https://github.com/make-software/casper-x402  
- Trade WCSPR: https://testnet.cspr.trade  

## Three modes

| `LASTRE_X402_MODE` | Asset | How | UI simulate |
|--------------------|-------|-----|-------------|
| `mock` (default) | — | synthetic_receipt | yes |
| `casper` | native CSPR | casper-client transfer | still mock |
| `cspr_cloud` | **WCSPR** CEP-18 | CSPR.cloud `/verify` + `/settle` | still mock |

## Env

```bash
LASTRE_X402_MODE=cspr_cloud
CSPR_CLOUD_API_TOKEN=…          # or LASTRE_CSPR_CLOUD_TOKEN / FACILITATOR_API_KEY
LASTRE_X402_PAY_TO=00…          # 66-char account hash (00 + 64 hex)
# optional
LASTRE_WCSPR_PACKAGE=3d80df21ba4ee4d66a2a1f60c32570dd5685e4b279f6538162a5fd1314847c1e
LASTRE_WCSPR_AMOUNT=1000000000
CSPR_CLOUD_FACILITATOR_URL=https://x402-facilitator.cspr.cloud
LASTRE_CAIP2_NETWORK=casper:casper-test
```

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/x402/cloud` | Quote meta + how-to (always, no settle) |
| GET | `/api/x402/cloud/supported` | Live probe of CSPR.cloud `/supported` |
| POST | `/api/x402/cloud/settle/:assetId` | Official settle body → paid provenance |
| POST | `/api/x402/simulate/:assetId` | Judge mock (never cloud) |
| POST | `/api/x402/settle/:assetId` | Native CSPR auto-settle (`mode=casper` only) |

## Client flow (agent)

1. `GET /api/x402/provenance/:assetId` → 402 with `requirements.cloud` when mode=cspr_cloud  
2. Build EIP-712 authorization with `@make-software/casper-x402` / casper-x402 examples  
3. `POST /api/x402/cloud/settle/:assetId` with `{ paymentPayload, paymentRequirements }`  
4. Receive provenance + explorer tx for WCSPR transfer  

## Code

- `agent/x402/src/cspr-cloud-types.ts`  
- `agent/x402/src/cspr-cloud-facilitator.ts`  
- `agent/x402/src/create-facilitator.ts` (mode wiring)  
- `app/server/runtime.ts` + `index.ts` (HTTP)

## Honesty freeze

- Never claim UI moves WCSPR.  
- Never claim CSPR.cloud settle without a real EIP-712 body.  
- Native CSPR and WCSPR cloud are both valid real-value paths — label which mode is active.
