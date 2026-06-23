use odra::prelude::*;

/// Resultado de uma atestação de origem.
///
/// `#[odra::odra_type]` gera a serialização necessária para guardar e retornar
/// este enum em storage/entry points do Odra.
#[odra::odra_type]
pub enum Verdict {
    Valid,
    Invalid,
}

/// Última atestação registrada para um ativo.
///
/// Os campos são `pub` para os testes e consumidores conseguirem ler o retorno
/// de `get_attestation` diretamente.
#[odra::odra_type]
pub struct Attestation {
    pub asset_id: String,
    pub provided_seal: String,
    pub verdict: Verdict,
    pub attester: Address,
}

/// Erros de negócio do contrato.
///
/// `#[odra::odra_error]` converte cada variante em um erro Odra revertível.
#[odra::odra_error]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ProofOfOriginError {
    NotOwner,
    UnknownAsset,
}

/// Evento emitido sempre que uma atestação é gravada on-chain.
#[odra::event]
pub struct OriginAttested {
    pub asset_id: String,
    pub verdict: Verdict,
    pub attester: Address,
}

/// Contrato de prova de origem.
///
/// `events` e `errors` informam ao Odra quais eventos e erros fazem parte do
/// schema público do contrato.
#[odra::module(events = [OriginAttested], errors = ProofOfOriginError)]
pub struct ProofOfOrigin {
    /// Dono do contrato, definido no `init` como o caller do deploy.
    owner: Var<Address>,
    /// Selo SHA-256 esperado por ativo: asset_id -> reference_seal.
    references: Mapping<String, String>,
    /// Última atestação registrada por ativo: asset_id -> Attestation.
    attestations: Mapping<String, Attestation>,
    /// Total de atestações aceitas.
    accepted: Var<u32>,
    /// Total de atestações rejeitadas.
    rejected: Var<u32>,
}

#[odra::module]
impl ProofOfOrigin {
    /// Construtor Odra.
    ///
    /// O primeiro caller vira owner, e os contadores começam zerados.
    pub fn init(&mut self) {
        self.owner.set(self.env().caller());
        self.accepted.set(0);
        self.rejected.set(0);
    }

    /// Registra ou substitui o selo de referência de um ativo.
    ///
    /// Apenas o owner pode chamar. Se outro endereço tentar, o contrato reverte
    /// com `ProofOfOriginError::NotOwner`.
    pub fn register_reference(&mut self, asset_id: String, reference_seal: String) {
        self.ensure_owner();
        self.references.set(&asset_id, reference_seal);
    }

    /// Atesta um ativo comparando o selo fornecido com o selo de referência.
    ///
    /// Importante: tanto o resultado `Valid` quanto `Invalid` são gravados
    /// on-chain. Uma rejeição também é uma prova permanente.
    pub fn attest(&mut self, asset_id: String, provided_seal: String) -> Verdict {
        let reference_seal = self
            .references
            .get(&asset_id)
            .unwrap_or_revert_with(self, ProofOfOriginError::UnknownAsset);

        let verdict = if provided_seal == reference_seal {
            self.accepted.add(1);
            Verdict::Valid
        } else {
            self.rejected.add(1);
            Verdict::Invalid
        };

        let attester = self.env().caller();
        let attestation = Attestation {
            asset_id: asset_id.clone(),
            provided_seal,
            verdict: verdict.clone(),
            attester,
        };

        self.attestations.set(&asset_id, attestation);
        self.env().emit_event(OriginAttested {
            asset_id,
            verdict: verdict.clone(),
            attester,
        });

        verdict
    }

    /// Retorna a última atestação de um ativo, se existir.
    pub fn get_attestation(&self, asset_id: String) -> Option<Attestation> {
        self.attestations.get(&asset_id)
    }

    /// Retorna o selo de referência de um ativo, se ele já foi registrado.
    pub fn get_reference(&self, asset_id: String) -> Option<String> {
        self.references.get(&asset_id)
    }

    /// Total de atestações aceitas.
    pub fn accepted_count(&self) -> u32 {
        self.accepted.get_or_default()
    }

    /// Total de atestações rejeitadas.
    pub fn rejected_count(&self) -> u32 {
        self.rejected.get_or_default()
    }

    /// Endereço do owner definido no deploy.
    pub fn get_owner(&self) -> Address {
        self.owner.get().unwrap_or_revert(self)
    }

