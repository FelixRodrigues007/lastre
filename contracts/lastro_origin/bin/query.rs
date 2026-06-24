use lastro_contracts::proof_of_origin::{ProofOfOrigin, ProofOfOriginHostRef};
use odra::host::HostRefLoader;
use odra::prelude::Address;

const PROOF_OF_ORIGIN_PACKAGE_HASH: &str =
    "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const ASSET_ID: &str = "MINA-VALEDOURO-LOTE-001";

fn main() {
    let env = odra_casper_livenet_env::env();
    let package_address = Address::new(PROOF_OF_ORIGIN_PACKAGE_HASH)
        .expect("invalid ProofOfOrigin package hash address");

    let proof: ProofOfOriginHostRef =
        <ProofOfOrigin as HostRefLoader<ProofOfOriginHostRef>>::load(&env, package_address);

    println!(
        "ProofOfOrigin package_address: {}",
        package_address.to_string()
    );
    println!("accepted_count(): {}", proof.accepted_count());
    println!("rejected_count(): {}", proof.rejected_count());

    match proof.get_attestation(ASSET_ID.to_string()) {
        Some(attestation) => {
            println!("get_attestation({ASSET_ID:?}): Some");
            println!("  asset_id: {}", attestation.asset_id);
            println!("  provided_seal: {}", attestation.provided_seal);
            println!("  verdict: {:?}", attestation.verdict);
            println!("  attester: {}", attestation.attester.to_string());
        }
        None => println!("get_attestation({ASSET_ID:?}): None"),
    }

    match proof.get_reference(ASSET_ID.to_string()) {
        Some(reference) => println!("get_reference({ASSET_ID:?}): {reference}"),
        None => println!("get_reference({ASSET_ID:?}): None"),
    }
}
