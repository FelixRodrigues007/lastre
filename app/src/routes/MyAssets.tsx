import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { ProofJourney } from "../components/proof/ProofJourney";
import { EmptyState } from "../components/ui/EmptyState";
import { BtnIcon } from "../components/ui/BtnIcon";
import { getLots } from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { shortHash } from "../lib/format";
import "./marketplace.css";

export function MyAssets() {
  const lotsData = useAsyncData(getLots);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(() =>
    localStorage.getItem("casper-demo-account") || null,
  );

  function connectDemo() {
    const fake = `casper-test-account-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem("casper-demo-account", fake);
    setConnectedAccount(fake);
    lotsData.reload();
  }

  const myMinted = useMemo(() => {
    const lots = lotsData.data?.lots ?? [];
    return lots.filter((l) => Boolean(l.isMinted));
  }, [lotsData.data]);

  if (!connectedAccount) {
    return (
      <div className="page">
        <PageHeader
          kicker="My Assets"
          title="My Proven Assets"
          lead="Connect a Casper account (demo) in Marketplace to track your claimed provenance NFT representations."
        />
        <ProofJourney activePath="/my-assets" compact />
        <EmptyState
          icon="shield"
          title="No demo account connected"
          hint="Claim a symbolic NFT representation in Marketplace after Valid proof, then return here to review your collection."
          action={
            <div className="my-assets-empty__actions">
              <button type="button" onClick={connectDemo} className="route-cta">
                <BtnIcon icon="chain">Connect demo Casper account</BtnIcon>
              </button>
              <Link className="route-cta route-cta--ghost" to="/marketplace">
                <BtnIcon icon="globe">Open Marketplace (demo)</BtnIcon>
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        kicker="Personal Collection"
        title="My Proven Assets"
        lead={`Symbolic representations claimed via MintGate (demo). Connected as ${connectedAccount.slice(0, 12)}…`}
      />

      <ProofJourney activePath="/my-assets" compact />

      {myMinted.length === 0 ? (
        <EmptyState
          icon="shield"
          title="No claimed representations yet"
          hint="After Valid proof, claim a symbolic NFT representation in Marketplace. Nothing here implies real ownership or value."
          action={
            <div className="my-assets-empty__actions">
              <Link className="route-cta" to="/marketplace">
                <BtnIcon icon="globe">Browse Marketplace (demo)</BtnIcon>
              </Link>
              <Link className="route-cta route-cta--ghost" to="/process">
                <BtnIcon icon="process">Run demo batch</BtnIcon>
              </Link>
            </div>
          }
        />
      ) : (
        <div className="market-grid">
          {myMinted.map((lot) => {
            const a = lot.artifact;
            const isCarbon = a.category === "carbon_credit" || !!a.creditType;
            const provScore = Math.min(
              99,
              68 +
                (lot.attested ? 18 : 0) +
                (lot.sealMatchesReference ? 8 : 0) +
                (lot.latestVerdict === "Valid" ? 5 : 0),
            );
            const seal = lot.computedSeal || "mint-seal";
            return (
              <div key={a.assetId} className="market-card panel rich-nft-card minted">
                <div className="asset-id">{a.assetId}</div>
                <div className="prov-score" title="Provenance score (demo)">
                  Provenance Score: {provScore}
                </div>

                <div className="seal-row">
                  <span>Seal:</span> <code>{shortHash(seal, 8, 6)}</code>
                </div>

                {isCarbon && (
                  <div className="carbon-details">
                    {a.tonnesCO2e && (
                      <div>
                        <strong>{a.tonnesCO2e.toLocaleString()}</strong> tCO₂e
                      </div>
                    )}
                    {a.creditType && (
                      <div>
                        Credit: <strong>{a.creditType}</strong>
                      </div>
                    )}
                    {a.vintage && <div>Vintage: {a.vintage}</div>}
                    {a.verifier && <div>Verifier: {a.verifier}</div>}
                  </div>
                )}

                {lot.mintTx && (
                  <a
                    href={`https://testnet.cspr.live/transaction/${lot.mintTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mint-tx-link"
                  >
                    View mint tx on cspr.live ↗
                  </a>
                )}

                <div className="small success">Minted ✓ via MintGate (demo)</div>
                <div className="card-actions" style={{ marginTop: 8 }}>
                  <Link to={`/lots/${a.assetId}`} className="btn small">
                    View Full Proof
                  </Link>
                  <Link to="/marketplace" className="btn small">
                    DeFi / Collateral in Marketplace
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="note">
        DEMO ONLY. Simulated provenance NFTs via MintGate (Casper Odra). No real ownership, value or transfer. All
        data fictional.
      </p>
    </div>
  );
}
