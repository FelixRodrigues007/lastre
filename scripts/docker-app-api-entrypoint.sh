#!/bin/sh
# Render/Docker entrypoint for app-api.
# Materializes LASTRE_X402_SECRET_KEY_PEM into a file before Node boots.
set -eu

if [ -n "${LASTRE_X402_SECRET_KEY_PEM:-}" ] && [ -z "${LASTRE_X402_SECRET_KEY_PATH:-}" ]; then
  mkdir -p /secrets
  # shellcheck disable=SC2059
  printf '%s\n' "$LASTRE_X402_SECRET_KEY_PEM" | sed 's/\\n/\n/g' > /secrets/x402_secret_key.pem
  chmod 600 /secrets/x402_secret_key.pem
  export LASTRE_X402_SECRET_KEY_PATH=/secrets/x402_secret_key.pem
fi

if [ -n "${CASPER_CLIENT_BIN:-}" ]; then
  :
elif [ -x /app/bin/casper-client ]; then
  export CASPER_CLIENT_BIN=/app/bin/casper-client
  export PATH="/app/bin:${PATH}"
fi

exec node app/server-dist/index.js
