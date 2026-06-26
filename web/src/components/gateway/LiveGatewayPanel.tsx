import { useEffect, useState } from "react";
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

export function LiveGatewayPanel() {
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<GatewaySnapshot>({
    proof: null,
    catalog: null,
    verdicts: [],
    certificate: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadGateway() {
      setState("loading");
      setError(null);

      try {
        const [proof, catalog, verdicts] = await Promise.all([
          fetchGatewayJson<ProofResponse>("/proof"),
          fetchGatewayJson<CatalogResponse>("/catalog"),
          Promise.all(
            LIVE_ASSETS.map((assetId) =>
              fetchGatewayJson<VerdictResponse>(`/verdict/${encodeURIComponent(assetId)}`),
            ),
          ),
        ]);

        let certificate: CertificateResponse | null = null;
        try {
          certificate = await fetchGatewayJson<CertificateResponse>(
            "/certificate/MINA-VALEDOURO-LOTE-002",
          );
        } catch {
          certificate = null;
        }

        if (!cancelled) {
          setSnapshot({ proof, catalog, verdicts, certificate });
          setState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gateway unavailable");
          setState("error");
        }
      }
    }

    loadGateway();
    return () => {
      cancelled = true;
    };
  }, []);

  const onChainAssets = snapshot.catalog?.assets.filter((asset) => asset.simulated !== true).length ?? 0;

  return (
    <aside className="live-gateway panel panel--elevated reveal-scroll" aria-live="polite">
      <header className="panel__head live-gateway__head">
        <span className="mono-label">Live gateway</span>
        <span className={`live-gateway__status live-gateway__status--${state}`}>
          {state === "loading" ? "Loading" : state === "ready" ? "Connected" : "Unavailable"}
        </span>
      </header>

      <p className="live-gateway__url">API: {LASTRO_GATEWAY_URL}</p>

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
