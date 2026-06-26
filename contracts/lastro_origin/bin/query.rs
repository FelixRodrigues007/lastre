// SPDX-License-Identifier: Apache-2.0
use lastro_contracts::proof_of_origin::{OriginAttested, ProofOfOrigin, ProofOfOriginHostRef};
use odra::host::HostRefLoader;
use odra::prelude::Address;
use serde_json::json;
use std::env;
use std::fs::File;
use std::io::Write;
use std::path::Path;

const DEFAULT_PACKAGE_HASH: &str =
    "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const DEFAULT_NODE_ADDRESS: &str = "https://node.testnet.casper.network/rpc";
const DEFAULT_CHAIN_NAME: &str = "casper-test";
const DEFAULT_EVENTS_URL: &str = "https://node.testnet.casper.network/events/main";
const DEFAULT_ASSET_ID: &str = "MINA-VALEDOURO-LOTE-001";

const PACKAGE_HASH_ENV: &str = "LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH";
const PACKAGE_HASH_ALIAS_ENV: &str = "PACKAGE_HASH";
const NODE_ADDRESS_ENV: &str = "NODE_ADDRESS";
const CHAIN_NAME_ENV: &str = "CHAIN_NAME";
const ODRA_NODE_ADDRESS_ENV: &str = "ODRA_CASPER_LIVENET_NODE_ADDRESS";
const ODRA_CHAIN_NAME_ENV: &str = "ODRA_CASPER_LIVENET_CHAIN_NAME";
const ODRA_EVENTS_URL_ENV: &str = "ODRA_CASPER_LIVENET_EVENTS_URL";
const ODRA_SECRET_KEY_ENV: &str = "ODRA_CASPER_LIVENET_SECRET_KEY_PATH";

fn main() {
    let args: Vec<String> = env::args().skip(1).collect();
    let json_mode = args.iter().any(|arg| arg == "--json");
    let asset_id = args
        .iter()
        .find(|arg| !arg.starts_with("--"))
        .map(String::as_str)
        .unwrap_or(DEFAULT_ASSET_ID);

    let package_hash = env_value(PACKAGE_HASH_ENV)
        .or_else(|| env_value(PACKAGE_HASH_ALIAS_ENV))
        .unwrap_or_else(|| DEFAULT_PACKAGE_HASH.to_string());

    // Force set the livenet env vars early to prevent panic in odra rpc client
    let node_address = env_value(NODE_ADDRESS_ENV).unwrap_or_else(|| DEFAULT_NODE_ADDRESS.to_string());
    let chain_name = env_value(CHAIN_NAME_ENV).unwrap_or_else(|| DEFAULT_CHAIN_NAME.to_string());
    std::env::set_var(ODRA_NODE_ADDRESS_ENV, &node_address);
    std::env::set_var(ODRA_CHAIN_NAME_ENV, &chain_name);
    std::env::set_var(ODRA_EVENTS_URL_ENV, DEFAULT_EVENTS_URL);

    // For read-only query (verdict/proof), the CasperClientConfiguration always
    // requires a secret key path (even if never used for signing reads).
    // Self-provision a throwaway dummy key file in /tmp so the binary runs
    // in any environment (Render, local cargo run, Docker) without external secrets.
    ensure_readonly_dummy_secret_key();

    let env = odra_casper_livenet_env::env();
    let package_address_input: &'static str = Box::leak(package_hash.clone().into_boxed_str());
    let package_address =
        Address::new(package_address_input).expect("invalid ProofOfOrigin package hash address");

    let proof: ProofOfOriginHostRef =
        <ProofOfOrigin as HostRefLoader<ProofOfOriginHostRef>>::load(&env, package_address);

    let accepted = proof.accepted_count();
    let rejected = proof.rejected_count();
    let attestation = proof.get_attestation(asset_id.to_string());
    let reference = proof.get_reference(asset_id.to_string());
    let recent_attestations = collect_recent_attestations(&env, &proof);

    if json_mode {
        let (verdict, seal, attester) = match &attestation {
            Some(attestation) => (
                format!("{:?}", attestation.verdict),
                Some(attestation.provided_seal.clone()),
                Some(attestation.attester.to_string()),
            ),
            None => ("Unverified".to_string(), None, None),
        };

        println!(
            "{}",
            json!({
                "packageHash": package_hash,
                "assetId": asset_id,
                "verdict": verdict,
                "seal": seal,
                "referenceSeal": reference,
                "attester": attester,
                "attestationTx": null,
                "accepted": accepted,
                "rejected": rejected,
                "recentAttestations": recent_attestations,
            })
        );
        return;
    }

    println!("ProofOfOrigin package_address: {:?}", package_address);
    println!("accepted_count(): {}", accepted);
    println!("rejected_count(): {}", rejected);

    match &attestation {
        Some(attestation) => {
            println!("get_attestation({asset_id:?}): Some");
            println!("  asset_id: {}", attestation.asset_id);
            println!("  provided_seal: {}", attestation.provided_seal);
            println!("  verdict: {:?}", attestation.verdict);
            println!("  attester: {}", attestation.attester.to_string());
        }
        None => println!("get_attestation({asset_id:?}): None"),
    }

    match reference {
        Some(reference) => println!("get_reference({asset_id:?}): {reference}"),
        None => println!("get_reference({asset_id:?}): None"),
    }
}

