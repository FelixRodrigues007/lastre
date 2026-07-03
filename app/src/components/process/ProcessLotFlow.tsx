import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import { ActionBadge, VerdictBadge } from "../proof/Badges";
import { Icon } from "../ui/Icon";
import { StatusBadge } from "../ui/StatusBadge";
import { useLocaleContext } from "../../context/LocaleContext";
import { useAgentStream } from "../../hooks/useAgentStream";
import { shortHash } from "../../lib/format";
import { getMarketplaceCoverFromAsset, MARKETPLACE_COVER_FALLBACK } from "../../lib/marketplaceCovers";
import {
  expectedKindLabelKey,
  inferExpectedKind,
  lotShortNameKey,
} from "../../lib/processLots";
import type { TranslationKey } from "../../i18n/translations";
import type { AuditRecord, DeciderMode, LotListItem } from "../../lib/types";
import "./process-lot-flow.css";

type BatchPhase = "idle" | "running" | "completed" | "error";

type ProcessLotFlowProps = {
  selectedLots: LotListItem[];
  phase: BatchPhase;
  activeIndex: number | null;
  records: AuditRecord[];
  streamingRecord: AuditRecord | null;
  sealRevealedThrough: number;
  fetchingBatch: boolean;
  decider: DeciderMode;
};

type LotPhase = "queued" | "prepare" | "agent" | "seal" | "done";

type ChecklistState = "done" | "active" | "pending";

function lotPhase(
  index: number,
  activeIndex: number | null,
  recordsLength: number,
  sealRevealedThrough: number,
  fetchingBatch: boolean,
  phase: BatchPhase,
): LotPhase {
  if (index <= sealRevealedThrough) return "done";
  if (index < recordsLength && index > sealRevealedThrough) return "seal";
  if (phase !== "running" && phase !== "error") return "queued";
  if (activeIndex !== index) return "queued";
  if (fetchingBatch && index >= recordsLength) return "prepare";
  if (index >= recordsLength) return "agent";
  return "seal";
}

function agentChecklistSteps(
  kind: ReturnType<typeof inferExpectedKind>,
  t: (key: TranslationKey) => string,
): string[] {
  switch (kind) {
    case "invalid":
      return [
        t("process.stage.agentStep.scan"),
        t("process.stage.agentStep.fields"),
        t("process.stage.agentStep.tamper"),
      ];
    case "escalate":
      return [
        t("process.stage.agentStep.scan"),
        t("process.stage.agentStep.geo"),
        t("process.stage.agentStep.perimeter"),
      ];
    case "skip":
      return [
        t("process.stage.agentStep.scan"),
        t("process.stage.agentStep.duplicate"),
        t("process.stage.agentStep.decide"),
      ];
    default:
      return [
        t("process.stage.agentStep.scan"),
        t("process.stage.agentStep.metadata"),
        t("process.stage.agentStep.decide"),
      ];
  }
}

function checklistItemState(
  itemIndex: number,
  agentStepCount: number,
  status: LotPhase,
  streamStepIndex: number,
  streamPhase: "idle" | "steps" | "reasoning" | "done",
  showSeal: boolean,
): ChecklistState {
  const sealIndex = agentStepCount;

  if (status === "queued") return "pending";
  if (status === "done" || showSeal) return "done";

  if (itemIndex < agentStepCount) {
    if (status === "prepare") return itemIndex === 0 ? "active" : "pending";
    if (status === "agent") {
      if (streamPhase === "idle") return itemIndex === 0 ? "active" : "pending";
      if (streamStepIndex > itemIndex || streamPhase === "reasoning" || streamPhase === "done") return "done";
      if (streamStepIndex === itemIndex && streamPhase === "steps") return "active";
      return "pending";
    }
    if (status === "seal") return "done";
  }

  if (itemIndex === sealIndex) {
    if (status === "seal" && !showSeal) return "active";
    if (showSeal) return "done";
    return "pending";
  }

  return "pending";
}

function LotCover({ lot }: { lot: LotListItem }) {
  const cover = getMarketplaceCoverFromAsset(lot.artifact as Record<string, unknown>);
  return (
    <img
      src={cover}
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
  );
}

