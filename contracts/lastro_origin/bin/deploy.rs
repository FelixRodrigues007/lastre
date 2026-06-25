// SPDX-License-Identifier: Apache-2.0
use lastro_contracts::proof_of_origin::ProofOfOrigin;
use odra::host::{Deployer, NoArgs};
use odra::prelude::Addressable;

fn main() {
    let env = odra_casper_livenet_env::env();

    // Deploy gas (adjustable). 500 CSPR = 500_000_000_000 motes.
    env.set_gas(500_000_000_000u64);

    // ProofOfOrigin::init takes no arguments, so the deploy uses NoArgs.
    // In Odra 2.8.x, Deployer is implemented on the contract type and returns the HostRef.
    let proof = ProofOfOrigin::deploy(&env, NoArgs);

    println!("ProofOfOrigin deployed at: {}", proof.address().to_string());
}
