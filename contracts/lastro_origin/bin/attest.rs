// SPDX-License-Identifier: Apache-2.0
//! Lastro — OriginChain agent: the real on-chain write path against the
//! already-deployed `ProofOfOrigin` package on the Casper network.
//!
//! This binary is the executable counterpart of the orchestrator's on-chain
//! step. Once the agent has decided the ACTION (pay/attest), it submits the
//! provided SHA-256 seal to the contract. The deterministic seal — compared
//! on-chain against the stored reference — is what decides the VERDICT
//! (`Valid` / `Invalid`). The agent (and any LLM behind it) only chooses the
//! action; it never decides the verdict.
//!
//! A rejection is NOT a revert: both `Valid` and `Invalid` attestations are
//! written on-chain permanently (the contract emits `OriginAttested` and bumps
//! the accepted/rejected counters). An `Invalid` outcome here is a successful,
//! recorded proof — not an error to be discarded.
//!
//! ## Why writes shell out to `casper-client`
//!
//! Odra's livenet host confirms a write by waiting on the node's SSE event
//! stream. The public testnet node does not expose that stream on 443 (it lives
//! on a separate sidecar port that is not proxied), so an Odra-driven write
//! never observes its confirmation and hangs. Plain RPC *reads* are unaffected.
//!
//! Therefore this binary splits the two paths:
//!   - WRITES (`register_reference`, `attest`) are submitted by shelling out to
//!     the `casper-client` CLI (`std::process::Command`) and confirmed by
//!     polling `casper-client get-transaction <hash>` until an
//!     `execution_result` appears. `error_message: null` means Success.
//!   - the final VERDICT READ still uses the existing Odra livenet path, which
//!     is a normal RPC query.
//!
//! Requires the `casper-client` binary on `PATH` (override with
//! `LASTRO_CASPER_CLIENT_BIN`). Install it with `cargo install casper-client`.
//!
//! Configuration (no secrets live in this file):
//!   - `LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH` — package address of the deployed
//!     contract (defaults to the published testnet package below).
//!   - `ODRA_CASPER_LIVENET_NODE_ADDRESS`    — RPC node, defaults to
//!     `https://node.testnet.casper.network/rpc` when neither the env nor
//!     the local `.env` file provides it. Used by both casper-client writes and
//!     the Odra read path.
//!   - `ODRA_CASPER_LIVENET_CHAIN_NAME`      — defaults to `casper-test`
//!     under the same rules.
//!   - `ODRA_CASPER_LIVENET_EVENTS_URL`      — defaults to the Casper testnet
//!     event stream when neither env nor `.env` provides it (read path only).
//!   - `ODRA_CASPER_LIVENET_SECRET_KEY_PATH` — attester secret key path, passed
//!     to `casper-client --secret-key`. It stays outside the repo and is never
//!     committed.
//!   - `LASTRO_CASPER_CLIENT_BIN`            — casper-client binary, defaults to
//!     `casper-client` resolved from `PATH`.
//!   - `LASTRO_AGENT_ASSET_ID`, `LASTRO_AGENT_REFERENCE_SEAL`,
//!     `LASTRO_AGENT_PROVIDED_SEAL`, `LASTRO_AGENT_GAS`,
//!     `LASTRO_AGENT_SKIP_REGISTER`,
//!     `LASTRO_AGENT_POLL_ATTEMPTS`, `LASTRO_AGENT_POLL_INTERVAL_SECS`
//!     — see the constants and reads below.
//!
//! All sample data is FICTIONAL.

use lastro_contracts::proof_of_origin::{ProofOfOrigin, ProofOfOriginHostRef};
use odra::host::HostRefLoader;
use odra::prelude::Address;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::str::FromStr;
use std::thread::sleep;
use std::time::Duration;

/// Published testnet package address of the deployed `ProofOfOrigin` contract.
/// This is public information (not a secret); override it with
/// `LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH` for other deployments.
const DEFAULT_PACKAGE_HASH: &str =
    "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

