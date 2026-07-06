import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { Map as MapboxMap } from "mapbox-gl";
import { CaptureWizardTrigger } from "../components/capture/CaptureWizardTrigger";
import { FullDemoModal, type FullDemoStep } from "../components/demo/FullDemoModal";
import { MarketMapDrawer } from "../components/marketplace/MarketMapDrawer";
import { MarketplaceAssetBadge } from "../components/marketplace/MarketplaceAssetBadge";
import { MarketplaceFilters } from "../components/marketplace/MarketplaceFilters";
import { PageHeader } from "../components/layout/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { useOnboarding } from "../context/OnboardingContext";
import {
  getLot,
  getLots,
  getMintSummary,
  mintAsset,
  processBatch,
  simulateAgentQuery,
  type AgentQueryResult,
  type MintSummary,
} from "../lib/api";
import { useAsyncData } from "../hooks/useAsyncData";
import { addDemoMint } from "../lib/demoMints";
import {
  clearFullDemoState,
  createFullDemoState,
  FULL_DEMO_ASSET_ID,
  buildMyAssetsUrl,
  readFullDemoState,
  writeFullDemoState,
} from "../lib/fullDemo";
import {
  buildLotMap,
  buildMapPoints,
  enrichMarketplaceAsset,
  mergeMarketplaceAssets,
} from "../lib/marketplaceAssets";
import { resolveMapCredentials, applyMarketplaceMapAppearance, type MapCredentials } from "../lib/mapConfig";
import { MARKETPLACE_COVER_FALLBACK } from "../lib/marketplaceCovers";
import type { EnrichedAsset, MapPoint, MarketplacePersona } from "../lib/marketplaceTypes";
import "maplibre-gl/dist/maplibre-gl.css";
import "./marketplace.css";

const DEMO_PERSONA_STORAGE_KEY = "casper-demo-persona";
const MARKETPLACE_PAGE_SIZE = 5;
const MARKETPLACE_ANCHOR = { label: "Casper Testnet anchor", lat: 37.7749, lng: -122.4194 };
const MARKETPLACE_MAP_CONFIG = resolveMapCredentials();
const EMPTY_LOTS: never[] = [];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const MARKETPLACE_DEMO_STEPS: FullDemoStep[] = [
  {
    label: "Capture + proof preset",
    detail: "Load the fictional VCS Amazonia carbon proof and confirm the proof-before-token payload.",
  },
  {
    label: "Agent processing",
    detail: "Run the Lastre agent path so the action is decided before the deterministic seal verdict.",
  },
  {
    label: "Paid x402 query",
    detail: "Simulate an external agent paying via x402 to read the provenance snapshot.",
  },
  {
    label: "MintGate claim",
    detail: "Emit the demo LotMinted event only after the proof is Valid.",
  },
];

const AGENT_SNIPPET = `const quote = await fetch(
  "https://app-api.lastre.io/api/x402/provenance/" + assetId
); // -> HTTP 402 payment requirements

const proof = await fetch(url, {
  headers: { "X-PAYMENT": signCasperPayment(quote) },
}).then((r) => r.json());

if (proof.provenance.verdict === "Valid") approveAction();`;

function buildCachedDemoAgentQuery(
  assetId: string,
  reason: string,
  paidQueries = 0,
): AgentQueryResult {
  return {
    ok: true,
    fallback: true,
    reason,
    txHash: "cached-demo-payload",
    facilitatorMode: "mock",
    amountCspr: 0,
    payTo: "casper-test-account-hash-lastro-payto-mock-0001",
    totalPaidQueries: paidQueries,
    provenance: {
      assetId,
      category: "carbon_credit",
      seal: "2e9feed35f5d887adf94819553cce0b559df2efab8c3a3dfd83c585f813a1d57",
      referenceSeal: "2e9feed35f5d887adf94819553cce0b559df2efab8c3a3dfd83c585f813a1d57",
      sealMatch: true,
      verdict: "Valid",
      attested: true,
      mintStatus: "minted",
      attestationTx: "fd8df60d20a8f6bcebf854e2ec87ee19acc6d0a59d3994ea62456908f916e3cf",
      mintTx: null,
      carbonDetails: {
        tonnesCO2e: 125000,
        creditType: "VCS",
        vintage: "2024",
        methodology: "REDD+",
        verifier: "Verra",
        carbonImpactScore: 92,
      },
      packageHash: "hash-b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561",
      csprLinks: {
        package:
          "https://testnet.cspr.live/contract-package/b8b505fe96c183de157beda5f2233903aa7805208b428c668d191c83f2590561",
        attestation:
          "https://testnet.cspr.live/transaction/fd8df60d20a8f6bcebf854e2ec87ee19acc6d0a59d3994ea62456908f916e3cf",
        mint: null,
      },
      readAt: new Date().toISOString(),
    },
  };
}

