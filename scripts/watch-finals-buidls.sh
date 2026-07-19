#!/usr/bin/env bash
# Snapshot Final Round BUIDL IDs via jina reader (Dora WAF blocks raw curl).
# Usage: bash scripts/watch-finals-buidls.sh
set -euo pipefail
ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd -P)"
STATE="${ROOT}/.cache/finals-known-buidls.json"
URL="https://dorahacks.io/hackathon/casper-agentic-buildathon-finals/buidl"
JINA="https://r.jina.ai/https://dorahacks.io/hackathon/casper-agentic-buildathon-finals/buidl"
mkdir -p "${ROOT}/.cache"

html="$(curl -sS --max-time 45 -A "Mozilla/5.0 Lastre-Finals-Watch/1.0" "$JINA" || true)"
# IDs like /buidl/46732
mapfile -t ids < <(printf '%s' "$html" | grep -oE '/buidl/[0-9]+' | sed 's|/buidl/||' | sort -u)

count="${#ids[@]}"
echo "FINAL_BUIDL_COUNT=${count}"
echo "FINAL_BUIDL_IDS=${ids[*]:-}"

# Extract rough name lines near each id (best-effort from jina markdown)
for id in "${ids[@]:-}"; do
  # grab a window around the buidl link
  snippet="$(printf '%s' "$html" | tr '\n' ' ' | grep -oE ".{0,80}/buidl/${id}.{0,200}" | head -1 || true)"
  echo "ID ${id}: ${snippet:0:220}"
done

# Compare to known if jq available
if command -v jq >/dev/null 2>&1 && [[ -f "$STATE" ]]; then
  known="$(jq -r '.knownIds[]' "$STATE" 2>/dev/null || true)"
  for id in "${ids[@]:-}"; do
    if ! printf '%s\n' "$known" | grep -qx "$id"; then
      echo "NEW_BUIDL_ID=${id}"
    fi
  done
  # missing from page (removed) — rare
  while IFS= read -r kid; do
    [[ -z "$kid" ]] && continue
    found=0
    for id in "${ids[@]:-}"; do
      [[ "$id" == "$kid" ]] && found=1 && break
    done
    if [[ "$found" -eq 0 ]]; then
      echo "REMOVED_BUIDL_ID=${kid}"
    fi
  done <<< "$known"
fi