/// Public Casper testnet RPC defaults. They are not secrets; callers can
/// override them with the standard Odra livenet environment variables.
const DEFAULT_NODE_ADDRESS: &str = "https://node.testnet.casper.network/rpc";
const DEFAULT_CHAIN_NAME: &str = "casper-test";
const DEFAULT_EVENTS_URL: &str = "https://node.testnet.casper.network/events/main";

const ODRA_NODE_ADDRESS_ENV: &str = "ODRA_CASPER_LIVENET_NODE_ADDRESS";
const ODRA_CHAIN_NAME_ENV: &str = "ODRA_CASPER_LIVENET_CHAIN_NAME";
const ODRA_EVENTS_URL_ENV: &str = "ODRA_CASPER_LIVENET_EVENTS_URL";
const ODRA_EXTRA_ENV_FILE_ENV: &str = "ODRA_CASPER_LIVENET_ENV";
const ODRA_SECRET_KEY_ENV: &str = "ODRA_CASPER_LIVENET_SECRET_KEY_PATH";
const CASPER_CLIENT_BIN_ENV: &str = "LASTRO_CASPER_CLIENT_BIN";

/// Fictional demo lot used by default, kept distinct from the documented
/// `MINA-VALEDOURO-LOTE-001` so a casual run never overwrites that attestation.
const DEFAULT_ASSET_ID: &str = "MINA-VALEDOURO-LOTE-DEMO";

/// Fictional reference seal (64-hex SHA-256) for the demo lot.
const DEFAULT_REFERENCE_SEAL: &str =
    "a3f1c9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff00";

/// Default gas for a single method call (5 CSPR). Method calls are far cheaper
/// than the install; override with `LASTRO_AGENT_GAS` if the network rejects it.
const DEFAULT_GAS: u64 = 5_000_000_000;

/// Default casper-client binary name; resolved from `PATH`.
const DEFAULT_CASPER_CLIENT_BIN: &str = "casper-client";

/// Polling defaults for confirming a submitted transaction. 60 attempts at a
/// 5-second interval (~5 minutes) comfortably covers testnet block times.
const DEFAULT_POLL_ATTEMPTS: u32 = 60;
const DEFAULT_POLL_INTERVAL_SECS: u64 = 5;

/// Fixed casper-client pricing flags matching the proven, working command.
const GAS_PRICE_TOLERANCE: &str = "1";