type LotCardProps = {
  lot: LotListItem;
  index: number;
  status: LotPhase;
  record: AuditRecord | null;
  streamingRecord: AuditRecord | null;
  showSeal: boolean;
  decider: DeciderMode;
};

function LotCard({ lot, index, status, record, streamingRecord, showSeal, decider }: LotCardProps) {
  const { t } = useLocaleContext();
  const kind = inferExpectedKind(lot);
  const expectedKey = expectedKindLabelKey(kind);
  const isActive = status === "prepare" || status === "agent" || status === "seal";
  const agentStreaming = status === "agent" && streamingRecord?.assetId === lot.artifact.assetId;
  const agentSteps = useMemo(() => agentChecklistSteps(kind, t), [kind, t]);
  const sealLabel = t("process.flow.checklist.seal");

  const stream = useAgentStream(
    agentStreaming,
    agentStreaming ? streamingRecord?.decision.reasoning ?? null : null,
    agentSteps,
  );

  const checklistLabels = [...agentSteps, sealLabel];
  const resolvedRecord = record ?? (agentStreaming ? streamingRecord : null);

  const deciderLabel =
    decider === "llm" ? t("process.pipeline.decidedByLlm") : t("process.pipeline.decidedByRule");

  return (
    <article
      className={`process-lot-card${isActive ? " process-lot-card--active" : ""}${
        status === "prepare" ? " process-lot-card--prepare" : ""
      }${status === "agent" ? " process-lot-card--agent" : ""}${
        status === "seal" ? " process-lot-card--seal" : ""
      }${status === "done" ? " process-lot-card--done" : ""}${
        status === "queued" ? " process-lot-card--queued" : ""
      }`}
      aria-current={isActive ? "step" : undefined}
      aria-busy={isActive}
    >
      <div className="process-lot-card__banner">
        <LotCover lot={lot} />
        <span className="process-lot-card__index mono-label">{String(index + 1).padStart(2, "0")}</span>
      </div>

      <div className="process-lot-card__head">
        <h3 className="process-lot-card__name">{t(lotShortNameKey(lot))}</h3>
        <p className={`process-lot-card__meta mono-label${expectedKey ? "" : " process-lot-card__meta--empty"}`}>
          {expectedKey ? t(expectedKey) : "\u00a0"}
        </p>
        <p
          className={`process-lot-card__agent mono-label${isActive ? " process-lot-card__agent--visible" : ""}`}
          aria-hidden={!isActive}
        >
          {deciderLabel}
        </p>
      </div>

      <ul className="process-lot-card__checklist" aria-label={t("process.flow.checklist.aria")}>
        {checklistLabels.map((label, itemIndex) => {
          const itemState = checklistItemState(
            itemIndex,
            agentSteps.length,
            status,
            stream.stepIndex,
            stream.phase,
            showSeal,
          );

          return (
            <li
              key={label}
              className={`process-lot-card__check-item process-lot-card__check-item--${itemState}`}
            >
              <span className="process-lot-card__check-mark" aria-hidden="true">
                {itemState === "done" ? <Icon name="check" size={12} /> : null}
              </span>
              <span className="process-lot-card__check-label">{label}</span>
            </li>
          );
        })}
      </ul>

      <div className="process-lot-card__tail">
        <div className="process-lot-card__reasoning-wrap">
          <p
            className={`process-lot-card__reasoning${isActive && stream.visibleReasoning ? " process-lot-card__reasoning--visible" : ""}`}
            aria-live={isActive ? "polite" : undefined}
          >
            {isActive && stream.visibleReasoning ? stream.visibleReasoning : "\u00a0"}
          </p>
        </div>

        <div className="process-lot-card__foot-wrap">
          {resolvedRecord && !agentStreaming && status !== "prepare" ? (
            <div className="process-lot-card__foot">
              <ActionBadge action={resolvedRecord.decision.action} size="sm" />
              {showSeal ? (
                resolvedRecord.decision.action === "skip" || resolvedRecord.decision.action === "escalate" ? (
                  <StatusBadge label={t("process.seal.notInvoked")} tone="neutral" circle="dashed" size="sm" />
                ) : (
                  <>
                    <VerdictBadge verdict={resolvedRecord.verification?.verdict ?? null} size="sm" />
                    {resolvedRecord.verification ? (
                      <code className="process-lot-card__hash">{shortHash(resolvedRecord.verification.seal)}</code>
                    ) : null}
                  </>
                )
              ) : status === "seal" ? (
                <span className="process-lot-card__computing mono-label">{t("process.pipeline.sealComputing")}</span>
              ) : null}
            </div>
          ) : status === "prepare" ? (
            <p className="process-lot-card__waiting mono-label">{t("process.pipeline.awaitingAgent")}</p>
          ) : (
            <div className="process-lot-card__foot process-lot-card__foot--idle" aria-hidden="true" />
          )}
        </div>
      </div>
    </article>
  );
}

