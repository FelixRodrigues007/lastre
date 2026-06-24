use lastro_contracts::proof_of_origin::ProofOfOrigin;
use odra::host::{Deployer, NoArgs};
use odra::prelude::Addressable;

fn main() {
    let env = odra_casper_livenet_env::env();

    // Gás do deploy (ajustável). 500 CSPR = 500_000_000_000 motes.
    env.set_gas(500_000_000_000u64);

    // ProofOfOrigin::init não recebe argumentos; por isso o deploy usa NoArgs.
    // Em Odra 2.8.x, Deployer é implementado no tipo do contrato e retorna o HostRef.
    let proof = ProofOfOrigin::deploy(&env, NoArgs);

    println!("ProofOfOrigin deployed at: {}", proof.address().to_string());
}
