// SPDX-License-Identifier: Apache-2.0
use lastro_contracts::mint_gate::{MintGate, MintGateInitArgs};
use odra::host::Deployer;
use odra::prelude::{Address, Addressable};

const DEFAULT_PROOF_CONTRACT: &str =
    "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const DEFAULT_NODE_ADDRESS: &str = "https://node.testnet.casper.network/rpc";
const DEFAULT_CHAIN_NAME: &str = "casper-test";
const DEFAULT_EVENTS_URL: &str = "https://node.testnet.casper.network/events/main";

fn main() {
    set_if_empty("ODRA_CASPER_LIVENET_NODE_ADDRESS", DEFAULT_NODE_ADDRESS);
    set_if_empty("ODRA_CASPER_LIVENET_CHAIN_NAME", DEFAULT_CHAIN_NAME);
    set_if_empty("ODRA_CASPER_LIVENET_EVENTS_URL", DEFAULT_EVENTS_URL);

    let proof_contract = std::env::var("LASTRE_PROOF_OF_ORIGIN_CONTRACT_HASH")
        .ok()
        .filter(|v| !v.trim().is_empty())
        .unwrap_or_else(|| DEFAULT_PROOF_CONTRACT.to_string());

    let proof_address = Address::new(Box::leak(proof_contract.clone().into_boxed_str()))
        .expect("invalid ProofOfOrigin package/contract address");

    let env = odra_casper_livenet_env::env();
    // Install gas for MintGate. Can be overridden by livenet env payment settings.
    env.set_gas(
        std::env::var("LASTRE_MINTGATE_DEPLOY_GAS")
            .ok()
            .and_then(|v| v.parse::<u64>().ok())
            .unwrap_or(500_000_000_000u64),
    );

    println!("== Lastre MintGate deploy ==");
    println!("proof_contract : {}", proof_address.to_string());
    println!("note           : using ProofOfOrigin package address accepted by Odra livenet");

    let gate = MintGate::deploy(
        &env,
        MintGateInitArgs {
            proof_contract: proof_address,
        },
    );

    println!("MintGate deployed at: {}", gate.address().to_string());
}

fn set_if_empty(key: &str, value: &str) {
    if std::env::var(key)
        .ok()
        .filter(|v| !v.trim().is_empty())
        .is_none()
    {
        std::env::set_var(key, value);
    }
}
