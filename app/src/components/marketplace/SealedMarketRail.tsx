import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GuardrailBanner } from "../layout/GuardrailBanner";
import { ProofRail } from "../proof/ProofRail";
import { StatusBadge } from "../ui/StatusBadge";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  getMintSummary,
  lockCollateral,
  mintAsset,
  releaseCollateral,
  simulateAgentQuery,
  type AgentQueryResult,
} from "../../lib/api";
import { addDemoMint } from "../../lib/demoMints";
import { shortHash } from "../../lib/format";
import { useAsyncData } from "../../hooks/useAsyncData";
import type { MarketplacePersona } from "../../lib/marketplaceTypes";
import "./sealed-market-rail.css";

const VALID_TARGET_ASSET_ID = "CARBON-VCS-AMAZONIA-2024-001";
const INVALID_TARGET_ASSET_ID = "MINA-VALEDOURO-LOTE-001-TAMPERED";
const DEMO_ACCOUNT_STORAGE_KEY = "casper-demo-account";

type RailPhase = "idle" | "proof_ready" | "minted" | "blocked";

function ensureDemoAccount(): string {
  if (typeof window === "undefined") return "casper-demo-account-preview";
  const existing = window.localStorage.getItem(DEMO_ACCOUNT_STORAGE_KEY);
  if (existing) return existing;
  const created = `casper-test-account-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(DEMO_ACCOUNT_STORAGE_KEY, created);
  return created;
}

function queryResultLine(result: AgentQueryResult): string {
  return [
    result.facilitatorMode,
    typeof result.amountCspr === "number" ? `${result.amountCspr} CSPR (mock)` : null,
    result.txHash ? shortHash(result.txHash) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

type SealedMarketRailProps = {
  persona: MarketplacePersona;
  onPersonaChange: (next: MarketplacePersona) => void;
};

export function SealedMarketRail({ persona, onPersonaChange }: SealedMarketRailProps) {
  const { t } = useLocaleContext();

  const [isInvalidChoice, setIsInvalidChoice] = useState(false);
  const assetId = isInvalidChoice ? INVALID_TARGET_ASSET_ID : VALID_TARGET_ASSET_ID;

  const [phase, setPhase] = useState<RailPhase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [queryInfo, setQueryInfo] = useState<AgentQueryResult | null>(null);
  const [mintTxHash, setMintTxHash] = useState<string | undefined>(undefined);
  const [runError, setRunError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  const mintSummaryState = useAsyncData(getMintSummary);

  // Switching the target asset (Valid <-> Invalid) starts the rail over —
  // the seal for the new target hasn't been checked yet.
  useEffect(() => {
    setPhase("idle");
    setIsRunning(false);
    setQueryInfo(null);
    setMintTxHash(undefined);
    setRunError(null);
    setLocked(false);
    setIsLocking(false);
    setLockError(null);
  }, [assetId]);

  const blocked = phase === "blocked";
  const minted = phase === "minted";
  const activeStep = blocked ? 0 : locked ? 5 : minted ? 4 : phase === "proof_ready" ? 2 : 0;

  const steps = [
    t("marketplace.rail.step.origin"),
    t("marketplace.rail.step.query"),
    t("marketplace.rail.step.mint"),
    t("marketplace.rail.step.sealed"),
    t("marketplace.rail.step.collateral"),
  ];

  async function handleRun() {
    if (isRunning || blocked || minted) return;
    setIsRunning(true);
    setRunError(null);

    try {
      const account = ensureDemoAccount();
      const query = await simulateAgentQuery(assetId, account);
      setQueryInfo(query);

      const queryIsInvalid =
        query.provenance?.verdict === "Invalid" || query.provenance?.sealMatch === false;

      if (queryIsInvalid) {
        setPhase("blocked");
        return;
      }

      if (!query.ok) {
        setRunError(query.reason ?? t("marketplace.rail.error.query"));
        return;
      }

      setPhase("proof_ready");

      const mint = await mintAsset(assetId, account);
      if (!mint.success) {
        const message = mint.error ?? t("marketplace.rail.error.mint");
        setRunError(message);
        if (message.toLowerCase().includes("valid")) setPhase("blocked");
        return;
      }

      addDemoMint(assetId);
      setMintTxHash(mint.txHash);
      setPhase("minted");
    } catch (error) {
      setRunError(error instanceof Error ? error.message : t("marketplace.rail.error.generic"));
    } finally {
      setIsRunning(false);
    }
  }

  async function handleLock() {
    if (!minted || locked || isLocking) return;
    setIsLocking(true);
    setLockError(null);
    try {
      const account = ensureDemoAccount();
      const res = await lockCollateral(assetId, account);
      if (res.success) setLocked(true);
      else setLockError(res.error ?? t("myassets.rail.lockError"));
    } catch (error) {
      setLockError(error instanceof Error ? error.message : t("myassets.rail.lockError"));
    } finally {
      setIsLocking(false);
    }
  }

  async function handleRelease() {
    if (!locked || isLocking) return;
    setIsLocking(true);
    setLockError(null);
    try {
      const account = ensureDemoAccount();
      const res = await releaseCollateral(assetId, account);
      if (res.success) setLocked(false);
      else setLockError(res.error ?? t("myassets.rail.releaseError"));
    } catch (error) {
      setLockError(error instanceof Error ? error.message : t("myassets.rail.releaseError"));
    } finally {
      setIsLocking(false);
    }
  }

  const statusText = blocked
    ? t("marketplace.rail.statusBlocked")
    : locked
      ? t("marketplace.rail.statusComplete")
      : t("marketplace.rail.statusIdle");

  return (
    <section className="sealed-rail panel" aria-labelledby="sealed-rail-title">
      <GuardrailBanner />

      <header className="sealed-rail__head">
        <div className="sealed-rail__heading">
          <h2 id="sealed-rail-title" className="sealed-rail__title">
            {t("marketplace.rail.title")}
          </h2>
          <p className="sealed-rail__subtitle">{t("marketplace.rail.subtitle")}</p>
        </div>

        <div className="sealed-rail__actions">
          <button
            type="button"
            className="route-cta"
            onClick={handleRun}
            disabled={isRunning || blocked || minted}
          >
            {isRunning ? t("marketplace.rail.running") : t("marketplace.rail.btnPrimary")}
          </button>
          <Link
            className="route-cta route-cta--ghost"
            to={`/my-assets?asset=${encodeURIComponent(assetId)}&rail=1`}
          >
            {t("marketplace.rail.btnSecondary")}
          </Link>
        </div>
      </header>

      <ProofRail steps={steps} activeStep={activeStep} failedStep={blocked ? 0 : undefined} />

      <p className="sealed-rail__status">{statusText}</p>

      {blocked ? (
        <p className="sealed-rail__note sealed-rail__note--danger">
          <StatusBadge label={t("common.invalid")} tone="danger" circle="dashed" size="sm" />
          {t("marketplace.rail.blockedNote")}
        </p>
      ) : null}

      {runError ? <p className="sealed-rail__note sealed-rail__note--danger">{runError}</p> : null}

      {queryInfo?.ok && !blocked ? (
        <p className="sealed-rail__result mono-label">
          {t("marketplace.rail.mockLabel")}
          {queryResultLine(queryInfo) ? ` · ${queryResultLine(queryInfo)}` : ""}
        </p>
      ) : null}

      {mintTxHash ? (
        <p className="sealed-rail__result mono-label">
          {t("marketplace.rail.demoMintLabel")} · {shortHash(mintTxHash)}
        </p>
      ) : null}

      <div className="sealed-rail__row">
        <button
          type="button"
          className="sealed-rail__link-btn"
          onClick={() => setIsInvalidChoice((value) => !value)}
        >
          {isInvalidChoice
            ? t("marketplace.rail.invalidToggleOff")
            : t("marketplace.rail.invalidToggleOn")}
        </button>

        <button
          type="button"
          className="sealed-rail__link-btn"
          onClick={() => onPersonaChange(persona === "defi" ? "buyer" : "defi")}
        >
          {persona === "defi"
            ? t("marketplace.rail.personaToggleOff")
            : t("marketplace.rail.personaToggleOn")}
        </button>
      </div>

      {persona === "defi" ? (
        <p className="sealed-rail__persona-copy">{t("marketplace.rail.personaDefiCopy")}</p>
      ) : null}

      {minted && !blocked ? (
        <div className="sealed-rail__collateral">
          {locked ? (
            <button
              type="button"
              className="route-cta route-cta--ghost"
              onClick={handleRelease}
              disabled={isLocking}
            >
              {isLocking ? t("myassets.rail.releasing") : t("marketplace.rail.releaseCta")}
            </button>
          ) : (
            <button
              type="button"
              className="route-cta route-cta--ghost"
              onClick={handleLock}
              disabled={isLocking}
            >
              {isLocking ? t("myassets.rail.locking") : t("marketplace.rail.lockCta")}
            </button>
          )}
          {lockError ? <p className="sealed-rail__note sealed-rail__note--danger">{lockError}</p> : null}
        </div>
      ) : null}

      {mintSummaryState.data ? (
        <p className="sealed-rail__mint-summary mono-label">
          {t("marketplace.rail.mintSummary", {
            count: mintSummaryState.data.mintCount,
            hash: shortHash(mintSummaryState.data.packageHash, 6, 4),
          })}
        </p>
      ) : null}

      <p className="sealed-rail__honesty">{t("marketplace.rail.honestyFooter")}</p>
    </section>
  );
}
