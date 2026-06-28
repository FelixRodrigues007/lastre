import { useCallback, useEffect, useRef, useState } from "react";
import {
  LASTRO_GATEWAY_URL,
  fetchGatewayJson,
  type CatalogResponse,
  type CertificateResponse,
  type ProofResponse,
  type VerdictResponse,
} from "../../lib/lastro-api";
import "./live-gateway-panel.css";

type LoadState = "loading" | "ready" | "error";

interface GatewaySnapshot {
  proof: ProofResponse | null;
  catalog: CatalogResponse | null;
  verdicts: VerdictResponse[];
  certificate: CertificateResponse | null;
}

const LIVE_ASSETS = ["MINA-VALEDOURO-LOTE-001", "MINA-VALEDOURO-LOTE-002"];
const CERTIFICATE_ASSET = "MINA-VALEDOURO-LOTE-002";

// Render's free tier sleeps idle services; the first request after a cold
// start can take tens of seconds. Bound each load so the panel fails with a
// clear, retryable message instead of hanging on "Loading" forever.
const REQUEST_TIMEOUT_MS = 45_000;

function formatClock(date: Date) {
  return date.toLocaleTimeString("en-US", { hour12: false });
}

export function LiveGatewayPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [snapshot, setSnapshot] = useState<GatewaySnapshot>({
    proof: null,
    catalog: null,
    verdicts: [],
    certificate: null,
  });

  // Identifies the most recent load so a superseded run (manual refresh or
  // unmount) never writes stale results into state.
  const latestRun = useRef(0);
  const mounted = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const loadGateway = useCallback(async () => {
    const runId = ++latestRun.current;
    controllerRef.current?.abort(); // cancel any prior run's pending fetches
    const controller = new AbortController();
    controllerRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    setState("loading");
    setError(null);

    const get = <T,>(path: string) =>
      fetchGatewayJson<T>(path, { signal: controller.signal });

    // allSettled: a single slow or failed endpoint (common on a cold-started
    // backend) must not blank the whole panel — render whatever resolved.
    const [coreResults, verdictResults] = await Promise.all([
      Promise.allSettled([get<ProofResponse>("/proof"), get<CatalogResponse>("/catalog")]),
      Promise.allSettled(
        LIVE_ASSETS.map((assetId) =>
          get<VerdictResponse>(`/verdict/${encodeURIComponent(assetId)}`),
        ),
      ),
    ]);
    clearTimeout(timeout);

    // Drop results from an unmounted component or a superseded refresh.
    if (!mounted.current || runId !== latestRun.current) return;

    const [proofResult, catalogResult] = coreResults;
    const proof = proofResult.status === "fulfilled" ? proofResult.value : null;
    const catalog = catalogResult.status === "fulfilled" ? catalogResult.value : null;
    const verdicts = verdictResults
      .filter((r): r is PromiseFulfilledResult<VerdictResponse> => r.status === "fulfilled")
      .map((r) => r.value);

    if (!proof && !catalog && verdicts.length === 0) {
      setSnapshot({ proof: null, catalog: null, verdicts: [], certificate: null });
      setUpdatedAt(new Date());
      setError(
        controller.signal.aborted
          ? "Gateway timed out — the demo backend may be waking up. Try Refresh."
          : proofResult.status === "rejected" && proofResult.reason instanceof Error
            ? proofResult.reason.message
            : "Gateway unavailable",
      );
      setState("error");
      return;
    }

    // Certificate is best-effort: a 404 for a non-Valid lot is expected.
    let certificate: CertificateResponse | null = null;
    try {
      certificate = await get<CertificateResponse>(
        `/certificate/${encodeURIComponent(CERTIFICATE_ASSET)}`,
      );
    } catch {
      certificate = null;
    }
    if (!mounted.current || runId !== latestRun.current) return;

    setSnapshot({ proof, catalog, verdicts, certificate });
    setUpdatedAt(new Date());
    setState("ready");
  }, []);

  useEffect(() => {
    mounted.current = true;
    void loadGateway();
    return () => {
      mounted.current = false;
      controllerRef.current?.abort();
    };
  }, [loadGateway]);

  const onChainAssets = snapshot.catalog?.assets.filter((asset) => asset.simulated !== true).length ?? 0;

  return (
    <aside className="live-gateway panel panel--elevated reveal-scroll" aria-live="polite">
      <header className="panel__head live-gateway__head">
        <span className="mono-label">Live gateway</span>
        <div className="live-gateway__head-actions">
          <span className={`live-gateway__status live-gateway__status--${state}`}>
            {state === "loading" ? "Loading" : state === "ready" ? "Connected" : "Unavailable"}
          </span>
          <button
            type="button"
            className="live-gateway__refresh"
            onClick={() => void loadGateway()}
            disabled={state === "loading"}
          >
            {state === "loading" ? "Refreshing…" : "Refresh live verdicts"}
          </button>
        </div>
      </header>

      <p className="live-gateway__url">
        API: {LASTRO_GATEWAY_URL}
        {updatedAt ? (
          <span className="live-gateway__timestamp"> · updated {formatClock(updatedAt)}</span>
        ) : null}
      </p>

      {state === "error" ? (
        <p className="live-gateway__error">
          {error}. Keep the demo visible, but do not claim live readback until the
          gateway responds.
        </p>
      ) : (
        <>
          <div className="live-gateway__stats" aria-label="Gateway proof counters">
            <span>
              <strong>{snapshot.proof?.accepted ?? "—"}</strong>
              Accepted
            </span>
            <span>
              <strong>{snapshot.proof?.rejected ?? "—"}</strong>
              Rejected
            </span>
            <span>
              <strong>{onChainAssets || "—"}</strong>
              Live catalog lots
            </span>
          </div>

          <div className="live-gateway__verdicts">
            {snapshot.verdicts.length === 0 ? (
              <p className="live-gateway__muted">Waiting for live verdicts…</p>
            ) : (
              snapshot.verdicts.map((verdict) => (
                <article className="live-gateway__row" key={verdict.assetId}>
                  <span>{verdict.assetId}</span>
                  <strong data-verdict={verdict.verdict}>{verdict.verdict}</strong>
                </article>
              ))
            )}
          </div>

          {snapshot.certificate ? (
            <p className="live-gateway__credential">
              ProvenanceCredential · transferable: false · {truncate(snapshot.certificate.attestationTx)}
            </p>
          ) : (
            <p className="live-gateway__muted">
              Credential appears only for Valid lots with a symbolic MintGate event.
            </p>
          )}
        </>
      )}
    </aside>
  );
}

function truncate(value: string) {
  return `${value.slice(0, 10)}…${value.slice(-8)}`;
}
