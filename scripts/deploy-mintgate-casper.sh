#!/usr/bin/env bash
# Deploy MintGate via casper-client (bypasses Odra SSE/event-stream issues on public testnet).
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
NODE="${NODE_ADDRESS:-https://node.testnet.casper.network/rpc}"
CHAIN="${CHAIN_NAME:-casper-test}"
KEY="${ODRA_CASPER_LIVENET_SECRET_KEY_PATH:-$HOME/.casper-keys/lastro-deploy/secret_key.pem}"
POO="${LASTRE_PROOF_OF_ORIGIN_PACKAGE_HASH:-hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561}"
WASM="${ROOT}/contracts/lastro_origin/wasm/MintGate.wasm"
GAS="${LASTRE_MINTGATE_DEPLOY_GAS:-500000000000}"

[[ -f "$KEY" ]] || { echo "missing secret key: $KEY" >&2; exit 1; }
[[ -f "$WASM" ]] || { echo "missing wasm: $WASM (run cargo odra build)" >&2; exit 1; }

echo "== MintGate install =="
OUT=$(casper-client put-transaction session \
  --node-address "$NODE" \
  --chain-name "$CHAIN" \
  --secret-key "$KEY" \
  --wasm-path "$WASM" \
  --install-upgrade \
  --pricing-mode classic \
  --standard-payment true \
  --payment-amount "$GAS" \
  --gas-price-tolerance 1 \
  --session-arg "proof_contract:key='${POO}'" \
  --session-arg "odra_cfg_package_hash_key_name:string='MintGate'" \
  --session-arg "odra_cfg_is_upgradable:bool='false'" \
  --session-arg "odra_cfg_is_upgrade:bool='false'" \
  --session-arg "odra_cfg_allow_key_override:bool='true'" \
  --session-arg "odra_cfg_constructor:string='init'")

echo "$OUT" | jq .
TX=$(printf '%s' "$OUT" | jq -r '.result.transaction_hash.Version1 // .result.transaction_hash.Deploy')
echo "install_tx=$TX"
echo "Poll get-transaction until success, then read account named key MintGate for package hash."
