# MintGate live status — Tier 0 attempt

Date: 2026-07-15

## Status

**T0.2 MintGate live deploy: FAIL / BLOCKED**

No MintGate package hash or `mint_lot` transaction is claimed in this document.
No fake Casper explorer links were added.

## Existing ProofOfOrigin dependency

| Field | Value |
| --- | --- |
| ProofOfOrigin package | `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561` |
| ProofOfOrigin contract version hash (RPC package version) | `contract-27f08307b82295e664fa5d2d7473bd10e393962f7f113f8fd1beadb51fd816b4` |

RPC query used:

```bash
casper-client query-global-state \
  -n https://node.testnet.casper.network/rpc \
  -k hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
```

## Deploy attempts

### Attempt 1 — contract hash as init proof_contract

```text
invalid ProofOfOrigin contract address: ExecutionError(AddressCreationFailed)
```

### Attempt 2/3 — package hash as init proof_contract

Command shape:

```bash
cd contracts/lastro_origin
ODRA_CASPER_LIVENET_SECRET_KEY_PATH="$HOME/.casper-keys/lastro-deploy/secret_key.pem" \
LASTRE_PROOF_OF_ORIGIN_CONTRACT_HASH="hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561" \
cargo run --features livenet --bin deploy_mint_gate
```

Observed output:

```text
== Lastre MintGate deploy ==
proof_contract : hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
note           : using ProofOfOrigin package address accepted by Odra livenet
Found wasm under "contracts/lastro_origin/wasm/MintGate.wasm".
Deploying "MintGate".
Contract init failed ExecutionError(ContractDeploymentError)
```

Backtrace points to Odra deploy host:

```text
<lastro_contracts::mint_gate::MintGate as odra_core::host::Deployer<...>>::deploy
at odra-core-2.8.1/src/host.rs:216:23
```

## Current production truth

```bash
curl -sS https://app-api.lastre.io/api/evidence | jq '.mintGate.livePackageHash, .mintGate.livePackageUrl'
# null
# null
```

## Required before PASS

- Fix/validate the Odra livenet MintGate init argument/address format.
- Deploy a real MintGate package on Casper Testnet.
- Execute at least one real `mint_lot` on a Valid ProofOfOrigin asset.
- Record only the resulting real package hash and real 64-hex transaction hash.
- Set `LASTRE_MINTGATE_PACKAGE_HASH` on Render after package is verified.
