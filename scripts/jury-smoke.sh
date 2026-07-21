#!/usr/bin/env bash
# Final Round jury dry-run — APIs + autonomy density (no Dora UI).
# Usage: bash scripts/jury-smoke.sh
set -euo pipefail
API="${LASTRE_API_BASE:-https://app-api.lastre.io}"
API="${API%/}"
fail=0

ok() { echo "PASS  $1"; }
bad() { echo "FAIL  $1 — $2"; fail=1; }

echo "=== Lastre jury smoke · ${API} · $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="

# 1 health
h="$(curl -sS --max-time 30 "${API}/api/health" || true)"
echo "$h" | grep -q '"ok":true' && ok "health ok" || bad "health" "$h"
echo "$h" | grep -q 'casper' && ok "facilitatorMode casper" || bad "facilitator" "$h"

# 2 evidence jury mode
e="$(curl -sS --max-time 45 "${API}/api/evidence" || true)"
echo "$e" | grep -q 'lastCasperSettle\|lastCasperSettle' && ok "evidence lastCasperSettle" || {
  # older deploy may lack field until redeploy
  echo "$e" | grep -q 'dualKey' && ok "evidence dualKey (lastCasperSettle pending redeploy)" || bad "evidence" "no dualKey"
}
echo "$e" | grep -q '"distinct":true\|"distinct": true' && ok "dualKey.distinct" || bad "dualKey" "not distinct"
echo "$e" | grep -q 'honesty\|Honest' && ok "honesty block" || echo "WARN  honesty block pending redeploy"

# 3 mint summary
m="$(curl -sS --max-time 25 "${API}/api/mint/summary" || true)"
echo "$m" | grep -q 'mintCount\|packageHash' && ok "mint summary" || bad "mint" "$m"

# 4 simulate (mock path)
sim="$(curl -sS --max-time 40 -X POST "${API}/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001" \
  -H "Content-Type: application/json" -d '{"from":"jury-smoke"}' || true)"
echo "$sim" | grep -q '"ok":true\|"ok": true' && ok "x402 simulate mock" || bad "simulate" "$sim"
echo "$sim" | grep -qi 'Valid' && ok "simulate Valid" || bad "simulate verdict" "$sim"

# 5 autonomy density (3 cycles)
if command -v node >/dev/null 2>&1; then
  ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
  for i in 1 2 3; do
    if LASTRE_API_BASE="$API" AUTONOMY_SOURCE="jury-smoke-$i" node "$ROOT/scripts/autonomous-cycle.mjs" >/tmp/lastre-auton-$i.log 2>&1; then
      ok "autonomy cycle $i"
    else
      bad "autonomy $i" "$(tail -3 /tmp/lastre-auton-$i.log | tr '\n' ' ')"
    fi
  done
  a="$(curl -sS --max-time 20 "${API}/api/agent/autonomy" || true)"
  echo "$a" | grep -q 'cyclesTotal' && ok "autonomy summary" || bad "autonomy GET" "$a"
else
  echo "WARN  node missing — skip autonomy CLI"
fi

# 6 invalid sample explorer (HEAD-ish)
code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 \
  'https://testnet.cspr.live/transaction/5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd' || echo 000)"
[[ "$code" == "200" || "$code" == "301" || "$code" == "302" ]] && ok "invalid sample explorer HTTP $code" || echo "WARN  explorer HTTP $code"

echo "=== result fail=$fail ==="
exit "$fail"
