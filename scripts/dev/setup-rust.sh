#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"
CONTRACT_DIR="$ROOT_DIR/contracts/lastro_origin"
CARGO_ODRA_VERSION="${LASTRO_CARGO_ODRA_VERSION:-0.1.7}"

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

require_cmd rustup
require_cmd cargo

cd "$CONTRACT_DIR"

log "Using Rust toolchain"
rustup show active-toolchain

log "Ensuring wasm32 target for the pinned toolchain"
rustup target add wasm32-unknown-unknown

if cargo odra --version >/dev/null 2>&1; then
  log "Found $(cargo odra --version)"
else
  log "cargo-odra not found; installing cargo-odra ${CARGO_ODRA_VERSION}"
  cargo install cargo-odra --version "$CARGO_ODRA_VERSION" --locked
fi
