#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)"
CONTRACT_DIR="$ROOT_DIR/contracts/lastro_origin"
CARGO_ODRA_VERSION="${LASTRO_CARGO_ODRA_VERSION:-0.1.7}"
RUST_TOOLCHAIN="${LASTRO_RUST_TOOLCHAIN:-nightly-2026-01-01}"

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
rustup toolchain install "$RUST_TOOLCHAIN"
rustup show active-toolchain

log "Ensuring wasm32 target for the pinned toolchain"
rustup target add wasm32-unknown-unknown --toolchain "$RUST_TOOLCHAIN"

if cargo +"$RUST_TOOLCHAIN" odra --version >/dev/null 2>&1; then
  log "Found $(cargo +"$RUST_TOOLCHAIN" odra --version)"
else
  log "cargo-odra not found; installing cargo-odra ${CARGO_ODRA_VERSION}"
  cargo +"$RUST_TOOLCHAIN" install cargo-odra --version "$CARGO_ODRA_VERSION" --locked
fi
