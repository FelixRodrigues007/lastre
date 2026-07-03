import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MarketAssetDetail } from "../components/marketplace/MarketAssetDetail";
import { MarketNoticeModal } from "../components/ui/MarketNoticeModal";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { EmptyState } from "../components/ui/EmptyState";
import { StatePanel } from "../components/layout/StatePanel";
import { getLots, lockCollateral, mintAsset, releaseCollateral } from "../lib/api";
import { findMarketplaceAsset } from "../lib/marketplaceAssets";
import type { MarketplacePersona } from "../lib/marketplaceTypes";
import { useAsyncData } from "../hooks/useAsyncData";
import "./marketplace.css";

const DEMO_ACCOUNT_STORAGE_KEY = "casper-demo-account";
const DEMO_PERSONA_STORAGE_KEY = "casper-demo-persona";

function readDemoStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeDemoStorage(key: string, value: string | null): void {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(key, value);
  else window.localStorage.removeItem(key);
}

function createDemoAccount(): string {
  return `casper-test-account-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredPersona(): MarketplacePersona {
  const stored = readDemoStorage(DEMO_PERSONA_STORAGE_KEY);
  return stored === "public" || stored === "buyer" || stored === "defi" || stored === "operator"
    ? stored
    : "buyer";
}

export function MarketplaceAssetDetail() {
  const { assetId = "" } = useParams();
  const navigate = useNavigate();
  const lotsData = useAsyncData(getLots);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(() =>
    readDemoStorage(DEMO_ACCOUNT_STORAGE_KEY),
  );
  const [persona] = useState<MarketplacePersona>(() => readStoredPersona());
  const [locked, setLocked] = useState<Record<string, boolean>>({});
  const [claimConfirm, setClaimConfirm] = useState<Record<string, unknown> | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
    tone: "info" | "success" | "error";
  } | null>(null);

  const lots = lotsData.data?.lots ?? [];
  const enriched = assetId ? findMarketplaceAsset(assetId, lots as never[]) : null;

  const connectWallet = useCallback(() => {
    const fake = createDemoAccount();
    writeDemoStorage(DEMO_ACCOUNT_STORAGE_KEY, fake);
    setConnectedAccount(fake);
    return fake;
  }, []);

  async function handleLock(id: string) {
    if (!connectedAccount) return;
    const res = await lockCollateral(id, connectedAccount);
    if (res.success) {
      setLocked((prev) => ({ ...prev, [id]: true }));
      setNotice({
        title: "Collateral locked",
        message: `Locked ${id} as collateral (DeFi demo).`,
        tone: "success",
      });
    } else {
      setNotice({
        title: "Lock failed",
        message: res.error ?? "Unable to lock collateral.",
        tone: "error",
      });
    }
  }

  async function handleRelease(id: string) {
    if (!connectedAccount) return;
    const res = await releaseCollateral(id, connectedAccount);
    if (res.success) {
      setLocked((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setNotice({
        title: "Collateral released",
        message: `Released ${id}.`,
        tone: "success",
      });
    } else {
      setNotice({
        title: "Release failed",
        message: res.error ?? "Unable to release collateral.",
        tone: "error",
      });
    }
  }

  function openClaimConfirm(asset: Record<string, unknown>) {
    if (!connectedAccount) connectWallet();
    setClaimConfirm(asset);
    setIsSigning(false);
  }

  async function confirmSimulatedClaim() {
    if (!claimConfirm || !connectedAccount) return;
    setIsSigning(true);
    await new Promise((r) => setTimeout(r, 850));
    try {
      const id = String(claimConfirm.assetId);
      const res = await mintAsset(id, connectedAccount);
      if (res.success && res.txHash) {
        setClaimConfirm(null);
        lotsData.reload();
        navigate(`/my-assets?asset=${encodeURIComponent(id)}`);
      } else {
        setNotice({
          title: "Claim failed",
          message: res.error || "No valid proof",
          tone: "error",
        });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setNotice({
        title: "Signing error",
        message: `Simulated signing error: ${message}`,
        tone: "error",
      });
    } finally {
      setIsSigning(false);
    }
  }

  useEffect(() => {
    if (!assetId) navigate("/marketplace", { replace: true });
  }, [assetId, navigate]);

  return (
    <div className="page market-asset-page">
      <Breadcrumbs
        items={[
          { label: "Marketplace", to: "/marketplace" },
          { label: enriched?.label ?? assetId },
        ]}
      />

      <StatePanel
        loading={lotsData.loading}
        error={lotsData.error}
        skeleton="detail"
        onRetry={lotsData.reload}
      >
        {!enriched ? (
          <EmptyState
            icon="lots"
            title="Asset not found"
            hint="This catalog entry may have been filtered out or removed from the demo set."
            action={
              <Link className="route-cta" to="/marketplace">
                Back to Marketplace
              </Link>
            }
          />
        ) : (
          <MarketAssetDetail
            layout="page"
            asset={enriched}
            persona={persona}
            locked={Boolean(locked[assetId])}
            onClose={() => navigate("/marketplace")}
            onClaim={() => openClaimConfirm(enriched.asset)}
            onLock={() => handleLock(assetId)}
            onRelease={() => handleRelease(assetId)}
          />
        )}
      </StatePanel>

      {claimConfirm ? (
        <div className="modal-overlay" onClick={() => setClaimConfirm(null)}>
          <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Claim NFT Representation (Demo)</h3>
            <div>
              Asset: <strong>{String(claimConfirm.assetId)}</strong>
            </div>
            <div className="sig-sim">
              Signing with: {connectedAccount?.slice(0, 16)}…
              <br />
              Action: MintGate.record_mint (simulated Casper signature)
            </div>
            <div className="actions">
              <button onClick={confirmSimulatedClaim} disabled={isSigning} className="btn primary">
                {isSigning ? "Signing with Casper account..." : "Sign & Claim (simulated)"}
              </button>
              <button onClick={() => setClaimConfirm(null)} className="btn" disabled={isSigning}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {notice ? (
        <MarketNoticeModal
          title={notice.title}
          message={notice.message}
          tone={notice.tone}
          onClose={() => setNotice(null)}
        />
      ) : null}
    </div>
  );
}
