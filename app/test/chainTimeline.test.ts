import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSessionEntries,
  explorerUrlFromTx,
  isCanonicalTestnetTx,
  resolveAttestationUrl,
  KNOWN_ATTESTATION_URLS,
  CANONICAL_TESTNET_TX_HASHES,
} from "../src/lib/chainTimeline";
import type { AuditRecord } from "../src/lib/types";

// A real, on-chain Version1 hash (canonical Invalid sample for LOTE-001).
const CANONICAL_INVALID = "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd";
const CANONICAL_VALID = "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4";
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

test("buildSessionEntries: synthetic receipt yields no live link but a session-receipt flag", () => {
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
  assert.equal(entry.explorerUrl, null);
  assert.equal(entry.sessionReceipt, true);
  assert.equal(entry.receiptTxHash, SYNTHETIC_RECEIPT);
});

test("buildSessionEntries: known lot resolves canonical link even with session hash", () => {
  const record: AuditRecord = {
    assetId: "MINA-VALEDOURO-LOTE-001",
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
  assert.equal(entry.explorerUrl, KNOWN_ATTESTATION_URLS["MINA-VALEDOURO-LOTE-001"]);
  assert.equal(entry.sessionReceipt, false);
  assert.equal(entry.receiptTxHash, null);
});

test("every canonical hash is 64-hex lowercase", () => {
  for (const hash of CANONICAL_TESTNET_TX_HASHES) {
    assert.match(hash, /^[0-9a-f]{64}$/);
  }
});
