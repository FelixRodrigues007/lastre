# Lastro Origin Contracts

Skeleton Odra/Casper para a Camada 1 do Lastro. No Bloco 2 o contrato de exemplo `Flipper` foi substituído pelo contrato `ProofOfOrigin`, que registra selos de referência de ativos e atesta a origem comparando o selo fornecido com o selo "bom".

## Testar

```bash
cargo odra test
```

Resultado do Bloco 2: os 4 testes de `proof_of_origin::tests` passam (`ok`).