fn main() {
    ensure_livenet_public_defaults();

    let package_hash = env_or("LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH", DEFAULT_PACKAGE_HASH);
    let asset_id = env_or("LASTRO_AGENT_ASSET_ID", DEFAULT_ASSET_ID);
    let reference_seal = env_or("LASTRO_AGENT_REFERENCE_SEAL", DEFAULT_REFERENCE_SEAL);
    // Default provided seal == reference seal -> Valid path. Set a different
    // value to exercise the Invalid path (which is still recorded on-chain).
    let provided_seal = env_or("LASTRO_AGENT_PROVIDED_SEAL", &reference_seal);
    let gas = env_gas("LASTRO_AGENT_GAS", DEFAULT_GAS);
    let skip_register = env_flag("LASTRO_AGENT_SKIP_REGISTER");

    assert_sha256_hex("provided seal", &provided_seal);

    let package_address = parse_contract_address(&package_hash);
    let package_arg = package_cli_arg(&package_hash);

    let node_address = config_or_default(ODRA_NODE_ADDRESS_ENV, DEFAULT_NODE_ADDRESS);
    let chain_name = config_or_default(ODRA_CHAIN_NAME_ENV, DEFAULT_CHAIN_NAME);
    let secret_key_path = required_config(ODRA_SECRET_KEY_ENV);
    let casper_client = config_or_default(CASPER_CLIENT_BIN_ENV, DEFAULT_CASPER_CLIENT_BIN);
    let gas_arg = gas.to_string();
    let poll = PollConfig::from_env();

    // Connection details shared by every casper-client write call.
    let client = CasperClient {
        bin: &casper_client,
        node_address: &node_address,
        chain_name: &chain_name,
        secret_key_path: &secret_key_path,
        package_arg: &package_arg,
        payment_amount: &gas_arg,
    };

    // Load a host reference to the EXISTING contract (no deploy): this registers
    // the package address with the livenet env so the READ path can query it.
    let env = odra_casper_livenet_env::env();
    let proof: ProofOfOriginHostRef =
        <ProofOfOrigin as HostRefLoader<ProofOfOriginHostRef>>::load(&env, package_address);

    println!("== Lastro OriginChain agent — on-chain attest ==");
    println!("package_address : {}", package_address.to_string());
    println!("node_address    : {node_address}");
    println!("chain_name      : {chain_name}");
    println!("casper_client   : {casper_client}");
    println!("asset_id        : {asset_id}");
    // Counter reads are free RPC queries (no gas), like bin/query.rs.
    println!("accepted(before): {}", proof.accepted_count());
    println!("rejected(before): {}", proof.rejected_count());

    // Owner-only setup so a self-contained run does not revert with
    // `UnknownAsset`. Skipped when the reference already exists (checked via the
    // RPC read path), or when `LASTRO_AGENT_SKIP_REGISTER` is set (e.g. attesting
    // as a non-owner against an asset whose reference the owner already stored).
    let reference_exists = proof.get_reference(asset_id.clone()).is_some();
    if skip_register {
        println!("register        : skipped (LASTRO_AGENT_SKIP_REGISTER set)");
    } else if reference_exists {
        println!("register        : skipped (reference already present)");
    } else {
        assert_sha256_hex("reference seal", &reference_seal);
        println!("register        : submitting via casper-client …");
        let tx_hash = client.put_package_transaction(
            "register_reference",
            &[("asset_id", &asset_id), ("reference_seal", &reference_seal)],
        );
        println!("register tx     : {tx_hash}");
        wait_for_success(&casper_client, &node_address, &tx_hash, &poll);
        println!("register        : reference stored for {asset_id}");
    }

    // The agent's real on-chain action. The contract — not the agent — compares
    // the provided seal against the stored reference and decides the verdict.
    println!("attest          : submitting via casper-client …");
    let tx_hash = client.put_package_transaction(
        "attest",
        &[("asset_id", &asset_id), ("provided_seal", &provided_seal)],
    );
    println!("attest tx       : {tx_hash}");
    wait_for_success(&casper_client, &node_address, &tx_hash, &poll);

    // Read the final verdict back via the Odra livenet RPC read path.
    let verdict = match proof.get_attestation(asset_id.clone()) {
        Some(attestation) => format!("{:?}", attestation.verdict),
        None => "Unknown (no attestation found)".to_string(),
    };

    println!("attest          : confirmed on-chain");
    println!("verdict         : {verdict}  (decided on-chain by the seal)");
    println!("accepted(after) : {}", proof.accepted_count());
    println!("rejected(after) : {}", proof.rejected_count());
    println!(
        "note            : Valid and Invalid are both written on-chain; a \
         rejection is permanent proof, not a discarded error."
    );
}

/// Polling configuration for confirming a submitted transaction.
struct PollConfig {
    attempts: u32,
    interval: Duration,
}

impl PollConfig {
    fn from_env() -> Self {
        let attempts = env_gas("LASTRO_AGENT_POLL_ATTEMPTS", DEFAULT_POLL_ATTEMPTS as u64)
            .max(1)
            .min(u32::MAX as u64) as u32;
        let interval_secs = env_gas(
            "LASTRO_AGENT_POLL_INTERVAL_SECS",
            DEFAULT_POLL_INTERVAL_SECS,
        )
        .max(1);
        Self {
            attempts,
            interval: Duration::from_secs(interval_secs),
        }
    }
}

/// Connection details shared by every casper-client write call. Bundled into a
/// struct so call sites pass only what varies (entry point + session args).
struct CasperClient<'a> {
    bin: &'a str,
    node_address: &'a str,
    chain_name: &'a str,
    secret_key_path: &'a str,
    package_arg: &'a str,
    payment_amount: &'a str,
}

