import { Link } from "react-router-dom";
import type { AuditRecord } from "../../lib/types";
import { shortHash } from "../../lib/format";
import { CSPR_PACKAGE_URL } from "../../lib/navigation";
import { explorerUrlFromTx, resolveAttestationUrl } from "../../lib/chainTimeline";
import { ActionBadge, OutcomeBadge, VerdictBadge } from "../proof/Badges";
import { SealChip } from "../proof/SealChip";
import "./process-record-panel.css";

type ProcessRecordPanelProps = {
  record: AuditRecord;
  index: number;
};

function sealMatchLabel(record: AuditRecord): string | null {
  if (!record.verification) return null;
  const matched = record.verification.seal === record.verification.referenceSeal;
  return matched ? "Seal matched reference" : "Seal mismatch — tamper detected";
}

export function ProcessRecordPanel({ record, index }: ProcessRecordPanelProps) {
  const verdict = record.verification?.verdict ?? record.onChain?.verdict ?? null;
  const sealNote = sealMatchLabel(record);
  const isInvalidProof = verdict === "Invalid";
  const attestationUrl = record.onChain
    ? resolveAttestationUrl(record.assetId, explorerUrlFromTx(record.onChain.txHash), record.onChain.verdict)
    : null;

  return (
    <article className="process-record panel" aria-label={`Process record ${record.assetId}`}>
      <header className="process-record__head">
        <div>
          <p className="mono-label">Lot {index}</p>
          <h3 className="process-record__title">
            <Link to={`/lots/${encodeURIComponent(record.assetId)}`}>{record.assetId}</Link>
          </h3>
        </div>
        <OutcomeBadge outcome={record.outcome} />
      </header>

      <div className="process-record__grid">
        <section className="process-record__cell process-record__cell--agent" aria-label="Agent action">
          <p className="process-record__label">Agent action</p>
          <p className="process-record__sublabel">Chooses what to do — not truth</p>
          <ActionBadge action={record.decision.action} />
          <p className="process-record__meta">Decided by {record.decision.decidedBy}</p>
          <p className="process-record__detail">{record.decision.reasoning}</p>
        </section>

        <section className="process-record__cell process-record__cell--seal" aria-label="Seal verification">
          <p className="process-record__label">Seal verification</p>
          <p className="process-record__sublabel">SHA-256 decides verdict</p>
          {record.verification ? (
            <>
              <div className="process-record__seals">
                <SealChip hash={record.verification.seal} label="computed" />
                <SealChip hash={record.verification.referenceSeal} label="reference" />
              </div>
              {sealNote ? (
                <p
                  className={`process-record__match${
                    isInvalidProof ? " process-record__match--invalid" : " process-record__match--valid"
                  }`}
                >
                  {sealNote}
                </p>
              ) : null}
            </>
          ) : (
            <p className="process-record__empty">
              {record.decision.action === "skip"
                ? "Skipped — seal check not run"
                : record.decision.action === "escalate"
                  ? "Escalated — awaiting manual review"
                  : "Not verified in this step"}
            </p>
          )}
        </section>

        <section className="process-record__cell process-record__cell--verdict" aria-label="Verdict">
          <p className="process-record__label">Verdict</p>
          <p className="process-record__sublabel">From seal comparison</p>
          <VerdictBadge verdict={verdict} />
          {isInvalidProof ? (
            <p className="process-record__invalid-note">
              Invalid is permanent proof of tamper or rejection — not a system error.
            </p>
          ) : verdict === "Valid" ? (
            <p className="process-record__valid-note">Valid attestation — eligible for symbolic demo layers.</p>
          ) : (
            <p className="process-record__empty">No verdict yet</p>
          )}
        </section>

        <section className="process-record__cell process-record__cell--casper" aria-label="Casper on-chain proof">
          <p className="process-record__label">Casper proof</p>
          <p className="process-record__sublabel">On-chain attestation record</p>
          {record.onChain ? (
            <>
              <VerdictBadge verdict={record.onChain.verdict} />
              <code className="process-record__tx">tx {shortHash(record.onChain.txHash, 10, 6)}</code>
              {attestationUrl ? (
                <a
                  className="process-record__link"
                  href={attestationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Casper testnet
                </a>
              ) : (
                <>
                  <p className="process-record__session">Demo/session receipt — not on Casper</p>
                  <a
                    className="process-record__link"
                    href={CSPR_PACKAGE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open ProofOfOrigin package
                  </a>
                </>
              )}
            </>
          ) : (
            <>
              <p className="process-record__empty">Not recorded on-chain</p>
              <a className="process-record__link" href={CSPR_PACKAGE_URL} target="_blank" rel="noopener noreferrer">
                Open ProofOfOrigin package
              </a>
            </>
          )}
        </section>
      </div>
    </article>
  );
}
