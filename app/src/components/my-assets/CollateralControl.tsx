import { useState } from "react";
import { useLocaleContext } from "../../context/LocaleContext";
import { lockCollateral, releaseCollateral } from "../../lib/api";
import { resolveVerdictTone } from "../../lib/lotVerdict";
import type { LotDetail } from "../../lib/types";
import "./collateral-control.css";

type CollateralControlProps = {
  lot: LotDetail;
  account: string;
  locked: boolean;
  onLockedChange: (assetId: string, locked: boolean) => void;
};

/**
 * Compact demo-collateral Lock/Release control for the selected asset in My
 * Assets. Locked state is tracked optimistically in the parent's local state
 * — there is no server read endpoint for collateral status (demo limitation).
 */
export function CollateralControl({ lot, account, locked, onLockedChange }: CollateralControlProps) {
  const { t } = useLocaleContext();
  const assetId = lot.artifact.assetId;
  const isValidProof = resolveVerdictTone(lot) === "valid";
  const canLock = Boolean(lot.isMinted) && isValidProof;

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lockReasonId = `collateral-lock-reason-${assetId}`;

  async function handleLock() {
    if (!canLock || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await lockCollateral(assetId, account);
      if (res.success) onLockedChange(assetId, true);
      else setError(res.error ?? t("myassets.rail.lockError"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("myassets.rail.lockError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRelease() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await releaseCollateral(assetId, account);
      if (res.success) onLockedChange(assetId, false);
      else setError(res.error ?? t("myassets.rail.releaseError"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("myassets.rail.releaseError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="my-assets-collateral panel">
      <div className="my-assets-collateral__row">
        <span className="my-assets-collateral__label mono-label">
          {t("myassets.rail.collateralLabel")}
        </span>

        {locked ? (
          <button
            type="button"
            className="route-cta route-cta--ghost"
            onClick={handleRelease}
            disabled={busy}
          >
            {busy ? t("myassets.rail.releasing") : t("myassets.rail.releaseCta")}
          </button>
        ) : (
          <button
            type="button"
            className="route-cta route-cta--ghost"
            onClick={handleLock}
            disabled={!canLock || busy}
            aria-describedby={!canLock ? lockReasonId : undefined}
          >
            {busy ? t("myassets.rail.locking") : t("myassets.rail.lockCta")}
          </button>
        )}
      </div>

      {!canLock && !locked ? (
        <p id={lockReasonId} className="my-assets-collateral__reason">
          {t("myassets.rail.lockDisabledReason")}
        </p>
      ) : null}

      {error ? <p className="my-assets-collateral__error">{error}</p> : null}

      <p className="my-assets-collateral__honesty">{t("myassets.rail.collateralHonesty")}</p>
    </div>
  );
}
