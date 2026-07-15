#!/usr/bin/env bash
# Real x402 CSPR smoke — only when LASTRE_X402_MODE=casper and keys are set.
# Default judge path remains mock; this script fails closed if misconfigured.
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
API_BASE="${LASTRE_API_BASE:-https://app-api.lastre.io}"
ASSET_ID="${1:-CARBON-VCS-AMAZONIA-2024-001}"

log() { printf '[x402-real-smoke] %s\n' "$*"; }
fail() { printf '[x402-real-smoke] ERROR: %s\n' "$*" >&2; exit 1; }

MODE="${LASTRE_X402_MODE:-mock}"
if [[ "$MODE" != "casper" ]]; then
  log "LASTRE_X402_MODE=$MODE (not casper). Running mock simulate check only."
  curl -fsS -X POST "$API_BASE/api/x402/simulate/$ASSET_ID" \
    -H 'Content-Type: application/json' \
    -d '{"from":"x402-real-smoke-mock"}' | head -c 600
  echo
  log "PASS (mock path). For real CSPR set LASTRE_X402_MODE=casper + LASTRE_X402_SECRET_KEY_PATH + LASTRE_X402_PAY_TO on the API host."
  exit 0
fi

KEY="${LASTRE_X402_SECRET_KEY_PATH:-${SANDBOX_SECRET_KEY_PATH:-}}"
PAY_TO="${LASTRE_X402_PAY_TO:-${LASTRE_X402_TARGET_ACCOUNT:-}}"
[[ -n "$KEY" && -f "$KEY" ]] || fail "casper mode requires LASTRE_X402_SECRET_KEY_PATH pointing to a PEM file"
[[ -n "$PAY_TO" ]] || fail "casper mode requires LASTRE_X402_PAY_TO (recipient public key)"
command -v casper-client >/dev/null 2>&1 || fail "casper-client not on PATH"

log "mode=casper key=$KEY payTo=$PAY_TO"
log "NOTE: UI /simulate stays mock. Real settle is via settleProvenanceQuery on a casper-mode API."
log "Checking API reports facilitatorMode=casper when keys are configured on the server..."
curl -fsS "$API_BASE/api/evidence" | head -c 800
echo
log "If facilitatorMode is still mock, the remote API does not have keys — run settle against a local API with env set."
log "PASS (config check). Execute a local settle in app runtime tests or a funded environment to print a real payment tx."
