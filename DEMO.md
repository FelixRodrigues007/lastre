# Lastre — Demo Runbook

This runbook is for the local Lastre demo experience. All lot, operator, and origin data is fictional.

> DEMONSTRATION — simulated assets, no investment offered.

Lastre is a provenance trust layer. The public action is **Verify provenance**. Do not present this demo as buying, selling, investing, yield, return, or price discovery.

## Live protocol reference

```bash
export NODE_ADDRESS="https://node.testnet.casper.network/rpc"
export CHAIN_NAME="casper-test"
export LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH="hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561"
export PACKAGE_ADDRESS="package-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561"
```

## Build and start the experience

```bash
make build
make gateway
```

Open:

```text
http://localhost:3456/demo
http://localhost:3456/marketplace
http://localhost:3456/proof
```

## Register a fresh demo reference with the owner key

Use a new `SANDBOX-*` id so the public anchor path can remain locked to the sandbox namespace.

```bash
export ASSET_ID="SANDBOX-DEMO-LOTE-001"
export REFERENCE_SEAL="111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000"
export OWNER_SECRET_KEY_PATH="$HOME/.casper-keys/lastro-deploy/secret_key.pem"

REGISTER_JSON=$(casper-client put-transaction package \
  --node-address "$NODE_ADDRESS" --chain-name "$CHAIN_NAME" \
  --secret-key "$OWNER_SECRET_KEY_PATH" \
  --package-address "$PACKAGE_ADDRESS" \
  --session-entry-point register_reference \
  --pricing-mode classic --standard-payment true \
  --payment-amount 5000000000 --gas-price-tolerance 1 \
  --session-arg "asset_id:string='SANDBOX-DEMO-LOTE-001'" \
  --session-arg "reference_seal:string='111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000'")

echo "$REGISTER_JSON"
export REGISTER_TX=$(printf '%s' "$REGISTER_JSON" | jq -r '.result.transaction_hash.Version1 // .result.transaction_hash.Deploy // .result.transaction_hash')
echo "register_reference tx: $REGISTER_TX"
```

Poll until `error_message` is `null`:

```bash
casper-client get-transaction --node-address "$NODE_ADDRESS" "$REGISTER_TX" \
  | jq '.result.execution_info.execution_result'
```

## Anchor a fresh attestation before recording

The anchor path uses the existing `bin/attest.rs` binary. It shells out to `casper-client`, polls the transaction until confirmation, and then reads the verdict back through Odra livenet.

For a fresh **Valid** sandbox attestation, provide the same seal as the registered reference:

```bash
cd contracts/lastro_origin

LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH="$LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH" \
ODRA_CASPER_LIVENET_NODE_ADDRESS="$NODE_ADDRESS" \
ODRA_CASPER_LIVENET_CHAIN_NAME="$CHAIN_NAME" \
ODRA_CASPER_LIVENET_SECRET_KEY_PATH="$OWNER_SECRET_KEY_PATH" \
LASTRO_AGENT_ASSET_ID=SANDBOX-DEMO-LOTE-001 \
LASTRO_AGENT_PROVIDED_SEAL=111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000 \
LASTRO_AGENT_SKIP_REGISTER=1 \
cargo +nightly-2026-01-01 run --features livenet --bin attest
```

For an **Invalid** sandbox proof, change only `LASTRO_AGENT_PROVIDED_SEAL` to a different 64-hex value. That is still a successful on-chain record: both Valid and Invalid verdicts are written permanently.

## Fresh recording checklist

1. Run `make query` and confirm the current `accepted_count()` and `rejected_count()`.
2. Start `make gateway` in a separate terminal.
3. Open `/marketplace`, use the mineral/status filters, and show that simulated lots stay labeled `Simulated`.
4. Open `/proof` and show live counters plus cspr.live transaction links.
5. Register a new `SANDBOX-*` reference with the owner key.
6. Run the fresh `bin/attest` command above.
7. Refresh `/proof` and show the new counter state and transaction link.

## Safety notes

- The owner secret key stays outside git.
- The gateway public anchor remains disabled unless `SANDBOX_ANCHOR_ENABLED=true` is set intentionally for a controlled run.
- Use a low-balance demo account for public sandbox anchoring when possible.
- All operators, coordinates, lots, and custody paths in `web/public/catalog.json` are fictional.
