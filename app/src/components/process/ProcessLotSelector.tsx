import type { LotListItem } from "../../lib/types";
import { useLocaleContext } from "../../context/LocaleContext";
import {
  expectedKindClass,
  expectedKindLabelKey,
  inferExpectedKind,
  isUserCapturedLot,
  lotShortNameKey,
} from "../../lib/processLots";
import { Icon } from "../ui/Icon";
import "./process-lot-selector.css";

type ProcessLotSelectorLayout = "grid" | "sidebar";

type ProcessLotSelectorProps = {
  layout?: ProcessLotSelectorLayout;
  demoLots: LotListItem[];
  capturedLots: LotListItem[];
  selected: string[];
  disabled: boolean;
  onToggle: (assetId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
};

function LotSelectCard({
  lot,
  checked,
  disabled,
  onToggle,
}: {
  lot: LotListItem;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const { t } = useLocaleContext();
  const expected = inferExpectedKind(lot);
  const expectedKey = expectedKindLabelKey(expected);
  const inputId = `process-lot-${lot.artifact.assetId}`;

  return (
    <li>
      <input
        id={inputId}
        type="checkbox"
        className="process-lot-card-input"
        checked={checked}
        disabled={disabled}
        onChange={onToggle}
      />
      <label
        htmlFor={inputId}
        className={`process-lot-card${checked ? " process-lot-card--selected" : ""}${disabled ? " process-lot-card--disabled" : ""}`}
      >
        <span className="process-lot-card__check" aria-hidden="true">
          {checked ? <Icon name="check" size={14} /> : null}
        </span>
        <span className="process-lot-card__body">
          <span className="process-lot-card__name">{t(lotShortNameKey(lot))}</span>
          {expectedKey ? (
            <span className={`process-lot-card__expected process-lot-card__expected--${expectedKindClass(expected)}`}>
              {t(expectedKey)}
            </span>
          ) : null}
          {isUserCapturedLot(lot) ? (
            <span className="process-lot-card__id mono-label">{lot.artifact.assetId}</span>
          ) : null}
        </span>
      </label>
    </li>
  );
}

export function ProcessLotSelector({
  layout = "grid",
  demoLots,
  capturedLots,
  selected,
  disabled,
  onToggle,
  onSelectAll,
  onSelectNone,
}: ProcessLotSelectorProps) {
  const { t } = useLocaleContext();
  const totalLots = demoLots.length + capturedLots.length;
  const isSidebar = layout === "sidebar";

  return (
    <section
      className={`process-lot-selector${isSidebar ? " process-lot-selector--sidebar" : " panel"}`}
      aria-labelledby="process-lot-selector-title"
    >
      <header className="process-lot-selector__head">
        <div>
          <p className="process-lot-selector__step mono-label">{t("process.step1")}</p>
          <h2 id="process-lot-selector-title" className="process-lot-selector__title">
            {t("process.selectLotsTitle")}
          </h2>
          {!isSidebar ? <p className="process-lot-selector__lead">{t("process.selectLotsLead")}</p> : null}
        </div>
        <div className="process-lot-selector__meta">
          <p className="process-lot-selector__count">
            {t("process.selected", { selected: String(selected.length), total: String(totalLots) })}
          </p>
          {!disabled ? (
            <div className="process-lot-selector__bulk">
              <button type="button" className="process-lot-selector__bulk-btn" onClick={onSelectAll}>
                {t("process.selectAll")}
              </button>
              <button type="button" className="process-lot-selector__bulk-btn" onClick={onSelectNone}>
                {t("process.selectNone")}
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <ul
        className={isSidebar ? "process-lot-selector__list" : "process-lot-selector__grid"}
        role="group"
        aria-label={t("process.selectLotsTitle")}
      >
        {demoLots.map((lot) => (
          <LotSelectCard
            key={lot.artifact.assetId}
            lot={lot}
            checked={selected.includes(lot.artifact.assetId)}
            disabled={disabled}
            onToggle={() => onToggle(lot.artifact.assetId)}
          />
        ))}
        {capturedLots.map((lot) => (
          <LotSelectCard
            key={lot.artifact.assetId}
            lot={lot}
            checked={selected.includes(lot.artifact.assetId)}
            disabled={disabled}
            onToggle={() => onToggle(lot.artifact.assetId)}
          />
        ))}
      </ul>

      {selected.length === 0 ? (
        <p className="process-lot-selector__warning" role="status">
          {t("process.selectLotsEmpty")}
        </p>
      ) : null}
    </section>
  );
}
