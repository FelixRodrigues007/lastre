import test from "node:test";
import { equal, ok } from "node:assert/strict";
import {
  Agent,
  LlmDecider,
  LocalGateway,
  MockOriginChain,
  RuleDecider,
  DEFAULT_LIMITS,
  createDemoArtifacts,
  createDemoReferenceArtifacts,
  createOriginChainWithReferences,
} from "../dist/index.js";

function createHarness() {
  const referenceArtifacts = createDemoReferenceArtifacts();
  const gateway = new LocalGateway(referenceArtifacts);
  const originChain = createOriginChainWithReferences(referenceArtifacts);
  const agent = new Agent(new RuleDecider(), gateway, originChain);
  const artifacts = createDemoArtifacts();

  return { agent, gateway, originChain, artifacts };
}

test("valid lot pays, verifies Valid, attests accepted, and becomes tokenizable", async () => {
  const { agent, originChain, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.valid);

  equal(record.decision.action, "pay");
  equal(record.verification?.verdict, "Valid");
  equal(record.onChain?.verdict, "Valid");
  equal(originChain.acceptedCount(), 1);
  equal(originChain.rejectedCount(), 0);
  equal(record.outcome, "tokenizable");
});

test("tampered lot can still pay, but the seal yields Invalid and rejected outcome", async () => {
  const { agent, originChain, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.tampered);

  equal(record.decision.action, "pay");
  equal(record.verification?.verdict, "Invalid");
  equal(record.onChain?.verdict, "Invalid");
  equal(originChain.acceptedCount(), 0);
  equal(originChain.rejectedCount(), 1);
  equal(record.outcome, "rejected");
});

test("duplicate lot is skipped with no new payment or attestation", async () => {
  const { agent, gateway, originChain, artifacts } = createHarness();
  await agent.processLot(artifacts.valid);
  const acceptedBefore = originChain.acceptedCount();
  const rejectedBefore = originChain.rejectedCount();
  const paymentsBefore = gateway.paymentCount();

  const duplicate = await agent.processLot(artifacts.validDuplicate);

  equal(duplicate.decision.action, "skip");
  equal(duplicate.verification, null);
  equal(duplicate.onChain, null);
  equal(duplicate.outcome, "skipped");
  equal(originChain.acceptedCount(), acceptedBefore);
  equal(originChain.rejectedCount(), rejectedBefore);
  equal(gateway.paymentCount(), paymentsBefore);
});

test("out-of-perimeter lot escalates with no payment or attestation", async () => {
  const { agent, gateway, originChain, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.outOfRegion);

  equal(record.decision.action, "escalate");
  equal(record.verification, null);
  equal(record.onChain, null);
  equal(record.outcome, "escalated");
  equal(originChain.acceptedCount(), 0);
  equal(originChain.rejectedCount(), 0);
  equal(gateway.paymentCount(), 0);
});

test("CRITICAL: pay decision does not decide verdict; paid tampered lot remains Invalid by seal", async () => {
  const { agent, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.tampered);

  equal(record.decision.action, "pay");
  equal(record.verification?.verdict, "Invalid");
  equal(record.verification?.seal === record.verification?.referenceSeal, false);
  equal(record.outcome, "rejected");
});

test("every batch log record has non-empty reasoning", async () => {
  const { agent, artifacts } = createHarness();

  const result = await agent.processBatch([
    artifacts.valid,
    artifacts.tampered,
    artifacts.validDuplicate,
    artifacts.outOfRegion,
  ]);

  equal(result.records.length, 4);
  for (const record of result.records) {
    ok(record.decision.reasoning.trim().length > 0);
  }
  equal(result.summary.tokenizable, 1);
  equal(result.summary.rejected, 1);
  equal(result.summary.skipped, 1);
  equal(result.summary.escalated, 1);
  equal(result.summary.onChainAccepted, 1);
  equal(result.summary.onChainRejected, 1);
});

