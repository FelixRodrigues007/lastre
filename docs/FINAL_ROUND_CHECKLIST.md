# Casper Buildathon Final-Round Readiness Checklist

Date: 2026-07-10

This checklist maps the Casper Agentic Buildathon final-round requirements to
the current Lastre repository state.

## GitHub repository

| Requirement | Status | Evidence / owner action |
| --- | --- | --- |
| Public repository | Done | GitHub reports `visibility=PUBLIC` for `FelixRodrigues007/lastre`. |
| Proper naming | Done | Public repo is `lastre`; internal legacy paths may still use `lastro` for compatibility. |
| Description | Done | `Lastre: proof-before-token provenance for real-world assets on Casper Testnet`. |
| Website | Done | `https://lastre.io`. |
| Required topics | Done | `casper-blockchain`, `casper-network`, `buildathon`, plus relevant tags. |
| Comprehensive README | Done | Root [`README.md`](../README.md). |
| Community standards | Done | `README.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, issue templates, and PR template. |
| CodeQL | Done | [`.github/workflows/codeql.yml`](../.github/workflows/codeql.yml). |
| Dependabot alerts / updates | Done | GitHub vulnerability alerts and automated security fixes are enabled; config lives in [`.github/dependabot.yml`](../.github/dependabot.yml). |
| CI/security tooling | Done | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) builds/tests web, app, agent packages, contracts, and runs npm high/critical audits. |
| Fix High+ security alerts | Verified locally | `npm audit --audit-level=high` returns 0 high/critical vulnerabilities for root, web, app, and agent packages checked. GitHub Dependabot alert API was not accessible with the current token (`404`), so confirm the Security tab after push. |

## Application

| Requirement | Status | Evidence |
| --- | --- | --- |
| Functional MVP | Done | `https://app.lastre.io/marketplace` → **Run Demo**. |
| Deployed on Casper Testnet | Done | `ProofOfOrigin` package hash `hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561`. |
| Intuitive UI workflows | Done | Marketplace → Run Demo → View in MyAssets; Agents page integration flow. |
| Demo video or playbook | Done | [`JUDGES_PLAYBOOK.md`](../JUDGES_PLAYBOOK.md) and [`docs/DEMO_SCRIPT.md`](DEMO_SCRIPT.md). |
| Concise testing instructions | Done | [`JUDGES_PLAYBOOK.md`](../JUDGES_PLAYBOOK.md). |
| Contract package hashes on BUIDL page | Manual | Copy from [`JUDGES_PLAYBOOK.md`](../JUDGES_PLAYBOOK.md) section 2. |
| Sample Testnet transactions on BUIDL page | Manual | Copy from [`JUDGES_PLAYBOOK.md`](../JUDGES_PLAYBOOK.md) section 3. |

## Must paste into DoraHacks/BUIDL page

### Contract package

```text
Network: Casper Testnet (casper-test)
ProofOfOrigin package hash: hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
Package address: package-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561
```

### Sample Testnet transactions

```text
Install ProofOfOrigin:
c2cd1d7fd301d54dd82ed5d25f0e76cde88f39008d92504c5a08922d78e4db10

Register reference for MINA-VALEDOURO-LOTE-001:
23d265beb8bd2e6d292975ded281bd9a63148d93870dd9ac262baf73154caede

Tampered attest for MINA-VALEDOURO-LOTE-001 (Invalid recorded on-chain):
5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd

Register reference for MINA-VALEDOURO-LOTE-002:
bd6d476ee1fddcb1b0deae0185eefc6fecfcbefe616d2b80ebb75fc736fb9101

Agent-driven attest for MINA-VALEDOURO-LOTE-002 (Valid recorded on-chain):
43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4
```

## Final smoke before resubmission

Run these after pushing and redeploying:

```bash
curl -s https://app-api.lastre.io/api/health
curl -s https://app-api.lastre.io/api/mint/summary
curl -s -X POST https://app-api.lastre.io/api/x402/simulate/CARBON-VCS-AMAZONIA-2024-001 \
  -H "Content-Type: application/json" \
  -d '{"from":"casper-buildathon-final-smoke"}'
```

Then open:

1. `https://lastre.io`
2. `https://app.lastre.io/marketplace`
3. `https://app.lastre.io/agents`
4. `https://github.com/FelixRodrigues007/lastre/community`

Do not leave `main`, Cloudflare Pages, or Render in a broken transitional state.
