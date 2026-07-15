import { Link } from "react-router-dom";
import type { LotDetail } from "../../lib/types";
import { shortHash } from "../../lib/format";
import { CSPR_PACKAGE_URL } from "../../lib/navigation";
import { explorerUrlFromTx, resolveAttestationUrl } from "../../lib/chainTimeline";
import { MutedStatusBadge, VerdictBadge } from "../proof/Badges";
import { CopyBlock } from "../ui/CopyBlock";
import { SectionHead } from "../ui/SectionHead";
import "./casper-proof-panel.css";

type CasperProofPanelProps = {
  lot: LotDetail;
  flat?: boolean;
};

export function CasperProofPanel({ lot, flat = false }: CasperProofPanelProps) {
  const onChain = lot.testnetAttestation ?? lot.auditRecord?.onChain ?? null;
  const invalidOnChain = onChain?.verdict === "Invalid";
  const awaiting = !onChain;
  const rawExplorer =
    onChain && "explorerUrl" in onChain && onChain.explorerUrl
      ? onChain.explorerUrl
      : onChain && "txHash" in onChain && onChain.txHash
        ? explorerUrlFromTx(onChain.txHash)
        : null;
  const attestationUrl = resolveAttestationUrl(lot.artifact.assetId, rawExplorer);
  const hasSessionReceipt =
    !attestationUrl && Boolean(onChain && "txHash" in onChain && onChain.txHash);

  return (
    <section
      className={`casper-proof evidence-section${flat ? "" : " panel"}`}
      aria-label="Casper testnet proof"
    >
      <SectionHead
        label="Casper testnet"
        aside={awaiting ? "Awaiting registration" : "On-chain attestation"}
      />

      {awaiting ? (
        <div className="casper-proof__awaiting">
          <MutedStatusBadge label="Awaiting registration" />
          <p className="casper-proof__lead">
            No Casper attestation for this lot yet. Process the batch to record proof on testnet.
          </p>
          <a
            className="casper-proof__link"
            href={CSPR_PACKAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open ProofOfOrigin package
          </a>
        </div>
      ) : (
        <div className="casper-proof__body">
          <div className="casper-proof__verdict">
            <VerdictBadge verdict={onChain.verdict} />
            {invalidOnChain ? (
              <p className="casper-proof__note casper-proof__note--invalid">
                Invalid is also recorded permanently on-chain — tamper proof, not a system failure.
              </p>
            ) : (
              <p className="casper-proof__note casper-proof__note--valid">
                Valid attestation is immutable on Casper testnet.
              </p>
            )}
          </div>

          {"providedSeal" in onChain && onChain.providedSeal ? (
            <CopyBlock label="On-chain seal" value={onChain.providedSeal} />
          ) : null}

          {"txHash" in onChain && onChain.txHash ? (
            <CopyBlock label="Transaction" value={onChain.txHash} />
          ) : null}

          <div className="casper-proof__links">
            {attestationUrl ? (
              <a
                className="casper-proof__link"
                href={attestationUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View attestation on cspr.live
              </a>
            ) : hasSessionReceipt ? (
              <p className="casper-proof__session">
                Demo/session receipt — not on Casper
                {onChain && "txHash" in onChain && onChain.txHash
                  ? ` (${shortHash(onChain.txHash, 8, 6)})`
                  : ""}
              </p>
            ) : null}

            {lot.auditRecord ? (
              <Link
                className="casper-proof__link casper-proof__link--ghost"
                to={`/audit/${encodeURIComponent(lot.artifact.assetId)}`}
              >
                View audit record
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
