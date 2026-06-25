// SPDX-License-Identifier: Apache-2.0
use odra::prelude::*;

/// Result of an origin attestation.
///
/// `#[odra::odra_type]` generates the serialization required to store and
/// return this enum through Odra storage/entry points.
#[odra::odra_type]
pub enum Verdict {
    Valid,
    Invalid,
}

/// Latest attestation recorded for an asset.
///
/// Fields are `pub` so tests and consumers can read the `get_attestation`
/// return value directly.
#[odra::odra_type]
pub struct Attestation {
    pub asset_id: String,
    pub provided_seal: String,
    pub verdict: Verdict,
    pub attester: Address,
}

/// Business errors for the contract.
///
/// `#[odra::odra_error]` converts each variant into a revertible Odra error.
#[odra::odra_error]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ProofOfOriginError {
    NotOwner,
    UnknownAsset,
}

/// Event emitted whenever an attestation is written on-chain.
#[odra::event]
pub struct OriginAttested {
    pub asset_id: String,
    pub verdict: Verdict,
    pub attester: Address,
}

/// Proof-of-origin contract.
///
/// `events` and `errors` tell Odra which events and errors are part of the
/// contract's public schema.
#[odra::module(events = [OriginAttested], errors = ProofOfOriginError)]
pub struct ProofOfOrigin {
    /// Contract owner, set in `init` to the deploy caller.
    owner: Var<Address>,
    /// Expected SHA-256 seal by asset: asset_id -> reference_seal.
    references: Mapping<String, String>,
    /// Latest attestation recorded by asset: asset_id -> Attestation.
    attestations: Mapping<String, Attestation>,
    /// Total accepted attestations.
    accepted: Var<u32>,
    /// Total rejected attestations.
    rejected: Var<u32>,
}

#[odra::module]
impl ProofOfOrigin {
    /// Odra constructor.
    ///
    /// The first caller becomes the owner, and counters start at zero.
    pub fn init(&mut self) {
        self.owner.set(self.env().caller());
        self.accepted.set(0);
        self.rejected.set(0);
    }

    /// Registers or replaces an asset reference seal.
    ///
    /// Only the owner may call this. If another address tries, the contract
    /// reverts with `ProofOfOriginError::NotOwner`.
    pub fn register_reference(&mut self, asset_id: String, reference_seal: String) {
        self.ensure_owner();
        self.references.set(&asset_id, reference_seal);
    }

    /// Attests an asset by comparing the provided seal with the reference seal.
    ///
    /// Important: both `Valid` and `Invalid` results are written on-chain. A
    /// rejection is also permanent proof.
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

    /// Returns the latest attestation for an asset, if any.
    pub fn get_attestation(&self, asset_id: String) -> Option<Attestation> {
        self.attestations.get(&asset_id)
    }

    /// Returns an asset reference seal, if it has been registered.
    pub fn get_reference(&self, asset_id: String) -> Option<String> {
        self.references.get(&asset_id)
    }

    /// Total accepted attestations.
    pub fn accepted_count(&self) -> u32 {
        self.accepted.get_or_default()
    }

    /// Total rejected attestations.
    pub fn rejected_count(&self) -> u32 {
        self.rejected.get_or_default()
    }

    /// Owner address set at deploy time.
    pub fn get_owner(&self) -> Address {
        self.owner.get().unwrap_or_revert(self)
    }

    /// Internal helper that keeps the owner rule in one place.
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

        // OriginAttested must be emitted on-chain with a Valid verdict. Checking
        // the emission is essential: without it, a bug that removed `emit_event`
        // would go unnoticed and the required "permanent proof" would disappear.
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

        // Even on rejection, OriginAttested must be emitted on-chain: rejection is
        // also permanent proof, not just a discarded error.
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
