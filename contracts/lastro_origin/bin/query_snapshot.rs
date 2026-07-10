// SPDX-License-Identifier: Apache-2.0
//! JSON snapshot for the Lastro app — read-only Casper Testnet query.
use lastro_contracts::proof_of_origin::{ProofOfOrigin, ProofOfOriginHostRef, Verdict};
use odra::host::HostRefLoader;
use odra::prelude::Address;
use serde::Serialize;

const PROOF_OF_ORIGIN_PACKAGE_HASH: &str =
    "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";

const KNOWN_ASSET_IDS: &[&str] = &["MINA-VALEDOURO-LOTE-001", "MINA-VALEDOURO-LOTE-002"];

#[derive(Serialize)]
struct AttestationSnapshot {
    asset_id: String,
    verdict: &'static str,
    provided_seal: String,
    reference_seal: Option<String>,
    attester: String,
}

#[derive(Serialize)]
struct ChainSnapshot {
    package_hash: &'static str,
    network: &'static str,
    accepted: u32,
    rejected: u32,
    attestations: Vec<AttestationSnapshot>,
}

fn verdict_label(verdict: &Verdict) -> &'static str {
    match verdict {
        Verdict::Valid => "Valid",
        Verdict::Invalid => "Invalid",
    }
}

fn main() {
    let env = odra_casper_livenet_env::env();
    let package_address = Address::new(PROOF_OF_ORIGIN_PACKAGE_HASH)
        .expect("invalid ProofOfOrigin package hash address");

    let proof: ProofOfOriginHostRef =
        <ProofOfOrigin as HostRefLoader<ProofOfOriginHostRef>>::load(&env, package_address);

    let mut attestations = Vec::new();

    for asset_id in KNOWN_ASSET_IDS {
        let reference_seal = proof.get_reference(asset_id.to_string());
        if let Some(attestation) = proof.get_attestation(asset_id.to_string()) {
            attestations.push(AttestationSnapshot {
                asset_id: attestation.asset_id,
                verdict: verdict_label(&attestation.verdict),
                provided_seal: attestation.provided_seal,
                reference_seal,
                attester: attestation.attester.to_string(),
            });
        }
    }

    let snapshot = ChainSnapshot {
        package_hash: PROOF_OF_ORIGIN_PACKAGE_HASH,
        network: "casper-test",
        accepted: proof.accepted_count(),
        rejected: proof.rejected_count(),
        attestations,
    };

    println!(
        "{}",
        serde_json::to_string(&snapshot).expect("serialize snapshot")
    );
}