impl CasperClient<'_> {
    /// Submits a `put-transaction package` call via casper-client and returns
    /// the transaction hash (hex). Panics with the captured CLI output on
    /// failure.
    ///
    /// Mirrors the proven command exactly:
    ///   casper-client put-transaction package \
    ///     --node-address $NODE --chain-name $CHAIN --secret-key $SECRET_KEY_PATH \
    ///     --package-address package-<hash> --session-entry-point <ep> \
    ///     --pricing-mode classic --standard-payment true \
    ///     --payment-amount <gas> --gas-price-tolerance 1 \
    ///     --session-arg "name:string='value'" ...
    fn put_package_transaction(&self, entry_point: &str, session_args: &[(&str, &str)]) -> String {
        let mut command = Command::new(self.bin);
        command
            .arg("put-transaction")
            .arg("package")
            .arg("--node-address")
            .arg(self.node_address)
            .arg("--chain-name")
            .arg(self.chain_name)
            .arg("--secret-key")
            .arg(self.secret_key_path)
            .arg("--package-address")
            .arg(self.package_arg)
            .arg("--session-entry-point")
            .arg(entry_point)
            .arg("--pricing-mode")
            .arg("classic")
            .arg("--standard-payment")
            .arg("true")
            .arg("--payment-amount")
            .arg(self.payment_amount)
            .arg("--gas-price-tolerance")
            .arg(GAS_PRICE_TOLERANCE);

        for (name, value) in session_args {
            // casper-client requires the value to be wrapped in literal single
            // quotes; it trims them itself. We run without a shell, so the quotes
            // must be part of the argument string.
            command
                .arg("--session-arg")
                .arg(format!("{name}:string='{value}'"));
        }

        let context = format!("put-transaction {entry_point}");
        let stdout = run_casper_client(command, &context);
        let json = parse_json(&stdout, &context);
        extract_transaction_hash(&json).unwrap_or_else(|| {
            panic!(
                "could not find transaction_hash in casper-client output for {entry_point}:\n{stdout}"
            )
        })
    }
}

/// Polls `casper-client get-transaction <hash>` until the execution result is
/// available, then asserts Success (`error_message: null`).
fn wait_for_success(casper_client: &str, node_address: &str, tx_hash: &str, poll: &PollConfig) {
    let mut last_output = String::new();

    for attempt in 1..=poll.attempts {
        let mut command = Command::new(casper_client);
        command
            .arg("get-transaction")
            .arg("--node-address")
            .arg(node_address)
            .arg(tx_hash);

        // The transaction may not be retrievable yet right after submission; a
        // failed CLI call early in the loop is expected, so don't panic on it.
        let output = command.output().unwrap_or_else(|err| {
            panic!("failed to spawn `{casper_client} get-transaction`: {err}")
        });

        let stdout = String::from_utf8_lossy(&output.stdout).to_string();
        let stderr = String::from_utf8_lossy(&output.stderr);
        last_output = format!(
            "status: {}\nstdout:\n{}\nstderr:\n{}",
            output.status, stdout, stderr
        );

        if output.status.success() {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&stdout) {
                match execution_outcome(&json) {
                    ExecutionOutcome::Success => {
                        println!("confirm         : Success (attempt {attempt})");
                        return;
                    }
                    ExecutionOutcome::Failure(message) => {
                        panic!("transaction {tx_hash} failed on-chain: {message}");
                    }
                    ExecutionOutcome::Pending => {}
                }
            }
        }

        if attempt < poll.attempts {
            println!(
                "confirm         : pending, retrying in {}s (attempt {attempt}/{})",
                poll.interval.as_secs(),
                poll.attempts
            );
            sleep(poll.interval);
        }
    }

    panic!(
        "transaction {tx_hash} not confirmed after {} attempts; \
         check the explorer or increase LASTRO_AGENT_POLL_ATTEMPTS\n\nlast get-transaction output:\n{}",
        poll.attempts, last_output
    );
}

