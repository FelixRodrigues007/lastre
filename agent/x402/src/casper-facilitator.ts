/**
 * CasperFacilitator — real testnet CSPR settlement for the x402 seam.
 *
 * Flow (server-as-agent-payer demo):
 * 1. verifyPayment — same anti-replay + amount/nonce checks as mock, using the
 *    deterministic mock signature for the HTTP X-PAYMENT header (proves the
 *    client knew the quote). This does NOT move funds.
 * 2. settlePayment — executes `casper-client transfer` with the configured
 *    secret key, amount, and target account. Returns the real transaction hash
 *    as settlementKind "casper_deploy".
 *
 * If the secret key path is missing or casper-client fails, settle throws —
 * callers that need a soft fallback should use createFacilitatorFromEnv().
 */

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import {
  type Facilitator,
  type FacilitatorMode,
  type PaymentPayload,
  type PaymentRequirements,
  type PaymentVerification,
  type Settlement,
  signMockPayment,
} from "./facilitator.js";

export type ExecFileResult = { stdout: string; stderr: string };

export type ExecFileFn = (
  command: string,
  args: string[],
  options: { encoding: "utf8"; timeout: number; maxBuffer: number },
) => Promise<ExecFileResult>;

function defaultExecFile(
  command: string,
  args: string[],
  options: { encoding: "utf8"; timeout: number; maxBuffer: number },
): Promise<ExecFileResult> {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) {
        const err = error as Error & { stdout?: string; stderr?: string };
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
        return;
      }
      resolve({ stdout: stdout ?? "", stderr: stderr ?? "" });
    });
  });
}

export type CasperFacilitatorOptions = {
  /** Path to PEM secret key used to pay (agent/demo purse). */
  secretKeyPath: string;
  /** Recipient: hex public key or account-hash (casper-client --target-account). */
  targetAccount: string;
  /** RPC node, e.g. https://node.testnet.casper.network/rpc */
  nodeAddress?: string;
  chainName?: string;
  casperClientBin?: string;
  /** Optional injectable exec for tests. */
  execFile?: ExecFileFn;
};

const DEFAULT_NODE = "https://node.testnet.casper.network/rpc";
const DEFAULT_CHAIN = "casper-test";

export class CasperFacilitator implements Facilitator {
  readonly mode: FacilitatorMode = "casper";

  private readonly settledNonces = new Set<string>();
  private readonly secretKeyPath: string;
  private readonly targetAccount: string;
  private readonly nodeAddress: string;
  private readonly chainName: string;
  private readonly casperClientBin: string;
  private readonly execFileImpl: ExecFileFn;

  constructor(options: CasperFacilitatorOptions) {
    if (!options.secretKeyPath || !existsSync(options.secretKeyPath)) {
      throw new Error(
        `CasperFacilitator: secret key not found at ${options.secretKeyPath ?? "(missing)"}`,
      );
    }
    if (!options.targetAccount?.trim()) {
      throw new Error("CasperFacilitator: targetAccount (payTo) is required");
    }
    this.secretKeyPath = options.secretKeyPath;
    this.targetAccount = options.targetAccount.trim();
    this.nodeAddress = options.nodeAddress ?? DEFAULT_NODE;
    this.chainName = options.chainName ?? DEFAULT_CHAIN;
    this.casperClientBin = options.casperClientBin ?? "casper-client";
    this.execFileImpl = options.execFile ?? defaultExecFile;
  }

  async verifyPayment(
    payment: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<PaymentVerification> {
    if (this.settledNonces.has(payment.nonce)) {
      return { ok: false, reason: "nonce_replayed" };
    }
    if (payment.nonce !== requirements.nonce) {
      return { ok: false, reason: "nonce_mismatch" };
    }
    if (payment.amount < requirements.maxAmountRequired) {
      return { ok: false, reason: "amount_insufficient" };
    }

    // Header authenticity: same deterministic signature as mock (proves quote knowledge).
    // On-chain movement happens only in settlePayment.
    const expectedSig = signMockPayment({
      nonce: payment.nonce,
      amount: payment.amount,
      from: payment.from,
    });
    if (payment.sig !== expectedSig) {
      return { ok: false, reason: "bad_signature" };
    }

    return { ok: true };
  }

  async settlePayment(
    payment: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<Settlement> {
    if (this.settledNonces.has(payment.nonce)) {
      throw new Error("nonce_replayed");
    }

    const transferId = transferIdFromNonce(payment.nonce);
    const amount = String(payment.amount);

    const args = [
      "transfer",
      "--node-address",
      this.nodeAddress,
      "--chain-name",
      this.chainName,
      "--secret-key",
      this.secretKeyPath,
      "--amount",
      amount,
      "--target-account",
      this.targetAccount,
      "--transfer-id",
      transferId,
      "--payment-amount",
      "2500000000",
    ];

    let stdout: string;
    let stderr: string;
    try {
      const result = await this.execFileImpl(this.casperClientBin, args, {
        encoding: "utf8",
        timeout: 180_000,
        maxBuffer: 2 * 1024 * 1024,
      });
      stdout = result.stdout ?? "";
      stderr = result.stderr ?? "";
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; message?: string };
      const detail = [err.stderr, err.stdout, err.message].filter(Boolean).join("\n");
      throw new Error(`CasperFacilitator settle failed: ${detail || "casper-client error"}`);
    }

    const txHash = extractTransferTxHash(`${stdout}\n${stderr}`);
    if (!txHash) {
      throw new Error(
        `CasperFacilitator: could not parse transaction hash from casper-client output:\n${stdout}\n${stderr}`,
      );
    }

    this.settledNonces.add(payment.nonce);

    return {
      kind: "casper_deploy",
      txHash,
    };
  }
}

/** Map quote nonce → u64 transfer-id for permanent association on chain. */
export function transferIdFromNonce(nonce: string): string {
  const hex = createHash("sha256").update(nonce).digest("hex").slice(0, 16);
  // Parse as big-endian u64 without overflow surprises for casper-client.
  return BigInt(`0x${hex}`).toString(10);
}

export function extractTransferTxHash(output: string): string | null {
  const patterns = [
    /transaction[_ ]hash["':\s]+([0-9a-fA-F]{64})/i,
    /deploy[_ ]hash["':\s]+([0-9a-fA-F]{64})/i,
    /"hash"\s*:\s*"([0-9a-fA-F]{64})"/i,
    /transfer\s+tx\s*:\s*([0-9a-fA-F]{64})/i,
    /\b([0-9a-fA-F]{64})\b/,
  ];
  for (const re of patterns) {
    const m = output.match(re);
    if (m?.[1]) return m[1].toLowerCase();
  }
  return null;
}
