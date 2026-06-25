import { Agent } from "./agent.js";
import { LlmDecider, RuleDecider } from "./decider.js";
import { LocalGateway } from "./gateway.js";
import { createOriginChainWithReferences } from "./origin_chain.js";
import { createDemoArtifacts, createDemoReferenceArtifacts } from "./samples.js";
import type { AuditRecord, BatchResult, Decider } from "./types.js";

async function main(): Promise<void> {
  await runDemo("Deterministic RuleDecider", new RuleDecider());
  await runDemo("LlmDecider (OpenRouter when configured, rule fallback otherwise)", new LlmDecider());
}

async function runDemo(title: string, decider: Decider): Promise<void> {
  const referenceArtifacts = createDemoReferenceArtifacts();
  const gateway = new LocalGateway(referenceArtifacts);
  const originChain = createOriginChainWithReferences(referenceArtifacts);
  const agent = new Agent(decider, gateway, originChain);
  const artifacts = createDemoArtifacts();

  const result = await agent.processBatch([
    artifacts.valid,
    artifacts.tampered,
    artifacts.validDuplicate,
    artifacts.outOfRegion,
  ]);

  // 1) Human-readable view for reviewers.
  console.log(renderAuditLog(title, result));
  // 2) Complete JSON for detailed inspection and machine parsing.
  console.log(`\n--- ${title}: complete JSON ---`);
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Formats the audit log for console output.
 *
 * Presentation only: it does not change any batch data, it only renders the
 * BatchResult already computed by the Agent.
 */
function renderAuditLog(title: string, result: BatchResult): string {
  const line = "═".repeat(64);
  const lines: string[] = [];

  lines.push("");
  lines.push(line);
  lines.push(` LASTRO — Audit Log (${title})`);
  lines.push(line);

  result.records.forEach((record, index) => {
    lines.push(...renderRecord(record, index + 1));
    lines.push("-".repeat(64));
  });

  const s = result.summary;
  lines.push(
    ` Summary:  tokenizable=${s.tokenizable}  rejected=${s.rejected}  ` +
      `skipped=${s.skipped}  escalated=${s.escalated}`,
  );
  lines.push(` On-chain: accepted=${s.onChainAccepted}  rejected=${s.onChainRejected}`);
  lines.push(line);

  return lines.join("\n");
}

/** Renders one audit record; payment/on-chain details appear only after verification. */
function renderRecord(record: AuditRecord, position: number): string[] {
  const lines: string[] = [];

  lines.push(` ${position}. ${record.assetId}`);
  lines.push(`    decision:  ${record.decision.action}  (by: ${record.decision.decidedBy})`);
  lines.push(`    reason:    ${record.decision.reasoning}`);

  if (record.verification && record.onChain) {
    // Paid lot: show the seal verdict, the short txHash, and the on-chain state.
    lines.push(`    payment:   tx ${shortHash(record.onChain.txHash)} (paid verification)`);
    lines.push(`    seal:      ${record.verification.verdict} (recomputed vs. referenceSeal)`);
    lines.push(`    on-chain:  ${record.onChain.verdict}`);
  } else {
    // Skipped/escalated lots are never paid or verified, so there is no on-chain proof.
    lines.push("    payment:   — (not paid)");
  }

  lines.push(`    outcome:   ${record.outcome}`);
  return lines;
}

/** Shortens a hash for compact console output while preserving traceability. */
function shortHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

main().catch((error: unknown) => {
  console.error(error);
  throw error;
});
