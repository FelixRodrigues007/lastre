import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createProtocolClient, extractAttestTxHash } from "../dist/protocol.js";

const PACKAGE_HASH = "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561";
const SEAL = "a".repeat(64);

describe("gateway protocol client", () => {
  it("reads verdict JSON through the Rust query binary", async () => {
    const calls = [];
    const client = createProtocolClient({
      packageHash: PACKAGE_HASH,
      contractDir: "/repo/contracts/lastro_origin",
      queryBinary: "/repo/contracts/lastro_origin/target/debug/query",
      execFile(command, args, options) {
        calls.push({ command, args, options });
        return Promise.resolve(JSON.stringify({
          packageHash: PACKAGE_HASH,
          assetId: "MINA-VALEDOURO-LOTE-001",
          verdict: "Invalid",
          seal: SEAL,
          referenceSeal: "b".repeat(64),
          attester: "account-hash-demo",
          attestationTx: null,
          accepted: 2,
          rejected: 1,
        }));
      },
    });

    const result = await client.readVerdict("MINA-VALEDOURO-LOTE-001");

    assert.equal(result.verdict, "Invalid");
    assert.equal(result.packageHash, PACKAGE_HASH);
    assert.equal(result.accepted, 2);
    assert.equal(calls[0].command, "/repo/contracts/lastro_origin/target/debug/query");
    assert.deepEqual(calls[0].args, ["MINA-VALEDOURO-LOTE-001", "--json"]);
    assert.equal(calls[0].options.cwd, "/repo/contracts/lastro_origin");
    assert.equal(calls[0].options.env.LASTRO_PROOF_OF_ORIGIN_PACKAGE_HASH, PACKAGE_HASH);
  });

  it("anchors a sandbox seal through the existing attest binary and parses the attest tx hash", async () => {
    const calls = [];
    const client = createProtocolClient({
      packageHash: PACKAGE_HASH,
      contractDir: "/repo/contracts/lastro_origin",
      queryBinary: "/repo/contracts/lastro_origin/target/debug/query",
      attestBinary: "/repo/contracts/lastro_origin/target/debug/attest",
      sandboxSecretKeyPath: "/keys/demo-secret.pem",
      execFile(command, args, options) {
        calls.push({ command, args, options });
        if (command.endsWith("/attest")) {
          return Promise.resolve("register        : skipped\nattest tx       : 43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4\nverdict         : Valid");
        }
        return Promise.resolve(JSON.stringify({
          packageHash: PACKAGE_HASH,
          assetId: "SANDBOX-001",
          verdict: "Valid",
          seal: SEAL,
          referenceSeal: SEAL,
          attester: "account-hash-demo",
          attestationTx: null,
          accepted: 3,
          rejected: 1,
        }));
      },
    });

    const result = await client.anchor("SANDBOX-001", SEAL);

    assert.equal(result.txHash, "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4");
    assert.equal(result.verdict, "Valid");
    assert.equal(result.explorerUrl, "https://testnet.cspr.live/transaction/43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4");
    assert.equal(calls[0].options.env.LASTRO_AGENT_SKIP_REGISTER, "1");
    assert.equal(calls[0].options.env.LASTRO_AGENT_ASSET_ID, "SANDBOX-001");
    assert.equal(calls[0].options.env.LASTRO_AGENT_PROVIDED_SEAL, SEAL);
    assert.equal(calls[0].options.env.ODRA_CASPER_LIVENET_SECRET_KEY_PATH, "/keys/demo-secret.pem");
  });

  it("extracts only the attest tx when register and attest hashes both appear", () => {
    const output = `register tx     : ${"1".repeat(64)}\nattest tx       : ${"2".repeat(64)}\n`;
    assert.equal(extractAttestTxHash(output), "2".repeat(64));
  });
});
