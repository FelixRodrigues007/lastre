use crate::proof_of_origin::{Attestation, ProofOfOriginContractRef, Verdict};
use odra::prelude::*;
use odra::ContractRef;

/// Erros de negócio do MintGate.
///
/// `#[odra::odra_error]` gera a conversão para `OdraError`, permitindo reverts
/// com nomes legíveis nos testes do OdraVM.
#[odra::odra_error]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum MintGateError {
    /// Apenas o owner pode executar a ação.
    NotOwner,
    /// Não existe prova válida no ProofOfOrigin para o lote informado.
    NoValidProof,
    /// O lote já foi tokenizado/registrado neste gate.
    AlreadyMinted,
}

/// Evento emitido quando um lote passa pelo gate e é marcado como tokenizado.
#[odra::event]
pub struct LotMinted {
    pub asset_id: String,
    pub minter: Address,
}

/// Gate on-chain que consome a prova do `ProofOfOrigin`.
///
/// Ele não cria um token real ainda; neste bloco, a "mintagem" é simbólica:
/// registrar que um `asset_id` já passou pelo gate após prova válida.
#[odra::module(events = [LotMinted], errors = MintGateError)]
pub struct MintGate {
    /// Dono/admin do gate, definido no `init` como o caller do deploy.
    owner: Var<Address>,
    /// Endereço do contrato ProofOfOrigin consultado por este gate.
    proof_contract: Var<Address>,
    /// Controle anti-duplicidade: asset_id -> já tokenizado?
    minted: Mapping<String, bool>,
    /// Total de lotes tokenizados/registrados pelo gate.
    mint_count: Var<u32>,
}

#[odra::module]
impl MintGate {
    /// Construtor Odra.
    ///
    /// Salva o owner inicial, o endereço do `ProofOfOrigin` e zera o contador.
    pub fn init(&mut self, proof_contract: Address) {
        self.owner.set(self.env().caller());
        self.proof_contract.set(proof_contract);
        self.mint_count.set(0);
    }

    /// Atualiza o contrato `ProofOfOrigin` consultado por este gate.
    ///
    /// Apenas o owner pode trocar essa dependência.
    pub fn set_proof_contract(&mut self, proof_contract: Address) {
        self.ensure_owner();
        self.proof_contract.set(proof_contract);
    }

    /// Tokeniza/registra simbolicamente um lote, somente se houver prova válida.
    ///
    /// Fluxo:
    /// 1. bloqueia dupla mintagem (`AlreadyMinted`);
    /// 2. consulta `ProofOfOrigin.get_attestation(asset_id)` por cross-contract call;
    /// 3. exige `Some(attestation)` com `verdict == Verdict::Valid`;
    /// 4. grava `minted`, incrementa contador e emite evento.
    pub fn mint_lot(&mut self, asset_id: String) {
        if self.is_minted(asset_id.clone()) {
            self.env().revert(MintGateError::AlreadyMinted);
        }

        let attestation = self.get_origin_attestation(asset_id.clone());
        match attestation {
            Some(attestation) if attestation.verdict == Verdict::Valid => {
                self.minted.set(&asset_id, true);
                self.mint_count.add(1);

                self.env().emit_event(LotMinted {
                    asset_id,
                    minter: self.env().caller(),
                });
            }
            _ => self.env().revert(MintGateError::NoValidProof),
        }
    }

    /// Retorna `true` se o lote já foi tokenizado/registrado neste gate.
    pub fn is_minted(&self, asset_id: String) -> bool {
        self.minted.get_or_default(&asset_id)
    }

    /// Total de lotes tokenizados/registrados pelo gate.
    pub fn mint_count(&self) -> u32 {
        self.mint_count.get_or_default()
    }

    /// Owner/admin definido no deploy.
    pub fn get_owner(&self) -> Address {
        self.owner.get().unwrap_or_revert(self)
    }

    /// Endereço atual do contrato `ProofOfOrigin` usado nas consultas.
    pub fn get_proof_contract(&self) -> Address {
        self.proof_contract.get().unwrap_or_revert(self)
    }

    /// Helper interno para manter a regra de owner em um só lugar.
    fn ensure_owner(&self) {
        if self.env().caller() != self.get_owner() {
            self.env().revert(MintGateError::NotOwner);
        }
    }

