#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

SEALER_KEY_DIR="${LASTRE_SEALER_KEY_DIR:-$HOME/.casper-keys/lastro-sealer}"
ATTESTER_KEY_DIR="${LASTRE_ATTESTER_KEY_DIR:-$HOME/.casper-keys/lastro-deploy}"
ASSET_ID="${LASTRE_DUAL_KEY_ASSET_ID:-CARBON-VCS-AMAZONIA-2024-001}"
ATTESTER_LAST_TX="${LASTRE_ATTESTER_LAST_TX:-a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e}"
SEALER_LAST_TX="${LASTRE_SEALER_LAST_TX:-e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e}"
RULE="Two keys, one seal rule"
OUT="${LASTRE_DUAL_KEY_OUTPUT:-output/dual-key-run.json}"
ARTIFACT_OUT="${LASTRE_DUAL_KEY_ARTIFACT:-output/dual-key-artifact.json}"

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "missing required file: $path" >&2
    exit 1
  fi
}

require_file "$SEALER_KEY_DIR/public_key_hex"
require_file "$ATTESTER_KEY_DIR/public_key_hex"

SEALER_PUBLIC_KEY="$(tr -d '[:space:]' < "$SEALER_KEY_DIR/public_key_hex")"
ATTESTER_PUBLIC_KEY="$(tr -d '[:space:]' < "$ATTESTER_KEY_DIR/public_key_hex")"

SEALER_ACCOUNT="$(casper-client account-address --public-key "$SEALER_PUBLIC_KEY" | tr -d '[:space:]')"
ATTESTER_ACCOUNT="$(casper-client account-address --public-key "$ATTESTER_PUBLIC_KEY" | tr -d '[:space:]')"

if [[ "$SEALER_ACCOUNT" == "$ATTESTER_ACCOUNT" ]]; then
  echo "dual-key assertion failed: sealer account equals attester account ($SEALER_ACCOUNT)" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")" "$(dirname "$ARTIFACT_OUT")"

CAPTURED_AT="${LASTRE_DUAL_KEY_CAPTURED_AT:-2026-07-15T00:00:00.000Z}"
cat > "$ARTIFACT_OUT" <<JSON
{
  "assetId": "$ASSET_ID",
  "category": "dual_key_operational_run",
  "capturedAtISO": "$CAPTURED_AT",
  "operator": "Lastre field sealer",
  "sealerPublicKey": "$SEALER_PUBLIC_KEY",
  "attesterPublicKey": "$ATTESTER_PUBLIC_KEY",
  "rule": "$RULE"
}
JSON

SEAL="$(python3 - "$ARTIFACT_OUT" <<'PY'
import hashlib, json, sys
path=sys.argv[1]
obj=json.load(open(path))
canonical=json.dumps(obj, sort_keys=True, separators=(',', ':'))
print(hashlib.sha256(canonical.encode()).hexdigest())
PY
)"

python3 - "$OUT" <<PY
import json, pathlib
out=pathlib.Path("$OUT")
run={
  "sealer": {
    "publicKey": "$SEALER_PUBLIC_KEY",
    "accountHash": "$SEALER_ACCOUNT",
    "lastTx": "$SEALER_LAST_TX",
    "lastTxExplorerUrl": "https://testnet.cspr.live/transaction/$SEALER_LAST_TX"
  },
  "attester": {
    "publicKey": "$ATTESTER_PUBLIC_KEY",
    "accountHash": "$ATTESTER_ACCOUNT",
    "lastTx": "$ATTESTER_LAST_TX",
    "lastTxExplorerUrl": "https://testnet.cspr.live/transaction/$ATTESTER_LAST_TX"
  },
  "assetId": "$ASSET_ID",
  "artifactPath": "$ARTIFACT_OUT",
  "seal": "$SEAL",
  "rule": "$RULE",
  "notes": [
    "Sealer key generated/held separately from attester key.",
    "Sealer lastTx is sealer-signed identity transfer on Casper Testnet.",
    "Attester lastTx is carbon Valid ProofOfOrigin attest (CARBON-VCS-AMAZONIA-2024-001).",
    "Seal is computed offline from output/dual-key-artifact.json.",
    "No secret material is written to this output."
  ]
}
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(run, indent=2) + "\n")
PY

printf 'sealer publicKey: %s\n' "$SEALER_PUBLIC_KEY"
printf 'sealer accountHash: %s\n' "$SEALER_ACCOUNT"
printf 'attester publicKey: %s\n' "$ATTESTER_PUBLIC_KEY"
printf 'attester accountHash: %s\n' "$ATTESTER_ACCOUNT"
printf 'assetId: %s\n' "$ASSET_ID"
printf 'seal: %s\n' "$SEAL"
printf 'wrote: %s\n' "$OUT"
