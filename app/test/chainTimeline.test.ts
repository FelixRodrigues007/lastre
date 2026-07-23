import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSessionEntries,
  explorerUrlFromTx,
  isCanonicalTestnetTx,
  resolveAttestationUrl,
  KNOWN_ATTESTATION_URLS,
  KNOWN_ATTESTATION_URLS_BY_VERDICT,
  CANONICAL_TESTNET_TX_HASHES,
} from "../src/lib/chainTimeline";
import type { AuditRecord } from "../src/lib/types";

// A real, on-chain Version1 hash (canonical Invalid sample for LOTE-001).
const CANONICAL_INVALID = "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd";
const CANONICAL_VALID = "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4";
const CANONICAL_VALID_LOTE_001 = "8c619f508443ded0ecd732050b976cb49e44a98501589e386516971351b4e32f";
// 64-hex SHA-256 that is NOT on chain (looks real; the exact dead-link bug).
const SYNTHETIC_RECEIPT = "3e64abf8ad14fe35653ca7b600d622e247e1b65f1989254be34ced1cac254d7f";

test("explorerUrlFromTx links only canonical on-chain hashes, via /transaction/", () => {
  assert.equal(
    explorerUrlFromTx(CANONICAL_INVALID),
    `https://testnet.cspr.live/transaction/${CANONICAL_INVALID}`,
  );
  // Never emit the dead /deploy/ path.
  assert.ok(!(explorerUrlFromTx(CANONICAL_INVALID) ?? "").includes("/deploy/"));
});

test("explorerUrlFromTx returns null for a synthetic_receipt 64-hex hash", () => {
  // This is the core bug: shape-identical to a real hash but not on chain.
  assert.equal(explorerUrlFromTx(SYNTHETIC_RECEIPT), null);
});

test("explorerUrlFromTx returns null for empty, null, and undefined input", () => {
  assert.equal(explorerUrlFromTx(""), null);
  assert.equal(explorerUrlFromTx("   "), null);
  assert.equal(explorerUrlFromTx(null), null);
  assert.equal(explorerUrlFromTx(undefined), null);
});

test("explorerUrlFromTx returns null for demo/mint/session receipt prefixes", () => {
  assert.equal(explorerUrlFromTx("demo-tx-a1b2c3d4e5f6"), null);
  assert.equal(explorerUrlFromTx("mint-19f63b777e2-24-001"), null);
  assert.equal(explorerUrlFromTx("demo-mint-abcdef01-19f"), null);
  assert.equal(explorerUrlFromTx("cached-demo-payload"), null);
});

test("explorerUrlFromTx accepts a full canonical URL and normalizes to /transaction/", () => {
  assert.equal(
    explorerUrlFromTx(`https://testnet.cspr.live/deploy/${CANONICAL_VALID}`),
    `https://testnet.cspr.live/transaction/${CANONICAL_VALID}`,
  );
  assert.equal(
    explorerUrlFromTx(`https://testnet.cspr.live/transaction/${CANONICAL_VALID}`),
    `https://testnet.cspr.live/transaction/${CANONICAL_VALID}`,
  );
});

test("explorerUrlFromTx returns null for a full URL wrapping a synthetic hash", () => {
  assert.equal(
    explorerUrlFromTx(`https://testnet.cspr.live/deploy/${SYNTHETIC_RECEIPT}`),
    null,
  );
});

test("explorerUrlFromTx is case-insensitive on the hash", () => {
  assert.equal(
    explorerUrlFromTx(CANONICAL_INVALID.toUpperCase()),
    `https://testnet.cspr.live/transaction/${CANONICAL_INVALID}`,
  );
});

test("isCanonicalTestnetTx recognizes only confirmed on-chain hashes", () => {
  assert.equal(isCanonicalTestnetTx(CANONICAL_INVALID), true);
  assert.equal(isCanonicalTestnetTx(SYNTHETIC_RECEIPT), false);
  assert.equal(isCanonicalTestnetTx(null), false);
  assert.equal(isCanonicalTestnetTx(undefined), false);
  assert.equal(isCanonicalTestnetTx(""), false);
});

test("resolveAttestationUrl prefers a canonical explorerUrl argument", () => {
  const url = `https://testnet.cspr.live/transaction/${CANONICAL_VALID}`;
  assert.equal(resolveAttestationUrl("ANY-ASSET", url), url);
});

test("resolveAttestationUrl ignores a synthetic explorerUrl and has no known lot", () => {
  assert.equal(
    resolveAttestationUrl("UNKNOWN-LOT", `https://testnet.cspr.live/deploy/${SYNTHETIC_RECEIPT}`),
    null,
  );
});

test("resolveAttestationUrl falls back to KNOWN_ATTESTATION_URLS for known lots", () => {
  assert.equal(
    resolveAttestationUrl("MINA-VALEDOURO-LOTE-001", null),
    KNOWN_ATTESTATION_URLS["MINA-VALEDOURO-LOTE-001"],
  );
  assert.equal(
    resolveAttestationUrl("MINA-VALEDOURO-LOTE-002", undefined),
    KNOWN_ATTESTATION_URLS["MINA-VALEDOURO-LOTE-002"],
  );
});

