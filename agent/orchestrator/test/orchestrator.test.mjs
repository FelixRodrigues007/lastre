import test from "node:test";
import { equal, ok } from "node:assert/strict";
import {
  Agent,
  LocalGateway,
  MockOriginChain,
  RuleDecider,
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

test("LOTE válido paga, verifica Valid, atesta accepted e fica tokenizable", async () => {
  const { agent, originChain, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.valid);

  equal(record.decision.action, "pay");
  equal(record.verification?.verdict, "Valid");
  equal(record.onChain?.verdict, "Valid");
  equal(originChain.acceptedCount(), 1);
  equal(originChain.rejectedCount(), 0);
  equal(record.outcome, "tokenizable");
});

test("LOTE adulterado ainda pode pagar, mas o selo gera verdict Invalid e outcome rejected", async () => {
  const { agent, originChain, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.tampered);

  equal(record.decision.action, "pay");
  equal(record.verification?.verdict, "Invalid");
  equal(record.onChain?.verdict, "Invalid");
  equal(originChain.acceptedCount(), 0);
  equal(originChain.rejectedCount(), 1);
  equal(record.outcome, "rejected");
});

test("LOTE duplicado é skip, sem novo pagamento e sem nova atestação", async () => {
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

test("LOTE fora do perímetro é escalate, sem pagamento e sem atestação", async () => {
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

test("CRÍTICO: decisão pay não decide o veredito; lote adulterado pago continua Invalid pelo selo", async () => {
  const { agent, artifacts } = createHarness();

  const record = await agent.processLot(artifacts.tampered);

  equal(record.decision.action, "pay");
  equal(record.verification?.verdict, "Invalid");
  equal(record.verification?.seal === record.verification?.referenceSeal, false);
  equal(record.outcome, "rejected");
});

test("todo registro do log de batch tem reasoning não-vazia", async () => {
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
