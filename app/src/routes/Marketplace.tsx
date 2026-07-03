import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Map as MapLibreMap } from "maplibre-gl";
import { FullDemoModal, type FullDemoStep } from "../components/demo/FullDemoModal";
import { PageHeader } from "../components/layout/PageHeader";
import {
  getLots,
  getLot,
  getMintSummary,
  mintAsset,
  lockCollateral,
  processBatch,
  releaseCollateral,
  simulateAgentQuery,
  type AgentQueryResult,
  type MintSummary,
} from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { shortHash } from "../lib/format";
import { DEMO_CATALOG, demoSeal, type CatalogAsset } from "../lib/demoCatalog";
import {
  buildCaptureDemoUrl,
  clearFullDemoState,
  createFullDemoState,
  FULL_DEMO_ASSET_ID,
  readFullDemoState,
  writeFullDemoState,
} from "../lib/fullDemo";
import { resolveMapProvider, type MapProviderConfig } from "../lib/mapProvider";
import "maplibre-gl/dist/maplibre-gl.css";
import "./marketplace.css";

type MarketplaceView = "assets" | "map";
type MarketplacePersona = "public" | "buyer" | "defi" | "operator";

type MapPoint = {
  assetId: string;
  label: string;
  lat: number;
  lng: number;
  category: "mineral" | "carbon_credit";
  status: "minted" | "proven" | "pending";
  detail: string;
};

const MAP_API_DECISION = {
  provider: "MapLibre GL JS + Mapbox or MapTiler Cloud",
  reason:
    "MapLibre keeps the renderer open-source and vendor-neutral; production vector tiles come from Mapbox (VITE_MAPBOX_TOKEN) or MapTiler (VITE_MAPTILER_KEY) once a key is set.",
};

const MARKETPLACE_DEMO_STEPS: FullDemoStep[] = [
  {
    label: "Filter carbon credit + available",
    detail: "Focus the Marketplace on the freshly processed fictional VCS carbon proof.",
  },
  {
    label: "Paid agent proof query",
    detail: "Simulate an external agent paying via x402 before it acts on the asset.",
  },
  {
    label: "MintGate claim",
    detail: "Emit the demo LotMinted event only after the Valid proof exists.",
  },
  {
    label: "Show payload for judges",
    detail: "Leave the x402 modal open with carbon score, seal match, and Casper links.",
  },
];

const AGENT_SNIPPET = `// Agent verifies provenance before acting (x402)
const quote = await fetch(
  "https://app-api.lastre.io/api/x402/provenance/" + assetId
); // -> HTTP 402 { accepts: [{ nonce, maxAmountRequired, asset: "CSPR" }] }

const proof = await fetch(url, {
  headers: { "X-PAYMENT": signCasperPayment(quote) },
}).then(r => r.json());
// proof.provenance -> { seal, verdict, carbonDetails, csprLinks, ... }
if (proof.provenance.verdict === "Valid") approveAction();`;

const DEMO_ACCOUNT_STORAGE_KEY = "casper-demo-account";
const DEMO_PERSONA_STORAGE_KEY = "casper-demo-persona";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function readDemoStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeDemoStorage(key: string, value: string | null): void {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(key, value);
  } else {
    window.localStorage.removeItem(key);
  }
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

