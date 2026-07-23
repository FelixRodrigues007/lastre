#!/usr/bin/env bash
# Call mint_lot on the live MintGate package.
set -Eeuo pipefail
NODE="${NODE_ADDRESS:-https://node.testnet.casper.network/rpc}"
CHAIN="${CHAIN_NAME:-casper-test}"
KEY="${ODRA_CASPER_LIVENET_SECRET_KEY_PATH:-$HOME/.casper-keys/lastro-deploy/secret_key.pem}"
# casper-client package-address requires package- prefix
PKG="${LASTRE_MINTGATE_PACKAGE_ADDRESS:-package-ea049cd14a502412ed53b4ebc00abb6639a83ca2f07aa3c2113693c94b995ae1}"
ASSET="${1:-MINA-VALEDOURO-LOTE-002}"
GAS="${LASTRE_MINT_LOT_GAS:-10000000000}"

OUT=$(casper-client put-transaction package \
  --node-address "$NODE" \
  --chain-name "$CHAIN" \
  --secret-key "$KEY" \
  --package-address "$PKG" \
  --session-entry-point mint_lot \
  --pricing-mode classic \
  --standard-payment true \
  --payment-amount "$GAS" \
  --gas-price-tolerance 1 \
  --session-arg "asset_id:string='${ASSET}'")

echo "$OUT" | jq .
TX=$(printf '%s' "$OUT" | jq -r '.result.transaction_hash.Version1 // .result.transaction_hash.Deploy')
echo "mint_lot_tx=$TX"
echo "explorer=https://testnet.cspr.live/transaction/$TX"