function useLatest<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

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
  const { completeStep } = useOnboarding();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<"all" | "mineral" | "carbon_credit">("all");
  const [creditFilter, setCreditFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "proven" | "minted" | "available">("all");
  const [page, setPage] = useState(1);
  const [hoveredAssetId, setHoveredAssetId] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<EnrichedAsset | null>(null);
  const [persona, setPersona] = useState<MarketplacePersona>(() => readStoredPersona());
  const [mintSummary, setMintSummary] = useState<MintSummary | null>(null);
  const [mintSummaryError, setMintSummaryError] = useState<string | null>(null);
  const [agentQuery, setAgentQuery] = useState<{
    assetId: string;
    loading: boolean;
    result: AgentQueryResult | null;
  } | null>(null);
  const [fullDemoOpen, setFullDemoOpen] = useState(false);
  const [fullDemoStep, setFullDemoStep] = useState(0);
  const [fullDemoStatus, setFullDemoStatus] = useState("");
  const [fullDemoMint, setFullDemoMint] = useState<{
    assetId: string;
    txHash?: string;
    alreadyMinted?: boolean;
  } | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [payloadCopied, setPayloadCopied] = useState(false);
  const fullDemoStartedRef = useRef(false);

  useEffect(() => {
    completeStep("marketplace");
  }, [completeStep]);

  useEffect(() => {
    void reloadMintSummary();
  }, []);

  useEffect(() => {
    const state = readFullDemoState();
    const shouldRun = searchParams.get("demo") === "full" || state?.stage === "marketplace";
    if (!shouldRun || fullDemoStartedRef.current) return;
    fullDemoStartedRef.current = true;
    void runMarketplaceFullDemo(searchParams.get("assetId") || state?.assetId || FULL_DEMO_ASSET_ID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [search, catFilter, creditFilter, statusFilter]);

  async function reloadMintSummary() {
    try {
      setMintSummaryError(null);
      setMintSummary(await getMintSummary());
    } catch (error) {
      setMintSummaryError(error instanceof Error ? error.message : "Mint summary unavailable");
    }
  }

  function updatePersona(nextPersona: MarketplacePersona) {
    writeDemoStorage(DEMO_PERSONA_STORAGE_KEY, nextPersona);
    setPersona(nextPersona);
  }

  async function runAgentQuery(assetId: string, from = "agent-casper-demo"): Promise<AgentQueryResult | null> {
    setAgentQuery({ assetId, loading: true, result: null });
    setPayloadCopied(false);
    try {
      const result = await simulateAgentQuery(assetId, from);
      await reloadMintSummary();
      setAgentQuery({ assetId, loading: false, result });
      return result;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "query_failed";
      const result = buildCachedDemoAgentQuery(assetId, reason, mintSummary?.paidX402Queries ?? 0);
      setAgentQuery({ assetId, loading: false, result });
      return result;
    }
  }

  async function ensureValidProof(assetId: string) {
    try {
      const lot = await getLot(assetId);
      if (lot.latestVerdict === "Valid") return;
    } catch {
      // If the runtime is cold or the detail endpoint is temporarily stale, try
      // the agent path below. This is a demo flow, not a financial operation.
    }

    const llmBatch = await processBatch([assetId], "llm");
    const llmRecord = llmBatch.records?.find((record) => record.assetId === assetId) ?? llmBatch.records?.[0] ?? null;
    const llmVerdict = llmRecord?.verification?.verdict ?? llmRecord?.onChain?.verdict ?? null;

    if (llmVerdict !== "Valid") {
      await processBatch([assetId], "rule");
    }
  }

  async function runMarketplaceFullDemo(assetId = FULL_DEMO_ASSET_ID) {
    setFullDemoOpen(true);
    setFullDemoMint(null);
    setFullDemoStep(0);
    setFullDemoStatus("Preparing the fictional carbon proof and focusing the Marketplace…");
    writeFullDemoState(createFullDemoState("marketplace", new Date(), assetId));
    setSearch(assetId);
    setCatFilter("carbon_credit");
    setCreditFilter("all");
    setStatusFilter("available");
    setPage(1);
    await delay(700);

    try {
      setFullDemoStep(1);
      setFullDemoStatus("Running the agent path. The agent decides action; SHA-256 decides verdict.");
      await ensureValidProof(assetId);
      lotsData.reload();
      await delay(700);

      setFullDemoStep(2);
      setFullDemoStatus("Requesting x402 quote…");
      await delay(350);
      setFullDemoStatus("Mock payment submitted (facilitator: mock)…");
      await delay(350);
      setFullDemoStatus("Reading provenance payload from Lastre…");
      writeFullDemoState(createFullDemoState("x402", new Date(), assetId));
      const query = await runAgentQuery(assetId);
      await delay(850);

      setFullDemoStep(3);
      setFullDemoStatus("Claiming through MintGate demo after Valid proof…");
      writeFullDemoState(createFullDemoState("mint", new Date(), assetId));
      try {
        const mint = await mintAsset(assetId, "agent-casper-demo");
        if (mint.txHash) addDemoMint(assetId);
        setFullDemoMint({ assetId, txHash: mint.txHash });
        setFullDemoStatus("MintGate demo event emitted…");
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("Already minted")) addDemoMint(assetId);
        setFullDemoMint({ assetId, alreadyMinted: message.includes("Already minted") });
        setFullDemoStatus(
          message.includes("Already minted")
            ? "MintGate demo event already existed for this runtime…"
            : "MintGate demo event attempted after Valid proof…",
        );
      }

      await reloadMintSummary();
      lotsData.reload();
      setFullDemoStatus(
        query?.ok
          ? "Complete: the x402 proof payload is open with verdict, seal match, carbon score, and Casper links."
          : "Demo reached x402, but the paid query returned an error. Check the API deployment.",
      );
      writeFullDemoState(createFullDemoState("complete", new Date(), assetId));
    } catch (error) {
      setFullDemoStatus(`Demo stopped: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  async function copyAgentSnippet() {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(AGENT_SNIPPET);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 1600);
  }

  async function copyAgentPayload() {
    if (!agentQuery?.result || !navigator.clipboard) return;
    await navigator.clipboard.writeText(JSON.stringify(agentQuery.result, null, 2));
    setPayloadCopied(true);
    setTimeout(() => setPayloadCopied(false), 1600);
  }

  const lots = lotsData.data?.lots ?? EMPTY_LOTS;

  const lotMap = useMemo(() => buildLotMap(lots as never[]), [lots]);
  const merged = useMemo(() => mergeMarketplaceAssets(lots as never[]), [lots]);

  const categoryTotals = useMemo(
    () => ({
      all: merged.length,
      mineral: merged.filter(
        (a: Record<string, unknown>) =>
          (a.category || (!a.creditType ? "mineral" : "carbon_credit")) === "mineral",
      ).length,
      carbon: merged.filter(
        (a: Record<string, unknown>) => a.category === "carbon_credit" || Boolean(a.creditType),
      ).length,
    }),
    [merged],
  );

  const visible = useMemo(() => {
    return merged.filter((a: any) => {
      const matchesSearch = !search || `${a.assetId} ${a.operator || ""} ${a.name || ""}`.toLowerCase().includes(search.toLowerCase());
      const cat = a.category || (a.creditType ? "carbon_credit" : "mineral");
      const matchesCat = catFilter === "all" || cat === catFilter;
      const matchesCredit = creditFilter === "all" || a.creditType === creditFilter;

      const lot = lotMap.get(a.assetId);
      const isInvalidProof =
        lot?.latestVerdict === "Invalid" || lot?.sealMatchesReference === false;
      const isValidProof =
        !isInvalidProof &&
        (lot?.latestVerdict === "Valid" || (a.expectedOnChain === "Valid" && !lot));
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

  const mapPoints = useMemo(
    () => buildMapPoints(visible, lotMap),
    [visible, lotMap],
  );

  const enrichedAssets = useMemo(
    () => visible.map((asset) => enrichMarketplaceAsset(asset, lotMap, mapPoints)),
    [visible, lotMap, mapPoints],
  );

  const pageCount = Math.max(1, Math.ceil(enrichedAssets.length / MARKETPLACE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedAssets = useMemo(() => {
    const start = (currentPage - 1) * MARKETPLACE_PAGE_SIZE;
    return enrichedAssets.slice(start, start + MARKETPLACE_PAGE_SIZE);
  }, [enrichedAssets, currentPage]);

  const openAsset = useCallback(
    (assetId: string) => {
      navigate(`/marketplace/${encodeURIComponent(assetId)}`);
    },
    [navigate],
  );

  const handleSelectMapPoint = useCallback(
    (point: MapPoint) => {
      const asset = enrichedAssets.find((item) => String(item.asset.assetId) === point.assetId);
      if (asset) setPreviewAsset(asset);
    },
    [enrichedAssets],
  );

  const selectedMapAssetId = previewAsset ? String(previewAsset.asset.assetId) : null;
  const visiblePaidQueries = mintSummary?.paidX402Queries ?? agentQuery?.result?.totalPaidQueries ?? 0;

  return (
    <div className="page market-page">
      <div className="market-page__intro">
        <PageHeader
          kicker="Marketplace"
          title="Provenance Marketplace"
          lead="Browse verified assets on the map. Select a lot to inspect origin, proof status, and claim options (demo)."
          actions={
            <CaptureWizardTrigger className="route-cta">Capture New</CaptureWizardTrigger>
          }
        />

        <FullDemoModal
          open={fullDemoOpen}
          assetId={FULL_DEMO_ASSET_ID}
          steps={MARKETPLACE_DEMO_STEPS}
          activeStep={fullDemoStep}
          status={fullDemoStatus}
          primaryAction={
            fullDemoStep >= 3
              ? { label: "View in MyAssets", to: buildMyAssetsUrl(FULL_DEMO_ASSET_ID) }
              : undefined
          }
          onClose={() => {
            setFullDemoOpen(false);
            clearFullDemoState();
          }}
        />

        <section className="market-demo-banner" aria-label="Full end-to-end demo">
          <div>
            <span className="eyebrow">Judge-ready flow</span>
            <h3>Run Full End-to-End Demo</h3>
            <p>
              Capture preset → agent decision → paid x402 proof query → MintGate demo claim,
              ending with the agent payload visible for judges.
            </p>
          </div>
          <button type="button" className="route-cta" onClick={() => void runMarketplaceFullDemo()}>
            Run Demo
          </button>
        </section>
      </div>

      <aside className="market-list" aria-label="Marketplace assets">
        <section className="market-agent-card" aria-label="Agent integration">
          <div className="market-agent-card__copy">
            <span className="mono-label">x402 provider</span>
            <strong>Agents pay Lastre before touching RWA/carbon data.</strong>
            <p>
              Query verdict, seal match, carbon score, and Casper links before any downstream action.
            </p>
          </div>
          <button type="button" className="market-agent-card__copy-btn" onClick={() => void copyAgentSnippet()}>
            {snippetCopied ? "Copied ✓" : "Copy snippet"}
          </button>
          <Link className="market-agent-card__copy-btn" to="/agents">
            Open /agents
          </Link>
        </section>

        <section className="market-mint-summary" aria-label="MintGate summary">
          <span>
            <strong>{mintSummary?.onChain?.source === "live" ? "Live testnet" : "Fallback snapshot"}</strong>
            ProofOfOrigin
          </span>
          <span>
            <strong>{mintSummary?.onChain?.proofOfOriginAccepted ?? "—"}</strong>
            Accepted
          </span>
          <span>
            <strong>{mintSummary?.onChain?.proofOfOriginRejected ?? "—"}</strong>
            Rejected
          </span>
          <span>
            <strong>Demo simulated</strong>
            MintGate
          </span>
          <span>
            <strong>{mintSummary?.paidX402Queries ?? 0}</strong>
            x402 paid queries
          </span>
          <span>
            <strong>{mintSummary?.mintCount ?? "—"}</strong>
            Demo LotMinted
          </span>
          <p className="market-mint-summary__note">
            Live query reads ProofOfOrigin attestations. MintGate events are demo-only for this hackathon.
          </p>
          {mintSummaryError ? <em>{mintSummaryError}</em> : null}
        </section>

        <div className="market-list__search">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search assets…"
            ariaLabel="Search marketplace assets"
          />
        </div>

        <MarketplaceFilters
          category={catFilter}
          status={statusFilter}
          creditType={creditFilter}
          persona={persona}
          totals={categoryTotals}
          onCategoryChange={setCatFilter}
          onStatusChange={setStatusFilter}
          onCreditTypeChange={setCreditFilter}
          onPersonaChange={updatePersona}
        />

        <div className="market-list__scroll">
          {enrichedAssets.length === 0 ? (
            <p className="market-list__empty muted">No matching assets. Try clearing filters.</p>
          ) : (
            pagedAssets.map((item) => {
              const assetId = String(item.asset.assetId);
              return (
                <MarketListItem
                  key={assetId}
                  item={item}
                  isHovered={hoveredAssetId === assetId}
                  isSelected={selectedMapAssetId === assetId}
                  onSelect={() => openAsset(assetId)}
                  onHover={(hover) => setHoveredAssetId(hover ? assetId : null)}
                />
              );
            })
          )}
        </div>

        {enrichedAssets.length > MARKETPLACE_PAGE_SIZE ? (
          <MarketListPagination
            page={currentPage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        ) : null}
      </aside>

      <div className="market-map" aria-label="Global Mundi provenance map">
        <MarketMapPanel
          points={mapPoints}
          hoveredAssetId={hoveredAssetId}
          selectedAssetId={selectedMapAssetId}
          previewAsset={previewAsset}
          onSelectPoint={handleSelectMapPoint}
          onHoverPoint={setHoveredAssetId}
          onClosePreview={() => setPreviewAsset(null)}
        />
      </div>

      {agentQuery ? (
        <div className="modal-overlay" onClick={() => setAgentQuery(null)}>
          <div className="buy-modal agent-query-modal" onClick={(event) => event.stopPropagation()}>
            <div className="agent-query-modal__head">
              <div>
                <span className="mono-label">x402 provenance read</span>
                <h3>Agent Query via x402 (Demo)</h3>
              </div>
              <span className="agent-query-counter">x402 query #{visiblePaidQueries}</span>
            </div>
            <div className="agent-query-asset">
              Asset: <strong>{agentQuery.assetId}</strong>
            </div>
            {agentQuery.loading ? (
              <div className="agent-query-loading" role="status" aria-live="polite">
                <span>Requesting x402 quote…</span>
                <span>Mock payment submitted (facilitator: mock)…</span>
                <span>Reading provenance payload from Lastre…</span>
              </div>
            ) : agentQuery.result?.ok && agentQuery.result.provenance ? (
              <>
                <div className="sig-sim">
                  {agentQuery.result.fallback ? (
                    <>
                      Could not reach provenance service right now. Using cached demo payload.
                      <br />
                      Original error: <code>{agentQuery.result.reason}</code>
                    </>
                  ) : (
                    <>
                      External agent paid <strong>{agentQuery.result.amountCspr}</strong> CSPR via x402
                      (mock settlement) to read this proof.
                      <br />
                      Facilitator: {agentQuery.result.facilitatorMode}
                      <br />
                      Settlement tx: <code>{agentQuery.result.txHash}</code>
                    </>
                  )}
                </div>
                <div className="agent-proof">
                  <div className="agent-proof__kpis">
                    <div className="agent-proof__kpi agent-proof__kpi--valid">
                      <span>Verdict</span>
                      <strong>{agentQuery.result.provenance.verdict}</strong>
                    </div>
                    <div className="agent-proof__kpi">
                      <span>Seal match</span>
                      <strong>{String(agentQuery.result.provenance.sealMatch)}</strong>
                    </div>
                    {agentQuery.result.provenance.carbonDetails ? (
                      <div className="agent-proof__kpi">
                        <span>Carbon impact score</span>
                        <strong>{agentQuery.result.provenance.carbonDetails.carbonImpactScore}</strong>
                      </div>
                    ) : null}
                  </div>
                  <div className="agent-proof__line">
                    Mint status: <strong>{agentQuery.result.provenance.mintStatus}</strong>{" "}
                    <span className="agent-proof__badge">x402 query #{visiblePaidQueries}</span>
                    {agentQuery.result.fallback ? <span className="agent-proof__badge">Cached demo fallback</span> : null}
                  </div>
                  <div className="agent-evidence-badges">
                    <a
                      href={agentQuery.result.provenance.csprLinks.package}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="agent-evidence-badge agent-evidence-badge--chain"
                    >
                      Casper ProofOfOrigin evidence
                    </a>
                    <span className="agent-evidence-badge agent-evidence-badge--demo">
                      MintGate: demo event
                    </span>
                  </div>
                  <p className="agent-proof__note">
                    This proof is anchored to a Casper package. Mint event is simulated for this demo.
                  </p>
                  <div className="agent-proof__actions">
                    {agentQuery.result.provenance.csprLinks?.attestation ? (
                      <a
                        href={agentQuery.result.provenance.csprLinks.attestation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn small primary"
                      >
                        View attestation on cspr.live
                      </a>
                    ) : null}
                    {agentQuery.result.provenance.csprLinks?.mint ? (
                      <a
                        href={agentQuery.result.provenance.csprLinks.mint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn small primary"
                      >
                        View mint on cspr.live
                      </a>
                    ) : null}
                  </div>
                </div>
                {fullDemoMint?.assetId === agentQuery.assetId ? (
                  <div className="demo-mint-note">
                    {fullDemoMint.txHash
                      ? `MintGate demo event emitted: ${fullDemoMint.txHash}`
                      : fullDemoMint.alreadyMinted
                        ? "MintGate demo event already existed for this runtime."
                        : "MintGate demo claim was attempted after the paid proof query."}
                  </div>
                ) : null}
                <p className="small muted">
                  This is what an external agent would see before deciding whether to act.
                  Total paid queries this session: {visiblePaidQueries}.
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
              <button type="button" className="btn" onClick={() => setAgentQuery(null)}>
                Close
              </button>
            </div>
            <div className="demo-disclaimer">
              DEMO ONLY. Mock x402 facilitator; no real CSPR moves. Structure mirrors a real Casper x402 settlement seam.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MarketListPagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav className="market-list__pagination" aria-label="Asset list pages">
      <button
        type="button"
        className="market-list__page-btn"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        ←
      </button>
      <div className="market-list__page-numbers" role="group" aria-label="Page numbers">
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`market-list__page-num${pageNumber === page ? " market-list__page-num--active" : ""}`}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="market-list__page-btn"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}

function MarketListItem({
  item,
  isHovered,
  isSelected,
  onSelect,
  onHover,
}: {
  item: EnrichedAsset;
  isHovered: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (hover: boolean) => void;
}) {
  const assetId = String(item.asset.assetId);
  const origin = item.asset.origin as { site?: string; label?: string } | undefined;
  const location = origin?.site || origin?.label;
  const stats = [
    item.isCarbon ? String(item.asset.creditType || "Carbon") : String(item.asset.mineral || item.asset.mineralType || "Mineral"),
    item.quantity ? `${item.quantity.toLocaleString()} ${item.unit}` : null,
    `Score ${item.provScore}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <button
      type="button"
      className={`market-list-item${isHovered ? " market-list-item--hovered" : ""}${isSelected ? " market-list-item--selected" : ""}`}
      aria-label={`Open ${item.label}`}
      aria-pressed={isSelected}
      onClick={onSelect}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
    >
      <span className="market-list-item__thumb" aria-hidden="true">
        <img
          className="market-list-item__photo"
          src={item.coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.dataset.fallback === "1") return;
            img.dataset.fallback = "1";
            img.src = MARKETPLACE_COVER_FALLBACK;
          }}
        />
      </span>
      <span className="market-list-item__body">
        <MarketplaceAssetBadge item={item} size="sm" className="market-list-item__status" />
        <strong className="market-list-item__title">{item.label}</strong>
        <span className="market-list-item__stats">{stats}</span>
        <span className="market-list-item__foot">
          {location ? `${location} · ` : ""}
          <span className="mono-label">{assetId}</span>
        </span>
      </span>
    </button>
  );
}

function MarketMapPanel({
  points,
  hoveredAssetId,
  selectedAssetId,
  previewAsset,
  onSelectPoint,
  onHoverPoint,
  onClosePreview,
}: {
  points: MapPoint[];
  hoveredAssetId: string | null;
  selectedAssetId: string | null;
  previewAsset: EnrichedAsset | null;
  onSelectPoint: (point: MapPoint) => void;
  onHoverPoint: (assetId: string | null) => void;
  onClosePreview: () => void;
}) {
  return (
    <div className="market-map-panel">
      <MundiMapCanvas
        points={points}
        anchor={MARKETPLACE_ANCHOR}
        mapConfig={MARKETPLACE_MAP_CONFIG}
        selectedAssetId={selectedAssetId}
        hoveredAssetId={hoveredAssetId}
        onSelectPoint={onSelectPoint}
        onHoverPoint={onHoverPoint}
      />

      <div className="market-map-legend" aria-label="Map legend">
        <div className="market-map-legend__items">
          <span>
            <i className="mundi-legend-dot mundi-legend-dot--origin mineral" aria-hidden="true" />
            Declared origin <em>(fictional)</em>
          </span>
          <span>
            <i className="mundi-legend-anchor" aria-hidden="true" />
            Casper on-chain anchor
          </span>
          <span>
            <i className="mundi-legend-line" aria-hidden="true" />
            Attestation route (demo)
          </span>
        </div>
        <p className="market-map-legend__note">
          Origins are operator-declared demo coordinates — not GPS tracking or real custody.
        </p>
      </div>

      {previewAsset ? (
        <MarketMapDrawer asset={previewAsset} onClose={onClosePreview} />
      ) : null}
    </div>
  );
}

type MundiMapInstance = MapLibreMap | MapboxMap;
type MundiMarkerHandle = { remove: () => void };

function createAnchorMarkerElement(label: string): HTMLDivElement {
  const markerEl = document.createElement("div");
  markerEl.className = "mundi-maplibre-marker mundi-maplibre-marker--anchor";
  markerEl.setAttribute("aria-label", label);
  markerEl.setAttribute("role", "img");
  markerEl.title = label;
  return markerEl;
}

function createMarkerElement(
  point: MapPoint,
  markerElsRef: MutableRefObject<Map<string, HTMLDivElement>>,
  onSelectPointRef: MutableRefObject<((point: MapPoint) => void) | undefined>,
  onHoverPointRef: MutableRefObject<((assetId: string | null) => void) | undefined>,
): HTMLDivElement {
  const markerEl = document.createElement("div");
  updateMarkerClasses(markerEl, point, null, null);
  markerEl.setAttribute("aria-label", `${point.label}: ${point.status}`);
  markerEl.setAttribute("role", "button");
  markerEl.tabIndex = 0;
  markerEl.dataset.assetId = point.assetId;
  markerElsRef.current.set(point.assetId, markerEl);

  markerEl.addEventListener("click", (event) => {
    event.stopPropagation();
    onSelectPointRef.current?.(point);
  });
  markerEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelectPointRef.current?.(point);
    }
  });
  markerEl.addEventListener("mouseenter", () => onHoverPointRef.current?.(point.assetId));
  markerEl.addEventListener("mouseleave", () => onHoverPointRef.current?.(null));

  return markerEl;
}

