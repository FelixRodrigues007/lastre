# MintGate live — Casper Testnet

**Status: PASS (2026-07-15)**

Live MintGate package + real `mint_lot` after Valid ProofOfOrigin attestation.

## Package

| Field | Value |
| --- | --- |
| Package hash | `hash-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1` |
| Package explorer | https://testnet.cspr.live/contract-package/ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1 |
| Contract version | `contract-393fe028bd5201b74a619e3ac2dcb11188c5333132a2f1c68b3aa7e60842951b` |
| Install / deploy tx | `13955752c3836b5fbc0da7281af102cc5f8953eae7ba543232697d3f3f81e8b7` |
| Install explorer | https://testnet.cspr.live/transaction/13955752c3836b5fbc0da7281af102cc5f8953eae7ba543232697d3f3f81e8b7 |

## mint_lot sample

| Field | Value |
| --- | --- |
| asset_id | `MINA-VALEDOURO-LOTE-002` (Valid on ProofOfOrigin) |
| mint_lot tx | `6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349` |
| Explorer | https://testnet.cspr.live/transaction/6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349 |
| execution | `error_message: null` |

## ProofOfOrigin dependency

| Field | Value |
| --- | --- |
| Package | `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561` |
| Contract version | `contract-27f08307b82295e664fa5d2d7473bd10e393962f7f113f8fd1beadb51fd816b4` |

## How it was deployed

Odra livenet `Deployer` fails on public testnet because it requires the **SSE event stream** (`ODRA_CASPER_LIVENET_EVENTS_URL`) before put-transaction (same class of issue as `bin/attest.rs` writes).

Working path (mirrors attest writes):

```bash
# Install MintGate session wasm with Odra constructor args
casper-client put-transaction session \
  --node-address https://node.testnet.casper.network/rpc \
  --chain-name casper-test \
  --secret-key "$HOME/.casper-keys/lastro-deploy/secret_key.pem" \
  --wasm-path contracts/lastro_origin/wasm/MintGate.wasm \
  --install-upgrade \
  --pricing-mode classic --standard-payment true \
  --payment-amount 500000000000 --gas-price-tolerance 1 \
  --session-arg "proof_contract:key='hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561'" \
  --session-arg "odra_cfg_package_hash_key_name:string='MintGate'" \
  --session-arg "odra_cfg_is_upgradable:bool='false'" \
  --session-arg "odra_cfg_is_upgrade:bool='false'" \
  --session-arg "odra_cfg_allow_key_override:bool='true'" \
  --session-arg "odra_cfg_constructor:string='init'"

# mint_lot (package- prefix required by casper-client)
casper-client put-transaction package \
  --package-address package-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1 \
  --session-entry-point mint_lot \
  --session-arg "asset_id:string='MINA-VALEDOURO-LOTE-002'" \
  # ... same node/key/payment flags
```

Helper: `scripts/deploy-mintgate-casper.sh`

## API / Render

Defaults are baked into `app/server/mint-economics.ts` (`DEFAULT_MINTGATE_*`).  
Optional env override: `LASTRE_MINTGATE_PACKAGE_HASH`.

After API redeploy:

```bash
curl -sS https://app-api.lastre.io/api/mint/economics | jq '{
  livePackageHash, liveMintLotTx, livePackageUrl, note
}'
curl -sS https://app-api.lastre.io/api/evidence | jq '.mintGate | {livePackageHash, liveMintLotTx, livePackageUrl}'
```

## Economics rule (unchanged)

`mint_lot` only succeeds when ProofOfOrigin has **Valid** for that `asset_id`. Invalid/missing → `NoValidProof`. Already gated → `AlreadyMinted`.