fn ensure_public_livenet_defaults() {
    let node_address =
        env_value(NODE_ADDRESS_ENV).unwrap_or_else(|| DEFAULT_NODE_ADDRESS.to_string());
    let chain_name = env_value(CHAIN_NAME_ENV).unwrap_or_else(|| DEFAULT_CHAIN_NAME.to_string());

    set_if_empty(ODRA_NODE_ADDRESS_ENV, &node_address);
    set_if_empty(ODRA_CHAIN_NAME_ENV, &chain_name);
    set_if_empty(ODRA_EVENTS_URL_ENV, DEFAULT_EVENTS_URL);
}

fn set_if_empty(key: &str, value: &str) {
    if env_value(key).is_none() {
        env::set_var(key, value);
    }
}

fn env_value(key: &str) -> Option<String> {
    env::var(key)
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
}

/// Self-provision a dummy secret key so odra-casper-rpc-client's CasperClientConfiguration
/// (which unconditionally calls get_env_variable + SecretKey::from_file in from_env)
/// does not panic for read-only operations (get_attestation etc).
/// This key is never used to sign anything in the query path and must not be funded.
fn ensure_readonly_dummy_secret_key() {
    if let Some(path) = env_value(ODRA_SECRET_KEY_ENV) {
        if Path::new(&path).exists() {
            return;
        }
    }

    // Minimal valid Ed25519 private key PEM (throwaway, generated via casper-client keygen).
    const DUMMY_PEM: &str =
        "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIDjek9a+YO/aANb+pKuKJtfvRAXwEjgI5dSUpwVBRgTl\n-----END PRIVATE KEY-----\n";

    let tmp_path = std::env::temp_dir().join("lastro_query_dummy_secret_key.pem");
    if let Ok(mut f) = File::create(&tmp_path) {
        let _ = f.write_all(DUMMY_PEM.as_bytes());
        let _ = f.flush();
    }
    std::env::set_var(ODRA_SECRET_KEY_ENV, tmp_path.to_string_lossy().as_ref());
}

fn collect_recent_attestations(
    env: &odra::host::HostEnv,
    proof: &ProofOfOriginHostRef,
) -> Vec<serde_json::Value> {
    let count = env.events_count(proof);
    let start = count.saturating_sub(10);

    (start..count)
        .filter_map(|index| env.get_event::<OriginAttested, _>(proof, index as i32).ok())
        .map(|event| {
            json!({
                "assetId": event.asset_id,
                "verdict": format!("{:?}", event.verdict),
                "attester": event.attester.to_string(),
                "tx": null,
                "timestamp": null,
            })
        })
        .collect()
}
