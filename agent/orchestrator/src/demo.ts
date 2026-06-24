import { Agent } from "./agent.js";
import { LlmDecider, RuleDecider } from "./decider.js";
import { LocalGateway } from "./gateway.js";
import { createOriginChainWithReferences } from "./origin_chain.js";
import { createDemoArtifacts, createDemoReferenceArtifacts } from "./samples.js";
import type { AuditRecord, BatchResult, Decider } from "./types.js";

async function main(): Promise<void> {
  await runDemo("RuleDecider determinístico", new RuleDecider());

  if (process.env.OPENROUTER_API_KEY) {
    await runDemo("LlmDecider via OpenRouter", new LlmDecider());
  } else {
    console.log("\nOPENROUTER_API_KEY não definido; demo LLM real pulado com segurança.");
  }
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

  // 1) Visão "bonita" e legível por humano (o que um revisor lê primeiro).
  console.log(renderAuditLog(title, result));
  // 2) JSON completo logo abaixo, para inspeção detalhada/máquina.
  console.log(`\n--- ${title}: JSON completo ---`);
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Formata o log de auditoria de forma amigável para o console.
 *
 * É apenas apresentação: não altera nenhum dado do batch, só monta uma string
 * legível a partir do BatchResult já calculado pelo Agent.
 */
function renderAuditLog(title: string, result: BatchResult): string {
  const line = "═".repeat(64);
  const lines: string[] = [];

  lines.push("");
  lines.push(line);
  lines.push(` LASTRO — Log de Auditoria (${title})`);
  lines.push(line);

  result.records.forEach((record, index) => {
    lines.push(...renderRecord(record, index + 1));
    lines.push("-".repeat(64));
  });

  const s = result.summary;
  lines.push(
    ` Resumo:   tokenizable=${s.tokenizable}  rejected=${s.rejected}  ` +
      `skipped=${s.skipped}  escalated=${s.escalated}`,
  );
  lines.push(` On-chain: accepted=${s.onChainAccepted}  rejected=${s.onChainRejected}`);
  lines.push(line);

  return lines.join("\n");
}

/** Renderiza um único registro do log; mostra pagamento/on-chain só quando houve verificação. */
function renderRecord(record: AuditRecord, position: number): string[] {
  const lines: string[] = [];

  lines.push(` ${position}. ${record.assetId}`);
  lines.push(`    decisão:   ${record.decision.action}  (por: ${record.decision.decidedBy})`);
  lines.push(`    motivo:    ${record.decision.reasoning}`);

  if (record.verification && record.onChain) {
    // Lote pago: mostra o veredito do selo, o txHash curto e o estado on-chain.
    lines.push(`    pagamento: tx ${shortHash(record.onChain.txHash)} (verificação paga)`);
    lines.push(`    selo:      ${record.verification.verdict} (recomputado vs. referenceSeal)`);
    lines.push(`    on-chain:  ${record.onChain.verdict}`);
  } else {
    // Lote skip/escalate: nunca paga nem verifica, então não há prova on-chain.
    lines.push(`    pagamento: — (não pago)`);
  }

  lines.push(`    resultado: ${record.outcome}`);
  return lines;
}

/** Encurta um hash para caber na visão de console sem perder a referência. */
function shortHash(hash: string): string {
  return hash.length > 12 ? `${hash.slice(0, 8)}…${hash.slice(-4)}` : hash;
}

main().catch((error: unknown) => {
  console.error(error);
  throw error;
});
