# ===========================================================
# LASTRO Gateway — Render Docker image
# ===========================================================
# Multi-stage build:
# 1) Rust builds only the read-only ProofOfOrigin query binary in release mode.
# 2) Node builds the deterministic sealer and the TypeScript gateway.
# 3) Runtime is slim: Node + production gateway deps + sealer dist + query bin.

# --- Stage A: build the Rust query binary (release) ---
FROM rust:bookworm AS rust-builder

RUN rustup toolchain install nightly-2026-01-01 --profile minimal \
  && rustup default nightly-2026-01-01

WORKDIR /app

# Copy only the contracts crate. The gateway runtime only needs the query binary.
COPY contracts/lastro_origin ./contracts/lastro_origin

RUN cargo +nightly-2026-01-01 build \
  --release \
  --features livenet \
  --bin query \
  --manifest-path contracts/lastro_origin/Cargo.toml

# --- Stage B: build the sealer + gateway ---
FROM node:22-bookworm AS node-builder

WORKDIR /app

COPY agent/sealer/package*.json ./agent/sealer/
COPY agent/gateway/package*.json ./agent/gateway/

RUN cd agent/sealer && npm ci
RUN cd agent/gateway && npm ci

COPY agent/sealer ./agent/sealer
COPY agent/gateway ./agent/gateway

# Gateway imports the built sealer package, so build sealer first.
RUN cd agent/sealer && npm run build
RUN cd agent/gateway && npm run build

# --- Stage C: slim runtime for Render ---
FROM node:22-slim AS runtime

WORKDIR /app

# HTTPS queries to the public Casper node need CA certificates. libssl3 keeps
# native-TLS Rust dependency trees safe on Debian slim runtimes.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates libssl3 \
  && rm -rf /var/lib/apt/lists/*

# Install only production dependencies for the gateway runtime.
COPY --from=node-builder /app/agent/gateway/package*.json ./agent/gateway/
RUN cd agent/gateway && npm ci --omit=dev

# Runtime artifacts.
COPY --from=node-builder /app/agent/sealer/dist ./agent/sealer/dist
COPY --from=node-builder /app/agent/gateway/dist ./agent/gateway/dist
COPY --from=rust-builder /app/contracts/lastro_origin/target/release/query /app/bin/query

# Static demo/catalog files served by the gateway fallbacks.
COPY web ./web

# createProtocolClient sets cwd to /app/contracts/lastro_origin when executing
# the query binary. The release image does not need contract sources, but the cwd
# must exist for execFile().
RUN mkdir -p /app/contracts/lastro_origin \
  && chmod +x /app/bin/query

ENV NODE_ENV=production
ENV PORT=10000
ENV LASTRO_QUERY_BIN=/app/bin/query
ENV SANDBOX_ANCHOR_ENABLED=false
ENV PACKAGE_HASH=hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
ENV NODE_ADDRESS=https://node.testnet.casper.network/rpc
ENV CHAIN_NAME=casper-test
ENV ODRA_CASPER_LIVENET_NODE_ADDRESS=https://node.testnet.casper.network/rpc
ENV ODRA_CASPER_LIVENET_CHAIN_NAME=casper-test
ENV ODRA_CASPER_LIVENET_EVENTS_URL=https://node.testnet.casper.network/events/main
# NOTE: ODRA_CASPER_LIVENET_SECRET_KEY_PATH is intentionally NOT required here.
# The /app/bin/query binary self-provisions a throwaway dummy key at runtime
# (only for read-only verdict/proof paths). Sandbox writes use SANDBOX_SECRET_KEY_PATH.

# Render injects PORT. 10000 is the local container default; 3456 is convenient
# for local docker run -p 3456:3456 -e PORT=3456.
EXPOSE 10000 3456

CMD ["node", "agent/gateway/dist/index.js"]