/// Runs a casper-client command, capturing stdout. Panics with stdout+stderr on
/// a non-zero exit or spawn failure (e.g. binary missing from PATH).
fn run_casper_client(mut command: Command, context: &str) -> String {
    let output = command.output().unwrap_or_else(|err| {
        panic!(
            "failed to run casper-client for {context}: {err}. \
             Is `casper-client` installed and on PATH? \
             (override with {CASPER_CLIENT_BIN_ENV})"
        )
    });

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        panic!(
            "casper-client {context} failed ({}):\nstdout:\n{stdout}\nstderr:\n{stderr}",
            output.status
        );
    }

    stdout
}

fn parse_json(stdout: &str, context: &str) -> serde_json::Value {
    serde_json::from_str::<serde_json::Value>(stdout).unwrap_or_else(|err| {
        panic!("could not parse casper-client {context} output as JSON: {err}\n{stdout}")
    })
}

/// Extracts the transaction hash from a `put-transaction` JSON-RPC response.
///
/// The response is `{ "result": { "transaction_hash": { "Version1": "<hex>" } } }`
/// (or `"Deploy"`). We accept either variant and also a bare string for safety.
fn extract_transaction_hash(json: &serde_json::Value) -> Option<String> {
    let hash = json
        .get("result")
        .and_then(|result| result.get("transaction_hash"))
        .or_else(|| json.get("transaction_hash"))?;

    if let Some(hex) = hash.as_str() {
        return Some(hex.to_string());
    }

    for key in ["Version1", "Deploy", "V1"] {
        if let Some(hex) = hash.get(key).and_then(|value| value.as_str()) {
            return Some(hex.to_string());
        }
    }

    None
}

enum ExecutionOutcome {
    Success,
    Failure(String),
    Pending,
}

/// Inspects a `get-transaction` JSON-RPC response for the execution result.
///
/// Shape: `{ "result": { "execution_info": { "execution_result": { "Version2":
/// { "error_message": null | "..." } } } } }`. No `execution_result` yet means
/// the transaction is still pending. `error_message: null` means Success.
fn execution_outcome(json: &serde_json::Value) -> ExecutionOutcome {
    let execution_result = json
        .get("result")
        .and_then(|result| result.get("execution_info"))
        .and_then(|info| info.get("execution_result"));

    let Some(execution_result) = execution_result else {
        return ExecutionOutcome::Pending;
    };
    if execution_result.is_null() {
        return ExecutionOutcome::Pending;
    }

    // error_message lives inside the versioned variant (Version2/Version1) or,
    // defensively, at the top level. `find_error_message` walks for it.
    match find_error_message(execution_result) {
        Some(serde_json::Value::Null) | None => ExecutionOutcome::Success,
        Some(serde_json::Value::String(message)) => ExecutionOutcome::Failure(message),
        Some(other) => ExecutionOutcome::Failure(other.to_string()),
    }
}

/// Finds the `error_message` field within an execution_result value, regardless
/// of whether it is wrapped in a `Version1`/`Version2` envelope.
fn find_error_message(execution_result: &serde_json::Value) -> Option<serde_json::Value> {
    if let Some(message) = execution_result.get("error_message") {
        return Some(message.clone());
    }

    match execution_result {
        serde_json::Value::Array(values) => {
            for value in values {
                if let Some(message) = find_error_message(value) {
                    return Some(message);
                }
            }
        }
        serde_json::Value::Object(object) => {
            for value in object.values() {
                if let Some(message) = find_error_message(value) {
                    return Some(message);
                }
            }
        }
        _ => {}
    }

    None
}

/// Supplies public testnet defaults for Odra livenet configuration while still
/// respecting explicit environment variables and values already present in the
/// local `.env` file. This avoids hardcoding network values at the call site and
/// lets a clean environment target Casper testnet without committing secrets.
fn ensure_livenet_public_defaults() {
    ensure_public_env_default(ODRA_NODE_ADDRESS_ENV, DEFAULT_NODE_ADDRESS);
    ensure_public_env_default(ODRA_CHAIN_NAME_ENV, DEFAULT_CHAIN_NAME);
    ensure_public_env_default(ODRA_EVENTS_URL_ENV, DEFAULT_EVENTS_URL);
}

