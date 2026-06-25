SHELL := /bin/bash

.DEFAULT_GOAL := build

ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
SEALER_DIR := $(ROOT_DIR)/agent/sealer
X402_DIR := $(ROOT_DIR)/agent/x402
ORCHESTRATOR_DIR := $(ROOT_DIR)/agent/orchestrator
CONTRACT_DIR := $(ROOT_DIR)/contracts/lastro_origin
SETUP_NODE := $(ROOT_DIR)/scripts/dev/setup-node.sh
SETUP_RUST := $(ROOT_DIR)/scripts/dev/setup-rust.sh

.PHONY: help setup build test wasm query demo \
	setup-node setup-rust \
	build-sealer build-x402 build-orchestrator build-contracts \
	test-sealer test-x402 test-orchestrator test-contracts

help:
	@printf '%s\n' "Lastro developer targets:"
	@printf '%s\n' "  make setup  - install local Node dependencies and validate Rust/Odra tooling"
	@printf '%s\n' "  make build  - build sealer -> x402 -> orchestrator and run Rust livenet checks"
	@printf '%s\n' "  make test   - run TypeScript package tests and Rust contract tests"
	@printf '%s\n' "  make wasm   - build Odra/Casper WASM artifacts"
	@printf '%s\n' "  make query  - run the livenet read-only ProofOfOrigin query"
	@printf '%s\n' "  make demo   - run the local agent demo"

setup: setup-node setup-rust

setup-node:
	"$(SETUP_NODE)"

setup-rust:
	"$(SETUP_RUST)"

build: setup build-sealer build-x402 build-orchestrator build-contracts wasm

build-sealer: setup-node
	@printf '%s\n' "==> Building agent/sealer"
	cd "$(SEALER_DIR)" && npm run build

build-x402: setup-node build-sealer
	@printf '%s\n' "==> Building agent/x402"
	cd "$(X402_DIR)" && npm run build

build-orchestrator: setup-node build-sealer build-x402
	@printf '%s\n' "==> Building agent/orchestrator"
	cd "$(ORCHESTRATOR_DIR)" && npm run build

build-contracts: setup-rust
	@printf '%s\n' "==> Checking contracts (all targets, livenet feature)"
	cd "$(CONTRACT_DIR)" && cargo check --all-targets --features livenet

test: setup test-sealer test-x402 test-orchestrator test-contracts

test-sealer: build-sealer
	@printf '%s\n' "==> Testing agent/sealer"
	cd "$(SEALER_DIR)" && npm test

test-x402: build-sealer build-x402
	@printf '%s\n' "==> Testing agent/x402"
	cd "$(X402_DIR)" && npm test

test-orchestrator: build-sealer build-x402 build-orchestrator
	@printf '%s\n' "==> Testing agent/orchestrator"
	cd "$(ORCHESTRATOR_DIR)" && npm test

test-contracts:
	@printf '%s\n' "==> Testing contracts"
	cd "$(CONTRACT_DIR)" && cargo test
	cd "$(CONTRACT_DIR)" && cargo fmt -- --check

wasm: setup-rust
	@printf '%s\n' "==> Building Odra/Casper WASM"
	cd "$(CONTRACT_DIR)" && cargo odra build

query: setup-rust build-contracts
	@printf '%s\n' "==> Running read-only livenet query"
	cd "$(CONTRACT_DIR)" && cargo run --features livenet --bin query

demo: setup build-sealer build-x402 build-orchestrator
	@printf '%s\n' "==> Running local agent demo"
	cd "$(ORCHESTRATOR_DIR)" && npm run demo
