#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
REPO="FelixRodrigues007/lastre"
API_BASE="${LASTRE_API_BASE:-https://app-api.lastre.io}"
APP_URL="${LASTRE_APP_URL:-https://app.lastre.io/marketplace}"
LANDING_URL="${LASTRE_LANDING_URL:-https://lastre.io}"
COMMUNITY_URL="${LASTRE_COMMUNITY_URL:-https://github.com/FelixRodrigues007/lastre/community}"

log() { printf '[final-smoke] %s\n' "$*"; }
fail() { printf '[final-smoke] ERROR: %s\n' "$*" >&2; exit 1; }
need_cmd() { command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"; }

need_cmd curl
need_cmd head

log "repo: $ROOT_DIR"

if command -v gh >/dev/null 2>&1; then
  log "checking GitHub repository metadata"
  gh repo view "$REPO" --json isPrivate,description,homepageUrl,repositoryTopics >/dev/null \
    || fail "gh repo view failed"

  log "checking GitHub community profile"
  community_health="$(gh api "repos/$REPO/community/profile" --jq '.health_percentage')" \
    || fail "community profile query failed"
  [[ "$community_health" == "100" ]] || fail "community health is $community_health, expected 100"

  log "checking open Dependabot high/critical alerts"
  high_critical="$(gh api "repos/$REPO/dependabot/alerts" \
    --jq '[.[]|select(.state=="open" and (.security_advisory.severity=="high" or .security_advisory.severity=="critical"))] | length')" \
    || fail "dependabot alert query failed"
  [[ "$high_critical" == "0" ]] || fail "open high/critical Dependabot alerts: $high_critical"
else
  log "gh not found; skipping GitHub API checks"
fi

log "checking API health"
curl -fsS "$API_BASE/api/health" >/dev/null || fail "API health failed"

log "checking mint summary"
curl -fsS "$API_BASE/api/mint/summary" | head -c 400 >/dev/null || fail "mint summary failed"

log "checking x402 simulate path"
curl -fsS -X POST "$API_BASE/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001" \
  -H "Content-Type: application/json" \
  -d '{"from":"casper-buildathon-final-smoke"}' >/dev/null || fail "x402 simulate failed"

log "checking landing and app HTTP responses"
curl -fsSI "$LANDING_URL" >/dev/null || fail "landing HEAD failed"
curl -fsSI "$APP_URL" >/dev/null || fail "app HEAD failed"

log "manual checks still required:"
printf '  - Open %s and click Run Demo\n' "$APP_URL"
printf '  - Open %s\n' "https://app.lastre.io/agents"
printf '  - Open %s\n' "$COMMUNITY_URL"

log "PASS"