test("resolveAttestationUrl uses assetId + verdict when the same lot has Valid and Invalid attests", () => {
  assert.equal(
    resolveAttestationUrl("MINA-VALEDOURO-LOTE-001", null, "Valid"),
    `https://testnet.cspr.live/transaction/${CANONICAL_VALID_LOTE_001}`,
  );
  assert.equal(
    resolveAttestationUrl("MINA-VALEDOURO-LOTE-001", null, "Invalid"),
    `https://testnet.cspr.live/transaction/${CANONICAL_INVALID}`,
  );
});

test("resolveAttestationUrl maps the tampered audit row to the canonical Invalid attest", () => {
  assert.equal(
    resolveAttestationUrl("MINA-VALEDOURO-LOTE-001-TAMPERED", null, "Invalid"),
    `https://testnet.cspr.live/transaction/${CANONICAL_INVALID}`,
  );
});

test("resolveAttestationUrl maps Carbon to its live asset-specific Valid attest", () => {
  assert.equal(
    resolveAttestationUrl("CARBON-VCS-AMAZONIA-2024-001", null, "Valid"),
    "https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e",
  );
});

test("resolveAttestationUrl uses the known-lot URL even when a synthetic hash is provided", () => {
  // Known lot + dead session hash => still resolves to the canonical known URL.
  assert.equal(
    resolveAttestationUrl("MINA-VALEDOURO-LOTE-001", explorerUrlFromTx(SYNTHETIC_RECEIPT)),
    KNOWN_ATTESTATION_URLS["MINA-VALEDOURO-LOTE-001"],
  );
});

test("resolveAttestationUrl returns null for unknown lot with no link", () => {
  assert.equal(resolveAttestationUrl("UNKNOWN-LOT", null), null);
});

test("KNOWN_ATTESTATION_URLS only contains canonical /transaction/ links", () => {
  for (const url of Object.values(KNOWN_ATTESTATION_URLS)) {
    assert.ok(url.startsWith("https://testnet.cspr.live/transaction/"));
    assert.ok(!url.includes("/deploy/"));
    assert.equal(isCanonicalTestnetTx(url), true);
  }
});

test("KNOWN_ATTESTATION_URLS_BY_VERDICT only contains canonical /transaction/ links", () => {
  for (const byVerdict of Object.values(KNOWN_ATTESTATION_URLS_BY_VERDICT)) {
    for (const url of Object.values(byVerdict ?? {})) {
      assert.ok(url.startsWith("https://testnet.cspr.live/transaction/"));
      assert.ok(!url.includes("/deploy/"));
      assert.equal(isCanonicalTestnetTx(url), true);
    }
  }
});

test("buildSessionEntries: carbon Valid resolves asset-specific attest; session hash kept as receipt", () => {
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
  const [entry] = buildSessionEntries([record]);
  assert.equal(
    entry.explorerUrl,
    "https://testnet.cspr.live/transaction/a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e",
  );
  assert.equal(entry.sessionReceipt, false);
  // Canonical asset link wins; session synthetic hash is not exposed as receipt.
  assert.equal(entry.receiptTxHash, null);
});

test("buildSessionEntries: known tampered lot resolves canonical Invalid link even with session hash", () => {
  const record: AuditRecord = {
    assetId: "MINA-VALEDOURO-LOTE-001-TAMPERED",
    decision: { action: "pay", reasoning: "demo", decidedBy: "rule" },
    verification: {
      verdict: "Invalid",
      seal: "abc",
      referenceSeal: "def",
      txHash: SYNTHETIC_RECEIPT,
    },
    onChain: { verdict: "Invalid", txHash: SYNTHETIC_RECEIPT },
    outcome: "rejected",
  };
  const [entry] = buildSessionEntries([record]);
  assert.equal(entry.explorerUrl, `https://testnet.cspr.live/transaction/${CANONICAL_INVALID}`);
  assert.equal(entry.sessionReceipt, false);
  assert.equal(entry.receiptTxHash, null);
});

test("buildSessionEntries: known Valid lot resolves historical Valid attest, not Invalid", () => {
  const record: AuditRecord = {
    assetId: "MINA-VALEDOURO-LOTE-001",
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
  const [entry] = buildSessionEntries([record]);
  assert.equal(entry.explorerUrl, `https://testnet.cspr.live/transaction/${CANONICAL_VALID_LOTE_001}`);
  assert.equal(entry.sessionReceipt, false);
  assert.equal(entry.receiptTxHash, null);
});

test("every canonical hash is 64-hex lowercase", () => {
  for (const hash of CANONICAL_TESTNET_TX_HASHES) {
    assert.match(hash, /^[0-9a-f]{64}$/);
  }
});