function MundiMapCanvas({
  points,
  anchor,
  mapConfig,
  selectedAssetId,
  hoveredAssetId,
  onSelectPoint,
  onHoverPoint,
}: {
  points: MapPoint[];
  anchor: { label: string; lat: number; lng: number };
  mapConfig: MapCredentials;
  selectedAssetId?: string | null;
  hoveredAssetId?: string | null;
  onSelectPoint?: (point: MapPoint) => void;
  onHoverPoint?: (assetId: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MundiMapInstance | null>(null);
  const markersRef = useRef<MundiMarkerHandle[]>([]);
  const markerElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const mapReadyRef = useRef(false);
  const onSelectPointRef = useLatest(onSelectPoint);
  const onHoverPointRef = useLatest(onHoverPoint);
  const [mapStatus, setMapStatus] = useState<"fallback" | "loading" | "ready" | "error">(
    mapConfig.ready ? "loading" : "fallback",
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    markerElsRef.current.clear();
  }, []);

  useEffect(() => {
    if (!mapConfig.ready || !containerRef.current) {
      setMapStatus("fallback");
      return;
    }

    let cancelled = false;
    let cleanup = () => {};
    const container = containerRef.current;
    mapReadyRef.current = false;
    setMapStatus("loading");

    const bindMap = (map: MundiMapInstance) => {
      mapRef.current = map;

      const resize = () => {
        if (!cancelled) map.resize();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const onLoad = () => {
        if (cancelled) return;
        if (mapConfig.provider === "mapbox" && "setProjection" in map) {
          applyMarketplaceMapAppearance(map as MapboxMap);
        }
        resize();
        mapReadyRef.current = true;
        setMapStatus("ready");
      };

      if (mapConfig.provider === "mapbox") {
        (map as MapboxMap).once("load", onLoad);
      } else {
        (map as MapLibreMap).once("load", onLoad);
      }

      cleanup = () => {
        resizeObserver.disconnect();
        clearMarkers();
        map.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      };
    };

    const boot = async () => {
      try {
        if (mapConfig.provider === "mapbox") {
          const mapboxgl = (await import("mapbox-gl")).default;
          await import("mapbox-gl/dist/mapbox-gl.css");
          if (cancelled || !container) return;

          mapboxgl.accessToken = mapConfig.token;
          const map = new mapboxgl.Map({
            container,
            style: mapConfig.styleUrl,
            center: [-45, -15],
            zoom: 2.1,
            projection: "mercator",
            attributionControl: true,
            cooperativeGestures: true,
          });

          map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
          bindMap(map);
          return;
        }

        const maplibre = await import("maplibre-gl");
        if (cancelled || !container) return;

        const map = new maplibre.Map({
          container,
          style: mapConfig.styleUrl,
          center: [0, 8],
          zoom: 1.08,
          attributionControl: { compact: true },
          cooperativeGestures: true,
        });

        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");
        bindMap(map);
      } catch {
        if (!cancelled) setMapStatus("error");
      }
    };

    void boot();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [clearMarkers, mapConfig.provider, mapConfig.ready, mapConfig.styleUrl, mapConfig.token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current || mapStatus !== "ready") return;

    let cancelled = false;

    const sync = async () => {
      clearMarkers();

      if (mapConfig.provider === "mapbox") {
        const mapboxgl = (await import("mapbox-gl")).default;
        if (cancelled || !mapRef.current) return;

        const mapboxMap = map as MapboxMap;
        markersRef.current = [
          ...points.map((point) => {
            const markerEl = createMarkerElement(point, markerElsRef, onSelectPointRef, onHoverPointRef);
            return new mapboxgl.Marker({ element: markerEl, anchor: "center" })
              .setLngLat([point.lng, point.lat])
              .addTo(mapboxMap);
          }),
          new mapboxgl.Marker({ element: createAnchorMarkerElement(anchor.label), anchor: "center" })
            .setLngLat([anchor.lng, anchor.lat])
            .addTo(mapboxMap),
        ];
      } else {
        const maplibre = await import("maplibre-gl");
        if (cancelled || !mapRef.current) return;

        const maplibreMap = map as MapLibreMap;
        markersRef.current = [
          ...points.map((point) => {
            const markerEl = createMarkerElement(point, markerElsRef, onSelectPointRef, onHoverPointRef);
            return new maplibre.Marker({ element: markerEl, anchor: "center" })
              .setLngLat([point.lng, point.lat])
              .addTo(maplibreMap);
          }),
          new maplibre.Marker({ element: createAnchorMarkerElement(anchor.label), anchor: "center" })
            .setLngLat([anchor.lng, anchor.lat])
            .addTo(maplibreMap),
        ];
      }

      updateMundiRouteLayer(map, points, anchor);
      fitMundiBounds(map, points, anchor);
    };

    void sync();

    return () => {
      cancelled = true;
    };
  }, [anchor, clearMarkers, mapConfig.provider, mapStatus, points]);

  useEffect(() => {
    markerElsRef.current.forEach((el, assetId) => {
      const point = points.find((p) => p.assetId === assetId);
      if (point) updateMarkerClasses(el, point, selectedAssetId, hoveredAssetId);
    });
  }, [hoveredAssetId, points, selectedAssetId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedAssetId) return;
    const point = points.find((p) => p.assetId === selectedAssetId);
    if (!point) return;
    map.flyTo({
      center: [point.lng, point.lat],
      zoom: Math.max(map.getZoom(), 3.2),
      duration: 650,
      essential: true,
    });
  }, [points, selectedAssetId]);

  if (!mapConfig.ready || mapStatus === "error") {
    return (
      <MundiSvgFallback
        points={points}
        anchor={anchor}
        selectedAssetId={selectedAssetId}
        hoveredAssetId={hoveredAssetId}
        onSelectPoint={onSelectPoint}
        onHoverPoint={onHoverPoint}
      />
    );
  }

  return (
    <div className="mundi-maplibre-shell market-map-canvas">
      <div ref={containerRef} className="mundi-maplibre-canvas" aria-label="Interactive provenance map" />
      {mapStatus === "loading" ? (
        <div className="mundi-map-loading" role="status">Loading map…</div>
      ) : null}
    </div>
  );
}

function updateMarkerClasses(
  el: HTMLDivElement,
  point: MapPoint,
  selectedAssetId?: string | null,
  hoveredAssetId?: string | null,
) {
  const classes = ["mundi-maplibre-marker", "mundi-maplibre-marker--origin", point.category, point.status];
  if (selectedAssetId === point.assetId) classes.push("selected");
  if (hoveredAssetId === point.assetId) classes.push("hovered");
  el.className = classes.join(" ");
}

function buildMundiRouteGeoJson(points: MapPoint[], anchor: { lat: number; lng: number }) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((point) => ({
      type: "Feature" as const,
      properties: { status: point.status },
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [point.lng, point.lat],
          [anchor.lng, anchor.lat],
        ],
      },
    })),
  };
}

