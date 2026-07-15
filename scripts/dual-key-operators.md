# Dual-key operators (Epic C)

## Keys (Casper Testnet identities)

| Role | Public key | Account hash |
| --- | --- | --- |
| Field sealer | `0193d8172e0e3aa24a7b1894331324ef17cb49d44ac4899b75083d1987b1725176` | `account-hash-4c8631b8d684faba4f3087c6be0fed6c506a9669bb378e6ee5fff7977b7d1657` |
| Chain attester | `01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad` | `account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2` |

**Rule:** sealer ≠ attester. Seal decides Valid/Invalid; keys only authorize roles.

## Attester sample txs (on-chain)

- Valid: `43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4`
- Invalid: `5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd`

## API

```bash
curl -sS https://app-api.lastre.io/api/evidence | jq '.operators, .dualKey'
```

Expect `dualKey.distinct: true` and two different `accountHash` values for field_sealer vs chain_attester.
