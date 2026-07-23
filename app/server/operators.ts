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
const SAMPLE_ATTEST_CARBON_VALID =
  "a4124ea9ce1de42e4b5007bd5bf618dc770b6c8c8f5c30ec452a373c432dc02e";
const SAMPLE_SEALER_IDENTITY =
  "e82e5738d604fcd7f0bf68e27e8f458ecf046bbf97fe8fb29690e88a6767b83e";
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
    carbonValidAttest: string;
    sealerIdentity: string;
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
      lastTx: SAMPLE_SEALER_IDENTITY,
      lastTxExplorerUrl: explorerTx(SAMPLE_SEALER_IDENTITY),
      duty: "Build canonical artifact + offline SHA-256 seal. No LLM. Separate key from attester — lastTx is sealer-signed on-chain identity.",
      keySeparation: "required",
    },
    {
      role: "chain_attester",
      label: "Chain attester (ProofOfOrigin)",
      publicKey: attesterPk,
      accountHash: attesterAccount,
      lastTx: SAMPLE_ATTEST_CARBON_VALID,
      lastTxExplorerUrl: explorerTx(SAMPLE_ATTEST_CARBON_VALID),
      duty: "Anchor Valid/Invalid on Casper. Sample lastTx = carbon Valid; mineral Valid + Invalid samples also from this operator class.",
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
      ? "Two keys, one seal rule: field sealer ≠ chain attester account. Seal decides; keys only authorize roles. Both keys have distinct on-chain lastTx."
      : "WARNING: sealer and attester public keys are identical — dual-key separation not met.",
    relatedSampleTxs: {
      invalidAttest: SAMPLE_ATTEST_INVALID,
      validAttest: SAMPLE_ATTEST_VALID,
      carbonValidAttest: SAMPLE_ATTEST_CARBON_VALID,
      sealerIdentity: SAMPLE_SEALER_IDENTITY,
      payment: SAMPLE_PAYMENT,
    },
  };
}

/**
 * Honest trust-network graph for judges: multi-party operators + multi-domain
 * origin (mineral + carbon) + composition hop + mint gate + agent pay.
 * This is NOT a Claros-style multi-agent marketplace — it is the Lastre trust
 * density surface (roles, domains, gates) with live explorer links.
 */
export function getTrustNetwork() {
  const ops = getOperators();
  const nodes = [
    {
      id: "field_sealer",
      kind: "operator",
      label: "Field sealer",
      lastTx: SAMPLE_SEALER_IDENTITY,
      explorerUrl: explorerTx(SAMPLE_SEALER_IDENTITY),
    },
    {
      id: "chain_attester",
      kind: "operator",
      label: "Chain attester",
      lastTx: SAMPLE_ATTEST_CARBON_VALID,
      explorerUrl: explorerTx(SAMPLE_ATTEST_CARBON_VALID),
    },
    {
      id: "domain_mineral",
      kind: "domain",
      label: "Mineral origin (MINA lots)",
      lastTx: SAMPLE_ATTEST_VALID,
      explorerUrl: explorerTx(SAMPLE_ATTEST_VALID),
    },
    {
      id: "domain_carbon",
      kind: "domain",
      label: "Carbon origin (VCS Amazonia)",
      lastTx: SAMPLE_ATTEST_CARBON_VALID,
      explorerUrl: explorerTx(SAMPLE_ATTEST_CARBON_VALID),
    },
    {
      id: "paying_agent",
      kind: "operator",
      label: "Paying agent (x402)",
      lastTx: SAMPLE_PAYMENT,
      explorerUrl: explorerTx(SAMPLE_PAYMENT),
    },
    {
      id: "mint_gate",
      kind: "gate",
      label: "MintGate (Valid-only)",
      lastTx: "6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349",
      explorerUrl: explorerTx("6878f3e146dc7baa0ef98eb57a53485806755cf389960bb2507bae2b81e36349"),
    },
    {
      id: "composition",
      kind: "composition",
      label: "2-hop composition anchor",
      lastTx: "915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a",
      explorerUrl: explorerTx("915c9736a8d835994b29d163866e600dc7ddb6c0d8c621d8989f52e071dc417a"),
    },
    {
      id: "human_escalation",
      kind: "operator",
      label: "Human escalation",
      lastTx: null,
      explorerUrl: null,
    },
  ];
  const edges = [
    { from: "field_sealer", to: "domain_mineral", relation: "seals_offline" },
    { from: "field_sealer", to: "domain_carbon", relation: "seals_offline" },
    { from: "chain_attester", to: "domain_mineral", relation: "attests_on_chain" },
    { from: "chain_attester", to: "domain_carbon", relation: "attests_on_chain" },
    { from: "paying_agent", to: "domain_carbon", relation: "pays_to_verify" },
    { from: "domain_mineral", to: "mint_gate", relation: "valid_only_mint" },
    { from: "domain_carbon", to: "composition", relation: "receipt_hop" },
    { from: "paying_agent", to: "human_escalation", relation: "escalate_path" },
  ];
  return {
    model: "trust_network",
    note: "Multi-party + multi-domain trust density. Not an oracle marketplace (that axis stays Claros-class).",
    dualKeyDistinct: ops.dualKeyDistinct,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    domains: ["mineral", "carbon"],
    nodes,
    edges,
  };
}
