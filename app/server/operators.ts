/**
 * Dual-key operators — multi-party identities for the trust stack.
 *
 * Field sealer and chain attester MUST be different account-hashes when both
 * are configured. Defaults document the documented Lastre testnet operators.
 *
 * Env overrides:
 *   LASTRE_OPERATOR_SEALER_PUBKEY
 *   LASTRE_OPERATOR_ATTESTER_PUBKEY
 *   LASTRE_OPERATOR_PAYER_PUBKEY
 */

export type OperatorRole = "field_sealer" | "chain_attester" | "paying_agent" | "human_escalation";

export type OperatorEntry = {
  role: OperatorRole;
  label: string;
  publicKey: string | null;
  accountHash: string | null;
  /** Last known related testnet tx (if any). */
  lastTx: string | null;
  lastTxExplorerUrl: string | null;
  duty: string;
  keySeparation: "required" | "optional" | "n/a";
};

/** Documented attester (ProofOfOrigin deployer / sample attests). */
export const DEFAULT_ATTESTER_PUBKEY =
  "01825d5caa210121ea1e493223af5a76f7ff23c70322c5fd0f02eb09f2818f68ad";
export const DEFAULT_ATTESTER_ACCOUNT =
  "account-hash-6de6ee75f7d41407d9e0643d24fe7debc36bbe75695950e544c4ebd11850e1b2";

/** Documented field-sealer operator identity (separate key from attester). */
export const DEFAULT_SEALER_PUBKEY =
  "0193d8172e0e3aa24a7b1894331324ef17cb49d44ac4899b75083d1987b1725176";
export const DEFAULT_SEALER_ACCOUNT =
  "account-hash-4c8631b8d684faba4f3087c6be0fed6c506a9669bb378e6ee5fff7977b7d1657";

/** Payer used in real x402 casper settle demos (may equal attester purse). */
export const DEFAULT_PAYER_PUBKEY = DEFAULT_ATTESTER_PUBKEY;
export const DEFAULT_PAYER_ACCOUNT = DEFAULT_ATTESTER_ACCOUNT;

const SAMPLE_ATTEST_VALID =
  "43b00eddb1371533584c673e1a77f77e479cf8829748bff8da835fd42e16f6f4";
const SAMPLE_ATTEST_INVALID =
  "5a7b0e01ba1a40fcf784e7b01a4a4b5da7ecb5eaf201c1e3b56ab3a2628773cd";
const SAMPLE_PAYMENT =
  "27461bd7d679dfd970dadb195f46a8513f53a916b01643c6f5b6beee1b3f199c";

function explorerTx(hash: string | null): string | null {
  return hash ? `https://testnet.cspr.live/transaction/${hash}` : null;
}

function envOr(name: string, fallback: string): string {
  const v = process.env[name]?.trim();
  return v && v.length > 0 ? v : fallback;
}

/**
 * Build operators[]. Sealer and attester public keys are forced distinct when
 * defaults apply; if env collapses them, dualKeyDistinct is false.
 */
export function getOperators(): {
  operators: OperatorEntry[];
  dualKeyDistinct: boolean;
  rule: string;
  relatedSampleTxs: {
    invalidAttest: string;
    validAttest: string;
    payment: string;
  };
} {
  const sealerPk = envOr("LASTRE_OPERATOR_SEALER_PUBKEY", DEFAULT_SEALER_PUBKEY);
  const attesterPk = envOr("LASTRE_OPERATOR_ATTESTER_PUBKEY", DEFAULT_ATTESTER_PUBKEY);
  const payerPk = envOr("LASTRE_OPERATOR_PAYER_PUBKEY", DEFAULT_PAYER_PUBKEY);

  const sealerAccount =
    sealerPk === DEFAULT_SEALER_PUBKEY
      ? DEFAULT_SEALER_ACCOUNT
      : process.env.LASTRE_OPERATOR_SEALER_ACCOUNT?.trim() || null;
  const attesterAccount =
    attesterPk === DEFAULT_ATTESTER_PUBKEY
      ? DEFAULT_ATTESTER_ACCOUNT
      : process.env.LASTRE_OPERATOR_ATTESTER_ACCOUNT?.trim() || null;
  const payerAccount =
    payerPk === DEFAULT_PAYER_PUBKEY
      ? DEFAULT_PAYER_ACCOUNT
      : process.env.LASTRE_OPERATOR_PAYER_ACCOUNT?.trim() || null;

  const dualKeyDistinct = sealerPk !== attesterPk;

  const operators: OperatorEntry[] = [
    {
      role: "field_sealer",
      label: "Field sealer (offline)",
      publicKey: sealerPk,
      accountHash: sealerAccount,
      lastTx: null,
      lastTxExplorerUrl: null,
      duty: "Build canonical artifact + offline SHA-256 seal. No LLM. Separate key from attester.",
      keySeparation: "required",
    },
    {
      role: "chain_attester",
      label: "Chain attester (ProofOfOrigin)",
      publicKey: attesterPk,
      accountHash: attesterAccount,
      lastTx: SAMPLE_ATTEST_VALID,
      lastTxExplorerUrl: explorerTx(SAMPLE_ATTEST_VALID),
      duty: "Anchor Valid/Invalid on Casper. Sample Invalid tx also from this operator class.",
      keySeparation: "required",
    },
    {
      role: "paying_agent",
      label: "Paying agent (x402)",
      publicKey: payerPk,
      accountHash: payerAccount,
      lastTx: SAMPLE_PAYMENT,
      lastTxExplorerUrl: explorerTx(SAMPLE_PAYMENT),
      duty: "HTTP 402 → settle → read proof before acting. Prod payment sample on testnet.",
      keySeparation: "optional",
    },
    {
      role: "human_escalation",
      label: "Human reviewer",
      publicKey: null,
      accountHash: null,
      lastTx: null,
      lastTxExplorerUrl: null,
      duty: "HITL for escalate only — never overwrites seal verdicts.",
      keySeparation: "n/a",
    },
  ];

  return {
    operators,
    dualKeyDistinct,
    rule: dualKeyDistinct
      ? "Two keys, one seal rule: field sealer ≠ chain attester account. Seal decides; keys only authorize roles."
      : "WARNING: sealer and attester public keys are identical — dual-key separation not met.",
    relatedSampleTxs: {
      invalidAttest: SAMPLE_ATTEST_INVALID,
      validAttest: SAMPLE_ATTEST_VALID,
      payment: SAMPLE_PAYMENT,
    },
  };
}
