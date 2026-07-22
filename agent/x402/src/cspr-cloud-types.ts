/**
 * Official CSPR.cloud x402 facilitator types + WCSPR constants.
 *
 * Docs: https://docs.cspr.cloud/x402-facilitator-api/reference
 * Examples: https://github.com/make-software/casper-x402
 * Swap CSPR↔WCSPR: https://testnet.cspr.trade (WCSPR menu)
 */

/** CSPR.cloud facilitator base URL (testnet + mainnet). */
export const CSPR_CLOUD_FACILITATOR_URL = "https://x402-facilitator.cspr.cloud";

/**
 * Wrapped CSPR (WCSPR) CEP-18 package hash on Casper Testnet.
 * Source: make-software/casper-x402 `.env.testnet` ASSET_PACKAGE.
 */
export const WCSPR_TESTNET_PACKAGE_HASH =
  "3d80df21ba4ee4d66a2a1f60c32570dd5685e4b279f6538162a5fd1314847c1e";

/** Docs settle example uses another CEP-18 package; prefer WCSPR for Lastre. */
export const DEFAULT_WCSPR_EXTRA = {
  name: "Wrapped CSPR",
  symbol: "WCSPR",
  version: "1",
  decimals: "9",
} as const;

export const CAIP2_CASPER_TEST = "casper:casper-test";
export const CAIP2_CASPER_MAIN = "casper:casper";

export type CloudPaymentRequirements = {
  scheme: "exact";
  network: string;
  payTo: string;
  amount: string;
  asset: string;
  maxTimeoutSeconds: number;
  extra: {
    name: string;
    version: string;
    decimals?: string;
    symbol?: string;
  };
};

export type CloudTransferAuthorization = {
  from: string;
  to: string;
  value: string;
  validAfter: string;
  validBefore: string;
  nonce: string;
};

export type CloudPaymentPayload = {
  x402Version: 2;
  resource: {
    url: string;
    description?: string;
    mimeType?: string;
  };
  accepted: {
    scheme: "exact";
    network: string;
    asset: string;
    amount: string;
    payTo: string;
    maxTimeoutSeconds: number;
    extra?: Record<string, string>;
  };
  payload: {
    signature: string;
    publicKey: string;
    authorization: CloudTransferAuthorization;
  };
};

export type CloudVerifyRequest = {
  paymentPayload: CloudPaymentPayload;
  paymentRequirements: CloudPaymentRequirements;
};

export type CloudVerifyResponse = {
  isValid: boolean;
  payer?: string;
  invalidReason?: string;
  invalidMessage?: string;
  extensions?: unknown;
};

export type CloudSettleResponse = {
  success: boolean;
  transaction: string;
  network: string;
  payer: string;
  errorReason?: string;
  errorMessage?: string;
};

export type CloudSupportedResponse = {
  kinds: Array<{
    x402Version: number;
    scheme: string;
    network: string;
    extra?: { feePayer?: string };
  }>;
  extensions?: unknown[];
  signers?: Record<string, string[]>;
};

/** Lastre 402 body extras when advertising official cloud path. */
export type CloudQuoteMeta = {
  facilitatorUrl: string;
  docs: string;
  examplesRepo: string;
  tradeWcspr: string;
  network: typeof CAIP2_CASPER_TEST | typeof CAIP2_CASPER_MAIN;
  asset: string;
  assetSymbol: "WCSPR";
  amountBaseUnits: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra: typeof DEFAULT_WCSPR_EXTRA;
  note: string;
};

export function buildCloudQuoteMeta(input: {
  payTo: string;
  amountBaseUnits?: string;
  network?: typeof CAIP2_CASPER_TEST | typeof CAIP2_CASPER_MAIN;
  assetPackage?: string;
}): CloudQuoteMeta {
  return {
    facilitatorUrl: CSPR_CLOUD_FACILITATOR_URL,
    docs: "https://docs.cspr.cloud/x402-facilitator-api/reference",
    examplesRepo: "https://github.com/make-software/casper-x402",
    tradeWcspr: "https://testnet.cspr.trade",
    network: input.network ?? CAIP2_CASPER_TEST,
    asset: (input.assetPackage ?? WCSPR_TESTNET_PACKAGE_HASH).replace(/^hash-/, ""),
    assetSymbol: "WCSPR",
    amountBaseUnits: input.amountBaseUnits ?? "1000000000", // 1 WCSPR @ 9 decimals (configurable)
    payTo: input.payTo,
    maxTimeoutSeconds: 900,
    extra: DEFAULT_WCSPR_EXTRA,
    note:
      "Official MAKE path: EIP-712 PAYMENT-SIGNATURE + CSPR.cloud /verify + /settle with WCSPR (CEP-18). Swap CSPR↔WCSPR on testnet.cspr.trade. Judge UI /simulate stays mock.",
  };
}

export function cloudRequirementsFromMeta(meta: CloudQuoteMeta): CloudPaymentRequirements {
  return {
    scheme: "exact",
    network: meta.network,
    payTo: meta.payTo,
    amount: meta.amountBaseUnits,
    asset: meta.asset,
    maxTimeoutSeconds: meta.maxTimeoutSeconds,
    extra: { ...meta.extra },
  };
}
