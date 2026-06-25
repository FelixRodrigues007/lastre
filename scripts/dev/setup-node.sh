#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"

log() {
  printf '==> %s\n' "$*"
}

require_cmd() {
  local -r command_name="$1"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'ERROR: required command not found: %s\n' "$command_name" >&2
    return 1
  fi
}

install_package() {
  local -r package_dir="$1"

  log "Installing Node dependencies in ${package_dir#"$ROOT_DIR"/}"
  cd "$package_dir"

  if [[ -f package-lock.json ]]; then
    npm ci
  else
    npm install
  fi
}

require_cmd node
require_cmd npm

install_package "$ROOT_DIR/agent/sealer"
install_package "$ROOT_DIR/agent/x402"
install_package "$ROOT_DIR/agent/orchestrator"
install_package "$ROOT_DIR/agent/gateway"
