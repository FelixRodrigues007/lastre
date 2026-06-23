# Lastro Architecture

## Tese

Proof before token: antes de qualquer tokenização ou liberação de dado, o protocolo valida uma cadeia de prova fictícia e ancora uma atestação verificável na Casper.

## Blocos

1. Fundação: monorepo, BUSL-1.1, skeleton Odra e teste verde.
2. `ProofOfOrigin`: contrato on-chain para registrar atestação, aceitar selo válido e rejeitar inválido.
3. Sealer/AuPass: SHA-256 do input fictício, compatível com o contrato.
4. x402: fluxo `402 -> pagamento -> dado liberado`.
5. Agente: orquestra ponta a ponta.
6. Testnet + Web: deploy real, tx no cspr.live e landing.
7. Empacotamento: demo e README final.

## Dados

Todos os documentos e exemplos públicos devem ser fictícios.
