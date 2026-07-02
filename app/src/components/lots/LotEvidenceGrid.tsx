import { Link } from "react-router-dom";
import type { LotDetail } from "../../lib/types";
import { shortHash } from "../../lib/format";
import { CSPR_PACKAGE_URL } from "../../lib/navigation";
import { ActionBadge, OutcomeBadge, VerdictBadge } from "../proof/Badges";
import "./lot-evidence-grid.css";

type LotEvidenceGridProps = {
  lot: LotDetail;
};

export function LotEvidenceGrid({ lot }: LotEvidenceGridProps) {
  const record = lot.auditRecord;
  const verdict = lot.latestVerdict ?? record?.verification?.verdict ?? record?.onChain?.verdict ?? null;
  const onChain = lot.testnetAttestation ?? record?.onChain ?? null;

  return (
    <section className="lot-evidence panel" aria-label="Evidence breakdown">
      <header className="lot-evidence__head">
        <div>
          <p className="mono-label">Evidence room</p>
          <p className="lot-evidence__lead">
            Agent chooses action · seal decides verdict · Casper records proof
          </p>
        </div>
        {record ? <OutcomeBadge outcome={record.outcome} /> : null}
      </header>

      <div className="lot-evidence__grid">
        <section className="lot-evidence__cell lot-evidence__cell--agent" aria-label="Agent action">
          <p className="lot-evidence__label">Agent action</p>
          <p className="lot-evidence__sublabel">Chooses what to do — not truth</p>
          {record ? (
            <>
              <ActionBadge action={record.decision.action} />
              <p className="lot-evidence__meta">Decided by {record.decision.decidedBy}</p>
              <p className="lot-evidence__detail">{record.decision.reasoning}</p>
            </>
          ) : (
            <>
              <span className="badge badge--muted">Not processed</span>
              <p className="lot-evidence__detail">
                Run the demo batch in Process to see agent action vs seal verdict.
              </p>
              <Link className="lot-evidence__link" to="/process">
                Go to Process
              </Link>
            </>
          )}
        </section>

        <section className="lot-evidence__cell lot-evidence__cell--seal" aria-label="Seal verification">
          <p className="lot-evidence__label">Seal check</p>
          <p className="lot-evidence__sublabel">SHA-256 over artifact fields</p>
          {lot.referenceSeal ? (
            <>
              <VerdictBadge
                verdict={
                  lot.sealMatchesReference === false
                    ? "Invalid"
                    : lot.sealMatchesReference
                      ? "Valid"
                      : null
                }
              />
              <p
                className={`lot-evidence__match${
                  lot.sealMatchesReference === false
                    ? " lot-evidence__match--invalid"
                    : lot.sealMatchesReference
                      ? " lot-evidence__match--valid"
                      : ""
                }`}
              >
                {lot.sealMatchesReference === false
                  ? "Mismatch — tamper detected"
                  : lot.sealMatchesReference
                    ? "Matches reference"
                    : "Reference registered"}
              </p>
            </>
          ) : (
            <>
              <span className="badge badge--muted">No reference</span>
              <p className="lot-evidence__detail">Reference seal not registered for this lot.</p>
            </>
          )}
        </section>

        <section className="lot-evidence__cell lot-evidence__cell--verdict" aria-label="Verdict">
          <p className="lot-evidence__label">Verdict</p>
          <p className="lot-evidence__sublabel">From seal comparison</p>
          <VerdictBadge verdict={verdict} />
          {verdict === "Invalid" ? (
            <p className="lot-evidence__note lot-evidence__note--invalid">
              Invalid is permanent proof — the artifact failed verification.
            </p>
          ) : verdict === "Valid" ? (
            <p className="lot-evidence__note lot-evidence__note--valid">
              Valid attestation — eligible for symbolic demo layers after proof.
            </p>
          ) : (
            <p className="lot-evidence__detail">Awaiting seal verification in a batch run.</p>
          )}
          {record ? (
            <Link
              className="lot-evidence__link"
              to={`/audit/${encodeURIComponent(lot.artifact.assetId)}`}
            >
              Open audit record
            </Link>
          ) : null}
        </section>

        <section className="lot-evidence__cell lot-evidence__cell--casper" aria-label="Casper proof">
          <p className="lot-evidence__label">Casper proof</p>
          <p className="lot-evidence__sublabel">On-chain attestation</p>
          {onChain ? (
            <>
              <VerdictBadge verdict={onChain.verdict} />
              {"txHash" in onChain && onChain.txHash ? (
                <code className="lot-evidence__tx">tx {shortHash(onChain.txHash, 10, 6)}</code>
              ) : null}
              {"explorerUrl" in onChain && onChain.explorerUrl ? (
                <a
                  className="lot-evidence__link"
                  href={onChain.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on cspr.live
                </a>
              ) : "txHash" in onChain && onChain.txHash ? (
                <a
                  className="lot-evidence__link"
                  href={`https://testnet.cspr.live/deploy/${onChain.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Casper testnet
                </a>
              ) : null}
            </>
          ) : (
            <>
              <span className="badge badge--muted">Not on-chain</span>
              <p className="lot-evidence__detail">No Casper attestation recorded for this lot yet.</p>
              <a className="lot-evidence__link" href={CSPR_PACKAGE_URL} target="_blank" rel="noopener noreferrer">
                Open ProofOfOrigin package
              </a>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
