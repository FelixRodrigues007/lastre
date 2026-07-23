# Carbon attestation live — Casper Testnet

**Status: PASS (2026-07-15)**

Asset-specific on-chain ProofOfOrigin for the judge demo carbon lot.

## Asset

| Field | Value |
| --- | --- |
| asset_id | `CARBON-VCS-AMAZONIA-2024-001` |
| seal (reference = provided) | `2e9feed35f5d887adf94819553cce0b559df2efab8c3a3dfd83c585f813a1d57` |
| verdict | **Valid** |

## Transactions

| Step | Hash | Explorer |
| --- | --- | --- |
| register_reference | `f9fdf121951d95c2d10dff6843ef3b7d6d92e292bef21b73aaf103b822c22c88` | https://testnet.cspr.live/transaction/f9fdf121951d95c2d10dff6843ef3b7d6d92e292bef21b73aaf103b822c22c88 |
| attest → Valid | `a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e` | https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e |

## Counters after run

- accepted: **3** (was 2)
- rejected: **1**

## Dual-key sealer identity (same day)

| Field | Value |
| --- | --- |
| sealer publicKey | `0193d8172e0e3aa24a7b1894331324ef17cb49d44ac4899b75083d1987b1725176` |
| sealer lastTx | `e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e` |
| explorer | https://testnet.cspr.live/transaction/e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e |
| initiator | sealer publicKey (≠ attester) |

## Honesty

- Sample data is fictional; mechanism + testnet txs are real.
- UI `/api/x402/simulate` remains mock (`synthetic_receipt`).
- Carbon Audit row now links the **asset-specific** Valid attest, not a mineral sample masquerading as carbon.