    /// Consulta o `ProofOfOrigin` configurado usando o `ContractRef` gerado pelo Odra.
    ///
    /// O macro `#[odra::module]` do contrato `ProofOfOrigin` gera
    /// `ProofOfOriginContractRef`. No Odra 2.8, esse ref é criado com
    /// `ProofOfOriginContractRef::new(env, address)`, onde `env` é o ambiente do
    /// contrato chamador (`self.env()`) e `address` é o endereço salvo em storage.
    fn get_origin_attestation(&self, asset_id: String) -> Option<Attestation> {
        let proof = ProofOfOriginContractRef::new(self.env(), self.get_proof_contract());
        proof.get_attestation(asset_id)
    }
}

#[cfg(test)]
mod tests {
    use crate::mint_gate::{LotMinted, MintGate, MintGateError, MintGateInitArgs};
    use crate::proof_of_origin::ProofOfOrigin;
    use odra::host::{Deployer, NoArgs};
    use odra::prelude::{Addressable, OdraError};

    fn asset_id() -> String {
        String::from("MINA-VALEDOURO-LOTE-001")
    }

    fn second_asset_id() -> String {
        String::from("MINA-VALEDOURO-LOTE-002")
    }

    fn valid_seal() -> String {
        String::from("a3f1c9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff00")
    }

    fn invalid_seal() -> String {
        String::from("fffec9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff11")
    }

    /// Deploy padrão dos dois contratos.
    ///
    /// O `MintGate` recebe o endereço do `ProofOfOrigin` no init, exatamente como
    /// aconteceria on-chain.
    fn deploy_contracts() -> (
        odra::host::HostEnv,
        crate::proof_of_origin::ProofOfOriginHostRef,
        crate::mint_gate::MintGateHostRef,
    ) {
        let env = odra_test::env();
        let owner = env.get_account(0);
        env.set_caller(owner);

        let proof = ProofOfOrigin::deploy(&env, NoArgs);
        let gate = MintGate::deploy(
            &env,
            MintGateInitArgs {
                proof_contract: proof.address(),
            },
        );

        (env, proof, gate)
    }

    #[test]
    fn valid_attestation_allows_mint_lot() {
        let (env, mut proof, mut gate) = deploy_contracts();
        let minter = env.get_account(1);

        proof.register_reference(asset_id(), valid_seal());

        env.set_caller(minter);
        proof.attest(asset_id(), valid_seal());
        gate.mint_lot(asset_id());

        assert!(gate.is_minted(asset_id()));
        assert_eq!(gate.mint_count(), 1);
        assert!(env.emitted_event(
            &gate,
            LotMinted {
                asset_id: asset_id(),
                minter,
            }
        ));
    }

    #[test]
    fn invalid_attestation_reverts_with_no_valid_proof() {
        let (env, mut proof, mut gate) = deploy_contracts();
        let minter = env.get_account(1);

        proof.register_reference(asset_id(), valid_seal());

        env.set_caller(minter);
        proof.attest(asset_id(), invalid_seal());
        let err = gate.try_mint_lot(asset_id()).unwrap_err();

        let expected: OdraError = MintGateError::NoValidProof.into();
        assert_eq!(err, expected);
        assert!(!gate.is_minted(asset_id()));
        assert_eq!(gate.mint_count(), 0);
    }

    #[test]
    fn asset_without_attestation_reverts_with_no_valid_proof() {
        let (env, _proof, mut gate) = deploy_contracts();
        let minter = env.get_account(1);

        env.set_caller(minter);
        let err = gate.try_mint_lot(second_asset_id()).unwrap_err();

        let expected: OdraError = MintGateError::NoValidProof.into();
        assert_eq!(err, expected);
        assert!(!gate.is_minted(second_asset_id()));
        assert_eq!(gate.mint_count(), 0);
    }

    #[test]
    fn minting_same_valid_asset_twice_reverts_with_already_minted() {
        let (env, mut proof, mut gate) = deploy_contracts();
        let minter = env.get_account(1);

        proof.register_reference(asset_id(), valid_seal());

        env.set_caller(minter);
        proof.attest(asset_id(), valid_seal());
        gate.mint_lot(asset_id());

        let err = gate.try_mint_lot(asset_id()).unwrap_err();

        let expected: OdraError = MintGateError::AlreadyMinted.into();
        assert_eq!(err, expected);
        assert!(gate.is_minted(asset_id()));
        assert_eq!(gate.mint_count(), 1);
    }

    #[test]
    fn set_proof_contract_from_non_owner_reverts_with_not_owner() {
        let (env, proof, mut gate) = deploy_contracts();
        let non_owner = env.get_account(1);

        env.set_caller(non_owner);
        let err = gate.try_set_proof_contract(proof.address()).unwrap_err();

        let expected: OdraError = MintGateError::NotOwner.into();
        assert_eq!(err, expected);
        assert_eq!(gate.get_proof_contract(), proof.address());
    }
}