test("LlmDecider without OPENROUTER_API_KEY uses deterministic rule fallback and logs the active mode", async () => {
  const artifacts = createDemoArtifacts();
  const logs = [];
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;
  const originalBaseUrl = process.env.OPENROUTER_BASE_URL;

  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_MODEL;
  delete process.env.OPENROUTER_BASE_URL;
  globalThis.fetch = async () => {
    throw new Error("fetch must not be called without OPENROUTER_API_KEY");
  };

  try {
    const decider = new LlmDecider({
      logger: (message) => logs.push(message),
    });

    const decision = await decider.decide({
      artifact: artifacts.valid,
      alreadyAttested: false,
      limits: DEFAULT_LIMITS,
    });

    equal(decision.action, "pay");
    equal(decision.decidedBy, "rule");
    ok(decision.reasoning.trim().length > 0);
    ok(
      logs.some((message) => message.includes("rule fallback") && message.includes("OPENROUTER_API_KEY")),
      "expected an explicit rule-fallback log when OPENROUTER_API_KEY is absent",
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("OPENROUTER_API_KEY", originalApiKey);
    restoreEnv("OPENROUTER_MODEL", originalModel);
    restoreEnv("OPENROUTER_BASE_URL", originalBaseUrl);
  }
});

test("LlmDecider with a key calls the env-configured endpoint/model and returns an llm action (never a verdict)", async () => {
  const artifacts = createDemoArtifacts();
  const logs = [];
  const originalFetch = globalThis.fetch;
  const originalApiKey = process.env.OPENROUTER_API_KEY;
  const originalModel = process.env.OPENROUTER_MODEL;
  const originalBaseUrl = process.env.OPENROUTER_BASE_URL;
  let capturedUrl;
  let capturedInit;

  process.env.OPENROUTER_API_KEY = "test-key-not-a-secret";
  process.env.OPENROUTER_MODEL = "test/model";
  process.env.OPENROUTER_BASE_URL = "https://router.example.test/api/v1";

  globalThis.fetch = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return {
      ok: true,
      status: 200,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"action":"escalate","reasoning":"LLM chose to escalate this lot for manual review."}',
            },
          },
        ],
      }),
    };
  };

  try {
    const decider = new LlmDecider({
      logger: (message) => logs.push(message),
    });

    const decision = await decider.decide({
      artifact: artifacts.valid,
      alreadyAttested: false,
      limits: DEFAULT_LIMITS,
    });

    // The LLM decided only the ACTION; there is no verdict field anywhere here.
    equal(decision.action, "escalate");
    equal(decision.decidedBy, "llm");
    ok(decision.reasoning.trim().length > 0);
    ok(!("verdict" in decision), "the decider must never emit a verdict");

    // Endpoint and model come from configuration, not a hardcoded URL.
    equal(capturedUrl, "https://router.example.test/api/v1/chat/completions");
    equal(capturedInit.headers.Authorization, "Bearer test-key-not-a-secret");
    const sentBody = JSON.parse(capturedInit.body);
    equal(sentBody.model, "test/model");

    ok(
      logs.some((message) => message.includes("OpenRouter LLM path") && message.includes("test/model")),
      "expected an explicit OpenRouter-LLM-path log naming the configured model",
    );
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv("OPENROUTER_API_KEY", originalApiKey);
    restoreEnv("OPENROUTER_MODEL", originalModel);
    restoreEnv("OPENROUTER_BASE_URL", originalBaseUrl);
  }
});

test("LlmDecider with a key falls back to the deterministic rule when OpenRouter fails", async () => {
  const artifacts = createDemoArtifacts();
  const logs = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    json: async () => ({}),
  });

  try {
    const decider = new LlmDecider({
      apiKey: "test-key-not-a-secret",
      logger: (message) => logs.push(message),
    });

    const decision = await decider.decide({
      artifact: artifacts.valid,
      alreadyAttested: false,
      limits: DEFAULT_LIMITS,
    });

    // A robust real path degrades to the deterministic rule on failure.
    equal(decision.action, "pay");
    equal(decision.decidedBy, "rule");
    ok(
      logs.some((message) => message.includes("rule fallback") && message.includes("HTTP 500")),
      "expected an explicit rule-fallback log naming the upstream failure",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function restoreEnv(name, value) {
  if (value === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = value;
  }
}
