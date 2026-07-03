import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { StatePanel } from "../layout/StatePanel";
import { VerdictBadge } from "../proof/Badges";
import { getLot } from "../../lib/api";
import { useAsyncData } from "../../hooks/useAsyncData";
import { drawerStatusLine, resolveVerdictTone } from "../../lib/lotVerdict";
import type { LotDetail } from "../../lib/types";
import {
  buildEvidenceTabs,
  defaultEvidenceTab,
  EvidenceRoomTabBar,
  type EvidenceTab,
} from "./EvidenceRoomTabs";
import { LotDetailContent } from "./LotDetailContent";
import "./lot-drawer.css";

type LotDrawerProps = {
  assetId: string;
  onClose: () => void;
};

function lotMetaLine(lot: LotDetail): string {
  const parts: string[] = [];
  if (lot.artifact.massGrams != null) {
    parts.push(`${lot.artifact.massGrams.toLocaleString()} g`);
  } else if (lot.artifact.tonnesCO2e != null) {
    parts.push(`${lot.artifact.tonnesCO2e.toLocaleString()} tCO₂e`);
  }
  parts.push(lot.artifact.category);
  parts.push(lot.artifact.origin.site);
  return parts.join(" · ");
}

export function LotDrawer({ assetId, onClose }: LotDrawerProps) {
  const titleId = useId();
  const loader = useCallback(() => getLot(assetId), [assetId]);
  const lot = useAsyncData(loader, [assetId]);

  const tone = lot.data ? resolveVerdictTone(lot.data) : "pending";
  const tabConfig = useMemo(
    () => (lot.data ? buildEvidenceTabs(lot.data) : null),
    [lot.data],
  );

  const [activeTab, setActiveTab] = useState<EvidenceTab>("summary");

  useEffect(() => {
    setActiveTab(defaultEvidenceTab(tone));
  }, [assetId, tone]);

  useEffect(() => {
    const root = document.documentElement;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = root.style.overflow;

    document.body.style.overflow = "hidden";
    root.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      root.style.overflow = previousRootOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="lot-drawer-overlay" onClick={onClose} role="presentation">
      <aside
        className={`lot-drawer lot-drawer--${tone}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="lot-drawer__head">
          <div className="lot-drawer__head-top">
            <p className="lot-drawer__kicker">Evidence room</p>
            <button
              type="button"
              className="lot-drawer__close"
              onClick={onClose}
              aria-label="Close evidence room"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path
                  d="M2.5 2.5L9.5 9.5M9.5 2.5L2.5 9.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="lot-drawer__head-main">
            <div className="lot-drawer__intro">
              <div className="lot-drawer__title-row">
                <h2 className="lot-drawer__title" id={titleId} title={assetId}>
                  {assetId}
                </h2>
                {lot.data ? <VerdictBadge verdict={lot.data.latestVerdict} /> : null}
              </div>
              {lot.data ? (
                <p className="lot-drawer__status">{drawerStatusLine(lot.data, tone)}</p>
              ) : null}
              {lot.data ? (
                <p className="lot-drawer__meta-line">{lotMetaLine(lot.data)}</p>
              ) : null}
            </div>
          </div>

          {tabConfig ? (
            <EvidenceRoomTabBar
              tabs={tabConfig.tabs}
              active={activeTab}
              onChange={setActiveTab}
            />
          ) : null}
        </header>

        <div className="lot-drawer__body">
          <StatePanel
            loading={lot.loading}
            error={lot.error}
            skeleton="detail"
            onRetry={lot.reload}
          >
            {lot.data ? <LotDetailContent data={lot.data} compact activeTab={activeTab} /> : null}
          </StatePanel>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
