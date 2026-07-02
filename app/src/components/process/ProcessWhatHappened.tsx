import type { AuditRecord, BatchSummary } from "../../lib/types";
import "./process-what-happened.css";

type ProcessWhatHappenedProps = {
  records: AuditRecord[];
  summary: BatchSummary;
};

export function ProcessWhatHappened({ records, summary }: ProcessWhatHappenedProps) {
  const invalidCount = records.filter(
    (r) => (r.verification?.verdict ?? r.onChain?.verdict) === "Invalid",
  ).length;
  const verifiedCount = records.filter((r) => r.verification).length;
  const onChainCount = records.filter((r) => r.onChain).length;

  return (
    <section className="process-what-happened panel" aria-label="What just happened">
      <header className="process-what-happened__head">
        <p className="process-what-happened__kicker">What just happened?</p>
        <h2 className="process-what-happened__title">Batch complete — proof chain recorded</h2>
      </header>

      <ol className="process-what-happened__steps">
        <li>
          <strong>{records.length} lots</strong> entered the pipeline with structured artifact fields.
        </li>
        <li>
          The <strong>agent</strong> chose pay, skip, or escalate for each lot — operational action only.
        </li>
        <li>
          The <strong>seal</strong> compared computed vs reference hashes on{" "}
          <strong>{verifiedCount}</strong> lot(s) —{" "}
          <strong>{summary.onChainAccepted}</strong> Valid, <strong>{summary.onChainRejected}</strong>{" "}
          Invalid.
        </li>
        {invalidCount > 0 ? (
          <li>
            <strong>{invalidCount} Invalid</strong> result(s) are permanent tamper/rejection proof — not
            discarded errors.
          </li>
        ) : null}
        <li>
          <strong>{onChainCount}</strong> attestation(s) recorded on Casper testnet where payment ran.
        </li>
      </ol>

      <p className="process-what-happened__north-star">
        Proof before token — symbolic Marketplace and NFT demo layers only apply after valid proof.
      </p>
    </section>
  );
}
