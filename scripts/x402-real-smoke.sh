#!/usr/bin/env bash
# Real x402 CSPR smoke — only when API (or local env) is casper-mode.
# Default judge path remains mock; this script fails closed if misconfigured
# for a real settle attempt.
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
API_BASE="${LASTRE_API_BASE:-https://app-api.lastre.io}"
ASSET_ID="${1:-CARBON-VCS-AMAZONIA-2024-001}"
CLI="${ROOT_DIR}/packages/cli/bin/lastre.mjs"

log() { printf '[x402-real-smoke] %s\n' "$*"; }
fail() { printf '[x402-real-smoke] ERROR: %s\n' "$*" >&2; exit 1; }

MODE="${LASTRE_X402_MODE:-mock}"

if [[ "$MODE" != "casper" ]]; then
  log "LASTRE_X402_MODE=$MODE (not casper). Running mock simulate check only."
  curl -fsS -X POST "$API_BASE/api/x402/simulate/$ASSET_ID" \
    -H 'Content-Type: application/json' \
    -d '{"from":"x402-real-smoke-mock"}' | head -c 800
  echo
  log "PASS (mock path). For real CSPR:"
  log "  1) On API host: LASTRE_X402_MODE=casper LASTRE_X402_PAY_TO=<pubkey> + secret key"
  log "  2) export LASTRE_X402_MODE=casper LASTRE_API_BASE=... && $0 $ASSET_ID"
  log "  3) Or: node packages/cli/bin/lastre.mjs prove $ASSET_ID --pay --mode casper"
  exit 0
fi

log "mode=casper api=$API_BASE asset=$ASSET_ID"
log "Probing evidence facilitatorMode..."
EVIDENCE="$(curl -fsS "$API_BASE/api/evidence")"
echo "$EVIDENCE" | head -c 500
echo

# Prefer CLI real settle path
if [[ ! -f "$CLI" ]]; then
  fail "CLI missing at $CLI"
fi

log "Running CLI prove --pay --mode casper"
set +e
OUT="$(LASTRE_API_BASE="$API_BASE" node "$CLI" prove "$ASSET_ID" --pay --mode casper 2>&1)"
RC=$?
set -e
printf '%s\n' "$OUT"

if [[ $RC -ne 0 ]]; then
  fail "CLI casper settle failed (exit $RC). Configure API secrets + casper-client, or run against a local API."
fi

echo "$OUT" | grep -q 'casper_deploy' || fail "expected settlementKind casper_deploy in CLI output"
echo "$OUT" | grep -Eq '"txHash": "[0-9a-f]{64}"' || fail "expected 64-hex payment txHash"

TX="$(printf '%s' "$OUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const j=JSON.parse(s);console.log(j.txHash||"")})')"
log "PASS real settle txHash=$TX"
log "Explorer: https://testnet.cspr.live/transaction/$TX"
