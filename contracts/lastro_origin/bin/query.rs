// SPDX-License-Identifier: Apache-2.0
use lastro_contracts::proof_of_origin::{ProofOfOrigin, ProofOfOriginHostRef};
use odra::host::HostRefLoader;
use odra::prelude::Address;

use std::env;

const DEFAULT_PACKAGE_HASH: &str =
    "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

fn main() {
    let args: Vec<String> = env::args().collect();

    // Usage: cargo run --bin query [--features livenet] [ASSET_ID] [--json]
    let asset_id = args.get(1)
        .filter(|a| !a.starts_with("--"))
        .map(|s| s.as_str())
        .unwrap_or("MINA-VALEDOURO-LOTE-001");

    let json_mode = args.iter().any(|a| a == "--json");

    let package_hash = env::var("LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH")
        .unwrap_or_else(|_| DEFAULT_PACKAGE_HASH.to_string());

    let env = odra_casper_livenet_env::env();
    let package_address = Address::new(&package_hash)
        .expect("invalid ProofOfOrigin package hash address");

    let proof: ProofOfOriginHostRef =
        <ProofOfOrigin as HostRefLoader<ProofOfOriginHostRef>>::load(&env, package_address);

    let accepted = proof.accepted_count();
    let rejected = proof.rejected_count();

    let attestation = proof.get_attestation(asset_id.to_string());
    let reference = proof.get_reference(asset_id.to_string());

    if json_mode {
        let verdict_str = match &attestation {
            Some(a) => {
                // Verdict is printed via Debug in non-json; here we normalize
                let v = format!("{:?}", a.verdict);
                if v.contains("Valid") { "Valid" } else { "Invalid" }
            }
            None => "Unverified",
        };

        let seal = attestation.as_ref().map(|a| a.provided_seal.clone());
        let attester = attestation.as_ref().map(|a| a.attester.to_string());

        println!(
            r#"{{"packageHash":"{}","assetId":"{}","verdict":"{}","seal":{},"referenceSeal":{},"attester":{},"attestationTx":null,"accepted":{},"rejected":{}}}"#,
            package_hash,
            asset_id,
            verdict_str,
            seal.map_or("null".to_string(), |s| format!("\"{}\"", s)),
            reference.map_or("null".to_string(), |s| format!("\"{}\"", s)),
            attester.map_or("null".to_string(), |s| format!("\"{}\"", s)),
            accepted,
            rejected
        );
    } else {
        println!("ProofOfOrigin package_address: {}", package_address);
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
}
