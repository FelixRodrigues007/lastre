# Real x402 CSPR settlement (Casper Testnet)

Judge UI path **always** uses mock (`POST /api/x402/simulate`).  
Real money path is **CLI / settle API** only.

## Architecture

```text
Client                    API (Render / local)              Casper Testnet
  |                         |                                    |
  |  GET /provenance          |                                    |
  |  (no X-PAYMENT)         |                                    |
  |  <---- 402 quote -------|                                    |
  |                         |                                    |
  |  GET + X-PAYMENT        |  CasperFacilitator                 |
  |  (mock header sig)      |  casper-client transfer ---------->|
  |  <---- 200 proof -------|  settlementKind=casper_deploy      |
  |       + txHash          |                                    |

Or server-as-agent:

  POST /api/x402/settle/:assetId
    → quote + sign + casper transfer (requires mode=casper + keys)
```

Header `X-PAYMENT` uses the deterministic **mock signature** (quote knowledge).  
**On-chain movement** happens only in `CasperFacilitator.settlePayment`.

## Environment (API host)

| Variable | Required | Purpose |
| --- | --- | --- |
| `LASTRE_X402_MODE` | yes | `casper` (default `mock`) |
| `LASTRE_X402_PAY_TO` | yes | Recipient public key hex or account-hash |
| `LASTRE_X402_SECRET_KEY_PATH` | one of | Path to payer PEM (local) |
| `LASTRE_X402_SECRET_KEY_B64` | **preferred on Render** | `base64` of the entire PEM file (single line, no newlines issues) |
| `LASTRE_X402_SECRET_KEY_PEM` | one of | Raw PEM (Render often mangles newlines → `malformedframing`) |
| `CASPER_CLIENT_BIN` | no | Default `/app/bin/casper-client` in Docker |
| `NODE_ADDRESS` / `CASPER_RPC_URL` | no | Default public testnet RPC |
| `CHAIN_NAME` | no | Default `casper-test` |

Optional alias: `SANDBOX_SECRET_KEY_PATH`, `LASTRE_X402_TARGET_ACCOUNT`.

## Local (funded key)

```bash
export LASTRE_X402_MODE=casper
export LASTRE_X402_SECRET_KEY_PATH="$HOME/.casper-keys/lastro-deploy/secret_key.pem"
export LASTRE_X402_PAY_TO="$(cat $HOME/.casper-keys/lastro-payto/public_key_hex)"
export CASPER_CLIENT_BIN="$(command -v casper-client)"
export LASTRE_API_BASE=http://127.0.0.1:3001

# Terminal A — API
cd app && npm run build:api && LASTRE_X402_MODE=casper \
  LASTRE_X402_SECRET_KEY_PATH="$LASTRE_X402_SECRET_KEY_PATH" \
  LASTRE_X402_PAY_TO="$LASTRE_X402_PAY_TO" \
  npm run start:api

# Terminal B — settle
node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay --mode casper
# or
./scripts/x402-real-smoke.sh CARBON-VCS-AMAZONIA-2024-001
```

Expected CLI fields:

- `settlementKind`: `casper_deploy`
- `facilitator` / `facilitatorMode`: `casper`
- `txHash`: 64-hex
- `paymentExplorerUrl`: `https://testnet.cspr.live/transaction/<txHash>`
- `provenance.verdict`: `Valid`, `sealMatch`: true

## Render

1. Redeploy service using `Dockerfile.app-api` (includes `casper-client` + entrypoint).
2. Environment → Secret — **use base64** (avoids PEM newline corruption):

```bash
# On your Mac only — copy the single line output into Render:
base64 -i ~/.casper-keys/lastro-deploy/secret_key.pem | tr -d '\n'
echo   # newline after paste
```

```text
LASTRE_X402_MODE=casper
LASTRE_X402_PAY_TO=<recipient public_key_hex>
LASTRE_X402_SECRET_KEY_B64=<paste single-line base64 from command above>
```

Optional: remove `LASTRE_X402_SECRET_KEY_PEM` if you set B64 (B64 wins).

If you still use PEM and see `malformedframing`, switch to B64.

3. Confirm:

```bash
curl -s https://app-api.lastre.io/api/evidence | jq .x402
# facilitatorMode should be "casper" when keys loaded

node packages/cli/bin/lastre.mjs prove CARBON-VCS-AMAZONIA-2024-001 --pay --mode casper
```

4. **Never** put the secret key in the git repo or BUIDL page. Only publish the **payment** `txHash` after a successful settle.

## Honesty rules

| Path | Settlement |
| --- | --- |
| `POST /api/x402/simulate/*` | Always `synthetic_receipt` / mock |
| `POST /api/x402/settle/*` | Real only if mode=casper; else 409 |
| `GET + X-PAYMENT` | Uses env facilitator (mock or casper) |
| Mint explorer links | Still null for simulated MintGate events |

## Amount

Quote amount is `2_500_000_000` motes (**2.5 CSPR**) — Casper Testnet minimum native transfer — plus standard payment gas (~2.5 CSPR).  
Payer purse must be funded on testnet.

## Live production sample (2026-07-19)

```bash
curl -sS -X POST https://app-api.lastre.io/api/x402/settle/CARBON-VCS-AMAZONIA-2024-001
```

| Field | Value |
| --- | --- |
| `ok` | `true` |
| `settlementKind` | `casper_deploy` |
| `facilitatorMode` | `casper` |
| `txHash` | `4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6` |
| Explorer | https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6 |
| On-chain action | **Transfer 2.50 CSPR** (native) · `casper-test` · ~19:03:34 UTC |
| Provenance | `verdict=Valid`, `sealMatch=true` for carbon asset |

### Density pass (2026-07-21)

| Field | Value |
| --- | --- |
| `txHash` | `b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106` |
| Explorer | https://testnet.cspr.live/transaction/b1967b6379c67f64a1b4f28767450f18d9aaca137a841f8c2b107765c18f2106 |
| Prior | https://testnet.cspr.live/transaction/5c12586dd5b61fc82f5c818d46b0141af68ea8610f715d47653544540526649c |
| `settlementKind` | `casper_deploy` · `paymentExplorerUrl` set |

## vs MAKE / CSPR.cloud official x402 facilitator

| | Lastre prod today | MAKE path (Telegram David H) |
| --- | --- | --- |
| Settlement | `casper-client transfer` native **CSPR** | Facilitator HTTP **verify/settle** |
| Asset | Native CSPR | **WCSPR** (CEP-18) |
| Endpoint | Our API + casper-client | `https://x402-facilitator.cspr.cloud` |
| Proof for jury | **Real testnet tx hash** | Same class of proof if adopted |

Both move real testnet value. Lastre already proves paid provenance with on-chain transfer. Optional later: wire WCSPR + CSPR.cloud for full parity with Linux Foundation / MAKE examples — **not required to claim real settle today**.