    /// Helper interno para manter a regra de owner em um só lugar.
    fn ensure_owner(&self) {
        if self.env().caller() != self.get_owner() {
            self.env().revert(ProofOfOriginError::NotOwner);
        }
    }
}

#[cfg(test)]
mod tests {
    use crate::proof_of_origin::{OriginAttested, ProofOfOrigin, ProofOfOriginError, Verdict};
    use odra::host::{Deployer, NoArgs};
    use odra::prelude::OdraError;

    fn asset_id() -> String {
        String::from("MINA-VALEDOURO-LOTE-001")
    }

    fn valid_seal() -> String {
        String::from("a3f1c9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff00")
    }

    fn invalid_seal() -> String {
        String::from("fffec9b8d7e6f50123456789abcdef00112233445566778899aabbccddeeff11")
    }

    #[test]
    fn register_reference_and_attest_equal_seal_accepts_and_stores_attestation() {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let attester = env.get_account(1);
        env.set_caller(owner);
        let mut contract = ProofOfOrigin::deploy(&env, NoArgs);

        contract.register_reference(asset_id(), valid_seal());

        env.set_caller(attester);
        let verdict = contract.attest(asset_id(), valid_seal());

        assert_eq!(verdict, Verdict::Valid);
        assert_eq!(contract.accepted_count(), 1);
        assert_eq!(contract.rejected_count(), 0);

        let attestation = contract.get_attestation(asset_id()).unwrap();
        assert_eq!(attestation.asset_id, asset_id());
        assert_eq!(attestation.provided_seal, valid_seal());
        assert_eq!(attestation.verdict, Verdict::Valid);
        assert_eq!(attestation.attester, attester);

        // O evento OriginAttested deve ter sido emitido on-chain com veredito Valid.
        // Conferir a emissão é essencial: sem isto, um bug que removesse o
        // `emit_event` passaria despercebido (a "prova permanente" pedida sumiria).
        assert!(env.emitted_event(
            &contract,
            OriginAttested {
                asset_id: asset_id(),
                verdict: Verdict::Valid,
                attester,
            }
        ));
    }

    #[test]
    fn attest_different_seal_rejects_and_stores_invalid_attestation() {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let attester = env.get_account(1);
        env.set_caller(owner);
        let mut contract = ProofOfOrigin::deploy(&env, NoArgs);

        contract.register_reference(asset_id(), valid_seal());

        env.set_caller(attester);
        let verdict = contract.attest(asset_id(), invalid_seal());

        assert_eq!(verdict, Verdict::Invalid);
        assert_eq!(contract.accepted_count(), 0);
        assert_eq!(contract.rejected_count(), 1);

        let attestation = contract.get_attestation(asset_id()).unwrap();
        assert_eq!(attestation.asset_id, asset_id());
        assert_eq!(attestation.provided_seal, invalid_seal());
        assert_eq!(attestation.verdict, Verdict::Invalid);
        assert_eq!(attestation.attester, attester);

        // Mesmo na rejeição o evento OriginAttested precisa ser emitido on-chain:
        // a rejeição também é prova permanente, não apenas um erro descartado.
        assert!(env.emitted_event(
            &contract,
            OriginAttested {
                asset_id: asset_id(),
                verdict: Verdict::Invalid,
                attester,
            }
        ));
    }

    #[test]
    fn attest_unknown_asset_reverts_with_unknown_asset() {
        let env = odra_test::env();
        let owner = env.get_account(0);
        env.set_caller(owner);
        let mut contract = ProofOfOrigin::deploy(&env, NoArgs);

        let err = contract.try_attest(asset_id(), valid_seal()).unwrap_err();
        let expected: OdraError = ProofOfOriginError::UnknownAsset.into();
        assert_eq!(err, expected);
    }

    #[test]
    fn register_reference_from_non_owner_reverts_with_not_owner() {
        let env = odra_test::env();
        let owner = env.get_account(0);
        let non_owner = env.get_account(1);
        env.set_caller(owner);
        let mut contract = ProofOfOrigin::deploy(&env, NoArgs);

        env.set_caller(non_owner);
        let err = contract
            .try_register_reference(asset_id(), valid_seal())
            .unwrap_err();
        let expected: OdraError = ProofOfOriginError::NotOwner.into();
        assert_eq!(err, expected);
    }
}
