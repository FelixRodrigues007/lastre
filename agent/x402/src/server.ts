import { randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { buildPassport, computeSeal, verifySeal } from "../../sealer/dist/src/sealer.js";
import {
  decodePaymentHeader,
  MockFacilitator,
  type Facilitator,
  type PaymentRequirements,
} from "./facilitator.js";
import { getArtifact, getReferenceSeal } from "./registry.js";

export const DEFAULT_PAYMENT_REQUIREMENTS = {
  scheme: "exact",
  network: "casper-test",
  maxAmountRequired: 100_000_000,
  asset: "CSPR",
  payTo: "casper-test-account-hash-lastro-payto-mock-0001",
  resource: "/verify",
  description: "Lastro provenance verification",
} as const;

type CreateServerOptions = {
  facilitator?: Facilitator;
  nonceFactory?: () => string;
};

/** Cria o servidor HTTP x402 do Lastro usando apenas node:http. */
export function createLastroX402Server(options: CreateServerOptions = {}): {
  server: Server;
  facilitator: Facilitator;
} {
  const facilitator = options.facilitator ?? new MockFacilitator();
  const nonceFactory = options.nonceFactory ?? randomUUID;
  const issuedRequirements = new Map<string, PaymentRequirements>();

  const server = createServer(async (req, res) => {
    try {
      await handleRequest(req, res, facilitator, issuedRequirements, nonceFactory);
    } catch (error) {
      sendJson(res, 500, {
        error: "internal_error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return { server, facilitator };
}

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  facilitator: Facilitator,
  issuedRequirements: Map<string, PaymentRequirements>,
  nonceFactory: () => string,
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (req.method !== "GET" || url.pathname !== "/verify") {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  const assetId = url.searchParams.get("assetId");
  if (!assetId) {
    sendJson(res, 400, { error: "missing_asset_id" });
    return;
  }

  const paymentHeader = readSingleHeader(req, "x-payment");
  if (!paymentHeader) {
    const requirements = issueRequirements(issuedRequirements, nonceFactory);
    sendPaymentRequired(res, requirements, "missing_x_payment");
    return;
  }

  const payment = decodePaymentHeader(paymentHeader);
  if (!payment) {
    const requirements = issueRequirements(issuedRequirements, nonceFactory);
    sendPaymentRequired(res, requirements, "malformed_payment");
    return;
  }

  const requirements = issuedRequirements.get(payment.nonce);
  if (!requirements) {
    const newRequirements = issueRequirements(issuedRequirements, nonceFactory);
    sendPaymentRequired(res, newRequirements, "nonce_unknown");
    return;
  }

  const verification = await facilitator.verifyPayment(payment, requirements);
  if (!verification.ok) {
    sendPaymentRequired(res, requirements, verification.reason);
    return;
  }

  const settlement = await facilitator.settlePayment(payment, requirements);
  const provenance = runProvenanceVerification(assetId, settlement.txHash);

  res.setHeader("X-PAYMENT-RESPONSE", settlement.txHash);
  sendJson(res, 200, provenance);
}

function issueRequirements(
  issuedRequirements: Map<string, PaymentRequirements>,
  nonceFactory: () => string,
): PaymentRequirements {
  const requirements: PaymentRequirements = {
    ...DEFAULT_PAYMENT_REQUIREMENTS,
    nonce: nonceFactory(),
  };
  issuedRequirements.set(requirements.nonce, requirements);
  return requirements;
}

function runProvenanceVerification(assetId: string, txHash: string) {
  const artifact = getArtifact(assetId);
  const referenceSeal = getReferenceSeal(assetId);

  if (!artifact || !referenceSeal) {
    return {
      assetId,
      verdict: "Invalid" as const,
      seal: null,
      referenceSeal: referenceSeal ?? null,
      passport: null,
      settlement: { txHash },
      reason: "unknown_asset",
    };
  }

  const seal = computeSeal(artifact);
  const passport = buildPassport(artifact);
  const verdict = verifySeal(artifact, referenceSeal) ? "Valid" : "Invalid";

  return {
    assetId,
    verdict,
    seal,
    referenceSeal,
    passport,
    settlement: { txHash },
  };
}

function sendPaymentRequired(
  res: ServerResponse,
  requirements: PaymentRequirements,
  reason: string,
): void {
  sendJson(res, 402, {
    error: "payment_required",
    reason,
    requirements,
  });
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readSingleHeader(req: IncomingMessage, name: string): string | undefined {
  const value = req.headers[name];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