export function Marketplace() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lotsData = useAsyncData(getLots);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | "mineral" | "carbon_credit">("all");
  const [creditFilter, setCreditFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "proven" | "minted" | "available">("all");
  const [view, setView] = useState<MarketplaceView>("assets");

  // Simple wallet / identity simulation for demo
  const [connectedAccount, setConnectedAccount] = useState<string | null>(() =>
    readDemoStorage(DEMO_ACCOUNT_STORAGE_KEY),
  );
  const [persona, setPersona] = useState<MarketplacePersona>(() => readStoredPersona());
  const [locked, setLocked] = useState<Record<string, boolean>>({});

  // Buy confirmation modal + signing sim (demo only, respects guardrails)
  const [buyConfirm, setBuyConfirm] = useState<any>(null);
  const [isSigning, setIsSigning] = useState(false);

  // x402 agent-query demo state
  const [agentQuery, setAgentQuery] = useState<{ assetId: string; loading: boolean; result: AgentQueryResult | null } | null>(null);
  const [mintSummary, setMintSummary] = useState<MintSummary | null>(null);
  const [mintSummaryError, setMintSummaryError] = useState<string | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const [fullDemoOpen, setFullDemoOpen] = useState(false);
  const [fullDemoStep, setFullDemoStep] = useState(0);
  const [fullDemoStatus, setFullDemoStatus] = useState("");
  const [fullDemoMint, setFullDemoMint] = useState<{ assetId: string; txHash?: string; alreadyMinted?: boolean } | null>(null);
  const fullDemoStartedRef = useRef(false);

  useEffect(() => {
    void reloadMintSummary();
  }, []);

  useEffect(() => {
    const isFullDemo = searchParams.get("demo") === "full" || readFullDemoState()?.stage === "marketplace";
    if (!isFullDemo || fullDemoStartedRef.current) return;
    fullDemoStartedRef.current = true;
    void runMarketplaceFullDemo(searchParams.get("assetId") || readFullDemoState()?.assetId || FULL_DEMO_ASSET_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function reloadMintSummary() {
    try {
      setMintSummaryError(null);
      setMintSummary(await getMintSummary());
    } catch (error) {
      setMintSummaryError(error instanceof Error ? error.message : "Mint summary unavailable");
    }
  }

  function connectWallet() {
    const fake = createDemoAccount();
    writeDemoStorage(DEMO_ACCOUNT_STORAGE_KEY, fake);
    setConnectedAccount(fake);
    return fake;
  }

  function disconnectWallet() {
    writeDemoStorage(DEMO_ACCOUNT_STORAGE_KEY, null);
    setConnectedAccount(null);
    setLocked({});
  }

  function updatePersona(nextPersona: MarketplacePersona) {
    writeDemoStorage(DEMO_PERSONA_STORAGE_KEY, nextPersona);
    setPersona(nextPersona);
  }

  async function handleLock(assetId: string) {
    if (!connectedAccount) return;
    const res = await lockCollateral(assetId, connectedAccount);
    if (res.success) {
      setLocked(prev => ({ ...prev, [assetId]: true }));
      // Demo collateral value calc (fictional, no investment semantics)
      const asset = merged.find((x: any) => x.assetId === assetId);
      const tonnes = asset?.tonnesCO2e || 1000;
      const demoLoanCspr = Math.floor(tonnes / 40); // simplistic: ~25 CSPR per 1000t demo rate
      alert(`Locked ${assetId} as collateral (DeFi demo).\nSimulated max loan value: ~${demoLoanCspr} CSPR (demo only).`);
    } else {
      alert("Lock failed: " + res.error);
    }
  }

  async function handleRelease(assetId: string) {
    if (!connectedAccount) return;
    const res = await releaseCollateral(assetId, connectedAccount);
    if (res.success) {
      setLocked(prev => { const c = {...prev}; delete c[assetId]; return c; });
      alert(`Released ${assetId}`);
    } else {
      alert("Release failed: " + res.error);
    }
  }

  // "Buy" confirmation flow: simulates Casper signing then mints (demo guardrail: no real value language)
  function openBuyConfirm(asset: any) {
    if (!connectedAccount) {
      connectWallet();
    }
    setBuyConfirm(asset);
    setIsSigning(false);
  }

  async function confirmSimulatedBuy() {
    if (!buyConfirm || !connectedAccount) return;
    setIsSigning(true);
    // Simulate Casper signature delay + UX
    await new Promise((r) => setTimeout(r, 850));
    try {
      const res = await mintAsset(buyConfirm.assetId, connectedAccount);
      if (res.success) {
        alert(`✅ Simulated Casper signature complete.\nAsset: ${buyConfirm.assetId}\nMint tx: ${res.txHash}\n\nRecorded via MintGate (demo). View on cspr.live.`);
        setBuyConfirm(null);
        lotsData.reload();
        void reloadMintSummary();
      } else {
        alert("Claim failed: " + (res.error || "No valid proof"));
      }
    } catch (e: any) {
      alert("Simulated signing error: " + e.message);
    } finally {
      setIsSigning(false);
    }
  }

  function closeBuyConfirm() {
    setBuyConfirm(null);
    setIsSigning(false);
  }

  // x402: simulate an external agent paying to read a proof before it acts.
  async function runAgentQuery(assetId: string, from = "agent-casper-demo"): Promise<AgentQueryResult | null> {
    setAgentQuery({ assetId, loading: true, result: null });
    setPayloadCopied(false);
    try {
      const result = await simulateAgentQuery(assetId, from);
      setAgentQuery({ assetId, loading: false, result });
      return result;
    } catch (e: any) {
      const result = { ok: false, reason: e?.message || "query_failed" };
      setAgentQuery({ assetId, loading: false, result });
      return result;
    }
  }

  function closeAgentQuery() {
    setAgentQuery(null);
  }

  function startFullDemo() {
    setFullDemoMint(null);
    writeFullDemoState(createFullDemoState("capture"));
    navigate(buildCaptureDemoUrl());
  }

  async function runMarketplaceFullDemo(assetId: string) {
    setFullDemoOpen(true);
    setFullDemoMint(null);
    setFullDemoStep(0);
    setFullDemoStatus("Filtering Marketplace for carbon credits ready to claim…");
    writeFullDemoState(createFullDemoState("marketplace", new Date(), assetId));
    setView("assets");
    setCatFilter("carbon_credit");
    setCreditFilter("all");
    setStatusFilter("available");
    await delay(850);

    try {
      // Idempotent safeguard: if the user opens the Marketplace demo URL directly,
      // make sure the proof has a Valid audit record before x402/mint. If Capture
      // already did it, do NOT process again because duplicate attestations become
      // "skip" records and would hide the last Valid verdict.
      const currentLot = await getLot(assetId);
      if (currentLot.latestVerdict !== "Valid") {
        const batch = await processBatch([assetId], "llm");
        const record = batch.records?.find((r: any) => r.assetId === assetId) ?? batch.records?.[0] ?? null;
        const verdict = record?.verification?.verdict ?? record?.onChain?.verdict ?? "Unverified";
        if (verdict !== "Valid") {
          await processBatch([assetId], "rule");
        }
      }
      lotsData.reload();
    } catch {
      // The Capture leg usually processed this already; keep the demo moving.
    }

    setFullDemoStep(1);
    setFullDemoStatus("Simulating Agent Casper-style proof query via x402…");
    writeFullDemoState(createFullDemoState("x402", new Date(), assetId));
    const query = await runAgentQuery(assetId, "agent-casper-demo");
    await delay(950);

    setFullDemoStep(2);
    setFullDemoStatus("Claiming the provenance NFT representation through MintGate demo…");
    writeFullDemoState(createFullDemoState("mint", new Date(), assetId));
    const minter = connectedAccount ?? connectWallet();
    try {
      const mint = await mintAsset(assetId, minter);
      setFullDemoMint({ assetId, txHash: mint.txHash });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      setFullDemoMint({ assetId, alreadyMinted: message.includes("Already minted") });
    }

    await reloadMintSummary();
    lotsData.reload();
    setFullDemoStep(3);
    setFullDemoStatus(
      query?.ok
        ? "Complete: x402 payload is open for judges, with carbon score and seal match."
        : "Demo reached x402, but the paid query returned an error. Check API runtime state.",
    );
    writeFullDemoState(createFullDemoState("complete", new Date(), assetId));
  }

  async function copyAgentSnippet() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(AGENT_SNIPPET);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 1600);
  }

  async function copyAgentPayload() {
    if (!agentQuery?.result) return;
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(JSON.stringify(agentQuery.result, null, 2));
    setPayloadCopied(true);
    setTimeout(() => setPayloadCopied(false), 1600);
  }

  // Static catalog seed — shared source of truth with the lot-detail fallback
  // (app/src/lib/demoCatalog.ts) so catalog assets never dead-end on 404.
  const [catalog] = useState<CatalogAsset[]>(DEMO_CATALOG);

  // Advanced carbon types for filters (full demo set, matches backend CarbonCreditType)
  const CARBON_TYPES = ["VCS", "GoldStandard", "ARR", "IREC", "REDD+", "CER", "VCU", "RenewableEnergy", "Solar", "Wind", "Biomass", "PCH"];

  const lots = lotsData.data?.lots ?? [];

  // lotMap for rich provenance + mint data
  const lotMap = useMemo(() => {
    const m = new Map<string, any>();
    lots.forEach((l: any) => m.set(l.artifact.assetId, l));
    return m;
  }, [lots]);

  const merged = useMemo(() => {
    const map = new Map<string, any>();
    [...catalog, ...lots.map((l: any) => l.artifact)].forEach((a: any) => {
      if (!map.has(a.assetId)) map.set(a.assetId, a);
    });
    return Array.from(map.values());
  }, [catalog, lots]);

  const visible = useMemo(() => {
    return merged.filter((a: any) => {
      const matchesSearch = !search || `${a.assetId} ${a.operator || ""} ${a.name || ""}`.toLowerCase().includes(search.toLowerCase());
      const cat = a.category || (a.creditType ? "carbon_credit" : "mineral");
      const matchesCat = catFilter === "all" || cat === catFilter;
      const matchesCredit = creditFilter === "all" || a.creditType === creditFilter;

      const lot = lotMap.get(a.assetId);
      const isValidProof = lot?.latestVerdict === "Valid" || (a.expectedOnChain === "Valid" && !lot);
      const isMinted = !!lot?.isMinted || !!a.isMinted;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "proven" && isValidProof) ||
        (statusFilter === "minted" && isMinted) ||
        (statusFilter === "available" && isValidProof && !isMinted);

      // provenance score (demo, deterministic-ish on attestation + seal)
      const score = lot
        ? Math.min(99, 68 + (lot.attested ? 18 : 0) + (lot.sealMatchesReference ? 8 : 0) + (lot.latestVerdict === "Valid" ? 5 : 0))
        : (a.expectedOnChain === "Valid" ? 91 : 62);

      const matchesScore = score >= 60; // simple baseline; could be user filter

      return matchesSearch && matchesCat && matchesCredit && matchesStatus && matchesScore;
    });
  }, [merged, search, catFilter, creditFilter, statusFilter, lotMap]);

  const mapPoints = useMemo(() => {
    return visible
      .map((asset: any): MapPoint | null => {
        if (!asset.origin || typeof asset.origin.lat !== "number" || typeof asset.origin.lng !== "number") {
          return null;
        }

        const category = asset.category || (asset.creditType ? "carbon_credit" : "mineral");
        const lot = lotMap.get(asset.assetId);
        const isMinted = Boolean(lot?.isMinted || asset.isMinted);
        const isValidProof = Boolean(lot?.latestVerdict === "Valid" || (asset.expectedOnChain === "Valid" && !lot));
        const status = isMinted ? "minted" : isValidProof ? "proven" : "pending";
        const label = asset.name || asset.origin.site || asset.origin.label || asset.assetId;
        const detail = category === "carbon_credit"
          ? `${asset.creditType || "Carbon"} · ${asset.tonnesCO2e ? `${asset.tonnesCO2e.toLocaleString()} tCO₂e` : "demo credit"}`
          : `${asset.mineral || asset.mineralType || "Mineral"} · ${asset.massGrams ? `${asset.massGrams.toLocaleString()} g` : "demo lot"}`;

        return {
          assetId: asset.assetId,
          label,
          lat: asset.origin.lat,
          lng: asset.origin.lng,
          category,
          status,
          detail,
        };
      })
      .filter((point): point is MapPoint => point !== null);
  }, [visible, lotMap]);

  return (
    <div className="page">
      <PageHeader
        kicker="Marketplace"
        title="Provenance Marketplace"
        lead="Browse verified and pending assets. Advanced filters for carbon types. Claim provenance NFT representation (demo) only after successful proof + Valid seal."
        actions={<Link className="route-cta" to="/capture">Capture New</Link>}
      />

      <FullDemoModal
        open={fullDemoOpen}
        assetId={searchParams.get("assetId") || FULL_DEMO_ASSET_ID}
        steps={MARKETPLACE_DEMO_STEPS}
        activeStep={fullDemoStep}
        status={fullDemoStatus}
        onClose={() => {
          setFullDemoOpen(false);
          clearFullDemoState();
        }}
      />

      <section className="panel demo-killer-banner" aria-label="Full end-to-end demo">
        <div>
          <span className="eyebrow">Judge-ready flow</span>
          <h3>Run Full End-to-End Demo</h3>
          <p>
            One click runs Capture → agent decision → paid x402 proof query → MintGate demo claim,
            then leaves the agent payload visible with the carbon impact score.
          </p>
        </div>
        <button type="button" className="btn primary demo-killer-button" onClick={startFullDemo}>
          Run Full End-to-End Demo
        </button>
      </section>

      <div className="market-filters panel">
        <div className="wallet-section">
          <select value={persona} onChange={e => updatePersona(e.target.value as MarketplacePersona)} title="Persona / role simulation">
            <option value="public">Public Verifier</option>
            <option value="buyer">NFT Buyer</option>
            <option value="defi">DeFi User</option>
            <option value="operator">Internal Operator</option>
          </select>

          {connectedAccount ? (
            <>
              <span className="wallet-label">Connected: </span>
              <code>{connectedAccount.slice(0, 12)}...</code>
              <button onClick={disconnectWallet} className="btn small">Disconnect</button>
            </>
          ) : (
            <button onClick={connectWallet} className="btn primary">Connect Casper Account (demo)</button>
          )}
        </div>

        <input
          placeholder="Search asset or operator…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)}>
          <option value="all">All categories</option>
          <option value="mineral">Minerals</option>
          <option value="carbon_credit">Carbon Credits</option>
        </select>
        <select value={creditFilter} onChange={e => setCreditFilter(e.target.value)}>
          <option value="all">All credit types</option>
          {CARBON_TYPES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} title="Advanced status filter">
          <option value="all">All status</option>
          <option value="proven">Proven (attested)</option>
          <option value="minted">Minted NFT</option>
          <option value="available">Available to claim</option>
        </select>
      </div>

      <div className="panel market-summary-panel">
        <div className="market-summary-strip">
          <span><strong>{visible.length}</strong> matching</span>
          <span><strong>{lots.filter((l: any) => l.isMinted).length}</strong> minted in visible runtime</span>
          <span><strong>{mintSummary?.mintCount ?? "—"}</strong> Total minted</span>
          <span><strong>{lots.filter((l: any) => l.attested || l.latestVerdict).length}</strong> attested on-chain (sim + live)</span>
          <span className="agent-x402-note">🔌 Queryable by agents via <strong>x402</strong></span>
          <span className="small muted">Live state from app runtime + testnet attestations. <a href="https://testnet.cspr.live" target="_blank" rel="noopener">cspr.live ↗</a></span>
        </div>

        <div className="mint-events">
          <div className="mint-events__head">
            <strong>Latest LotMinted events</strong>
            <button type="button" className="btn small ghost" onClick={() => void reloadMintSummary()}>
              Refresh
            </button>
          </div>
          {mintSummaryError ? (
            <p className="small muted">Mint summary unavailable: {mintSummaryError}</p>
          ) : mintSummary?.events?.length ? (
            <div className="mint-events__list">
              {mintSummary.events.slice(0, 3).map((event) => (
                <a
                  key={`${event.assetId}-${event.mintTx}-${event.at}`}
                  href={`https://testnet.cspr.live/transaction/${event.mintTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>{event.assetId}</span>
                  <code>{shortHash(event.mintTx, 8, 6)}</code>
                </a>
              ))}
            </div>
          ) : (
            <p className="small muted">No LotMinted event yet. Run the demo or claim a Valid asset.</p>
          )}
        </div>
      </div>

      <div className="market-tabs" role="tablist" aria-label="Marketplace views">
        <button
          className={view === "assets" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={view === "assets"}
          aria-controls="market-assets-panel"
          onClick={() => setView("assets")}
        >
          Assets
        </button>
        <button
          className={view === "map" ? "active" : ""}
          type="button"
          role="tab"
          aria-selected={view === "map"}
          aria-controls="market-map-panel"
          onClick={() => setView("map")}
        >
          Global Mundi Map
        </button>
      </div>

      {connectedAccount && (persona === "defi" || persona === "operator") && (
        <div className="panel" style={{ margin: "12px 0", padding: "10px 14px", fontSize: "0.9em" }}>
          <strong>DeFi demo positions</strong> (this session): {Object.keys(locked).length} asset(s) locked as collateral.
          <span className="small muted"> • Use Lock/Release on Valid minted cards. Simulated values only.</span>
        </div>
      )}

      {view === "assets" ? (
      <div id="market-assets-panel" className="market-grid" role="tabpanel" aria-label="Marketplace assets">
        {visible.length === 0 && <p>No matching assets.</p>}
        {visible.map((a: any) => {
          const isCarbon = a.category === "carbon_credit" || !!a.creditType;
          const quantity = isCarbon ? a.tonnesCO2e : a.massGrams;
          const unit = isCarbon ? "tCO₂e" : "g";
          const lot = lotMap.get(a.assetId);
          // Strict: only claim if we have a processed Valid verdict (or pure catalog expected for demo seeds)
          const isValidProof = lot?.latestVerdict === "Valid" || (a.expectedOnChain === "Valid" && !lot);
          const isMinted = !!lot?.isMinted || !!a.isMinted;
          const mintTx = lot?.mintTx || a.mintTx;
          // Rich provenance score (demo)
          const provScore = lot
            ? Math.min(99, 68 + (lot.attested ? 18 : 0) + (lot.sealMatchesReference ? 8 : 0) + (lot.latestVerdict === "Valid" ? 5 : 0))
            : (a.expectedOnChain === "Valid" ? 91 : 62);

          const computedSeal = lot?.computedSeal || demoSeal(a.assetId);
          const isAgentQuerying = Boolean(agentQuery && agentQuery.assetId === a.assetId && agentQuery.loading);

          return (
            <div key={a.assetId} className={`market-card panel rich-nft-card ${isCarbon ? "carbon" : "mineral"}`}>
              <div className="card-head">
                <div>
                  <div className="asset-id">{a.assetId}</div>
                  <div className="asset-name">{a.name || a.operator || "Provenance asset"}</div>
                </div>
                <span className={`cat-badge ${isCarbon ? "carbon" : "mineral"}`}>
                  {isCarbon ? (a.creditType || "CARBON") : "MINERAL"}
                </span>
              </div>

              <div className="prov-score" title="Provenance score (demo): combines attestation, seal match, verdict">Provenance Score: {provScore}</div>

              {/* Rich provenance seal display */}
              <div className="seal-row">
                <span>Seal:</span>
                <code>{shortHash(computedSeal, 8, 6)}</code>
              </div>

              {/* Carbon details if applicable */}
              {isCarbon && (
                <div className="carbon-details">
                  {quantity && <div><strong>{quantity.toLocaleString()}</strong> {unit}</div>}
                  {a.creditType && <div>Credit: <strong>{a.creditType}</strong></div>}
                  {a.vintage && <div>Vintage: {a.vintage}</div>}
                  {a.methodology && <div>{a.methodology}</div>}
                  {a.verifier && <div>Verifier: {a.verifier}</div>}
                </div>
              )}
              {!isCarbon && quantity && (
                <div className="meta"><strong>{quantity.toLocaleString()}</strong> {unit}</div>
              )}

              {/* Mint tx link (simulated cspr.live) */}
              {isMinted && mintTx && (
                <a
                  href={`https://testnet.cspr.live/transaction/${mintTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mint-tx-link"
                >
                  View mint tx on cspr.live ↗
                </a>
              )}

              <div className="card-actions">
                <Link to={`/lots/${encodeURIComponent(a.assetId)}`} className="btn small">Inspect Proof</Link>
                {isValidProof && !isMinted ? (
                  <button onClick={() => openBuyConfirm(a)} className="btn primary small">Claim NFT (Demo)</button>
                ) : isMinted ? (
                  <>
                    <span className="small success">Minted ✓</span>
                    {(persona === "defi" || persona === "buyer") && !locked[a.assetId] && (
                      <button onClick={() => handleLock(a.assetId)} className="btn small">Lock as Collateral</button>
                    )}
                    {locked[a.assetId] && (
                      <button onClick={() => handleRelease(a.assetId)} className="btn small danger">Release Collateral</button>
                    )}
                  </>
                ) : (
                  <span className="small muted">Proof required before claim</span>
                )}
              </div>

              <div className="card-actions card-actions--agent">
                <span className="x402-badge" title="External agents can pay via x402 to read this proof before acting">
                  x402 queryable
                </span>
                <button
                  onClick={() => void runAgentQuery(a.assetId)}
                  className="btn small ghost"
                  disabled={isAgentQuerying}
                  title="Simulate an external agent paying via x402 to verify this proof"
                >
                  {isAgentQuerying ? "Agent paying…" : "Simulate Agent Query (x402)"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      ) : (
        <div id="market-map-panel" role="tabpanel" aria-label="Global Mundi provenance map">
          <GlobalMundiMap points={mapPoints} />
        </div>
      )}

      <p className="note">Only Valid + attested lots should be tokenizable. This demo uses the same catalog + live app state. All actions are simulations.</p>

      {/* For Agents / Agent Integration Hub — Lastro as the trust foundation layer. */}
      <section className="panel for-agents" aria-label="For Agents">
        <div className="for-agents__head">
          <div>
            <span className="eyebrow">For Agents</span>
            <h3>Lastro is the provenance layer autonomous agents query before acting</h3>
            <p className="small muted">
              <strong>Other agents pay via x402 to query Lastre before touching any RWA/carbon record.</strong>{" "}
              Portfolio, DeFi, and RWA issuance agents read a lot's seal, verdict and carbon details
              <strong> before</strong> they act on a physical/carbon asset.
              Proof before token — for humans and for machines.
            </p>
          </div>
          <div className="for-agents__stat">
            <strong>x402</strong>
            <span>pay-per-proof</span>
          </div>
        </div>
        <div className="for-agents__toolbar">
          <span className="small muted">Drop-in Node/TS snippet for external agents:</span>
          <button type="button" className="btn small ghost" onClick={() => void copyAgentSnippet()}>
            {snippetCopied ? "Copied ✓" : "Copy snippet"}
          </button>
        </div>
        <pre className="for-agents__code" aria-label="Example agent query">
{AGENT_SNIPPET}
        </pre>
        <p className="small muted">
          Try it live: click <strong>Simulate Agent Query (x402)</strong> on any card above.
          DEMO facilitator (mock settlement) — the seam maps to a real Casper facilitator.
        </p>
      </section>

      {persona === "operator" && (
        <section className="panel" style={{marginTop: 16}}>
          <h4>Internal Operator Controls (demo)</h4>
          <p className="small">Connected as operator. You see privileged actions above (e.g. on minted). Use Process route for LLM batch, Escalations for reviews. Casper package: <a href="https://testnet.cspr.live/contract-package/hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561" target="_blank">view on cspr.live ↗</a></p>
          <div className="small muted">Tip: Run Capture → auto-attest → Claim as buyer, then switch to operator to review/lock.</div>
        </section>
      )}

      {connectedAccount && (
        <section className="my-assets">
          <h3>My Proven Assets (demo)</h3>
          <p className="small">Assets you have claimed via MintGate (demo) in this session.</p>
          <div className="market-grid">
            {visible.filter((a: any) => (lotMap.get(a.assetId)?.isMinted || a.isMinted)).length > 0 ? (
              visible.filter((a: any) => (lotMap.get(a.assetId)?.isMinted || a.isMinted)).map((a: any) => {
                const lot = lotMap.get(a.assetId);
                const isCarbon = a.category === "carbon_credit" || !!a.creditType;
                const provScore = lot ? Math.min(99, 68 + (lot.attested ? 18 : 0) + (lot.sealMatchesReference ? 8 : 0) + (lot.latestVerdict === "Valid" ? 5 : 0)) : 91;
                const mintTx = lot?.mintTx;
                return (
                  <div key={a.assetId} className="market-card panel rich-nft-card minted">
                    <div className="asset-id">{a.assetId}</div>
                    <div className="prov-score">Provenance Score: {provScore}</div>
                    <div className="seal-row">Seal: <code>{shortHash(lot?.computedSeal || "minted-seal", 8, 6)}</code></div>
                    {isCarbon && a.tonnesCO2e && <div className="carbon-details"><strong>{a.tonnesCO2e}</strong> tCO₂e • {a.creditType}</div>}
                    {mintTx && <a href={`https://testnet.cspr.live/transaction/${mintTx}`} target="_blank" rel="noopener" className="mint-tx-link">View mint on cspr.live ↗</a>}
                    <div className="small success">Claimed by {connectedAccount.slice(0,8)}...</div>
                    <Link to={`/lots/${a.assetId}`} className="btn small">View Proof</Link>
                  </div>
                );
              })
            ) : (
              <p className="small muted">Claim a valid proven asset via Marketplace to see it here.</p>
            )}
          </div>
        </section>
      )}

      {/* Buy confirmation modal — simulates Casper signing. Demo guardrail language. */}
      {buyConfirm && (
        <div className="modal-overlay" onClick={closeBuyConfirm}>
          <div className="buy-modal" onClick={e => e.stopPropagation()}>
            <h3>Buy Confirmation (Demo) — Simulate Casper Signing</h3>
            <div>Asset: <strong>{buyConfirm.assetId}</strong></div>
            <div className="demo-disclaimer">
              DEMO ONLY. This simulates acquiring a provenance NFT representation. No real asset, value, or on-chain transfer occurs.
            </div>
            <div className="sig-sim">
              Signing with: {connectedAccount?.slice(0, 16)}...<br />
              Action: MintGate.record_mint (simulated Casper signature)
            </div>
            <p className="small">Provenance seal + attestation will be bound on success (demo).</p>
            <div className="actions">
              <button
                onClick={confirmSimulatedBuy}
                disabled={isSigning}
                className="btn primary"
              >
                {isSigning ? "Signing with Casper account..." : "Sign & Claim (simulated)"}
              </button>
              <button onClick={closeBuyConfirm} className="btn" disabled={isSigning}>Cancel</button>
            </div>
            <div className="small muted" style={{marginTop: 12}}>cspr.live link shown after simulated mint.</div>
          </div>
        </div>
      )}

      {/* x402 Agent Query result modal (DEMO) */}
      {agentQuery && (
        <div className="modal-overlay" onClick={closeAgentQuery}>
          <div className="buy-modal agent-query-modal" onClick={e => e.stopPropagation()}>
            <h3>Agent Query via x402 (Demo)</h3>
            <div>Asset: <strong>{agentQuery.assetId}</strong></div>
            {agentQuery.loading ? (
              <p className="small">Agent requesting quote → signing x402 payment → settling…</p>
            ) : agentQuery.result?.ok && agentQuery.result.provenance ? (
              <>
                <div className="sig-sim">
                  External agent paid <strong>{agentQuery.result.amountCspr}</strong> CSPR via x402 (mock settlement) to read this proof.<br />
                  Facilitator: {agentQuery.result.facilitatorMode}<br />
                  Settlement tx: <code>{shortHash(agentQuery.result.txHash || "", 10, 8)}</code>
                </div>
                <div className="agent-proof">
                  <div>Verdict: <strong className={agentQuery.result.provenance.verdict === "Valid" ? "success" : ""}>{agentQuery.result.provenance.verdict}</strong></div>
                  <div>Seal match: <strong>{String(agentQuery.result.provenance.sealMatch)}</strong></div>
                  <div>Mint status: <strong>{agentQuery.result.provenance.mintStatus}</strong></div>
                  {agentQuery.result.provenance.carbonDetails && (
                    <div>Carbon impact score: <strong>{agentQuery.result.provenance.carbonDetails.carbonImpactScore}</strong></div>
                  )}
                  <div className="seal-row"><span>Seal:</span> <code>{shortHash(agentQuery.result.provenance.seal, 10, 8)}</code></div>
                  {agentQuery.result.provenance.csprLinks?.attestation && (
                    <a href={agentQuery.result.provenance.csprLinks.attestation} target="_blank" rel="noopener noreferrer">
                      View attestation on cspr.live ↗
                    </a>
                  )}
                  {agentQuery.result.provenance.csprLinks?.mint && (
                    <a href={agentQuery.result.provenance.csprLinks.mint} target="_blank" rel="noopener noreferrer">
                      View mint on cspr.live ↗
                    </a>
                  )}
                </div>
                {fullDemoMint?.assetId === agentQuery.assetId && (
                  <div className="demo-mint-note">
                    {fullDemoMint.txHash ? (
                      <>
                        MintGate demo event emitted:{" "}
                        <a href={`https://testnet.cspr.live/transaction/${fullDemoMint.txHash}`} target="_blank" rel="noopener noreferrer">
                          {shortHash(fullDemoMint.txHash, 10, 8)} ↗
                        </a>
                      </>
                    ) : fullDemoMint.alreadyMinted ? (
                      "MintGate demo event already existed for this runtime."
                    ) : (
                      "MintGate demo claim was attempted after the paid proof query."
                    )}
                  </div>
                )}
                <p className="small muted">
                  This is what an external Agent Casper-style agent would read before deciding whether it can act.
                  Total paid queries this session: {agentQuery.result.totalPaidQueries}.
                </p>
                <div className="payload-toolbar">
                  <strong>Complete proof payload</strong>
                  <button type="button" className="btn small ghost" onClick={() => void copyAgentPayload()}>
                    {payloadCopied ? "Copied ✓" : "Copy JSON"}
                  </button>
                </div>
                <pre className="agent-payload-json">{JSON.stringify(agentQuery.result, null, 2)}</pre>
              </>
            ) : (
              <p className="small">Query failed: {agentQuery.result?.reason ?? "unknown"}</p>
            )}
            <div className="actions">
              <button onClick={closeAgentQuery} className="btn">Close</button>
            </div>
            <div className="demo-disclaimer">DEMO ONLY. Mock x402 facilitator; no real CSPR moves. Structure mirrors a real Casper x402 settlement.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function GlobalMundiMap({ points }: { points: MapPoint[] }) {
  const anchor = { label: "Casper Testnet anchor", lat: 37.7749, lng: -122.4194 };
  const mintedCount = points.filter((point) => point.status === "minted").length;
  const provenCount = points.filter((point) => point.status === "proven").length;
  const pendingCount = points.filter((point) => point.status === "pending").length;
  const mapConfig = resolveMapProvider();

  return (
    <section className="mundi-map panel" aria-label="Global Mundi provenance map">
      <div className="mundi-copy">
        <div>
          <span className="eyebrow">Step 8 · Global Mundi</span>
          <h2>Geographic proof surface</h2>
          <p>
            A demo-only origin map for minerals and carbon credits. It does not claim GPS custody tracking; it shows
            where each fictional provenance record starts before the seal, agent decision, and Casper attestation.
          </p>
        </div>
        <div className="mundi-stats" aria-label="Map summary">
          <span><strong>{points.length}</strong> mapped assets</span>
          <span><strong>{provenCount}</strong> proven</span>
          <span><strong>{mintedCount}</strong> minted</span>
          <span><strong>{pendingCount}</strong> pending</span>
        </div>
      </div>

      <div className="mundi-production-path" aria-label="Production map integration path">
        <div>
          <strong>Renderer</strong>
          <span>{mapConfig.rendererLabel}</span>
        </div>
        <div>
          <strong>Tiles / styles</strong>
          <span>{mapConfig.tilesLabel}</span>
        </div>
        <div>
          <strong>API key</strong>
          <span>{mapConfig.statusLabel}</span>
        </div>
      </div>

      <MundiMapCanvas points={points} anchor={anchor} mapConfig={mapConfig} />

      <div className="mundi-ledger">
        <div className="mundi-legend" aria-label="Map legend">
          <span><i className="mundi-legend-dot mineral" /> Mineral origin</span>
          <span><i className="mundi-legend-dot carbon_credit" /> Carbon credit origin</span>
          <span><i className="mundi-legend-line proven" /> Proven route</span>
          <span><i className="mundi-legend-line minted" /> Minted route</span>
        </div>
        <div className="mundi-api-note">
          <strong>Map API choice:</strong> {MAP_API_DECISION.provider}. {MAP_API_DECISION.reason}
        </div>
        {points.length > 0 ? (
          points.map((point) => (
            <Link key={point.assetId} to={`/lots/${encodeURIComponent(point.assetId)}`} className="mundi-row">
              <span className={`mundi-status ${point.status}`} />
              <span>
                <strong>{point.label}</strong>
                <small>{point.assetId} · {point.detail}</small>
              </span>
              <em>{point.status}</em>
            </Link>
          ))
        ) : (
          <div className="mundi-row mundi-row--empty">
            <span className="mundi-status" />
            <span>
              <strong>No origin points in this view</strong>
              <small>Clear filters or process/capture assets with latitude and longitude.</small>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

function MundiMapCanvas({
  points,
  anchor,
  mapConfig,
}: {
  points: MapPoint[];
  anchor: { label: string; lat: number; lng: number };
  mapConfig: MapProviderConfig;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { ready: mapReady, styleUrl, transformRequest, loadingLabel } = mapConfig;
  const [mapStatus, setMapStatus] = useState<"fallback" | "loading" | "ready" | "error">(
    mapReady ? "loading" : "fallback",
  );

  useEffect(() => {
    if (!mapReady || !styleUrl || !containerRef.current) {
      setMapStatus("fallback");
      return;
    }

    let cancelled = false;
    let cleanup = () => {};
    setMapStatus("loading");

    import("maplibre-gl")
      .then((maplibre) => {
        if (cancelled || !containerRef.current) return;

        const map = new maplibre.Map({
          container: containerRef.current,
          style: styleUrl,
          ...(transformRequest ? { transformRequest } : {}),
          center: [0, 8],
          zoom: 1.08,
          attributionControl: { compact: true },
          cooperativeGestures: true,
        });

        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

        const markers = [
          ...points.map((point) => {
            const markerEl = document.createElement("div");
            markerEl.className = `mundi-maplibre-marker ${point.category} ${point.status}`;
            markerEl.setAttribute("aria-label", `${point.label}: ${point.status}`);

            const popup = new maplibre.Popup({ offset: 18 }).setHTML(
              `<strong>${escapeHtml(point.label)}</strong><br/><small>${escapeHtml(point.assetId)} · ${escapeHtml(point.detail)} · ${escapeHtml(point.status)}</small>`,
            );

            return new maplibre.Marker({ element: markerEl, anchor: "center" })
              .setLngLat([point.lng, point.lat])
              .setPopup(popup)
              .addTo(map);
          }),
          new maplibre.Marker({ color: "#f97316" })
            .setLngLat([anchor.lng, anchor.lat])
            .setPopup(new maplibre.Popup({ offset: 18 }).setText(anchor.label))
            .addTo(map),
        ];

        map.once("load", () => {
          if (cancelled) return;
          addMundiRouteLayer(map, points, anchor);
          setMapStatus("ready");
          fitMundiBounds(map, points, anchor);
        });

        map.once("error", () => {
          if (!cancelled && !map.loaded()) setMapStatus("error");
        });

        cleanup = () => {
          markers.forEach((marker) => marker.remove());
          map.remove();
        };
      })
      .catch(() => {
        if (!cancelled) setMapStatus("error");
      });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [anchor.lat, anchor.lng, anchor.label, mapReady, styleUrl, transformRequest, points]);

  if (!mapReady || mapStatus === "error") {
    return (
      <>
        {mapStatus === "error" ? (
          <p className="mundi-map-warning" role="status">
            The vector map could not load in this browser. Showing the zero-token SVG fallback so the demo stays stable.
          </p>
        ) : null}
        <MundiSvgFallback points={points} anchor={anchor} />
      </>
    );
  }

  return (
    <div className="mundi-maplibre-shell">
      <div ref={containerRef} className="mundi-maplibre-canvas" aria-label="Interactive MapLibre provenance map" />
      {mapStatus === "loading" ? (
        <div className="mundi-map-loading" role="status">Loading {loadingLabel} vector map…</div>
      ) : null}
    </div>
  );
}

function addMundiRouteLayer(
  map: MapLibreMap,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  map.addSource("mundi-routes", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        properties: { status: point.status },
        geometry: {
          type: "LineString",
          coordinates: [
            [point.lng, point.lat],
            [anchor.lng, anchor.lat],
          ],
        },
      })),
    },
  });

  map.addLayer({
    id: "mundi-routes",
    type: "line",
    source: "mundi-routes",
    paint: {
      "line-color": ["match", ["get", "status"], "minted", "#10b981", "proven", "#d4af37", "#64748b"],
      "line-dasharray": [2, 2],
      "line-opacity": 0.58,
      "line-width": 1.8,
    },
  });
}

function fitMundiBounds(
  map: MapLibreMap,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  const coordinates = [...points.map((point) => [point.lng, point.lat] as const), [anchor.lng, anchor.lat] as const];
  const lngs = coordinates.map(([lng]) => lng);
  const lats = coordinates.map(([, lat]) => lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const padLng = minLng === maxLng ? 1 : 0;
  const padLat = minLat === maxLat ? 1 : 0;

  map.fitBounds(
    [
      [minLng - padLng, minLat - padLat],
      [maxLng + padLng, maxLat + padLat],
    ],
    { padding: 60, maxZoom: 3.5, duration: 700 },
  );
}

function MundiSvgFallback({ points, anchor }: { points: MapPoint[]; anchor: { lat: number; lng: number } }) {
  return (
    <div className="mundi-canvas">
      <svg viewBox="0 0 1000 520" role="img" aria-label="World map with provenance origin points">
        <defs>
          <radialGradient id="mundiGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="rgba(212, 175, 55, 0.30)" />
            <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
          </radialGradient>
        </defs>
        <rect width="1000" height="520" rx="24" fill="#071323" />
        <ellipse cx="500" cy="260" rx="438" ry="204" fill="url(#mundiGlow)" opacity="0.65" />
        {[-120, -60, 0, 60, 120].map((lng) => (
          <line key={`lng-${lng}`} x1={project(lng, 85).x} x2={project(lng, -85).x} y1="42" y2="478" className="mundi-gridline" />
        ))}
        {[-60, -30, 0, 30, 60].map((lat) => (
          <line key={`lat-${lat}`} x1="70" x2="930" y1={project(0, lat).y} y2={project(0, lat).y} className="mundi-gridline" />
        ))}

        <path className="mundi-land" d="M178 177c42-35 117-52 164-17 34 25 15 71 56 85 35 12 62-19 91 2 33 24 8 73-27 89-53 24-135 2-188-29-44-26-132-84-96-130Z" />
        <path className="mundi-land" d="M416 124c66-44 204-42 272-8 50 25 78 72 52 106-34 45-126 14-168 45-35 26-4 79-54 97-56 20-136-39-148-100-9-46-24-103 46-140Z" />
        <path className="mundi-land" d="M666 298c56-19 129-7 164 36 31 38 3 91-53 104-69 16-165-25-171-78-4-30 20-49 60-62Z" />

        {points.map((point) => {
          const origin = project(point.lng, point.lat);
          const target = project(anchor.lng, anchor.lat);
          return (
            <g key={point.assetId}>
              <line x1={origin.x} y1={origin.y} x2={target.x} y2={target.y} className={`mundi-route ${point.status}`} />
              <circle cx={origin.x} cy={origin.y} r="9" className={`mundi-dot ${point.category} ${point.status}`} />
              <circle cx={origin.x} cy={origin.y} r="16" className={`mundi-pulse ${point.status}`} />
              <title>{`${point.label} · ${point.detail} · ${point.status}`}</title>
            </g>
          );
        })}

        {points.length === 0 ? (
          <text x="500" y="262" textAnchor="middle" className="mundi-empty-svg">
            No mapped assets match the current filters
          </text>
        ) : null}

        <g>
          <circle cx={project(anchor.lng, anchor.lat).x} cy={project(anchor.lng, anchor.lat).y} r="11" className="mundi-anchor" />
          <text x={project(anchor.lng, anchor.lat).x + 18} y={project(anchor.lng, anchor.lat).y + 5} className="mundi-anchor-label">
            Casper
          </text>
        </g>
      </svg>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function project(lng: number, lat: number) {
  return {
    x: ((lng + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 520,
  };
}
