import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAlreadyLockedError,
  isAlreadyMintedError,
  isNotLockedError,
} from "../src/lib/railIdempotency.ts";
import { ApiError } from "../src/lib/types.ts";

describe("isAlreadyMintedError", () => {
  it("matches prod API body shape: AlreadyMinted without space", () => {
    const err = new ApiError(
      "AlreadyMinted: MintGate: asset already tokenized/registered in this gate",
      400,
    );
    assert.equal(isAlreadyMintedError(err), true);
  });

  it("matches code ALREADY_MINTED even when message is opaque", () => {
    const err = new ApiError("gate refused", 400, "ALREADY_MINTED");
    assert.equal(isAlreadyMintedError(err), true);
  });

  it("matches spaced 'already minted' legacy string", () => {
    assert.equal(isAlreadyMintedError(new Error("asset already minted")), true);
  });

  it("matches 'already tokenized' from MintGate message", () => {
    assert.equal(
      isAlreadyMintedError(new Error("MintGate: asset already tokenized/registered")),
      true,
    );
  });

  it("rejects genuine mint failures", () => {
    assert.equal(
      isAlreadyMintedError(
        new ApiError("NoValidProof: MintGate: NoValidProof — ProofOfOrigin must be Valid before mint", 400, "INVALID_ORIGIN"),
      ),
      false,
    );
    assert.equal(isAlreadyMintedError(new Error("network down")), false);
    assert.equal(isAlreadyMintedError(null), false);
  });

  it("does not match the broken old regex alone (space-required) against AlreadyMinted — helper still true", () => {
    // Documents the regression: /already minted/iu fails on AlreadyMinted
    const message = "AlreadyMinted: MintGate: asset already tokenized/registered in this gate";
    assert.equal(/already minted/iu.test(message), false);
    assert.equal(isAlreadyMintedError(new Error(message)), true);
  });
});

describe("isAlreadyLockedError", () => {
  it("matches code and message forms", () => {
    assert.equal(isAlreadyLockedError(new ApiError("x", 400, "ALREADY_LOCKED")), true);
    assert.equal(isAlreadyLockedError(new Error("AlreadyLocked: position exists")), true);
    assert.equal(isAlreadyLockedError(new Error("asset already locked")), true);
    assert.equal(isAlreadyLockedError(new Error("NOT_MINTED")), false);
  });
});

describe("isNotLockedError", () => {
  it("matches NOT_LOCKED code and message", () => {
    assert.equal(isNotLockedError(new ApiError("x", 400, "NOT_LOCKED")), true);
    assert.equal(isNotLockedError(new Error("not locked under this account")), true);
    assert.equal(isNotLockedError(new Error("ALREADY_LOCKED")), false);
  });
});