function FlowConnector({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div
      className={`process-flow__connector${active ? " process-flow__connector--active" : ""}${
        done ? " process-flow__connector--done" : ""
      }`}
      aria-hidden="true"
    >
      <span className="process-flow__connector-line" />
    </div>
  );
}

export function ProcessLotFlow({
  selectedLots,
  phase,
  activeIndex,
  records,
  streamingRecord,
  sealRevealedThrough,
  fetchingBatch,
  decider,
}: ProcessLotFlowProps) {
  const { t } = useLocaleContext();

  const recordByAssetId = useMemo(
    () => new Map(records.map((record) => [record.assetId, record])),
    [records],
  );

  const cards = selectedLots.map((lot, index) => ({
    lot,
    index,
    status: lotPhase(index, activeIndex, records.length, sealRevealedThrough, fetchingBatch, phase),
    record: recordByAssetId.get(lot.artifact.assetId) ?? null,
    showSeal: index <= sealRevealedThrough,
  }));

  const activeCardIndex = cards.findIndex(
    (card) => card.status === "prepare" || card.status === "agent" || card.status === "seal",
  );

  const activeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = activeRef.current;
    const track = trackRef.current;
    if (activeCardIndex < 0 || !slot || !track) return;

    const targetLeft = slot.offsetLeft - (track.clientWidth - slot.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
  }, [activeCardIndex, streamingRecord, sealRevealedThrough]);

  const flowPhaseClass =
    phase === "running"
      ? " process-flow--running"
      : phase === "completed"
        ? " process-flow--completed"
        : "";

  return (
    <div className={`process-flow${flowPhaseClass}`} aria-label={t("process.flow.aria")}>
      <div className="process-flow__status" aria-live="polite">
        {phase === "running" && activeCardIndex >= 0 ? (
          <p className="process-flow__kicker mono-label">
            <span className="process-flow__kicker-dot" aria-hidden="true" />
            {t("process.stage.inspectProgress", {
              current: String(activeCardIndex + 1),
              total: String(selectedLots.length),
            })}
          </p>
        ) : phase === "completed" ? (
          <p className="process-flow__complete mono-label">
            <Icon name="check" size={12} aria-hidden="true" />
            {t("process.stage.inspectComplete", { count: String(selectedLots.length) })}
          </p>
        ) : (
          <span className="process-flow__status-spacer" aria-hidden="true" />
        )}
      </div>

      <div className="process-flow__track-wrap">
        <div className="process-flow__track" ref={trackRef}>
        {cards.map((card, cardIndex) => {
          const connectorDone = card.status === "done";
          const connectorActive =
            card.status === "agent" ||
            card.status === "seal" ||
            card.status === "prepare" ||
            (cardIndex > 0 && cards[cardIndex - 1]?.status === "done");
          const isActiveSlot = cardIndex === activeCardIndex;

          return (
            <div
              key={card.lot.artifact.assetId}
              className="process-flow__slot"
              style={{ "--flow-slot-index": cardIndex } as CSSProperties}
              ref={isActiveSlot ? activeRef : undefined}
            >
              {cardIndex > 0 ? <FlowConnector active={connectorActive} done={connectorDone} /> : null}
              <LotCard
                lot={card.lot}
                index={card.index}
                status={card.status}
                record={card.record}
                streamingRecord={streamingRecord}
                showSeal={card.showSeal}
                decider={decider}
              />
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
