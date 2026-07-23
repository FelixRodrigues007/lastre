import assert from "node:assert/strict";
import test from "node:test";

import { resolveAuditOnChainLinks } from "../src/lib/auditOnChainLinks";
import type { AuditRecord } from "../src/lib/types";

const SYNTHETIC_RECEIPT = "3f3505a9ca056a790ee546fb1a7a7954969d21d8b2826f25f7753adc95b79f42";
const CARBON_VALID = "a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e";
const MINA_VALID = "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4";

test("carbon Valid row uses asset-specific on-chain attestation (not a generic sample)", () => {
  const record: AuditRecord = {
    assetId: "CARBON-VCS-AMAZONIA-2024-001",
    decision: { action: "pay", reasoning: "demo", decidedBy: "rule" },
    verification: {
      verdict: "Valid",
      seal: "abc",
      referenceSeal: "abc",
      txHash: SYNTHETIC_RECEIPT,
    },
    onChain: { verdict: "Valid", txHash: SYNTHETIC_RECEIPT },
    outcome: "tokenizable",
  };

  assert.deepEqual(resolveAuditOnChainLinks(record), {
    attestationUrl: `https://testnet.cspr.live/transaction/${CARBON_VALID}`,
    sampleUrl: null,
  });
});

test("known MINA row uses its asset-specific attestation and no sample link", () => {
  const record: AuditRecord = {
    assetId: "MINA-VALEDOURO-LOTE-002",
    decision: { action: "pay", reasoning: "demo", decidedBy: "rule" },
    verification: {
      verdict: "Valid",
      seal: "abc",
      referenceSeal: "abc",
      txHash: SYNTHETIC_RECEIPT,
    },
    onChain: { verdict: "Valid", txHash: SYNTHETIC_RECEIPT },
    outcome: "tokenizable",
  };

  assert.deepEqual(resolveAuditOnChainLinks(record), {
    attestationUrl: `https://testnet.cspr.live/transaction/${MINA_VALID}`,
    sampleUrl: null,
  });
});