fn ensure_public_env_default(key: &str, default: &str) {
    let value = config_or_default(key, default);
    std::env::set_var(key, value);
}

fn config_or_default(key: &str, default: &str) -> String {
    config_value(key).unwrap_or_else(|| default.to_string())
}

fn required_config(key: &str) -> String {
    config_value(key).unwrap_or_else(|| {
        panic!(
            "{key} must be set to the attester secret key path (e.g. \
             /path/to/secret_key.pem); it is never read from the repo"
        )
    })
}

fn config_value(key: &str) -> Option<String> {
    non_empty_env(key)
        .or_else(|| dotenv_file_value(Path::new(".env"), key))
        .or_else(|| {
            non_empty_env(ODRA_EXTRA_ENV_FILE_ENV)
                .map(PathBuf::from)
                .map(|path| path.with_extension("env"))
                .and_then(|path| dotenv_file_value(&path, key))
        })
}

fn non_empty_env(key: &str) -> Option<String> {
    std::env::var(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

fn dotenv_file_value(path: &Path, key: &str) -> Option<String> {
    let contents = std::fs::read_to_string(path).ok()?;

    contents.lines().find_map(|line| {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            return None;
        }

        let trimmed = trimmed.strip_prefix("export ").unwrap_or(trimmed);
        let (candidate_key, value) = trimmed.split_once('=')?;
        if candidate_key.trim() != key {
            return None;
        }

        let value = value
            .split_once(" #")
            .map(|(before_comment, _)| before_comment)
            .unwrap_or(value)
            .trim()
            .trim_matches('"')
            .trim_matches('\'')
            .to_string();

        (!value.is_empty()).then_some(value)
    })
}

fn parse_contract_address(raw_address: &str) -> Address {
    let normalized = raw_address
        .strip_prefix("package-")
        .map(|hash| format!("hash-{hash}"))
        .unwrap_or_else(|| raw_address.to_string());

    let address = Address::from_str(&normalized).unwrap_or_else(|err| {
        panic!("invalid ProofOfOrigin package address {raw_address:?}: {err:?}")
    });

    if !address.is_contract() {
        panic!("ProofOfOrigin address must be a contract package hash, got {raw_address:?}");
    }

    address
}

/// Returns the `package-<hash>` argument that casper-client expects for
/// `--package-address`, accepting input in either `hash-…` or `package-…` form.
fn package_cli_arg(raw_address: &str) -> String {
    let hash = raw_address
        .strip_prefix("package-")
        .or_else(|| raw_address.strip_prefix("hash-"))
        .unwrap_or(raw_address);
    format!("package-{hash}")
}

fn assert_sha256_hex(label: &str, seal: &str) {
    let valid = seal.len() == 64 && seal.bytes().all(|byte| byte.is_ascii_hexdigit());
    if !valid {
        panic!("{label} must be a 64-character SHA-256 hex string");
    }
}

/// Reads an env var, trimming whitespace; falls back to `default` when unset or
/// empty so an exported-but-blank variable behaves like "not set".
fn env_or(key: &str, default: &str) -> String {
    match std::env::var(key) {
        Ok(value) if !value.trim().is_empty() => value.trim().to_string(),
        _ => default.to_string(),
    }
}

/// Parses a `u64` gas env var; falls back to `default` when unset or invalid.
fn env_gas(key: &str, default: u64) -> u64 {
    match std::env::var(key) {
        Ok(value) => value.trim().parse::<u64>().unwrap_or(default),
        Err(_) => default,
    }
}

/// Returns true when the env var is set to a truthy value (`1`/`true`/`yes`).
fn env_flag(key: &str) -> bool {
    matches!(
        std::env::var(key).ok().as_deref().map(str::trim),
        Some("1") | Some("true") | Some("yes")
    )
}
