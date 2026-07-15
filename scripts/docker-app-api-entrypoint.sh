#!/bin/sh
# Render/Docker entrypoint for app-api.
# Prefer LASTRE_X402_SECRET_KEY_B64 (single-line, no newline corruption).
# Node also re-normalizes PEM/B64 via prepareX402SecretsFromEnv at boot.
set -eu

SECRETS_DIR=/secrets
KEY_PATH="${SECRETS_DIR}/x402_secret_key.pem"

if [ -n "${LASTRE_X402_SECRET_KEY_B64:-}" ]; then
  mkdir -p "$SECRETS_DIR"
  printf '%s' "$LASTRE_X402_SECRET_KEY_B64" | tr -d ' \n\r\t' | base64 -d > "$KEY_PATH"
  chmod 600 "$KEY_PATH"
  export LASTRE_X402_SECRET_KEY_PATH="$KEY_PATH"
elif [ -n "${LASTRE_X402_SECRET_KEY_PEM:-}" ]; then
  mkdir -p "$SECRETS_DIR"
  # Expand literal \n; strip CR. Node normalizePem will finish repair if needed.
  printf '%s' "$LASTRE_X402_SECRET_KEY_PEM" | sed 's/\r//g; s/\\n/\n/g' > "$KEY_PATH"
  printf '\n' >> "$KEY_PATH"
  chmod 600 "$KEY_PATH"
  export LASTRE_X402_SECRET_KEY_PATH="$KEY_PATH"
fi

if [ -z "${CASPER_CLIENT_BIN:-}" ] && [ -x /app/bin/casper-client ]; then
  export CASPER_CLIENT_BIN=/app/bin/casper-client
  export PATH="/app/bin:${PATH}"
fi

exec node app/server-dist/index.js