function updateMundiRouteLayer(
  map: MundiMapInstance,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  const data = buildMundiRouteGeoJson(points, anchor);
  const source = (map as MapboxMap).getSource("mundi-routes") as { setData?: (next: typeof data) => void } | undefined;

  if (source?.setData) {
    source.setData(data);
    return;
  }

  addMundiRouteLayer(map, points, anchor);
}

function addMundiRouteLayer(
  map: MundiMapInstance,
  points: MapPoint[],
  anchor: { lat: number; lng: number },
) {
  map.addSource("mundi-routes", {
    type: "geojson",
    data: buildMundiRouteGeoJson(points, anchor),
  });

  map.addLayer({
    id: "mundi-routes",
    type: "line",
    source: "mundi-routes",
    paint: {
      "line-color": ["match", ["get", "status"], "minted", "#6b9b5c", "proven", "#7a9aab", "#8a9aab"],
      "line-dasharray": [3, 3],
      "line-opacity": 0.72,
      "line-width": 1.4,
    },
  });
}

function fitMundiBounds(
  map: MundiMapInstance,
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

function MundiSvgFallback({
  points,
  anchor,
  selectedAssetId,
  hoveredAssetId,
  onSelectPoint,
  onHoverPoint,
}: {
  points: MapPoint[];
  anchor: { lat: number; lng: number };
  selectedAssetId?: string | null;
  hoveredAssetId?: string | null;
  onSelectPoint?: (point: MapPoint) => void;
  onHoverPoint?: (assetId: string | null) => void;
}) {
  return (
    <div className="mundi-canvas market-map-canvas">
      <svg viewBox="0 0 1000 520" role="img" aria-label="World map with provenance origin points">
        <rect width="1000" height="520" fill="#aadaff" />
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
          const isSelected = selectedAssetId === point.assetId;
          const isHovered = hoveredAssetId === point.assetId;
          return (
            <g
              key={point.assetId}
              className={`mundi-svg-point${isSelected ? " selected" : ""}${isHovered ? " hovered" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${point.label}: ${point.status}`}
              aria-pressed={isSelected}
              onClick={() => onSelectPoint?.(point)}
              onMouseEnter={() => onHoverPoint?.(point.assetId)}
              onMouseLeave={() => onHoverPoint?.(null)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectPoint?.(point);
                }
              }}
            >
              <line x1={origin.x} y1={origin.y} x2={target.x} y2={target.y} className={`mundi-route ${point.status}`} />
              <circle cx={origin.x} cy={origin.y} r="7" className={`mundi-dot mundi-dot--origin ${point.category} ${point.status}`} />
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
          <polygon
            points={`${project(anchor.lng, anchor.lat).x},${project(anchor.lng, anchor.lat).y - 12} ${project(anchor.lng, anchor.lat).x + 10},${project(anchor.lng, anchor.lat).y} ${project(anchor.lng, anchor.lat).x},${project(anchor.lng, anchor.lat).y + 12} ${project(anchor.lng, anchor.lat).x - 10},${project(anchor.lng, anchor.lat).y}`}
            className="mundi-anchor-shape"
          />
          <text x={project(anchor.lng, anchor.lat).x + 18} y={project(anchor.lng, anchor.lat).y + 5} className="mundi-anchor-label">
            Casper anchor
          </text>
        </g>
      </svg>
    </div>
  );
}

function project(lng: number, lat: number) {
  return {
    x: ((lng + 180) / 360) * 1000,
    y: ((90 - lat) / 180) * 520,
  };
}
