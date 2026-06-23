//! CLI mínima para deploy/interação com o contrato `ProofOfOrigin` via Odra CLI.

use lastro_contracts::proof_of_origin::ProofOfOrigin;
use odra::host::{HostEnv, NoArgs};
use odra_cli::{
    deploy::DeployScript, DeployedContractsContainer, DeployerExt, OdraCli,
};

/// Deploya o contrato `ProofOfOrigin` e o registra no container da Odra CLI.
pub struct ProofOfOriginDeployScript;

impl DeployScript for ProofOfOriginDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer,
    ) -> Result<(), odra_cli::deploy::Error> {
        let _contract = ProofOfOrigin::load_or_deploy(
            env,
            NoArgs,
            container,
            350_000_000_000, // Gas limit padrão do template Odra.
        )?;

        Ok(())
    }
}

/// Entrada principal da CLI gerada pelo template Odra.
pub fn main() {
    OdraCli::new()
        .about("CLI tool for the Lastro ProofOfOrigin contract")
        .deploy(ProofOfOriginDeployScript)
        .contract::<ProofOfOrigin>()
        .build()
        .run();
}
